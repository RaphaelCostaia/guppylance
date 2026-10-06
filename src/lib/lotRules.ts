import type { AuctionStatus, Lot, LotStatus } from '../types/auction'

/**
 * Regras de apresentação dos lotes.
 *
 * Regras obrigatórias que o BACKEND futuro deverá garantir (não implementadas aqui):
 * - cada lance pertence a um lote; cada lote possui disputa independente;
 * - vendedor não pode dar lance no próprio lote;
 * - lance precisa respeitar o valor mínimo (lance atual + incremento, ou valor inicial);
 * - o backend é a autoridade do horário; o navegador nunca define o vencedor;
 * - lotes não aceitam lances após o encerramento oficial;
 * - lances simultâneos processados de forma segura (transação/lock no servidor);
 * - histórico de lances válidos é preservado;
 * - cada lote tem no máximo um vencedor;
 * - lote sem lances termina como `sem_lances`; lote com lance válido termina como `vendido`.
 *
 * Anti-sniping (DECISÃO EM ABERTO, não implementado):
 * proposta atual — se um lance válido ocorrer nos últimos 2 min, o `endsAt` DAQUELE lote
 * é estendido em 2 min. Será aplicado pelo servidor; o frontend apenas receberá o novo `endsAt`.
 * Valores abaixo são somente referência e não são usados em nenhuma regra.
 */
export const ANTI_SNIPING_PROPOSAL = { windowMinutes: 2, extensionMinutes: 2 } as const

/** Próximo lance mínimo exibido. Futuro: valor calculado/confirmado pelo backend. */
export function nextMinimumBid(lot: Pick<Lot, 'currentPrice' | 'startingPrice' | 'minIncrement'>): number {
  return lot.currentPrice == null ? lot.startingPrice : lot.currentPrice + lot.minIncrement
}

/** Rótulos amigáveis dos status. */
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
 * Status exibido do lote. No mock, um lote "ativo" cujo contador zerou é exibido como
 * "aguardando confirmação" — o status oficial (vendido / sem_lances) virá do servidor.
 */
export function isAwaitingOfficialClose(lot: Lot, nowMs: number) {
  return lot.status === 'ativo' && new Date(lot.endsAt).getTime() <= nowMs
}

/** Status do leilão derivado dos lotes (sem máquina de estados real). */
export function deriveAuctionStatus(lots: Lot[]): AuctionStatus {
  if (lots.length === 0) return 'rascunho'
  if (lots.every((l) => l.status === 'rascunho')) return 'rascunho'
  if (lots.every((l) => l.status === 'cancelado')) return 'cancelado'
  if (lots.some((l) => l.status === 'ativo')) return 'ativo'
  if (lots.some((l) => l.status === 'agendado')) return 'agendado'
  return 'encerrado'
}

export const isFinished = (s: LotStatus) => s === 'vendido' || s === 'sem_lances' || s === 'cancelado'
