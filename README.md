# GuppyLance — leilões de Guppys

Plataforma de leilões online de Guppys. Estrutura: **Leilão → vários lotes → vários lances**, cada lote com disputa, contador e vencedor independentes.

- **Frontend:** Vite + React + TypeScript + Tailwind (deploy na Vercel).
- **Backend:** Supabase (Postgres + Auth + Realtime + Storage), plano gratuito.

## Regras garantidas pelo servidor

Tudo em [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql):

- lances só entram pela função `place_bid`, que trava a linha do lote (lances simultâneos são processados um por vez);
- o servidor valida login, horário oficial, valor mínimo e impede o organizador de dar lance no próprio lote;
- **anti-sniping:** lance nos últimos 2 min estende só aquele lote em +2 min (configurável por leilão);
- `close_expired_lots` (pg_cron a cada minuto) abre lotes agendados e encerra os vencidos: com lance → `vendido` (vencedor = maior lance), sem lance → `sem_lances`;
- histórico de lances é preservado (lote com lances não pode ser apagado);
- só **admin** cria, edita e cancela leilões (RLS); participantes aparecem pelo **apelido**.

## Configuração (uma vez)

1. Crie um projeto em [supabase.com](https://supabase.com) (plano Free).
2. **SQL Editor** → cole todo o conteúdo de `supabase/migrations/0001_init.sql` → **Run**.
3. **Authentication → URL Configuration**:
   - Site URL: `https://guppylance.vercel.app`
   - Redirect URLs: `https://guppylance.vercel.app/**` e `http://localhost:5173/**`
4. **Project Settings → API**: copie a *Project URL* e a chave *anon / publishable*.
5. Na **Vercel → Settings → Environment Variables**, crie:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   e faça **Redeploy**. Para rodar localmente, copie `.env.example` para `.env.local` com os mesmos valores.
6. Cadastre-se no site e torne sua conta admin (SQL Editor):

   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'SEU-EMAIL');
   ```

> Nunca coloque a chave `service_role` no frontend nem na Vercel.

## Rodar localmente

```bash
npm install
npm run dev
```

## Estrutura

- `src/services/` — acesso ao Supabase (`auctionService`, `bidService`, `sellerService`, `mappers`).
- `src/state/` — `AuthProvider` (sessão/perfil) e `DataProvider` (catálogo + realtime dos lotes).
- `src/hooks/useCountdown.ts` — contador visual corrigido pelo relógio do servidor (não é autoridade).
- `src/pages/` — páginas; `src/pages/seller/` — painel admin e cadastro de leilão com upload.

## Fora do escopo (decisões em aberto)

Pagamento, frete, notificações externas, proxy bid, preço de reserva, inadimplência, reabertura administrativa e encerramento sequencial automático.
