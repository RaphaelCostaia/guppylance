import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, Search, User, X } from 'lucide-react'
import { useAuth } from '../../state/AuthProvider'
import { initials } from '../../lib/format'

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Guppy Boroski — início">
      <img src="/brand/boroski-logo.webp" alt="" className="h-10 w-10 rounded-full shadow-sm ring-1 ring-coral-400/40" />
      <span className="flex flex-col leading-none">
        <span className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${light ? 'text-coral-200' : 'text-coral-600'}`}>Guppy</span>
        <span className={`font-display text-lg font-bold tracking-wide ${light ? 'text-coral-300' : 'text-abyss-950'}`}>BOROSKI</span>
      </span>
    </Link>
  )
}

export function Header() {
  const { session, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [q, setQ] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  const nav = [
    { to: '/leiloes', label: 'Leilões' },
    ...(session ? [{ to: '/meus-lances', label: 'Meus lances' }, { to: '/leiloes-ganhos', label: 'Lotes ganhos' }] : []),
    ...(isAdmin ? [{ to: '/vendedor', label: 'Painel admin' }] : []),
  ]

  useEffect(() => {
    setOpen(false)
    setMenu(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menu) return
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menu])

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    navigate(q.trim() ? `/leiloes?q=${encodeURIComponent(q.trim())}` : '/leiloes')
  }

  const logout = async () => {
    await signOut()
    navigate('/')
  }

  const loginLink = `/entrar?voltar=${encodeURIComponent(location.pathname + location.search)}`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-abyss-50 text-abyss-900' : 'text-slate-600 hover:text-abyss-900'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={onSearch} className="relative ml-auto hidden w-full max-w-xs md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar leilão ou variedade" className="input rounded-full py-2 pl-9" />
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {session ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenu((v) => !v)}
                title={profile?.nickname}
                className="grid h-9 w-9 place-items-center rounded-full bg-coral-100 text-sm font-bold text-coral-700 ring-2 ring-white"
              >
                {initials(profile?.nickname ?? '?')}
              </button>
              {menu && (
                <div className="card absolute right-0 top-11 w-52 overflow-hidden py-1 text-sm">
                  <p className="truncate px-4 py-2 text-xs text-slate-500">
                    Conectado como <strong className="text-abyss-950">{profile?.nickname}</strong>
                  </p>
                  <Link to="/perfil" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50">
                    <User className="h-4 w-4" /> Meu perfil
                  </Link>
                  <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-rose-600 hover:bg-rose-50">
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to={loginLink} className="btn-ghost hidden sm:inline-flex">
                Entrar
              </Link>
              <Link to="/criar-conta" className="btn-dark hidden py-2 sm:inline-flex">
                Criar conta
              </Link>
            </>
          )}
          <button className="btn-ghost p-2 lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-page space-y-1 py-3">
            <form onSubmit={onSearch} className="relative mb-2 md:hidden">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar leilão ou variedade" className="input pl-9" />
            </form>
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-abyss-50 text-abyss-900' : 'text-slate-700'}`}
              >
                {n.label}
              </NavLink>
            ))}
            {session ? (
              <>
                <NavLink to="/perfil" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700">
                  Meu perfil
                </NavLink>
                <button onClick={logout} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600">
                  Sair
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2 sm:hidden">
                <Link to={loginLink} className="btn-outline flex-1">
                  Entrar
                </Link>
                <Link to="/criar-conta" className="btn-dark flex-1">
                  Criar conta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
