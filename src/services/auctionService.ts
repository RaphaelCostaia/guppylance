import type { Auction, AuctionStatus, Bid, Lot, Seller } from '../types/auction'
import { deriveAuctionStatus } from '../lib/lotRules'

/**
 * Camada de leitura de dados.
 * Hoje opera sobre o "banco" em memória (mock + estado local, ver state/MockDbProvider.tsx).
 * Futuro: cada função vira uma chamada ao backend (REST/RPC) mantendo as mesmas assinaturas de retorno.
 */
export interface MockDb {
  auctions: Auction[]
  lots: Lot[]
  bids: Bid[]
  sellers: Seller[]
}

export interface AuctionSummary {
  auction: Auction
  seller: Seller | undefined
  lots: Lot[]
  status: AuctionStatus
  activeLots: number
  /** Próximo encerramento entre os lotes ativos (para "Encerrando em breve"). */
  nextEndsAt: string | null
  totalBids: number
}

export function getSeller(db: MockDb, id: string) {
  return db.sellers.find((s) => s.id === id)
}

export function getLotsByAuction(db: MockDb, auctionId: string) {
  return db.lots.filter((l) => l.auctionId === auctionId).sort((a, b) => a.number - b.number)
}

export function summarizeAuction(db: MockDb, auction: Auction): AuctionSummary {
  const lots = getLotsByAuction(db, auction.id)
  const active = lots.filter((l) => l.status === 'ativo')
  const nextEndsAt = active.map((l) => l.endsAt).sort()[0] ?? null
  return {
    auction,
    seller: getSeller(db, auction.sellerId),
    lots,
    status: deriveAuctionStatus(lots),
    activeLots: active.length,
    nextEndsAt,
    totalBids: lots.reduce((n, l) => n + l.bidCount, 0),
  }
}

/** Leilões públicos (rascunhos ficam de fora). */
export function getPublicAuctions(db: MockDb): AuctionSummary[] {
  return db.auctions.map((a) => summarizeAuction(db, a)).filter((s) => s.status !== 'rascunho')
}

export function getAuctionById(db: MockDb, id: string) {
  const a = db.auctions.find((x) => x.id === id)
  return a ? summarizeAuction(db, a) : undefined
}

export function getLot(db: MockDb, auctionId: string, lotId: string) {
  return db.lots.find((l) => l.id === lotId && l.auctionId === auctionId)
}

export function getBidsByLot(db: MockDb, lotId: string) {
  return db.bids
    .filter((b) => b.lotId === lotId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.amount - a.amount)
}

// ── Área do comprador ──

export interface MyBidEntry {
  lot: Lot
  auction: Auction
  myHighest: number
  isLeading: boolean
}

/** Lotes em que o participante deu ao menos um lance. */
export function getMyBids(db: MockDb, alias: string): MyBidEntry[] {
  const byLot = new Map<string, number>()
  for (const b of db.bids) {
    if (b.participantAlias !== alias) continue
    byLot.set(b.lotId, Math.max(byLot.get(b.lotId) ?? 0, b.amount))
  }
  const entries: MyBidEntry[] = []
  for (const [lotId, myHighest] of byLot) {
    const lot = db.lots.find((l) => l.id === lotId)
    const auction = lot && db.auctions.find((a) => a.id === lot.auctionId)
    if (!lot || !auction) continue
    entries.push({ lot, auction, myHighest, isLeading: myHighest === lot.currentPrice })
  }
  return entries.sort((a, b) => a.lot.endsAt.localeCompare(b.lot.endsAt))
}

export interface WonGroup {
  auction: Auction
  lots: Lot[]
  total: number
}

/** Lotes vendidos ao participante, agrupados por leilão. Vencedor é definido pelo backend no futuro. */
export function getWonLots(db: MockDb, alias: string): WonGroup[] {
  const won = db.lots.filter((l) => l.status === 'vendido' && l.winnerAlias === alias)
  const groups = new Map<string, WonGroup>()
  for (const lot of won) {
    const auction = db.auctions.find((a) => a.id === lot.auctionId)!
    const g = groups.get(auction.id) ?? { auction, lots: [], total: 0 }
    g.lots.push(lot)
    g.total += lot.currentPrice ?? 0
    groups.set(auction.id, g)
  }
  return [...groups.values()].map((g) => ({ ...g, lots: g.lots.sort((a, b) => a.number - b.number) }))
}
