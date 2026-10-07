import type { Db } from './auctionService'
import { summarizeAuction } from './auctionService'
import { errorMessage, MEDIA_BUCKET, supabase } from '../lib/supabase'
import type { FishCategory, Variety } from '../types/auction'

/**
 * Área administrativa (somente admin cria e gerencia leilões).
 * As permissões são garantidas no banco (RLS); aqui só montamos a interface.
 */
export function getSellerAuctions(db: Db, sellerId: string) {
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

export function getSellerStats(db: Db, sellerId: string) {
  const list = getSellerAuctions(db, sellerId)
  const lots = list.flatMap((s) => s.lots)
  return {
    activeAuctions: list.filter((s) => s.status === 'ativo').length,
    totalLots: lots.length,
    soldLots: lots.filter((l) => l.status === 'vendido').length,
    activeLots: lots.filter((l) => l.status === 'ativo').length,
    totalBids: lots.reduce((n, l) => n + l.bidCount, 0),
    /** Soma dos lances atuais de lotes vendidos + ativos (valor potencial). */
    potentialValue: lots
      .filter((l) => l.status === 'vendido' || l.status === 'ativo')
      .reduce((n, l) => n + (l.currentPrice ?? 0), 0),
  }
}

// ── Publicação ──

export interface PublishLotInput {
  number: number
  title: string
  category: FishCategory
  variety: Variety
  quantity: number
  composition: string
  ageApprox: string
  description: string
  startingPrice: number
  minIncrement: number
  /** ISO — encerramento independente por lote. */
  endsAt: string
  files: { file: File; type: 'image' | 'video' }[]
}

export interface PublishInput {
  title: string
  description: string
  /** ISO */
  startsAt: string
  location: string
  pickupShipping: string
  lots: PublishLotInput[]
}

const extOf = (f: File) => (f.name.split('.').pop() || (f.type.startsWith('video') ? 'mp4' : 'jpg')).toLowerCase()

/**
 * Cria o leilão como rascunho, grava lotes e mídias e só então publica —
 * assim ninguém vê um leilão pela metade. Em caso de erro, desfaz o que criou.
 */
export async function publishAuction(input: PublishInput, onProgress?: (msg: string) => void) {
  const uploaded: string[] = []
  let auctionId: string | null = null

  try {
    onProgress?.('Criando leilão…')
    const { data: auction, error: aErr } = await supabase
      .from('auctions')
      .insert({
        title: input.title,
        description: input.description,
        starts_at: input.startsAt,
        location: input.location,
        pickup_shipping_info: input.pickupShipping,
        cover_variety: input.lots[0]?.variety ?? 'Full Red',
        status: 'rascunho',
      })
      .select('id')
      .single()
    if (aErr) throw aErr
    auctionId = auction.id as string

    onProgress?.('Cadastrando lotes…')
    const { data: lots, error: lErr } = await supabase
      .from('lots')
      .insert(
        input.lots.map((l) => ({
          auction_id: auctionId,
          number: l.number,
          title: l.title,
          category: l.category,
          variety: l.variety,
          quantity: l.quantity,
          composition: l.composition,
          age_approx: l.ageApprox,
          description: l.description,
          starting_price: l.startingPrice,
          min_increment: l.minIncrement,
          starts_at: input.startsAt,
          ends_at: l.endsAt,
          status: 'agendado',
        })),
      )
      .select('id, number')
    if (lErr) throw lErr

    const idByNumber = new Map((lots ?? []).map((l) => [l.number as number, l.id as string]))
    const total = input.lots.reduce((n, l) => n + l.files.length, 0)
    let done = 0
    const mediaRows: { lot_id: string; type: string; storage_path: string; label: string; position: number }[] = []

    for (const lot of input.lots) {
      const lotId = idByNumber.get(lot.number)!
      for (const [position, m] of lot.files.entries()) {
        done++
        onProgress?.(`Enviando mídia ${done} de ${total}…`)
        const path = `${auctionId}/${lotId}/${crypto.randomUUID()}.${extOf(m.file)}`
        const { error: upErr } = await supabase.storage.from(MEDIA_BUCKET).upload(path, m.file, { contentType: m.file.type, upsert: false })
        if (upErr) throw upErr
        uploaded.push(path)
        mediaRows.push({ lot_id: lotId, type: m.type, storage_path: path, label: m.file.name, position })
      }
    }

    if (mediaRows.length) {
      const { error: mErr } = await supabase.from('lot_media').insert(mediaRows)
      if (mErr) throw mErr
    }

    onProgress?.('Publicando…')
    const { error: pErr } = await supabase.from('auctions').update({ status: 'publicado' }).eq('id', auctionId)
    if (pErr) throw pErr

    return { ok: true as const, id: auctionId }
  } catch (err) {
    // Desfaz o que foi criado (o leilão ainda era rascunho, então não há lances).
    if (uploaded.length) await supabase.storage.from(MEDIA_BUCKET).remove(uploaded)
    if (auctionId) await supabase.from('auctions').delete().eq('id', auctionId)
    return { ok: false as const, error: errorMessage(err, 'Não foi possível publicar o leilão.') }
  }
}

/** Cancela o leilão inteiro: o servidor passa a recusar novos lances. */
export async function cancelAuction(auctionId: string) {
  const { error } = await supabase.from('auctions').update({ status: 'cancelado' }).eq('id', auctionId)
  return error ? errorMessage(error) : null
}
