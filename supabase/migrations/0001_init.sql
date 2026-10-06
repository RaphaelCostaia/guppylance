-- =====================================================================
-- GuppyLance — schema inicial (Supabase / Postgres)
--
-- Princípios:
--  * O SERVIDOR é a autoridade: horário, validade do lance, vencedor.
--  * Lances só entram pela função place_bid (transação + lock de linha).
--  * Cada lote é uma disputa independente (preço, contador, vencedor).
--  * Somente administradores criam/editam leilões e lotes.
--  * Participantes aparecem publicamente apenas pelo apelido (nickname).
--
-- Como aplicar: Supabase → SQL Editor → colar este arquivo inteiro → Run.
-- =====================================================================

create extension if not exists pg_cron with schema pg_catalog;

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.user_role as enum ('user', 'admin');
create type public.auction_status as enum ('rascunho', 'publicado', 'cancelado');
create type public.lot_status as enum ('rascunho', 'agendado', 'ativo', 'vendido', 'sem_lances', 'cancelado');
create type public.media_type as enum ('image', 'video');

-- ---------------------------------------------------------------------
-- Perfis
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null
    check (char_length(nickname) between 3 and 24 and nickname ~ '^[A-Za-zÀ-ÿ0-9_. -]+$'),
  full_name text not null default '',
  city text not null default '',
  state text not null default '' check (state = '' or char_length(state) = 2),
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);
create unique index profiles_nickname_unique on public.profiles (lower(nickname));

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Cria o perfil automaticamente no cadastro (apelido vem do metadata do signUp).
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_nick text := nullif(trim(new.raw_user_meta_data ->> 'nickname'), '');
begin
  begin
    insert into public.profiles (id, nickname, full_name)
    values (new.id, coalesce(v_nick, 'participante_' || substr(new.id::text, 1, 6)),
            coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  exception when unique_violation or check_violation then
    insert into public.profiles (id, nickname, full_name)
    values (new.id, 'participante_' || substr(new.id::text, 1, 6),
            coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  end;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.nickname_available(p_nickname text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles
    where lower(nickname) = lower(trim(p_nickname)) and id is distinct from auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- Leilões
-- ---------------------------------------------------------------------
create table public.auctions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '',
  seller_id uuid not null default auth.uid() references public.profiles (id),
  location text not null default '',
  starts_at timestamptz not null,
  pickup_shipping_info text not null default '',
  cover_variety text not null default 'Full Red',
  featured boolean not null default false,
  status public.auction_status not null default 'rascunho',
  -- Anti-sniping (por leilão): lance válido dentro da janela final estende SOMENTE aquele lote.
  anti_snipe_window_seconds int not null default 120 check (anti_snipe_window_seconds >= 0),
  anti_snipe_extension_seconds int not null default 120 check (anti_snipe_extension_seconds >= 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Lotes
-- ---------------------------------------------------------------------
create table public.lots (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  number int not null check (number > 0),
  title text not null check (char_length(title) between 1 and 120),
  variety text not null,
  quantity int not null check (quantity > 0),
  composition text not null default '',
  age_approx text not null default '',
  description text not null default '',
  starting_price numeric(12, 2) not null check (starting_price > 0),
  min_increment numeric(12, 2) not null check (min_increment > 0),
  -- Campos abaixo só são alterados pelas funções do servidor (sem permissão de escrita via API).
  current_price numeric(12, 2),
  bid_count int not null default 0,
  leader_id uuid references public.profiles (id),
  winner_id uuid references public.profiles (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.lot_status not null default 'agendado',
  created_at timestamptz not null default now(),
  constraint lots_number_unique unique (auction_id, number) deferrable initially deferred,
  constraint lots_time_order check (ends_at > starts_at)
);
create index lots_auction_idx on public.lots (auction_id);
create index lots_open_idx on public.lots (ends_at) where status in ('agendado', 'ativo');

-- Impede que a API (usuário/admin) force status de resultado; só o servidor encerra lotes.
create or replace function public.lots_guard()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' and new.status not in ('rascunho', 'agendado') then
      raise exception 'Status inicial inválido para o lote.';
    end if;
    if tg_op = 'UPDATE' and new.status is distinct from old.status
       and new.status not in ('rascunho', 'agendado', 'cancelado') then
      raise exception 'Status de lote só pode ser alterado pelo servidor.';
    end if;
    if tg_op = 'UPDATE' and old.status in ('vendido', 'sem_lances') then
      raise exception 'Lote encerrado não pode ser alterado.';
    end if;
  end if;
  return new;
end;
$$;

create trigger lots_guard
  before insert or update on public.lots
  for each row execute function public.lots_guard();

-- Cancelar o leilão cancela os lotes ainda em aberto (sem declarar vencedor).
create or replace function public.cancel_open_lots_on_auction_cancel()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.status = 'cancelado' and old.status is distinct from 'cancelado' then
    update public.lots set status = 'cancelado'
    where auction_id = new.id and status in ('rascunho', 'agendado', 'ativo');
  end if;
  return new;
end;
$$;

create trigger auctions_cancel_lots
  after update of status on public.auctions
  for each row execute function public.cancel_open_lots_on_auction_cancel();

-- ---------------------------------------------------------------------
-- Mídias dos lotes (arquivos no Storage, bucket "lot-media")
-- ---------------------------------------------------------------------
create table public.lot_media (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots (id) on delete cascade,
  type public.media_type not null,
  storage_path text not null,
  label text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index lot_media_lot_idx on public.lot_media (lot_id, position);

-- ---------------------------------------------------------------------
-- Lances (histórico preservado: lote com lances não pode ser apagado)
-- ---------------------------------------------------------------------
create table public.bids (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots (id) on delete restrict,
  bidder_id uuid not null references public.profiles (id),
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);
create index bids_lot_idx on public.bids (lot_id, created_at desc);
create index bids_bidder_idx on public.bids (bidder_id);

-- ---------------------------------------------------------------------
-- Views públicas (expõem só o necessário)
-- ---------------------------------------------------------------------
-- Apelido de todos; cidade/UF apenas de organizadores (admins), exibidos no card do vendedor.
create view public.public_profiles as
  select id, nickname,
         case when role = 'admin' then city else '' end as city,
         case when role = 'admin' then state else '' end as state,
         (role = 'admin') as is_organizer
  from public.profiles;

create view public.bids_public as
  select b.id, b.lot_id, b.amount, b.created_at, p.nickname,
         (b.bidder_id = auth.uid()) as is_mine
  from public.bids b
  join public.profiles p on p.id = b.bidder_id
  join public.lots l on l.id = b.lot_id
  join public.auctions a on a.id = l.auction_id
  where a.status <> 'rascunho' or public.is_admin();

-- ---------------------------------------------------------------------
-- Funções do motor de leilão
-- ---------------------------------------------------------------------

-- Horário oficial do servidor (o frontend usa apenas para corrigir o relógio de exibição).
create or replace function public.server_now()
returns timestamptz
language sql stable
as $$ select now(); $$;

-- Lance: validação completa no servidor, com lock da linha do lote
-- (lances simultâneos são processados um de cada vez).
create or replace function public.place_bid(p_lot_id uuid, p_amount numeric)
returns public.lots
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_lot public.lots;
  v_auction public.auctions;
  v_now timestamptz;
  v_min numeric(12, 2);
begin
  if v_uid is null then
    raise exception 'Faça login para dar lances.';
  end if;

  select * into v_lot from public.lots where id = p_lot_id for update;
  if not found then
    raise exception 'Lote não encontrado.';
  end if;

  -- horário medido DEPOIS de obter o lock
  v_now := clock_timestamp();

  select * into v_auction from public.auctions where id = v_lot.auction_id;
  if v_auction.status <> 'publicado' then
    raise exception 'Este leilão não está disponível.';
  end if;
  if v_auction.seller_id = v_uid then
    raise exception 'Você é o vendedor deste lote e não pode dar lances nele.';
  end if;
  if v_lot.status not in ('agendado', 'ativo') then
    raise exception 'Este lote não está aceitando lances.';
  end if;
  if v_now < v_lot.starts_at then
    raise exception 'Este lote ainda não abriu para lances.';
  end if;
  if v_now >= v_lot.ends_at then
    raise exception 'Lote encerrado. Seu lance não foi aceito.';
  end if;

  if p_amount is null or p_amount <> round(p_amount, 2) or p_amount > 9999999 then
    raise exception 'Valor de lance inválido.';
  end if;

  v_min := coalesce(v_lot.current_price + v_lot.min_increment, v_lot.starting_price);
  if p_amount < v_min then
    raise exception 'O lance mínimo é R$ %.', replace(to_char(v_min, 'FM9999990.00'), '.', ',');
  end if;

  insert into public.bids (lot_id, bidder_id, amount, created_at)
  values (p_lot_id, v_uid, p_amount, v_now);

  update public.lots
  set current_price = p_amount,
      bid_count = bid_count + 1,
      leader_id = v_uid,
      status = 'ativo',
      ends_at = case
        when v_auction.anti_snipe_extension_seconds > 0
             and ends_at - v_now <= make_interval(secs => v_auction.anti_snipe_window_seconds)
          then ends_at + make_interval(secs => v_auction.anti_snipe_extension_seconds)
        else ends_at
      end
  where id = p_lot_id
  returning * into v_lot;

  return v_lot;
end;
$$;

-- Abre lotes agendados e encerra lotes vencidos (idempotente).
-- Roda a cada minuto via pg_cron; o frontend também pode chamar quando o contador zera.
create or replace function public.close_expired_lots()
returns int
language plpgsql security definer set search_path = ''
as $$
declare
  v_closed int;
begin
  update public.lots set status = 'ativo'
  where status = 'agendado' and starts_at <= now() and ends_at > now();

  update public.lots
  set status = case when bid_count > 0 then 'vendido'::public.lot_status else 'sem_lances'::public.lot_status end,
      winner_id = case when bid_count > 0 then leader_id else null end
  where status in ('agendado', 'ativo') and ends_at <= now();
  get diagnostics v_closed = row_count;
  return v_closed;
end;
$$;

select cron.schedule('guppylance-close-expired-lots', '* * * * *', $$select public.close_expired_lots();$$);

-- ---------------------------------------------------------------------
-- Permissões (RLS + grants por coluna)
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.auctions enable row level security;
alter table public.lots enable row level security;
alter table public.lot_media enable row level security;
alter table public.bids enable row level security;

-- profiles: cada um vê/edita o próprio; admin vê todos. Papel (role) não é editável via API.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (nickname, full_name, city, state) on public.profiles to authenticated;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- auctions: público vê publicados/cancelados; admin vê e edita tudo.
revoke all on public.auctions from anon, authenticated;
grant select on public.auctions to anon, authenticated;
grant insert, update, delete on public.auctions to authenticated;
create policy auctions_select on public.auctions for select to anon, authenticated
  using (status <> 'rascunho' or public.is_admin());
create policy auctions_insert on public.auctions for insert to authenticated
  with check (public.is_admin() and seller_id = auth.uid());
create policy auctions_update on public.auctions for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy auctions_delete on public.auctions for delete to authenticated
  using (public.is_admin());

-- lots: leitura pública conforme o leilão; escrita só admin e só em colunas editáveis.
revoke all on public.lots from anon, authenticated;
grant select on public.lots to anon, authenticated;
grant insert (auction_id, number, title, variety, quantity, composition, age_approx, description,
              starting_price, min_increment, starts_at, ends_at, status) on public.lots to authenticated;
grant update (number, title, variety, quantity, composition, age_approx, description,
              starting_price, min_increment, starts_at, ends_at, status) on public.lots to authenticated;
grant delete on public.lots to authenticated;
create policy lots_select on public.lots for select to anon, authenticated
  using (exists (select 1 from public.auctions a where a.id = auction_id and (a.status <> 'rascunho' or public.is_admin())));
create policy lots_write on public.lots for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- lot_media
revoke all on public.lot_media from anon, authenticated;
grant select on public.lot_media to anon, authenticated;
grant insert, update, delete on public.lot_media to authenticated;
create policy lot_media_select on public.lot_media for select to anon, authenticated
  using (exists (select 1 from public.lots l join public.auctions a on a.id = l.auction_id
                 where l.id = lot_id and (a.status <> 'rascunho' or public.is_admin())));
create policy lot_media_write on public.lot_media for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- bids: escrita SOMENTE via place_bid; leitura direta só dos próprios (público usa bids_public).
revoke all on public.bids from anon, authenticated;
grant select on public.bids to authenticated;
create policy bids_select on public.bids for select to authenticated
  using (bidder_id = auth.uid() or public.is_admin());

-- views e funções
grant select on public.public_profiles to anon, authenticated;
grant select on public.bids_public to anon, authenticated;

revoke execute on function public.place_bid(uuid, numeric) from public, anon;
grant execute on function public.place_bid(uuid, numeric) to authenticated;
grant execute on function public.close_expired_lots() to anon, authenticated;
grant execute on function public.server_now() to anon, authenticated;
grant execute on function public.nickname_available(text) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Realtime: mudanças nos lotes (lance atual, contagem, encerramento) chegam ao vivo.
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.lots;

-- ---------------------------------------------------------------------
-- Storage: bucket público para fotos/vídeos dos lotes (até 50 MB por arquivo).
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lot-media', 'lot-media', true, 52428800,
        array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do nothing;

create policy lot_media_storage_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'lot-media' and public.is_admin());
create policy lot_media_storage_update on storage.objects for update to authenticated
  using (bucket_id = 'lot-media' and public.is_admin());
create policy lot_media_storage_delete on storage.objects for delete to authenticated
  using (bucket_id = 'lot-media' and public.is_admin());
