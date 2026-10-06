import { MapPin, Star } from 'lucide-react'
import type { Seller } from '../../types/auction'
import { initials } from '../../lib/format'

export function SellerCard({ seller, compact }: { seller: Seller; compact?: boolean }) {
  return (
    <div className={compact ? 'flex items-center gap-3' : 'card p-5'}>
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-abyss-600 to-abyss-900 text-sm font-bold text-white">
          {initials(seller.name)}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-slate-500">Criador</p>
          <p className="truncate font-semibold text-abyss-950">{seller.name}</p>
          <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {seller.rating.toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {seller.city}/{seller.state}
            </span>
          </p>
        </div>
      </div>
      {!compact && (
        <>
          <p className="mt-4 text-sm text-slate-600">{seller.bio}</p>
          <div className="mt-4 flex gap-6 border-t border-slate-100 pt-4 text-sm">
            <div>
              <p className="font-bold text-abyss-950">{seller.salesCount}</p>
              <p className="text-xs text-slate-500">vendas</p>
            </div>
            <div>
              <p className="font-bold text-abyss-950">desde {seller.memberSince}</p>
              <p className="text-xs text-slate-500">na plataforma</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
