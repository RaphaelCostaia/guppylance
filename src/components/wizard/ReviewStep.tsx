import { CalendarDays, Image, MapPin, Truck, Video } from 'lucide-react'
import type { DraftAuction, DraftLot } from './draft'
import { MediaView } from '../media/MediaView'
import { formatBRL, formatDateTime, padLotNumber } from '../../lib/format'

const toIso = (local: string) => (local ? new Date(local).toISOString() : '')

export function ReviewStep({ auction, lots }: { auction: DraftAuction; lots: DraftLot[] }) {
  return (
    <div className="space-y-6">
      <section className="card p-6">
        <p className="eyebrow">Informações gerais</p>
        <h2 className="mt-1 text-2xl font-bold">{auction.title}</h2>
        {auction.description && <p className="mt-2 text-slate-600">{auction.description}</p>}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-slate-400" /> Início {formatDateTime(toIso(auction.startsAt))}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" /> {auction.location}</span>
        </div>
        {auction.pickupShipping && (
          <p className="mt-3 flex items-start gap-2 text-sm text-slate-600"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />{auction.pickupShipping}</p>
        )}
      </section>

      <section>
        <h3 className="mb-3 font-semibold">{lots.length} {lots.length === 1 ? 'lote' : 'lotes'}</h3>
        <div className="space-y-4">
          {lots.map((l, i) => {
            const photos = l.media.filter((m) => m.type === 'image').length
            const videos = l.media.length - photos
            return (
              <div key={l.key} className="card flex flex-col gap-4 p-4 sm:flex-row">
                <div className="flex shrink-0 gap-2 overflow-x-auto sm:w-64 sm:flex-wrap">
                  {l.media.length === 0 ? (
                    <div className="grid h-20 w-full place-items-center rounded-xl bg-slate-100 text-xs text-slate-400">Sem mídia</div>
                  ) : (
                    l.media.slice(0, 4).map((m, k) => (
                      <div key={m.id} className="h-20 w-24 shrink-0 overflow-hidden rounded-xl sm:h-[74px] sm:w-[calc(50%-4px)]">
                        <MediaView item={m} variant={k} size="sm" />
                      </div>
                    ))
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-abyss-600">{padLotNumber(i + 1)} · {l.variety}</p>
                  <p className="font-semibold text-abyss-950">{l.title}</p>
                  <p className="text-sm text-slate-500">{l.composition} · {l.quantity} peixe(s){l.ageApprox && ` · ${l.ageApprox}`}</p>
                  {l.description && <p className="mt-1 text-sm text-slate-600">{l.description}</p>}
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 p-2"><dt className="text-xs text-slate-500">Valor inicial</dt><dd className="font-semibold">{formatBRL(l.startingPrice)}</dd></div>
                    <div className="rounded-lg bg-slate-50 p-2"><dt className="text-xs text-slate-500">Incremento</dt><dd className="font-semibold">{formatBRL(l.minIncrement)}</dd></div>
                    <div className="col-span-2 rounded-lg bg-slate-50 p-2 sm:col-span-1"><dt className="text-xs text-slate-500">Encerramento</dt><dd className="font-semibold">{formatDateTime(toIso(l.endsAt))}</dd></div>
                  </dl>
                  <p className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><Image className="h-3.5 w-3.5" /> {photos} foto(s)</span>
                    <span className="inline-flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {videos} vídeo(s)</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
