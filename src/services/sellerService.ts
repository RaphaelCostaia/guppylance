import type { MockDb } from './auctionService'
import { summarizeAuction } from './auctionService'

/**
 * Dados do painel do vendedor (mock).
 * Futuro: endpoints autenticados restritos ao vendedor logado.
 */
export function getSellerAuctions(db: MockDb, sellerId: string) {
  return db.auctions
    .filter((a) => a.sellerId === sellerId)
    .map((a) => {
      const s = summarizeAuction(db, a)
      return {
        ...s,
        soldLots: s.lots.filter((l) => l.status === 'vendido').length,
        noBidLots: s.lots.filter((l) => l.status === 'sem_lances').length,
      }
    })
    .sort((a, b) => b.auction.createdAt.localeCompare(a.auction.createdAt))
}

export function getSellerStats(db: MockDb, sellerId: string) {
  const list = getSellerAuctions(db, sellerId)
  const lots = list.flatMap((s) => s.lots)
  return {
    activeAuctions: list.filter((s) => s.status === 'ativo').length,
    totalLots: lots.length,
    soldLots: lots.filter((l) => l.status === 'vendido').length,
    activeLots: lots.filter((l) => l.status === 'ativo').length,
    totalBids: lots.reduce((n, l) => n + l.bidCount, 0),
    /** Soma dos lances atuais de lotes vendidos + ativos com lance (valor potencial). */
    potentialValue: lots
      .filter((l) => l.status === 'vendido' || l.status === 'ativo')
      .reduce((n, l) => n + (l.currentPrice ?? 0), 0),
  }
}

export interface DraftAuctionPayload {
  title: string
  lots: unknown[]
}

/**
 * Publicação SIMULADA. Nada é persistido.
 * Futuro: `POST /auctions` com upload prévio de mídias para o storage.
 */
export async function simulatePublishAuction(payload: DraftAuctionPayload) {
  await new Promise((r) => setTimeout(r, 900))
  return { ok: true as const, id: `draft-${Date.now()}`, lotCount: payload.lots.length }
}
