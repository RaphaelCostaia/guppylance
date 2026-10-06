import { Link } from 'react-router-dom'
import { CalendarDays, Layers, MapPin } from 'lucide-react'
import type { AuctionSummary } from '../../services/auctionService'
import { FishPlaceholder } from '../media/FishPlaceholder'
import { AuctionStatusBadge } from '../ui/StatusBadge'
import { LotCountdown } from '../lot/LotCountdown'
import { formatDate } from '../../lib/format'

export function AuctionCard({ summary }: { summary: AuctionSummary }) {
  const { auction, seller, lots, status, activeLots, nextEndsAt } = summary
  const href = `/leiloes/${auction.id}`

  return (
    <article className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={href} className="relative block aspect-[16/10] overflow-hidden">
        <FishPlaceholder variety={auction.coverVariety} variant={2} className="h-full w-full transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3">
          <AuctionStatusBadge status={status} className="bg-white/95" />
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          {lots.length} lotes
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-slate-500">{seller?.name}</p>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug">
          <Link to={href} className="hover:text-abyss-700">
            {auction.title}
          </Link>
        </h3>

        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            {activeLots} {activeLots === 1 ? 'lote ativo' : 'lotes ativos'}
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            {formatDate(auction.startsAt)}
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {auction.city}/{auction.state}
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          {nextEndsAt ? (
            <LotCountdown lot={{ status: 'ativo', startsAt: auction.startsAt, endsAt: nextEndsAt }} />
          ) : status === 'agendado' ? (
            <LotCountdown lot={{ status: 'agendado', startsAt: auction.startsAt, endsAt: auction.startsAt }} />
          ) : (
            <span className="text-xs text-slate-500">Leilão finalizado</span>
          )}
          <Link to={href} className="btn-dark px-3 py-2 text-xs">
            Ver leilão
          </Link>
        </div>
      </div>
    </article>
  )
}
