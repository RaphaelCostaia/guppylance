import { Link, useParams } from 'react-router-dom'
import { CalendarDays, ChevronLeft, Layers, MapPin, Truck } from 'lucide-react'
import { useMockDb } from '../state/MockDbProvider'
import { getAuctionById } from '../services/auctionService'
import { FishPlaceholder } from '../components/media/FishPlaceholder'
import { AuctionStatusBadge } from '../components/ui/StatusBadge'
import { SellerCard } from '../components/seller/SellerCard'
import { LotCard } from '../components/lot/LotCard'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDateTime } from '../lib/format'

export function AuctionDetailPage() {
  const { id = '' } = useParams()
  const { db } = useMockDb()
  const summary = getAuctionById(db, id)

  if (!summary || summary.status === 'rascunho') {
    return (
      <div className="container-page py-16">
        <EmptyState title="Leilão não encontrado" description="Ele pode ter sido removido ou o link está incorreto." action={<Link to="/leiloes" className="btn-dark">Ver leilões</Link>} />
      </div>
    )
  }

  const { auction, seller, lots, status, activeLots, totalBids } = summary
  const sold = lots.filter((l) => l.status === 'vendido').length

  return (
    <div>
      {/* Banner */}
      <section className="relative overflow-hidden bg-abyss-950">
        <div className="absolute inset-0 opacity-70">
          <FishPlaceholder variety={auction.coverVariety} variant={2} className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-abyss-950/70 to-abyss-950/10" />
        <div className="container-page relative pb-10 pt-6 sm:pt-10">
          <Link to="/leiloes" className="inline-flex items-center gap-1 text-sm font-medium text-abyss-200 hover:text-white">
            <ChevronLeft className="h-4 w-4" /> Todos os leilões
          </Link>
          <div className="mt-16 sm:mt-24">
            <AuctionStatusBadge status={status} className="bg-white/95" />
            <h1 className="mt-3 max-w-3xl text-3xl font-extrabold text-white sm:text-4xl">{auction.title}</h1>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-abyss-200">
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Início {formatDateTime(auction.startsAt)}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {auction.city}/{auction.state}</span>
              <span className="inline-flex items-center gap-1.5"><Layers className="h-4 w-4" /> {lots.length} lotes</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Sobre este leilão</h2>
          <p className="mt-2 leading-relaxed text-slate-600">{auction.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['Lotes', lots.length],
              ['Ativos', activeLots],
              ['Vendidos', sold],
              ['Lances', totalBids],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">{k}</dt>
                <dd className="text-xl font-bold text-abyss-950">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 flex items-start gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-abyss-600" />
            {auction.pickupShippingInfo}
          </p>
        </div>
        {seller && <SellerCard seller={seller} />}
      </div>

      <section className="container-page mt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold">Lotes deste leilão</h2>
            <p className="text-sm text-slate-500">Cada lote tem disputa, contador e horário de encerramento próprios.</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lots.map((l) => (
            <LotCard key={l.id} lot={l} />
          ))}
        </div>
      </section>
    </div>
  )
}
