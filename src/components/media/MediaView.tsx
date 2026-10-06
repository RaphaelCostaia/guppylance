import { Play } from 'lucide-react'
import type { MediaItem } from '../../types/auction'
import { FishPlaceholder } from './FishPlaceholder'

/**
 * Renderiza um item de mídia.
 * - image: preview local (url) ou ilustração placeholder.
 * - video: placeholder com botão de play (sem arquivo real nesta etapa).
 * Futuro: <img>/<video> com URLs assinadas do storage.
 */
export function MediaView({
  item,
  variant = 0,
  size = 'lg',
  className = '',
}: {
  item: MediaItem
  variant?: number
  size?: 'sm' | 'lg'
  className?: string
}) {
  const isVideo = item.type === 'video'

  // Vídeo escolhido no cadastro: prévia local com controles nativos.
  if (isVideo && item.url) {
    return (
      <div className={`relative h-full w-full overflow-hidden bg-black ${className}`}>
        <video src={item.url} className="h-full w-full object-cover" controls={size === 'lg'} muted playsInline />
      </div>
    )
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {item.url && !isVideo ? (
        <img src={item.url} alt={item.label} className="h-full w-full object-cover" />
      ) : (
        <FishPlaceholder variety={item.variety} variant={variant} className="h-full w-full" />
      )}
      {isVideo && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <span
              className={`grid place-items-center rounded-full bg-white/90 text-abyss-900 shadow-lg backdrop-blur ${
                size === 'lg' ? 'h-16 w-16' : 'h-7 w-7'
              }`}
            >
              <Play className={size === 'lg' ? 'ml-1 h-7 w-7' : 'ml-0.5 h-3.5 w-3.5'} fill="currentColor" />
            </span>
          </div>
          {size === 'lg' && (
            <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
              Vídeo simulado · 0:24
            </span>
          )}
        </>
      )}
    </div>
  )
}
