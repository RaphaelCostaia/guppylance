-- =====================================================================
-- Guppy Boroski — categoria dos lotes (Guppys / Peixes de água salgada)
-- Como aplicar: Supabase → SQL Editor → colar este arquivo → Run (uma vez).
-- =====================================================================

alter table public.lots
  add column category text not null default 'guppy'
  check (category in ('guppy', 'agua_salgada'));

-- Admin pode definir a categoria ao cadastrar/editar lotes.
grant insert (category), update (category) on public.lots to authenticated;
