import { useEffect, useId, useState, type FormEvent } from 'react'
import { AlertCircle, CheckCircle2, Gavel, ShieldCheck, Trophy } from 'lucide-react'
import type { Lot } from '../../types/auction'
import type { PlaceBidResult } from '../../services/bidService'
import { formatBRL } from '../../lib/format'
import { isAwaitingOfficialClose, nextMinimumBid } from '../../lib/lotRules'
import { LotCountdown } from './LotCountdown'
import { LotStatusBadge } from '../ui/StatusBadge'
import { useNow } from '../../hooks/useCountdown'

interface Props {
  lot: Lot
  isOwnLot: boolean
  isLeading: boolean
  /** Hoje: lance simulado em estado local. Futuro: chamada ao backend (ver services/bidService.ts). */
  onPlaceBid: (amount: number) => PlaceBidResult
}

export function BidPanel({ lot, isOwnLot, isLeading, onPlaceBid }: Props) {
  const now = useNow()
  const inputId = useId()
  const min = nextMinimumBid(lot)
  const [value, setValue] = useState(String(min))
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  // Mantém o campo sugerindo o mínimo sempre que o lance atual mudar.
  useEffect(() => {
    setValue(String(min))
  }, [min])

  const awaiting = isAwaitingOfficialClose(lot, now)
  // Desabilitar aqui é só UX; quem recusa lances fora do prazo é o servidor.
  const canBid = lot.status === 'ativo' && !awaiting && !isOwnLot

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const amount = Number(value.replace(',', '.'))
    const res = onPlaceBid(amount)
    setFeedback(res.ok ? { ok: true, text: `Lance simulado de ${formatBRL(amount)} registrado.` } : { ok: false, text: res.error })
  }

  const quick = [min, min + lot.minIncrement, min + lot.minIncrement * 3]

  return (
    <section id="painel-lance" className="card scroll-mt-20 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <LotStatusBadge status={lot.status} awaiting={awaiting} />
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
          <Gavel className="h-4 w-4" />
          <strong className="text-abyss-950">{lot.bidCount}</strong> {lot.bidCount === 1 ? 'lance' : 'lances'}
        </span>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {lot.status === 'vendido' ? 'Arrematado por' : lot.currentPrice == null ? 'Valor inicial' : 'Lance atual'}
            </p>
            <p className="mt-0.5 text-3xl font-extrabold text-abyss-950">{formatBRL(lot.currentPrice ?? lot.startingPrice)}</p>
          </div>
          {lot.status !== 'vendido' && lot.status !== 'sem_lances' && lot.status !== 'cancelado' && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Próximo lance mínimo</p>
              <p className="mt-0.5 text-2xl font-bold text-coral-600">{formatBRL(min)}</p>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-abyss-50/70 px-4 py-3">
          <LotCountdown lot={lot} size="lg" />
        </div>

        {isLeading && lot.status === 'ativo' && (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <Trophy className="h-4 w-4" /> Você está liderando este lote
          </p>
        )}

        {isOwnLot ? (
          <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            Você é o vendedor deste lote e não pode dar lances nele.
          </p>
        ) : lot.status === 'ativo' && !awaiting ? (
          <form onSubmit={submit} className="space-y-3">
            <label className="label" htmlFor={inputId}>
              Seu lance (R$)
            </label>
            <div className="flex gap-2">
              <input
                id={inputId}
                inputMode="decimal"
                className="input text-lg font-semibold"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  setFeedback(null)
                }}
              />
            </div>
            <div className="flex gap-2">
              {quick.map((q) => (
                <button type="button" key={q} onClick={() => setValue(String(q))} className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-semibold text-slate-600 hover:border-abyss-300 hover:text-abyss-800">
                  {formatBRL(q)}
                </button>
              ))}
            </div>
            <button type="submit" disabled={!canBid} className="btn-primary w-full py-3.5 text-base">
              <Gavel className="h-5 w-5" /> Dar lance
            </button>
          </form>
        ) : (
          <p className="rounded-xl bg-slate-50 px-3 py-3 text-center text-sm text-slate-600">
            {lot.status === 'agendado'
              ? 'Este lote ainda não está aberto para lances.'
              : awaiting
                ? 'Tempo esgotado. O resultado oficial será confirmado pelo servidor.'
                : lot.status === 'vendido'
                  ? `Lote vendido para ${lot.winnerAlias}.`
                  : lot.status === 'sem_lances'
                    ? 'Lote encerrado sem lances.'
                    : 'Este lote não está disponível.'}
          </p>
        )}

        {feedback && (
          <p className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${feedback.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {feedback.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            {feedback.text}
          </p>
        )}

        <p className="flex items-start gap-2 text-xs text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-abyss-500" />
          Demonstração: lances são simulados localmente. Na versão final, o horário oficial e a validação de cada lance serão feitos pelo servidor.
        </p>
      </div>
    </section>
  )
}
