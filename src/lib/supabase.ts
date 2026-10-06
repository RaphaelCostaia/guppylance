import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase do navegador.
 * Usa SOMENTE a chave pública (anon). Toda regra sensível é garantida no banco
 * (RLS + funções), nunca no frontend. A chave service_role NUNCA deve vir para cá.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'missing-key', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

export const MEDIA_BUCKET = 'lot-media'

export const mediaPublicUrl = (path: string) => supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl

/** Extrai a mensagem amigável de erros do Supabase/Postgres (ex.: exceções do place_bid). */
export function errorMessage(err: unknown, fallback = 'Algo deu errado. Tente novamente.') {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message || fallback
  }
  return fallback
}
