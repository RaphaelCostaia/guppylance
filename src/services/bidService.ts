import { errorMessage, supabase } from '../lib/supabase'
import { toLot, type LotRow } from './mappers'
import type { Lot } from '../types/auction'

/**
 * Lance REAL: enviado à função `place_bid` no servidor, que de forma atômica
 * (lock do lote) valida login, vendedor, horário oficial, valor mínimo,
 * registra o lance, atualiza o lote e aplica o anti-sniping.
 * O frontend não decide nada — apenas mostra o resultado.
 */
export type PlaceBidResult = { ok: true; lot: Lot } | { ok: false; error: string }

export async function placeBid(lotId: string, amount: number): Promise<PlaceBidResult> {
  const { data, error } = await supabase.rpc('place_bid', { p_lot_id: lotId, p_amount: amount })
  if (error) return { ok: false, error: errorMessage(error, 'Não foi possível registrar o lance.') }
  return { ok: true, lot: toLot(data as LotRow) }
}
