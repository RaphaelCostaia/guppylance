import { useState } from 'react'
import type { Bid } from '../../types/auction'
import { formatBRL, formatDateTime, formatTime } from '../../lib/format'
import { Trophy } from 'lucide-react'

/** Histórico de lances. Participantes aparecem pelo apelido público (nunca nome completo). */
export function BidHistory({ bids }: { bids: Bid[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? bids : bids.slice(0, 8)

  return (
    <section className="card">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-semibold">Histórico de lances</h2>
        <span className="text-sm text-slate-500">{bids.length} no total</span>
      </div>

      {bids.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-500">Nenhum lance ainda.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-2.5 font-medium">Participante</th>
              <th className="px-5 py-2.5 text-right font-medium">Valor</th>
              <th className="px-5 py-2.5 text-right font-medium">Horário</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((b, i) => {
              const mine = b.isMine
              const recent = Date.now() - new Date(b.createdAt).getTime() < 5000
              return (
                <tr key={b.id} className={`border-t border-slate-100 ${recent ? 'animate-flash' : ''}`}>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2">
                      {i === 0 && <Trophy className="h-4 w-4 text-amber-500" />}
                      <span className={mine ? 'font-semibold text-coral-600' : 'text-slate-700'}>{b.participantAlias}</span>
                      {mine && <span className="rounded bg-coral-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-coral-600">você</span>}
                    </span>
                  </td>
                  <td className={`px-5 py-3 text-right font-semibold ${i === 0 ? 'text-abyss-950' : 'text-slate-600'}`}>{formatBRL(b.amount)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-500" title={formatDateTime(b.createdAt)}>
                    {formatTime(b.createdAt)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {bids.length > 8 && (
        <button onClick={() => setExpanded((v) => !v)} className="w-full border-t border-slate-100 py-3 text-sm font-medium text-abyss-700 hover:bg-slate-50">
          {expanded ? 'Mostrar menos' : `Ver todos os ${bids.length} lances`}
        </button>
      )}
    </section>
  )
}
