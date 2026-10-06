import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Gavel } from 'lucide-react'
import { useMockDb } from '../state/MockDbProvider'
import { getAuctionById, getBidsByLot, getLot } from '../services/auctionService'
import { LotMediaGallery } from '../components/lot/LotMediaGallery'
import { LotInfo } from '../components/lot/LotInfo'
import { BidPanel } from '../components/lot/BidPanel'
import { BidHistory } from '../components/lot/BidHistory'
import { LotCountdown } from '../components/lot/LotCountdown'
import { SellerCard } from '../components/seller/SellerCard'
import { EmptyState } from '../components/ui/EmptyState'
import { formatBRL, padLotNumber } from '../lib/format'
import { nextMinimumBid } from '../lib/lotRules'
import { useToast } from '../components/ui/Toast'

export function LotPage() {
  const { leilaoId = '', loteId = '' } = useParams()
  const { db, user, placeBid } = useMockDb()
  const toast = useToast()
  const summary = getAuctionById(db, leilaoId)
  const lot = getLot(db, leilaoId, loteId)

  if (!summary || !lot || summary.status === 'rascunho') {
    return (
      <div className="container-page py-16">
        <EmptyState title="Lote não encontrado" action={<Link to="/leiloes" className="btn-dark">Ver leilões</Link>} />
      </div>
    )
  }

  const { auction, seller, lots } = summary
  const bids = getBidsByLot(db, lot.id)
  const isOwnLot = user.sellerId === auction.sellerId
  const isLeading = bids[0]?.participantAlias === user.alias
  const idx = lots.findIndex((l) => l.id === lot.id)
  const prev = lots[idx - 1]
  const next = lots[idx + 1]

  const handleBid = (amount: number) => {
    const res = placeBid(lot.id, amount)
    if (res.ok) toast('Lance simulado registrado!', 'success')
    return res
  }

  return (
    <div className="pb-28 lg:pb-0">
      <div className="container-page pt-6">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
          <Link to="/leiloes" className="hover:text-abyss-800">Leilões</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/leiloes/${auction.id}`} className="line-clamp-1 hover:text-abyss-800">{auction.title}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-slate-700">{padLotNumber(lot.number)}</span>
        </nav>
      </div>

      <div className="container-page mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
        {/* Coluna principal */}
        <div className="min-w-0 space-y-6">
          {/* Título (no mobile vem antes da galeria para leitura rápida) */}
          <header className="lg:hidden">
            <p className="text-sm font-semibold text-abyss-600">{padLotNumber(lot.number)} · {lot.variety}</p>
            <h1 className="text-2xl font-extrabold">{lot.title}</h1>
          </header>

          <LotMediaGallery media={lot.media} />

          {/* Painel de lance no mobile logo após a mídia */}
          <div className="lg:hidden">
            <BidPanel lot={lot} isOwnLot={isOwnLot} isLeading={isLeading} onPlaceBid={handleBid} />
          </div>

          <LotInfo lot={lot} auction={auction} seller={seller} />
          <BidHistory bids={bids} myAlias={user.alias} />
        </div>

        {/* Coluna lateral (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <header>
              <p className="text-sm font-semibold text-abyss-600">{padLotNumber(lot.number)} · {lot.variety}</p>
              <h1 className="mt-1 text-3xl font-extrabold leading-tight">{lot.title}</h1>
              <p className="mt-1 text-slate-500">{lot.composition} · {lot.ageApprox}</p>
            </header>
            <BidPanel lot={lot} isOwnLot={isOwnLot} isLeading={isLeading} onPlaceBid={handleBid} />
            {seller && <div className="card p-4"><SellerCard seller={seller} compact /></div>}
          </div>
        </aside>
      </div>

      {/* Navegação entre lotes */}
      <div className="container-page mt-10 flex items-center justify-between gap-3">
        {prev ? (
          <Link to={`/leiloes/${auction.id}/lotes/${prev.id}`} className="btn-outline">
            <ChevronLeft className="h-4 w-4" /> {padLotNumber(prev.number)}
          </Link>
        ) : <span />}
        <Link to={`/leiloes/${auction.id}`} className="text-sm font-medium text-abyss-700 hover:underline">Todos os lotes</Link>
        {next ? (
          <Link to={`/leiloes/${auction.id}/lotes/${next.id}`} className="btn-outline">
            {padLotNumber(next.number)} <ChevronRight className="h-4 w-4" />
          </Link>
        ) : <span />}
      </div>

      {/* Barra fixa no mobile: preço + contador + atalho para o painel */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(6,37,48,0.25)] backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-extrabold leading-tight text-abyss-950">{formatBRL(lot.currentPrice ?? lot.startingPrice)}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {lot.status === 'ativo' && <span className="whitespace-nowrap">mín. {formatBRL(nextMinimumBid(lot))}</span>}
              <LotCountdown lot={lot} />
            </div>
          </div>
          <a href="#painel-lance" className={lot.status === 'ativo' && !isOwnLot ? 'btn-primary' : 'btn-outline'}>
            <Gavel className="h-4 w-4" /> {lot.status === 'ativo' && !isOwnLot ? 'Dar lance' : 'Detalhes'}
          </a>
        </div>
      </div>
    </div>
  )
}
