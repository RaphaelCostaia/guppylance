import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '../../state/AuthProvider'
import { EmptyState } from '../ui/EmptyState'

export function PageLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center text-slate-400">
      <Loader2 className="h-7 w-7 animate-spin" />
    </div>
  )
}

/** Exige login (UX). A proteção real dos dados é feita pela RLS no banco. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageLoader />
  if (!session) return <Navigate to={`/entrar?voltar=${encodeURIComponent(location.pathname)}`} replace />
  return <>{children}</>
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, profile, loading, isAdmin } = useAuth()
  const location = useLocation()
  if (loading || (session && !profile)) return <PageLoader />
  if (!session) return <Navigate to={`/entrar?voltar=${encodeURIComponent(location.pathname)}`} replace />
  if (!isAdmin) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Acesso restrito"
          description="Somente administradores podem criar e gerenciar leilões."
          action={<Link to="/" className="btn-dark"><ShieldAlert className="h-4 w-4" /> Voltar ao início</Link>}
        />
      </div>
    )
  }
  return <>{children}</>
}
