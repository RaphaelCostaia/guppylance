import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, ListChecks, PlusCircle } from 'lucide-react'
import { useMockDb } from '../../state/MockDbProvider'
import { getSeller } from '../../services/auctionService'

const TABS = [
  { to: '/vendedor', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/vendedor/meus-leiloes', label: 'Meus leilões', icon: ListChecks },
  { to: '/vendedor/novo-leilao', label: 'Novo leilão', icon: PlusCircle },
]

export function SellerLayout() {
  const { db, user } = useMockDb()
  const seller = user.sellerId ? getSeller(db, user.sellerId) : undefined

  return (
    <div>
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page pt-8">
          <p className="eyebrow">Painel do vendedor</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{seller?.name ?? 'Minha loja'}</h1>
          <nav className="-mb-px mt-6 flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap border-b-2 px-3 pb-3 text-sm font-medium transition ${
                    isActive ? 'border-coral-500 text-abyss-950' : 'border-transparent text-slate-500 hover:text-abyss-900'
                  }`
                }
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <div className="container-page py-8">
        <Outlet />
      </div>
    </div>
  )
}
