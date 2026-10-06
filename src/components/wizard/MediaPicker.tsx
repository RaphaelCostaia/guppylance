import { useRef } from 'react'
import { ImagePlus, Video, X } from 'lucide-react'
import type { MediaItem, Variety } from '../../types/auction'
import { MediaView } from '../media/MediaView'

/**
 * Mídia SIMULADA: arquivos escolhidos geram apenas previews locais (URL.createObjectURL).
 * Nenhum upload é feito. Futuro: upload para o storage e gravação das URLs no lote.
 */
export function MediaPicker({ media, variety, onChange }: { media: MediaItem[]; variety: Variety; onChange: (m: MediaItem[]) => void }) {
  const photoInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)

  const add = (type: MediaItem['type'], files?: FileList | null) => {
    const id = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const items: MediaItem[] = files && files.length
      ? [...files].map((f) => ({ id: id(), type, variety, label: f.name, url: URL.createObjectURL(f) }))
      : [{ id: id(), type, variety, label: type === 'video' ? 'Vídeo simulado' : 'Foto simulada' }]
    onChange([...media, ...items])
  }

  const remove = (m: MediaItem) => {
    if (m.url) URL.revokeObjectURL(m.url)
    onChange(media.filter((x) => x.id !== m.id))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {media.map((m, i) => (
          <div key={m.id} className="group relative h-20 w-24 overflow-hidden rounded-xl ring-1 ring-slate-200">
            <MediaView item={m} variant={i} size="sm" />
            <button type="button" onClick={() => remove(m)} aria-label="Remover mídia" className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-90 hover:bg-black/80">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => photoInput.current?.click()} className="grid h-20 w-24 place-items-center rounded-xl border-2 border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-abyss-400 hover:text-abyss-700">
          <span className="flex flex-col items-center gap-1"><ImagePlus className="h-5 w-5" />Fotos</span>
        </button>
        <button type="button" onClick={() => videoInput.current?.click()} className="grid h-20 w-24 place-items-center rounded-xl border-2 border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-abyss-400 hover:text-abyss-700">
          <span className="flex flex-col items-center gap-1"><Video className="h-5 w-5" />Vídeo</span>
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <button type="button" onClick={() => add('image')} className="font-medium text-abyss-700 hover:underline">+ foto de exemplo</button>
        <button type="button" onClick={() => add('video')} className="font-medium text-abyss-700 hover:underline">+ vídeo de exemplo</button>
        <span className="text-slate-400">Prévia local · nenhum arquivo é enviado</span>
      </div>
      <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={(e) => { add('image', e.target.files); e.target.value = '' }} />
      <input ref={videoInput} type="file" accept="video/*" hidden onChange={(e) => { add('video', e.target.files); e.target.value = '' }} />
    </div>
  )
}
