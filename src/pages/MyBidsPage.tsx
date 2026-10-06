import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownRight, Trophy } from 'lucide-react'
import { useData } from '../state/DataProvider'
import { useAuth } from '../state/AuthProvider'
import { fetchMyBidTotals, getMyBids, type MyBidEntry } from '../services/auctionService'
import { PageLoader } from '../components/layout/Guards'
import { MediaView } from '../components/media/MediaView'
import { LotCountdown } from '../components/lot/LotCountdown'
import { LotStatusBadge } from '../components/ui/StatusBadge'
import { EmptyState } from '../components/ui/EmptyState'
import { formatBRL, padLotNumber } from '../lib/format'
import { isFinished } from '../lib/lotRules'

function MyBidCard({ entry }: { entry: MyBidEntry }) {
  const { lot, auction, myHighest, isLeading } = entry
  const live = lot.status === 'ativo' || lot.status === 'agendado'
  const href = `/leiloes/${auction.id}/lotes/${lot.id}`
  const cover = lot.media.find((m) => m.type === 'image') ?? { id: 'ph', type: 'image' as const, variety: lot.variety, label: lot.title }

  return (
    <article className="card flex flex-col overflow-hidden sm:flex-row">
      <Link to={href} className="relative aspect-[16/9] sm:aspect-auto sm:w-48 sm:shrink-0">
        <MediaView item={cover} variant={lot.number} />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs text-slate-500">{auction.title}</p>
            <h3 className="font-semibold">
              <Link to={href} className="hover:text-abyss-700">{padLotNumber(lot.number)} — {lot.title}</Link>
            </h3>
          </div>
          <LotStatusBadge status={lot.status} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-slate-50 p-2.5">
            <p className="text-xs text-slate-500">Seu lance</p>
            <p className="font-bold text-abyss-950">{formatBRL(myHighest)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5">
            <p className="text-xs text-slate-500">Maior lance</p>
            <p className="font-bold text-abyss-950">{formatBRL(lot.currentPrice ?? 0)}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {live ? (
            isLeading ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <Trophy className="h-3.5 w-3.5" /> Você está liderando
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                <ArrowDownRight className="h-3.5 w-3.5" /> Você foi superado
              </span>
            )
          ) : (
            <span className="text-xs font-medium text-slate-500">
              {lot.status === 'vendido' && isLeading ? 'Você venceu este lote' : 'Disputa encerrada'}
            </span>
          )}
          <LotCountdown lot={lot} />
        </div>

        {live && (
          <Link to={href} className={`${isLeading ? 'btn-outline' : 'btn-primary'} mt-4 w-full sm:w-auto sm:self-end`}>
            {isLeading ? 'Acompanhar lote' : 'Cobrir lance'}
          </Link>
        )}
      </div>
    </article>
  )
}

export function MyBidsPage() {
  const { db, loading } = useData()
  const { session, profile } = useAuth()
  const userId = session!.user.id
  const [tab, setTab] = useState<'ativos' | 'encerrados'>('ativos')
  const [totals, setTotals] = useState<Map<string, number> | null>(null)

  // Recalcula quando qualquer lote muda (ex.: alguém cobriu seu lance).
  const lotsVersion = db.lots.reduce((n, l) => n + l.bidCount, 0)
  useEffect(() => {
    fetchMyBidTotals(userId).then(setTotals).catch(console.error)
  }, [userId, lotsVersion])

  if (loading || !totals) return <PageLoader />
  const entries = getMyBids(db, totals, userId)
  const active = entries.filter((e) => !isFinished(e.lot.status))
  const ended = entries.filter((e) => isFinished(e.lot.status))
  const list = tab === 'ativos' ? active : ended

  return (
    <div className="container-page py-10">
      <p className="eyebrow">Área do comprador</p>
      <h1 className="mt-1 text-3xl font-bold">Meus lances</h1>
      <p className="mt-1 text-slate-500">Lotes em que você está participando como <strong>{profile?.nickname}</strong>.</p>

      <div className="mt-8 inline-flex rounded-xl bg-slate-100 p-1">
        {(['ativos', 'encerrados'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${tab === t ? 'bg-white text-abyss-950 shadow-sm' : 'text-slate-500'}`}>
            {t} <span className="ml-1 text-xs text-slate-400">{t === 'ativos' ? active.length : ended.length}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {list.map((e) => (
          <MyBidCard key={e.lot.id} entry={e} />
        ))}
      </div>
      {list.length === 0 && (
        <EmptyState title="Nenhum lance por aqui" description="Explore os leilões ativos e participe." action={<Link to="/leiloes" className="btn-primary">Ver leilões</Link>} />
      )}
    </div>
  )
}
