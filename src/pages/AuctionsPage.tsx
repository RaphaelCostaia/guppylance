import { useSearchParams } from 'react-router-dom'
import { useData } from '../state/DataProvider'
import { getPublicAuctions, type AuctionSummary } from '../services/auctionService'
import { AuctionCard } from '../components/auction/AuctionCard'
import { AuctionFilters, type SortKey, type StatusFilter } from '../components/auction/AuctionFilters'
import { EmptyState } from '../components/ui/EmptyState'
import { PageLoader } from '../components/layout/Guards'

const matchStatus = (s: AuctionSummary, f: StatusFilter) =>
  f === 'todos' ||
  (f === 'ativos' && s.status === 'ativo') ||
  (f === 'proximos' && s.status === 'agendado') ||
  (f === 'encerrados' && (s.status === 'encerrado' || s.status === 'cancelado'))

const norm = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function AuctionsPage() {
  const { db, loading } = useData()
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') as StatusFilter) || 'todos'
  const q = params.get('q') ?? ''
  const variety = params.get('variedade') ?? ''
  const sort = (params.get('ordem') as SortKey) || 'encerra'

  const all = getPublicAuctions(db)
  const varieties = [...new Set(db.lots.map((l) => l.variety))].sort()

  // A busca livre procura no título E nas variedades dos lotes (ex.: "Moscow").
  const textMatch = (s: AuctionSummary) =>
    !q || norm(s.auction.title).includes(norm(q)) || s.lots.some((l) => norm(l.variety).includes(norm(q)) || norm(l.title).includes(norm(q)))
  const varietyMatch = (s: AuctionSummary) => !variety || s.lots.some((l) => l.variety === variety)

  const base = all.filter((s) => textMatch(s) && varietyMatch(s))
  const counts = {
    todos: base.length,
    ativos: base.filter((s) => matchStatus(s, 'ativos')).length,
    proximos: base.filter((s) => matchStatus(s, 'proximos')).length,
    encerrados: base.filter((s) => matchStatus(s, 'encerrados')).length,
  }

  const list = base
    .filter((s) => matchStatus(s, status))
    .sort((a, b) => {
      if (sort === 'recentes') return b.auction.createdAt.localeCompare(a.auction.createdAt)
      if (sort === 'lotes') return b.lots.length - a.lots.length
      // encerrando primeiro: ativos pelo próximo encerramento, depois agendados, depois encerrados
      const key = (s: AuctionSummary) => s.nextEndsAt ?? (s.status === 'agendado' ? `9${s.auction.startsAt}` : `Z${s.auction.startsAt}`)
      return key(a).localeCompare(key(b))
    })

  const update = (patch: Partial<{ status: StatusFilter; q: string; variety: string; sort: SortKey }>) => {
    const next = new URLSearchParams(params)
    const set = (k: string, v: string | undefined, def: string) => (v === undefined ? null : v && v !== def ? next.set(k, v) : next.delete(k))
    set('status', patch.status, 'todos')
    set('q', patch.q, '')
    set('variedade', patch.variety, '')
    set('ordem', patch.sort, 'encerra')
    setParams(next, { replace: true })
  }

  return (
    <div className="container-page py-10">
      <p className="eyebrow">Explorar</p>
      <h1 className="mt-1 text-3xl font-bold">Leilões</h1>
      <p className="mt-1 text-slate-500">Encontre lotes de Guppys de criadores de todo o Brasil.</p>

      <div className="mt-8">
        <AuctionFilters status={status} q={q} variety={variety} sort={sort} varieties={varieties} counts={counts} onChange={update} />
      </div>

      <div className="mt-8">
        {loading ? (
          <PageLoader />
        ) : list.length === 0 ? (
          <EmptyState
            title="Nenhum leilão encontrado"
            description="Tente outra busca ou limpe os filtros."
            action={
              <button className="btn-outline" onClick={() => setParams({}, { replace: true })}>
                Limpar filtros
              </button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <AuctionCard key={s.auction.id} summary={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
