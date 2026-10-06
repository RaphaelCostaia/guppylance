import type { MediaItem, Variety } from '../../types/auction'

/** Estado local do cadastro de leilão (nada é persistido nesta etapa). */
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
  media: MediaItem[]
}

export const VARIETIES: Variety[] = ['Full Red', 'Moscow Blue', 'Blue Grass', 'Red Dragon', 'Dumbo Ear', 'Albino Full Red', 'Japan Blue', 'Platinum', 'Snakeskin']

let counter = 0
export const newKey = () => `lot-${Date.now()}-${counter++}`

export function emptyLot(): DraftLot {
  return {
    key: newKey(),
    title: '',
    variety: 'Full Red',
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
  if (!(l.quantity > 0)) e.push('quantidade')
  if (!(l.startingPrice > 0)) e.push('valor inicial')
  if (!(l.minIncrement > 0)) e.push('incremento mínimo')
  if (!l.endsAt) e.push('data/hora de encerramento')
  else if (startsAt && l.endsAt <= startsAt) e.push('encerramento deve ser após o início')
  return e
}
