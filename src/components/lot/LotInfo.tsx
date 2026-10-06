import type { Auction, Lot, Seller } from '../../types/auction'
import { formatBRL } from '../../lib/format'

export function LotInfo({ lot, auction, seller }: { lot: Lot; auction: Auction; seller?: Seller }) {
  const rows: [string, string][] = [
    ['Variedade / linhagem', lot.variety],
    ['Quantidade', `${lot.quantity} ${lot.quantity === 1 ? 'peixe' : 'peixes'}`],
    ['Sexo / composição', lot.composition],
    ['Idade aproximada', lot.ageApprox],
    ['Criador', seller?.name ?? '—'],
    ['Localização', `${auction.city}/${auction.state}`],
    ['Valor inicial', formatBRL(lot.startingPrice)],
    ['Incremento mínimo', formatBRL(lot.minIncrement)],
  ]

  return (
    <section className="card p-5">
      <h2 className="text-lg font-semibold">Informações do lote</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{lot.description}</p>
      <dl className="mt-5 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-t border-slate-100 py-2.5 text-sm">
            <dt className="text-slate-500">{k}</dt>
            <dd className="text-right font-medium text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
        <strong className="text-slate-700">Retirada / envio:</strong> {auction.pickupShippingInfo}
      </div>
    </section>
  )
}
