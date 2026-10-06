import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Ban, Plus } from 'lucide-react'
import { useData } from '../../state/DataProvider'
import { useAuth } from '../../state/AuthProvider'
import { cancelAuction, getSellerAuctions } from '../../services/sellerService'
import { AuctionStatusBadge } from '../../components/ui/StatusBadge'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/Toast'
import type { AuctionStatus } from '../../types/auction'

export function MyAuctionsPage() {
  const { db, reload } = useData()
  const { session } = useAuth()
  const toast = useToast()
  const list = getSellerAuctions(db, session?.user.id ?? '')
  const [toCancel, setToCancel] = useState<{ id: string; title: string } | null>(null)

  const confirmCancel = async () => {
    if (!toCancel) return
    const err = await cancelAuction(toCancel.id)
    setToCancel(null)
    if (err) return toast(err)
    toast('Leilão cancelado. Novos lances não serão aceitos.', 'success')
    await reload()
  }

  const actions = (id: string, title: string, status: AuctionStatus) => (
    <div className="flex justify-end gap-2">
      {status !== 'rascunho' && (
        <Link to={`/leiloes/${id}`} className="btn-outline px-3 py-1.5 text-xs">
          Ver detalhes
        </Link>
      )}
      {(status === 'ativo' || status === 'agendado') && (
        <button onClick={() => setToCancel({ id, title })} className="btn-ghost px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50">
          <Ban className="h-3.5 w-3.5" /> Cancelar
        </button>
      )}
    </div>
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

      {list.length === 0 && (
        <EmptyState title="Nenhum leilão ainda" description="Crie o primeiro leilão com seus lotes." action={<Link to="/vendedor/novo-leilao" className="btn-primary">Novo leilão</Link>} />
      )}

      {/* Tabela (desktop) */}
      {list.length > 0 && (
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
                  <td className="px-5 py-4">{actions(a.auction.id, a.auction.title, a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
            <div className="mt-3">{actions(a.auction.id, a.auction.title, a.status)}</div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!toCancel}
        danger
        title="Cancelar este leilão?"
        description={`"${toCancel?.title}" deixará de aceitar lances imediatamente. O histórico de lances é preservado.`}
        confirmLabel="Cancelar leilão"
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      />
    </div>
  )
}
