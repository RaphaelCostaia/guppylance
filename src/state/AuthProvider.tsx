import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { errorMessage, supabase } from '../lib/supabase'
import { toProfile, type ProfileRow } from '../services/mappers'
import type { Profile } from '../types/auction'

/**
 * Autenticação real (Supabase Auth, e-mail + senha).
 * O papel (user/admin) vem do banco e não pode ser alterado pelo usuário.
 */
interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (input: { email: string; password: string; nickname: string; fullName: string }) => Promise<{ error: string | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<string | null>
  updatePassword: (password: string) => Promise<string | null>
  updateProfile: (patch: Partial<Pick<Profile, 'nickname' | 'fullName' | 'city' | 'state'>>) => Promise<string | null>
  isNicknameAvailable: (nickname: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  return data ? toProfile(data as ProfileRow) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      setProfile(data.session ? await loadProfile(data.session.user.id) : null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      // Evita chamadas ao Supabase dentro do callback (recomendação da lib).
      setTimeout(async () => {
        setProfile(s ? await loadProfile(s.user.id) : null)
      }, 0)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) return null
    if (error.message.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
    if (error.message.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).'
    return errorMessage(error)
  }, [])

  const signUp = useCallback<AuthContextValue['signUp']>(async ({ email, password, nickname, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname: nickname.trim(), full_name: fullName.trim() }, emailRedirectTo: `${window.location.origin}/` },
    })
    if (error) {
      if (error.message.includes('already registered')) return { error: 'Este e-mail já possui conta.', needsConfirmation: false }
      if (error.message.toLowerCase().includes('password')) return { error: 'A senha precisa ter pelo menos 6 caracteres.', needsConfirmation: false }
      return { error: errorMessage(error), needsConfirmation: false }
    }
    return { error: null, needsConfirmation: !data.session }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/redefinir-senha` })
    return error ? errorMessage(error) : null
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return error ? errorMessage(error) : null
  }, [])

  const isNicknameAvailable = useCallback(async (nickname: string) => {
    const { data, error } = await supabase.rpc('nickname_available', { p_nickname: nickname })
    return !error && data === true
  }, [])

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    async (patch) => {
      if (!session) return 'Faça login.'
      const row: Record<string, string> = {}
      if (patch.nickname !== undefined) row.nickname = patch.nickname.trim()
      if (patch.fullName !== undefined) row.full_name = patch.fullName.trim()
      if (patch.city !== undefined) row.city = patch.city.trim()
      if (patch.state !== undefined) row.state = patch.state.trim().toUpperCase()
      const { data, error } = await supabase.from('profiles').update(row).eq('id', session.user.id).select('*').single()
      if (error) {
        if (error.code === '23505') return 'Este apelido já está em uso.'
        if (error.code === '23514') return 'Apelido inválido: use 3 a 24 letras, números, espaço, ponto, hífen ou _.'
        return errorMessage(error)
      }
      setProfile(toProfile(data as ProfileRow))
      return null
    },
    [session],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      updatePassword,
      updateProfile,
      isNicknameAvailable,
    }),
    [session, profile, loading, signIn, signUp, signOut, sendPasswordReset, updatePassword, updateProfile, isNicknameAvailable],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
