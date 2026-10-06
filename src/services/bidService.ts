import type { Bid, CurrentUser, Lot } from '../types/auction'
import { nextMinimumBid } from '../lib/lotRules'

/**
 * Lance SIMULADO — somente para demonstração da interface.
 *
 * ⚠️ Substituir por chamada ao backend, ex.: `POST /lots/:lotId/bids { amount }`.
 * O servidor será a autoridade e deverá, de forma atômica:
 *  1. verificar se o lote está ativo pelo horário OFICIAL do servidor;
 *  2. impedir lance do vendedor no próprio lote;
 *  3. validar valor mínimo contra o lance atual no banco (não o exibido na tela);
 *  4. tratar lances simultâneos (lock/transação) e preservar o histórico;
 *  5. aplicar anti-sniping, se aprovado (estender `endsAt` apenas deste lote);
 *  6. devolver o lote atualizado (currentPrice, bidCount, endsAt).
 *
 * As checagens abaixo existem apenas para dar feedback visual no demo.
 */
export type PlaceBidResult =
  | { ok: true; bid: Bid; lot: Lot }
  | { ok: false; error: string }

export function simulatePlaceBid(params: {
  lot: Lot
  sellerId: string
  amount: number
  user: CurrentUser
}): PlaceBidResult {
  const { lot, sellerId, amount, user } = params

  if (user.sellerId && user.sellerId === sellerId) {
    return { ok: false, error: 'Você é o vendedor deste lote e não pode dar lances nele.' }
  }
  if (lot.status !== 'ativo' || new Date(lot.endsAt).getTime() <= Date.now()) {
    return { ok: false, error: 'Este lote não está aceitando lances.' }
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: 'Informe um valor válido.' }
  }
  const min = nextMinimumBid(lot)
  if (amount < min) {
    return { ok: false, error: `O lance mínimo é ${min.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.` }
  }

  const bid: Bid = {
    id: `${lot.id}-local-${Date.now()}`,
    lotId: lot.id,
    participantAlias: user.alias,
    amount,
    createdAt: new Date().toISOString(),
  }
  return { ok: true, bid, lot: { ...lot, currentPrice: amount, bidCount: lot.bidCount + 1 } }
}
