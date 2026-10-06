import { Link } from 'react-router-dom'
import { CreditCard, Trophy } from 'lucide-react'
import { useData } from '../state/DataProvider'
import { useAuth } from '../state/AuthProvider'
import { getWonLots } from '../services/auctionService'
import { PageLoader } from '../components/layout/Guards'
import { MediaView } from '../components/media/MediaView'
import { EmptyState } from '../components/ui/EmptyState'
import { formatBRL, formatDate, padLotNumber } from '../lib/format'

export function WonLotsPage() {
  const { db, loading } = useData()
  const { session } = useAuth()
  const groups = getWonLots(db, session!.user.id)
  const grandTotal = groups.reduce((n, g) => n + g.total, 0)

  if (loading) return <PageLoader />

  return (
    <div className="container-page py-10">
      <p className="eyebrow">Área do comprador</p>
      <h1 className="mt-1 text-3xl font-bold">Lotes ganhos</h1>
      <p className="mt-1 text-slate-500">Lotes arrematados por você.</p>

      {groups.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Você ainda não venceu nenhum lote" action={<Link to="/leiloes" className="btn-primary">Ver leilões</Link>} />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {groups.map((g) => (
              <section key={g.auction.id} className="card overflow-hidden">
                <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div>
                    <Link to={`/leiloes/${g.auction.id}`} className="font-semibold text-abyss-950 hover:text-abyss-700">{g.auction.title}</Link>
                    <p className="text-xs text-slate-500">Encerrado em {formatDate(g.lots[0]!.endsAt)}</p>
                  </div>
                  <Trophy className="h-5 w-5 text-amber-500" />
                </header>
                <ul>
                  {g.lots.map((l) => (
                    <li key={l.id} className="flex items-center gap-4 border-b border-slate-100 px-5 py-3 last:border-b-0">
                      <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg">
                        <MediaView item={l.media.find((m) => m.type === 'image') ?? { id: 'ph', type: 'image', variety: l.variety, label: l.title }} variant={l.number} size="sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link to={`/leiloes/${g.auction.id}/lotes/${l.id}`} className="font-medium hover:text-abyss-700">
                          {padLotNumber(l.number)} — {l.title}
                        </Link>
                        <p className="text-xs text-slate-500">{l.composition}</p>
                      </div>
                      <p className="font-bold text-abyss-950">{formatBRL(l.currentPrice ?? 0)}</p>
                    </li>
                  ))}
                </ul>
                <footer className="flex justify-between bg-slate-50 px-5 py-3 text-sm">
                  <span className="text-slate-600">Total do leilão</span>
                  <strong className="text-abyss-950">{formatBRL(g.total)}</strong>
                </footer>
              </section>
            ))}
          </div>

          <aside className="card h-fit p-5 lg:sticky lg:top-24">
            <p className="text-sm text-slate-500">Total arrematado</p>
            <p className="mt-1 text-3xl font-extrabold text-abyss-950">{formatBRL(grandTotal)}</p>
            <p className="mt-1 text-xs text-slate-500">{groups.reduce((n, g) => n + g.lots.length, 0)} lotes</p>
            <button disabled className="btn-primary mt-5 w-full">
              <CreditCard className="h-4 w-4" /> Pagamento em breve
            </button>
            <p className="mt-3 text-xs text-slate-500">Pagamento e frete ainda não estão disponíveis na plataforma. Combine diretamente com o organizador do leilão.</p>
          </aside>
        </div>
      )}
    </div>
  )
}
