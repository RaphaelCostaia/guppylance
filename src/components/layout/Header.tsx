import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import { useMockDb } from '../../state/MockDbProvider'
import { useToast } from '../ui/Toast'
import { initials } from '../../lib/format'

const NAV = [
  { to: '/leiloes', label: 'Leilões' },
  { to: '/meus-lances', label: 'Meus lances' },
  { to: '/leiloes-ganhos', label: 'Lotes ganhos' },
  { to: '/vendedor', label: 'Painel do vendedor' },
]

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-abyss-700 to-abyss-950 shadow-sm">
        <svg viewBox="0 0 64 64" className="h-6 w-6">
          <path d="M10 32c6-9 18-11 26-6l14-10-3 16 3 16-14-10c-8 5-20 3-26-6z" fill="#ff7556" />
          <circle cx="19" cy="30" r="2.6" fill="#062530" />
        </svg>
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-abyss-950'}`}>
        Guppy<span className="text-coral-500">Lance</span>
      </span>
    </Link>
  )
}

export function Header() {
  const { user } = useMockDb()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    navigate(q.trim() ? `/leiloes?q=${encodeURIComponent(q.trim())}` : '/leiloes')
  }

  const authSoon = () => toast('Autenticação chega na próxima etapa — você está no modo demonstração.')

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
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
          <button onClick={authSoon} className="btn-ghost hidden sm:inline-flex">
            Entrar
          </button>
          <button onClick={authSoon} className="btn-dark hidden py-2 sm:inline-flex">
            Criar conta
          </button>
          <Link to="/perfil" title="Perfil (usuário de demonstração)" className="grid h-9 w-9 place-items-center rounded-full bg-coral-100 text-sm font-bold text-coral-700 ring-2 ring-white">
            {initials(user.name)}
          </Link>
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
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-abyss-50 text-abyss-900' : 'text-slate-700'}`}
              >
                {n.label}
              </NavLink>
            ))}
            <NavLink to="/perfil" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700">
              Perfil
            </NavLink>
            <div className="flex gap-2 pt-2 sm:hidden">
              <button onClick={authSoon} className="btn-outline flex-1">
                Entrar
              </button>
              <button onClick={authSoon} className="btn-dark flex-1">
                Criar conta
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
