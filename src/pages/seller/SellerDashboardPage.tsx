import { Link } from 'react-router-dom'
import { CircleDollarSign, Gavel, Layers, PlusCircle, Radio, Store, Trophy } from 'lucide-react'
import { useData } from '../../state/DataProvider'
import { useAuth } from '../../state/AuthProvider'
import { getSellerAuctions, getSellerStats } from '../../services/sellerService'
import { StatCard } from '../../components/seller/StatCard'
import { AuctionStatusBadge } from '../../components/ui/StatusBadge'
import { LotCountdown } from '../../components/lot/LotCountdown'
import { formatBRL } from '../../lib/format'

export function SellerDashboardPage() {
  const { db } = useData()
  const { session } = useAuth()
  const sellerId = session?.user.id ?? ''
  const stats = getSellerStats(db, sellerId)
  const auctions = getSellerAuctions(db, sellerId)
  const activeLots = auctions.flatMap((a) => a.lots.filter((l) => l.status === 'ativo').map((l) => ({ lot: l, auction: a.auction })))

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Leilões ativos" value={stats.activeAuctions} icon={Store} />
        <StatCard label="Total de lotes" value={stats.totalLots} icon={Layers} />
        <StatCard label="Lotes vendidos" value={stats.soldLots} icon={Trophy} />
        <StatCard label="Lotes ativos" value={stats.activeLots} icon={Radio} />
        <StatCard label="Total de lances" value={stats.totalBids} icon={Gavel} />
        <StatCard label="Valor potencial" value={formatBRL(stats.potentialValue)} icon={CircleDollarSign} accent />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <section className="card">
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold">Lotes ao vivo</h2>
            <span className="text-sm text-slate-500">{activeLots.length}</span>
          </header>
          {activeLots.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">Nenhum lote ao vivo agora.</p>
          ) : (
            <ul>
              {activeLots.map(({ lot, auction }) => (
                <li key={lot.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 last:border-b-0">
                  <div className="min-w-0">
                    <Link to={`/leiloes/${auction.id}/lotes/${lot.id}`} className="font-medium hover:text-abyss-700">
                      Lote {String(lot.number).padStart(2, '0')} — {lot.title}
                    </Link>
                    <p className="truncate text-xs text-slate-500">{auction.title}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-abyss-950">{lot.currentPrice ? formatBRL(lot.currentPrice) : 'sem lances'}</span>
                    <LotCountdown lot={lot} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <Link to="/vendedor/novo-leilao" className="card flex items-center gap-4 border-dashed p-5 transition hover:border-coral-300 hover:shadow-lift">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-coral-50 text-coral-600">
              <PlusCircle className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold text-abyss-950">Criar novo leilão</p>
              <p className="text-sm text-slate-500">Cadastre vários lotes com fotos e vídeos.</p>
            </div>
          </Link>
          <div className="card p-5">
            <h3 className="font-semibold">Seus leilões</h3>
            <ul className="mt-3 space-y-2">
              {auctions.map((a) => (
                <li key={a.auction.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-slate-700">{a.auction.title}</span>
                  <AuctionStatusBadge status={a.status} />
                </li>
              ))}
            </ul>
            <Link to="/vendedor/meus-leiloes" className="btn-outline mt-4 w-full">Ver todos</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
