import type { AuctionStatus, LotStatus } from '../../types/auction'
import { AUCTION_STATUS_LABEL, LOT_STATUS_LABEL } from '../../lib/lotRules'

type Tone = 'live' | 'scheduled' | 'sold' | 'neutral' | 'danger' | 'draft' | 'warning'

const TONE: Record<Tone, string> = {
  live: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  scheduled: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  sold: 'bg-abyss-50 text-abyss-800 ring-abyss-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  draft: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  warning: 'bg-orange-50 text-orange-700 ring-orange-600/20',
}

const LOT_TONE: Record<LotStatus, Tone> = {
  rascunho: 'draft',
  agendado: 'scheduled',
  ativo: 'live',
  vendido: 'sold',
  sem_lances: 'neutral',
  cancelado: 'danger',
}

const AUCTION_TONE: Record<AuctionStatus, Tone> = {
  rascunho: 'draft',
  agendado: 'scheduled',
  ativo: 'live',
  encerrado: 'neutral',
  cancelado: 'danger',
}

interface Props {
  className?: string
  /** Lote "ativo" com contador zerado aguardando o resultado oficial do servidor. */
  awaiting?: boolean
}

export function Badge({ tone, children, pulse, className = '' }: { tone: Tone; children: React.ReactNode; pulse?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONE[tone]} ${className}`}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      )}
      {children}
    </span>
  )
}

export function LotStatusBadge({ status, awaiting, className }: Props & { status: LotStatus }) {
  if (awaiting) return <Badge tone="warning" className={className}>Encerrado · apurando</Badge>
  return (
    <Badge tone={LOT_TONE[status]} pulse={status === 'ativo'} className={className}>
      {LOT_STATUS_LABEL[status]}
    </Badge>
  )
}

export function AuctionStatusBadge({ status, className }: Props & { status: AuctionStatus }) {
  return (
    <Badge tone={AUCTION_TONE[status]} pulse={status === 'ativo'} className={className}>
      {AUCTION_STATUS_LABEL[status]}
    </Badge>
  )
}
