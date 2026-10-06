import type { AuctionPublication, AuctionStatus, Lot, LotStatus } from '../types/auction'

/**
 * Regras de APRESENTAÇÃO dos lotes.
 *
 * As regras de negócio são garantidas no servidor (supabase/migrations/0001_init.sql):
 * - cada lance pertence a um lote; cada lote possui disputa independente;
 * - vendedor não pode dar lance no próprio lote;
 * - lance precisa respeitar o mínimo (lance atual + incremento, ou valor inicial);
 * - o servidor é a autoridade do horário e define o vencedor;
 * - lotes não aceitam lances após o encerramento oficial;
 * - lances simultâneos são serializados (lock da linha do lote);
 * - histórico de lances é preservado; no máximo um vencedor por lote;
 * - lote sem lances → `sem_lances`; com lance válido → `vendido`;
 * - anti-sniping: lance nos últimos N s estende SOMENTE aquele lote (padrão 2 min / 2 min, por leilão).
 */

/** Próximo lance mínimo exibido. O servidor recalcula e valida no momento do lance. */
export function nextMinimumBid(lot: Pick<Lot, 'currentPrice' | 'startingPrice' | 'minIncrement'>): number {
  return lot.currentPrice == null ? lot.startingPrice : lot.currentPrice + lot.minIncrement
}

export const LOT_STATUS_LABEL: Record<LotStatus, string> = {
  rascunho: 'Rascunho',
  agendado: 'Agendado',
  ativo: 'Ao vivo',
  vendido: 'Vendido',
  sem_lances: 'Sem lances',
  cancelado: 'Cancelado',
}

export const AUCTION_STATUS_LABEL: Record<AuctionStatus, string> = {
  rascunho: 'Rascunho',
  agendado: 'Agendado',
  ativo: 'Ao vivo',
  encerrado: 'Encerrado',
  cancelado: 'Cancelado',
}

/**
 * Status exibido considerando o relógio (corrigido pelo servidor):
 * - agendado cujo início já passou → exibido como "ativo" (o servidor abre no próximo ciclo ou no 1º lance);
 * - ativo cujo prazo zerou → "apurando" até o servidor confirmar vendido / sem_lances.
 */
export function displayStatus(lot: Lot, nowMs: number): LotStatus {
  if (lot.status === 'agendado' && new Date(lot.startsAt).getTime() <= nowMs && new Date(lot.endsAt).getTime() > nowMs) return 'ativo'
  return lot.status
}

export function isAwaitingOfficialClose(lot: Lot, nowMs: number) {
  return (lot.status === 'ativo' || lot.status === 'agendado') && new Date(lot.endsAt).getTime() <= nowMs
}

/** Status do leilão derivado da publicação e dos lotes. */
export function deriveAuctionStatus(publication: AuctionPublication, lots: Lot[]): AuctionStatus {
  if (publication === 'rascunho') return 'rascunho'
  if (publication === 'cancelado') return 'cancelado'
  if (lots.length === 0) return 'agendado'
  if (lots.every((l) => l.status === 'cancelado')) return 'cancelado'
  if (lots.some((l) => l.status === 'ativo')) return 'ativo'
  if (lots.some((l) => l.status === 'agendado')) return 'agendado'
  return 'encerrado'
}

export const isFinished = (s: LotStatus) => s === 'vendido' || s === 'sem_lances' || s === 'cancelado'
