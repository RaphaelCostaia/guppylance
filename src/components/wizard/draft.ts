import type { FishCategory, MediaItem, Variety } from '../../types/auction'

/** Estado do formulário de cadastro (só vai ao servidor ao publicar). */
export interface DraftAuction {
  title: string
  description: string
  startsAt: string // datetime-local
  location: string
  pickupShipping: string
}

export interface DraftLot {
  key: string
  title: string
  category: FishCategory
  variety: Variety
  quantity: number
  composition: string
  ageApprox: string
  description: string
  startingPrice: number
  minIncrement: number
  /**
   * Encerramento independente por lote (datetime-local).
   * Compatível com encerramento sequencial futuro (ex.: 20:00, 20:03, 20:06…),
   * que ainda NÃO é calculado automaticamente.
   */
  endsAt: string
  media: DraftMedia[]
}

/** Mídia escolhida no cadastro: arquivo real + prévia local até o upload na publicação. */
export type DraftMedia = MediaItem & { file: File }

let counter = 0
export const newKey = () => `lot-${Date.now()}-${counter++}`

export function emptyLot(): DraftLot {
  return {
    key: newKey(),
    title: '',
    category: 'guppy',
    variety: '',
    quantity: 2,
    composition: 'Casal',
    ageApprox: '',
    description: '',
    startingPrice: 0,
    minIncrement: 10,
    endsAt: '',
    media: [],
  }
}

export function validateAuction(a: DraftAuction) {
  const e: Partial<Record<keyof DraftAuction, string>> = {}
  if (!a.title.trim()) e.title = 'Informe o título do leilão.'
  if (!a.startsAt) e.startsAt = 'Informe a data de início.'
  if (!a.location.trim()) e.location = 'Informe a localização.'
  return e
}

export function validateLot(l: DraftLot, startsAt: string) {
  const e: string[] = []
  if (!l.title.trim()) e.push('título')
  if (!l.variety.trim()) e.push(l.category === 'guppy' ? 'variedade' : 'espécie')
  if (!(l.quantity > 0)) e.push('quantidade')
  if (!(l.startingPrice > 0)) e.push('valor inicial')
  if (!(l.minIncrement > 0)) e.push('incremento mínimo')
  if (!l.endsAt) e.push('data/hora de encerramento')
  else if (startsAt && l.endsAt <= startsAt) e.push('encerramento deve ser após o início')
  else if (new Date(l.endsAt).getTime() <= Date.now()) e.push('encerramento já passou')
  return e
}
