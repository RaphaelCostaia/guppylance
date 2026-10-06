import type { Auction, AuctionStatus, Bid, Lot, Seller } from '../types/auction'
import { deriveAuctionStatus } from '../lib/lotRules'
import { supabase } from '../lib/supabase'
import { toAuction, toBid, toLot, toSeller, type AuctionRow, type BidPublicRow, type LotRow } from './mappers'

/**
 * Camada de dados de leilões.
 * - fetch*: chamadas ao Supabase (respeitam RLS).
 * - funções puras (summarize/get*): montam a visão a partir do que já foi carregado.
 */
export interface Db {
  auctions: Auction[]
  lots: Lot[]
  sellers: Seller[]
}

// ── Leitura no servidor ──

/** Carrega leilões visíveis (publicados/cancelados; admin vê também rascunhos), lotes e mídias. */
export async function fetchCatalog(): Promise<Db> {
  const { data, error } = await supabase
    .from('auctions')
    .select('*, lots(*, lot_media(*))')
    .order('created_at', { ascending: false })
  if (error) throw error

  const rows = (data ?? []) as (AuctionRow & { lots: LotRow[] })[]
  const auctions = rows.map(toAuction)
  const lots = rows.flatMap((r) => r.lots.map((l) => toLot(l)))

  const sellerIds = [...new Set(auctions.map((a) => a.sellerId))]
  let sellers: Seller[] = []
  if (sellerIds.length) {
    const res = await supabase.from('public_profiles').select('id, nickname, city, state').in('id', sellerIds)
    if (res.error) throw res.error
    sellers = (res.data ?? []).map(toSeller)
  }
  return { auctions, lots, sellers }
}

/** Histórico público de lances de um lote (apelidos, nunca nomes completos). */
export async function fetchBidsByLot(lotId: string): Promise<Bid[]> {
  const { data, error } = await supabase
    .from('bids_public')
    .select('*')
    .eq('lot_id', lotId)
    .order('created_at', { ascending: false })
    .order('amount', { ascending: false })
  if (error) throw error
  return ((data ?? []) as BidPublicRow[]).map(toBid)
}

/** Maior lance do usuário logado por lote (RLS só devolve os próprios lances). */
export async function fetchMyBidTotals(userId: string): Promise<Map<string, number>> {
  const { data, error } = await supabase.from('bids').select('lot_id, amount').eq('bidder_id', userId)
  if (error) throw error
  const map = new Map<string, number>()
  for (const b of data ?? []) map.set(b.lot_id, Math.max(map.get(b.lot_id) ?? 0, Number(b.amount)))
  return map
}

/** Horário oficial do servidor — usado só para corrigir o relógio de exibição. */
export async function fetchServerNow(): Promise<number> {
  const { data, error } = await supabase.rpc('server_now')
  if (error) throw error
  return new Date(data as string).getTime()
}

/** Pede ao servidor para abrir/encerrar lotes vencidos (idempotente; também roda via cron). */
export async function requestCloseExpiredLots() {
  await supabase.rpc('close_expired_lots')
}

// ── Montagem da visão ──

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

export function getSeller(db: Db, id: string) {
  return db.sellers.find((s) => s.id === id)
}

export function getLotsByAuction(db: Db, auctionId: string) {
  return db.lots.filter((l) => l.auctionId === auctionId).sort((a, b) => a.number - b.number)
}

export function summarizeAuction(db: Db, auction: Auction): AuctionSummary {
  const lots = getLotsByAuction(db, auction.id)
  const active = lots.filter((l) => l.status === 'ativo')
  const nextEndsAt = active.map((l) => l.endsAt).sort()[0] ?? null
  return {
    auction,
    seller: getSeller(db, auction.sellerId),
    lots,
    status: deriveAuctionStatus(auction.publication, lots),
    activeLots: active.length,
    nextEndsAt,
    totalBids: lots.reduce((n, l) => n + l.bidCount, 0),
  }
}

/** Leilões públicos (rascunhos ficam de fora, mesmo para o admin). */
export function getPublicAuctions(db: Db): AuctionSummary[] {
  return db.auctions.map((a) => summarizeAuction(db, a)).filter((s) => s.status !== 'rascunho')
}

export function getAuctionById(db: Db, id: string) {
  const a = db.auctions.find((x) => x.id === id)
  return a ? summarizeAuction(db, a) : undefined
}

export function getLot(db: Db, auctionId: string, lotId: string) {
  return db.lots.find((l) => l.id === lotId && l.auctionId === auctionId)
}

// ── Área do comprador ──

export interface MyBidEntry {
  lot: Lot
  auction: Auction
  myHighest: number
  isLeading: boolean
}

export function getMyBids(db: Db, totals: Map<string, number>, userId: string): MyBidEntry[] {
  const entries: MyBidEntry[] = []
  for (const [lotId, myHighest] of totals) {
    const lot = db.lots.find((l) => l.id === lotId)
    const auction = lot && db.auctions.find((a) => a.id === lot.auctionId)
    if (!lot || !auction) continue
    entries.push({ lot, auction, myHighest, isLeading: lot.leaderId === userId })
  }
  return entries.sort((a, b) => a.lot.endsAt.localeCompare(b.lot.endsAt))
}

export interface WonGroup {
  auction: Auction
  lots: Lot[]
  total: number
}

/** Lotes vencidos pelo usuário (winner_id definido pelo servidor), agrupados por leilão. */
export function getWonLots(db: Db, userId: string): WonGroup[] {
  const won = db.lots.filter((l) => l.status === 'vendido' && l.winnerId === userId)
  const groups = new Map<string, WonGroup>()
  for (const lot of won) {
    const auction = db.auctions.find((a) => a.id === lot.auctionId)
    if (!auction) continue
    const g = groups.get(auction.id) ?? { auction, lots: [], total: 0 }
    g.lots.push(lot)
    g.total += lot.currentPrice ?? 0
    groups.set(auction.id, g)
  }
  return [...groups.values()].map((g) => ({ ...g, lots: g.lots.sort((a, b) => a.number - b.number) }))
}
