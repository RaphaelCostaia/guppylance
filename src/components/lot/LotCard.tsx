import { Link } from 'react-router-dom'
import { Gavel, Video } from 'lucide-react'
import type { Lot } from '../../types/auction'
import { MediaView } from '../media/MediaView'
import { LotStatusBadge } from '../ui/StatusBadge'
import { LotCountdown } from './LotCountdown'
import { formatBRL, padLotNumber } from '../../lib/format'
import { displayStatus, isAwaitingOfficialClose, nextMinimumBid } from '../../lib/lotRules'
import { useNow } from '../../hooks/useCountdown'

export function LotCard({ lot }: { lot: Lot }) {
  const now = useNow()
  const href = `/leiloes/${lot.auctionId}/lotes/${lot.id}`
  const cover = lot.media.find((m) => m.type === 'image') ?? lot.media[0] ?? { id: 'ph', type: 'image' as const, variety: lot.variety, label: lot.title }
  const hasVideo = lot.media.some((m) => m.type === 'video')
  const finished = lot.status === 'vendido' || lot.status === 'sem_lances' || lot.status === 'cancelado'

  return (
    <article className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={href} className="relative block aspect-[4/3] overflow-hidden">
        {cover && <MediaView item={cover} variant={lot.number} className="transition duration-500 group-hover:scale-105" />}
        <span className="absolute left-3 top-3 rounded-lg bg-abyss-950/80 px-2 py-1 text-xs font-bold text-white backdrop-blur">
          {padLotNumber(lot.number)}
        </span>
        <div className="absolute right-3 top-3">
          <LotStatusBadge status={displayStatus(lot, now)} awaiting={isAwaitingOfficialClose(lot, now)} className="bg-white/95" />
        </div>
        {hasVideo && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white">
            <Video className="h-3 w-3" /> vídeo
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-coral-600">{lot.variety}</p>
        <h3 className="mt-0.5 text-base font-semibold">
          <Link to={href} className="hover:text-abyss-700">
            {lot.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">
          {lot.composition} · {lot.quantity} {lot.quantity === 1 ? 'peixe' : 'peixes'}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {lot.status === 'vendido' ? 'Arrematado' : lot.currentPrice == null ? 'Valor inicial' : 'Lance atual'}
            </p>
            <p className="text-lg font-bold text-abyss-950">{formatBRL(lot.currentPrice ?? lot.startingPrice)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{finished ? 'Lances' : 'Próximo lance'}</p>
            <p className="text-lg font-bold text-slate-700">{finished ? lot.bidCount : formatBRL(nextMinimumBid(lot))}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Gavel className="h-3.5 w-3.5" /> {lot.bidCount} {lot.bidCount === 1 ? 'lance' : 'lances'}
          </span>
          <LotCountdown lot={lot} />
        </div>

        <Link to={href} className={`${lot.status === 'ativo' ? 'btn-primary' : 'btn-outline'} mt-4 w-full`}>
          Ver lote
        </Link>
      </div>
    </article>
  )
}
