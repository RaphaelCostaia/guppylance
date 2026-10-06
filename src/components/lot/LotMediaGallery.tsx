import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MediaItem, Variety } from '../../types/auction'
import { MediaView } from '../media/MediaView'

/** Galeria de mídia do lote: N fotos e vídeos por lote (ilustração quando não há mídia). */
export function LotMediaGallery({ media: items, variety }: { media: MediaItem[]; variety: Variety }) {
  const [index, setIndex] = useState(0)
  const media: MediaItem[] = items.length ? items : [{ id: 'placeholder', type: 'image', variety, label: 'Sem fotos enviadas' }]
  const current = media[index]!
  const go = (d: number) => setIndex((i) => (i + d + media.length) % media.length)

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-abyss-950 shadow-card">
        <MediaView key={current.id} item={current} variant={index} size="lg" />
        <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          {index + 1}/{media.length}
        </span>
        <p className="absolute bottom-3 right-3 max-w-[60%] truncate rounded-md bg-black/45 px-2 py-1 text-xs text-white/90">{current.label}</p>
        {media.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Anterior" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-abyss-900 shadow hover:bg-white">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(1)} aria-label="Próxima" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-abyss-900 shadow hover:bg-white">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {media.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setIndex(i)}
            aria-label={m.label}
            className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition sm:h-20 sm:w-24 ${
              i === index ? 'ring-coral-500' : 'ring-transparent opacity-75 hover:opacity-100'
            }`}
          >
            <MediaView item={m} variant={i} size="sm" />
          </button>
        ))}
      </div>
    </div>
  )
}
