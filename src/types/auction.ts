/**
 * Modelo de domínio do MVP.
 *
 * Estrutura: Leilão → vários Lotes → vários Lances.
 * Cada lote é uma disputa independente (preço, contador, histórico, vencedor e status próprios).
 * Estes tipos foram pensados para espelhar as futuras tabelas/respostas do backend.
 */

export type LotStatus = 'rascunho' | 'agendado' | 'ativo' | 'vendido' | 'sem_lances' | 'cancelado'

/** Status do leilão é derivado dos lotes (ver lib/lotRules.ts). */
export type AuctionStatus = 'rascunho' | 'agendado' | 'ativo' | 'encerrado' | 'cancelado'

export type Variety =
  | 'Full Red'
  | 'Moscow Blue'
  | 'Blue Grass'
  | 'Red Dragon'
  | 'Dumbo Ear'
  | 'Albino Full Red'
  | 'Japan Blue'
  | 'Platinum'
  | 'Snakeskin'

export interface MediaItem {
  id: string
  type: 'image' | 'video'
  /** Variedade usada para gerar o placeholder visual. Futuro: `url` vinda do storage. */
  variety: Variety
  label: string
  /** Preview local (ex.: URL.createObjectURL no cadastro). Nunca é enviado a lugar nenhum. */
  url?: string
}

export interface Seller {
  id: string
  name: string
  city: string
  state: string
  rating: number
  salesCount: number
  memberSince: string
  bio: string
}

export interface Auction {
  id: string
  title: string
  description: string
  sellerId: string
  city: string
  state: string
  /** ISO. Início do leilão. */
  startsAt: string
  pickupShippingInfo: string
  coverVariety: Variety
  featured?: boolean
  /** ISO. Data de criação, usada em "Novos leilões". */
  createdAt: string
}

export interface Lot {
  id: string
  auctionId: string
  number: number
  title: string
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
  /** ISO. Abertura do lote para lances. */
  startsAt: string
  /** ISO. Encerramento INDEPENDENTE por lote (compatível com encerramento sequencial futuro). */
  endsAt: string
  status: LotStatus
  media: MediaItem[]
  /** Alias mascarado do vencedor — futuramente definido SOMENTE pelo backend. */
  winnerAlias?: string
}

export interface Bid {
  id: string
  /** Todo lance pertence a um lote. */
  lotId: string
  /** Identificação pública mascarada — nunca nome completo. */
  participantAlias: string
  amount: number
  /** ISO. Futuro: horário registrado pelo servidor. No mock, gerado localmente. */
  createdAt: string
}

export interface CurrentUser {
  id: string
  name: string
  alias: string
  city: string
  state: string
  rating: number
  purchases: number
  memberSince: string
  /** Se o usuário também é vendedor, id do Seller correspondente. */
  sellerId?: string
}
