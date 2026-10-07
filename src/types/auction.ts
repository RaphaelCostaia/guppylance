/**
 * Modelo de domínio usado pelo frontend.
 *
 * Estrutura: Leilão → vários Lotes → vários Lances.
 * Cada lote é uma disputa independente (preço, contador, histórico, vencedor e status próprios).
 * Os dados vêm do Supabase (snake_case) e são convertidos em services/mappers.ts.
 */

export type LotStatus = 'rascunho' | 'agendado' | 'ativo' | 'vendido' | 'sem_lances' | 'cancelado'

/** Status de publicação gravado no banco. */
export type AuctionPublication = 'rascunho' | 'publicado' | 'cancelado'

/** Status exibido do leilão — derivado da publicação + lotes (ver lib/lotRules.ts). */
export type AuctionStatus = 'rascunho' | 'agendado' | 'ativo' | 'encerrado' | 'cancelado'

/** Categoria do lote. */
export type FishCategory = 'guppy' | 'agua_salgada'

/** Variedade (Guppy) ou espécie (água salgada) — texto livre com sugestões em lib/catalog.ts. */
export type Variety = string

export interface MediaItem {
  id: string
  type: 'image' | 'video'
  /** Variedade usada para o placeholder quando não há arquivo. */
  variety: Variety
  label: string
  /** URL pública (Storage) ou prévia local (URL.createObjectURL) no cadastro. */
  url?: string
}

/** Perfil público de quem organiza o leilão. */
export interface Seller {
  id: string
  name: string
  city: string
  state: string
}

export interface Auction {
  id: string
  title: string
  description: string
  sellerId: string
  location: string
  /** ISO. Início do leilão. */
  startsAt: string
  pickupShippingInfo: string
  coverVariety: Variety
  featured: boolean
  publication: AuctionPublication
  antiSnipeWindowSeconds: number
  antiSnipeExtensionSeconds: number
  /** ISO. Data de criação, usada em "Novos leilões". */
  createdAt: string
}

export interface Lot {
  id: string
  auctionId: string
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
  /** Maior lance válido atual (ou null se não houver lances). */
  currentPrice: number | null
  bidCount: number
  /** Quem lidera agora (definido pelo servidor). */
  leaderId: string | null
  /** Vencedor oficial, definido SOMENTE pelo servidor ao encerrar. */
  winnerId: string | null
  /** ISO. Abertura do lote para lances. */
  startsAt: string
  /** ISO. Encerramento oficial (pode ser estendido pelo anti-sniping no servidor). */
  endsAt: string
  status: LotStatus
  media: MediaItem[]
}

export interface Bid {
  id: string
  lotId: string
  /** Apelido público do participante — nunca nome completo. */
  participantAlias: string
  isMine: boolean
  amount: number
  /** ISO. Horário registrado pelo servidor. */
  createdAt: string
}

export interface Profile {
  id: string
  nickname: string
  fullName: string
  city: string
  state: string
  role: 'user' | 'admin'
  createdAt: string
}
