import { useRef, useState } from 'react'
import { ImagePlus, Video, X } from 'lucide-react'
import type { Variety } from '../../types/auction'
import { MediaView } from '../media/MediaView'
import type { DraftMedia } from './draft'

const MAX_BYTES = 50 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']

/**
 * Seleção de fotos e vídeos do lote. Os arquivos ficam como prévia local
 * e só são enviados ao Storage quando o leilão é publicado.
 */
export function MediaPicker({ media, variety, onChange }: { media: DraftMedia[]; variety: Variety; onChange: (m: DraftMedia[]) => void }) {
  const photoInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const add = (type: DraftMedia['type'], files: FileList | null) => {
    if (!files?.length) return
    const allowed = type === 'image' ? IMAGE_TYPES : VIDEO_TYPES
    const ok: DraftMedia[] = []
    const rejected: string[] = []
    for (const f of files) {
      if (!allowed.includes(f.type)) rejected.push(`${f.name} (formato não aceito)`)
      else if (f.size > MAX_BYTES) rejected.push(`${f.name} (acima de 50 MB)`)
      else ok.push({ id: `m-${crypto.randomUUID()}`, type, variety, label: f.name, url: URL.createObjectURL(f), file: f })
    }
    setError(rejected.length ? `Não adicionados: ${rejected.join(', ')}.` : null)
    onChange([...media, ...ok])
  }

  const remove = (m: DraftMedia) => {
    if (m.url) URL.revokeObjectURL(m.url)
    onChange(media.filter((x) => x.id !== m.id))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {media.map((m, i) => (
          <div key={m.id} className="group relative h-20 w-24 overflow-hidden rounded-xl ring-1 ring-slate-200">
            <MediaView item={m} variant={i} size="sm" />
            {m.type === 'video' && <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">vídeo</span>}
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
      <p className="mt-2 text-xs text-slate-400">JPG, PNG, WEBP, MP4, MOV ou WEBM · até 50 MB por arquivo · enviados ao publicar</p>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      <input ref={photoInput} type="file" accept={IMAGE_TYPES.join(',')} multiple hidden onChange={(e) => { add('image', e.target.files); e.target.value = '' }} />
      <input ref={videoInput} type="file" accept={VIDEO_TYPES.join(',')} hidden onChange={(e) => { add('video', e.target.files); e.target.value = '' }} />
    </div>
  )
}
