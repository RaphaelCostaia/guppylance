import { MapPin } from 'lucide-react'
import type { Seller } from '../../types/auction'
import { initials } from '../../lib/format'

export function SellerCard({ seller, location, compact }: { seller: Seller; location?: string; compact?: boolean }) {
  const place = location || [seller.city, seller.state].filter(Boolean).join('/')
  return (
    <div className={compact ? 'flex items-center gap-3' : 'card p-5'}>
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-abyss-600 to-abyss-900 text-sm font-bold text-white">
          {initials(seller.name)}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-slate-500">Organizador</p>
          <p className="truncate font-semibold text-abyss-950">{seller.name}</p>
          {place && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              {place}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
