import { Clock } from 'lucide-react'
import type { Lot } from '../../types/auction'
import { useCountdown } from '../../hooks/useCountdown'
import { SOON_MS, URGENT_MS } from '../../lib/time'
import { formatDateTime } from '../../lib/format'

/**
 * Contador regressivo VISUAL de um lote.
 * Não é autoridade: o encerramento oficial e a validade de lances são decididos pelo servidor.
 */
export function LotCountdown({ lot, size = 'sm' }: { lot: Pick<Lot, 'status' | 'startsAt' | 'endsAt'>; size?: 'sm' | 'lg' }) {
  const target = lot.status === 'agendado' ? lot.startsAt : lot.endsAt
  const c = useCountdown(target)

  if (lot.status === 'vendido' || lot.status === 'sem_lances' || lot.status === 'cancelado' || lot.status === 'rascunho') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-slate-500 ${size === 'lg' ? 'text-base' : 'text-xs'}`}>
        <Clock className="h-3.5 w-3.5" />
        {lot.status === 'rascunho' ? 'Não publicado' : `Encerrado em ${formatDateTime(lot.endsAt)}`}
      </span>
    )
  }

  const prefix = lot.status === 'agendado' ? 'Abre em' : c.done ? 'Encerrado' : 'Encerra em'
  const tone = c.done
    ? 'text-slate-500'
    : lot.status === 'agendado'
      ? 'text-sky-700'
      : c.totalMs <= URGENT_MS
        ? 'text-rose-600'
        : c.totalMs <= SOON_MS
          ? 'text-coral-600'
          : 'text-abyss-800'

  if (size === 'lg') {
    return (
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{prefix}</p>
        <p className={`mt-0.5 font-mono text-3xl font-bold tabular-nums ${tone}`}>{c.done ? '00:00:00' : c.label}</p>
      </div>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${tone}`}>
      <Clock className="h-3.5 w-3.5" />
      {prefix} {!c.done && <span className="font-mono tabular-nums">{c.label}</span>}
    </span>
  )
}
