import type { Auction, Bid, Lot, MediaItem, Profile, Seller, Variety } from '../types/auction'
import { mediaPublicUrl } from '../lib/supabase'

/* Linhas cruas do banco (snake_case). */
export interface AuctionRow {
  id: string
  title: string
  description: string
  seller_id: string
  location: string
  starts_at: string
  pickup_shipping_info: string
  cover_variety: string
  featured: boolean
  status: Auction['publication']
  anti_snipe_window_seconds: number
  anti_snipe_extension_seconds: number
  created_at: string
}

export interface LotMediaRow {
  id: string
  lot_id: string
  type: 'image' | 'video'
  storage_path: string
  label: string
  position: number
}

export interface LotRow {
  id: string
  auction_id: string
  number: number
  title: string
  category: 'guppy' | 'agua_salgada' | null
  variety: string
  quantity: number
  composition: string
  age_approx: string
  description: string
  starting_price: number | string
  min_increment: number | string
  current_price: number | string | null
  bid_count: number
  leader_id: string | null
  winner_id: string | null
  starts_at: string
  ends_at: string
  status: Lot['status']
  lot_media?: LotMediaRow[]
}

export interface BidPublicRow {
  id: string
  lot_id: string
  amount: number | string
  created_at: string
  nickname: string
  is_mine: boolean
}

export interface ProfileRow {
  id: string
  nickname: string
  full_name: string
  city: string
  state: string
  role: 'user' | 'admin'
  created_at: string
}

const num = (v: number | string) => Number(v)

export const toAuction = (r: AuctionRow): Auction => ({
  id: r.id,
  title: r.title,
  description: r.description,
  sellerId: r.seller_id,
  location: r.location,
  startsAt: r.starts_at,
  pickupShippingInfo: r.pickup_shipping_info,
  coverVariety: r.cover_variety as Variety,
  featured: r.featured,
  publication: r.status,
  antiSnipeWindowSeconds: r.anti_snipe_window_seconds,
  antiSnipeExtensionSeconds: r.anti_snipe_extension_seconds,
  createdAt: r.created_at,
})

export const toMedia = (m: LotMediaRow, variety: Variety): MediaItem => ({
  id: m.id,
  type: m.type,
  variety,
  label: m.label,
  url: mediaPublicUrl(m.storage_path),
})

/** `media` é preservado quando a linha vem do realtime (que não traz relações). */
export const toLot = (r: LotRow, keepMedia?: MediaItem[]): Lot => {
  const variety = r.variety
  return {
    id: r.id,
    auctionId: r.auction_id,
    number: r.number,
    title: r.title,
    category: r.category ?? 'guppy',
    variety,
    quantity: r.quantity,
    composition: r.composition,
    ageApprox: r.age_approx,
    description: r.description,
    startingPrice: num(r.starting_price),
    minIncrement: num(r.min_increment),
    currentPrice: r.current_price == null ? null : num(r.current_price),
    bidCount: r.bid_count,
    leaderId: r.leader_id,
    winnerId: r.winner_id,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    status: r.status,
    media: r.lot_media
      ? [...r.lot_media].sort((a, b) => a.position - b.position).map((m) => toMedia(m, variety))
      : (keepMedia ?? []),
  }
}

export const toBid = (r: BidPublicRow): Bid => ({
  id: r.id,
  lotId: r.lot_id,
  participantAlias: r.nickname,
  isMine: r.is_mine,
  amount: num(r.amount),
  createdAt: r.created_at,
})

export const toProfile = (r: ProfileRow): Profile => ({
  id: r.id,
  nickname: r.nickname,
  fullName: r.full_name,
  city: r.city,
  state: r.state,
  role: r.role,
  createdAt: r.created_at,
})

export const toSeller = (r: { id: string; nickname: string; city: string; state: string }): Seller => ({
  id: r.id,
  name: r.nickname,
  city: r.city,
  state: r.state,
})
