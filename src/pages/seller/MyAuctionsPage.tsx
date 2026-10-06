import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useMockDb } from '../../state/MockDbProvider'
import { getSellerAuctions } from '../../services/sellerService'
import { AuctionStatusBadge } from '../../components/ui/StatusBadge'
import { useToast } from '../../components/ui/Toast'

export function MyAuctionsPage() {
  const { db, user } = useMockDb()
  const toast = useToast()
  const list = getSellerAuctions(db, user.sellerId ?? '')

  const details = (id: string, status: string) =>
    status === 'rascunho' ? (
      <button onClick={() => toast('Edição de rascunhos chega numa próxima etapa.')} className="btn-outline px-3 py-1.5 text-xs">
        Ver detalhes
      </button>
    ) : (
      <Link to={`/leiloes/${id}`} className="btn-outline px-3 py-1.5 text-xs">
        Ver detalhes
      </Link>
    )

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Meus leilões</h2>
          <p className="text-sm text-slate-500">{list.length} leilões cadastrados</p>
        </div>
        <Link to="/vendedor/novo-leilao" className="btn-primary">
          <Plus className="h-4 w-4" /> Novo leilão
        </Link>
      </div>

      {/* Tabela (desktop) */}
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Leilão</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 text-center font-medium">Lotes</th>
              <th className="px-3 py-3 text-center font-medium">Ativos</th>
              <th className="px-3 py-3 text-center font-medium">Vendidos</th>
              <th className="px-3 py-3 text-center font-medium">Sem lance</th>
              <th className="px-3 py-3 text-center font-medium">Lances</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.auction.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                <td className="px-5 py-4 font-medium text-abyss-950">{a.auction.title}</td>
                <td className="px-3 py-4"><AuctionStatusBadge status={a.status} /></td>
                <td className="px-3 py-4 text-center">{a.lots.length}</td>
                <td className="px-3 py-4 text-center">{a.activeLots}</td>
                <td className="px-3 py-4 text-center">{a.soldLots}</td>
                <td className="px-3 py-4 text-center">{a.noBidLots}</td>
                <td className="px-3 py-4 text-center">{a.totalBids}</td>
                <td className="px-5 py-4 text-right">{details(a.auction.id, a.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="space-y-4 md:hidden">
        {list.map((a) => (
          <div key={a.auction.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-abyss-950">{a.auction.title}</p>
              <AuctionStatusBadge status={a.status} />
            </div>
            <dl className="mt-3 grid grid-cols-5 gap-2 text-center text-xs">
              {[
                ['Lotes', a.lots.length],
                ['Ativos', a.activeLots],
                ['Vend.', a.soldLots],
                ['S/ lance', a.noBidLots],
                ['Lances', a.totalBids],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-slate-50 py-2">
                  <dd className="text-base font-bold text-abyss-950">{v}</dd>
                  <dt className="text-slate-500">{k}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex justify-end">{details(a.auction.id, a.status)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
