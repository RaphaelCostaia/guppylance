import type { Bid, Lot, LotStatus, MediaItem, Variety } from '../types/auction'
import { daysFromNow, minutesFromNow } from './time'

/**
 * Definição compacta dos lotes do demo.
 * O helper `buildLot` calcula lance atual e gera histórico coerente
 * (lance atual = valor inicial + (nº lances − 1) × incremento).
 */
interface LotSeed {
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
  bidCount: number
  startsAt: string
  endsAt: string
  status: LotStatus
  /** Aliases dos lances, do mais recente para o mais antigo. O restante é preenchido automaticamente. */
  aliases?: string[]
  /** Quantidade de fotos e se possui vídeo simulado. */
  photos?: number
  video?: boolean
}

const PHOTO_LABELS = ['Macho — vista lateral', 'Fêmea — vista lateral', 'Casal no aquário', 'Detalhe da nadadeira caudal', 'Exemplar em close']

function buildMedia(seed: LotSeed): MediaItem[] {
  const photos = seed.photos ?? 3
  const media: MediaItem[] = Array.from({ length: photos }, (_, i) => ({
    id: `${seed.id}-img${i + 1}`,
    type: 'image',
    variety: seed.variety,
    label: PHOTO_LABELS[i % PHOTO_LABELS.length],
  }))
  if (seed.video ?? true) {
    media.splice(1, 0, {
      id: `${seed.id}-vid1`,
      type: 'video',
      variety: seed.variety,
      label: 'Vídeo dos exemplares nadando',
    })
  }
  return media
}

const ALIAS_POOL = ['Participante 21', 'Participante 14', 'Participante 33', 'Participante 05', 'Participante 12', 'Participante 41', 'Participante 27', 'Participante 08', 'Participante 19']

function seededIndex(text: string, i: number) {
  let h = i * 31
  for (const c of text) h = (h * 17 + c.charCodeAt(0)) % 9973
  return h % ALIAS_POOL.length
}

function buildBids(seed: LotSeed): Bid[] {
  const ended = new Date(seed.endsAt).getTime() < Date.now()
  const lastAt = ended ? new Date(seed.endsAt).getTime() - 60_000 : Date.now() - 60_000
  const bids: Bid[] = []
  let prevAlias = ''
  for (let i = 0; i < seed.bidCount; i++) {
    let alias = seed.aliases?.[i]
    if (!alias) {
      let k = seededIndex(seed.id, i)
      // evita o mesmo participante cobrir o próprio lance em sequência
      while (ALIAS_POOL[k] === prevAlias || ALIAS_POOL[k] === 'Participante 08') k = (k + 1) % ALIAS_POOL.length
      alias = ALIAS_POOL[k]
    }
    prevAlias = alias
    bids.push({
      id: `${seed.id}-b${seed.bidCount - i}`,
      lotId: seed.id,
      participantAlias: alias,
      amount: seed.startingPrice + (seed.bidCount - 1 - i) * seed.minIncrement,
      createdAt: new Date(lastAt - i * 2 * 60_000 - (i % 3) * 20_000).toISOString(),
    })
  }
  return bids
}

function buildLot(seed: LotSeed): Lot {
  const bids = buildBids(seed)
  return {
    id: seed.id,
    auctionId: seed.auctionId,
    number: seed.number,
    title: seed.title,
    variety: seed.variety,
    quantity: seed.quantity,
    composition: seed.composition,
    ageApprox: seed.ageApprox,
    description: seed.description,
    startingPrice: seed.startingPrice,
    minIncrement: seed.minIncrement,
    currentPrice: bids[0]?.amount ?? null,
    bidCount: seed.bidCount,
    startsAt: seed.startsAt,
    endsAt: seed.endsAt,
    status: seed.status,
    media: buildMedia(seed),
    winnerAlias: seed.status === 'vendido' ? bids[0]?.participantAlias : undefined,
  }
}

const seeds: LotSeed[] = [
  // ── a1 · Leilão Guppys Premium — Outubro (ao vivo, encerramento sequencial) ──
  {
    id: 'l101', auctionId: 'a1', number: 1, title: 'Full Red Premium', variety: 'Full Red',
    quantity: 3, composition: 'Trio (1 macho + 2 fêmeas)', ageApprox: 'aprox. 4 meses',
    description: 'Trio de Full Red com vermelho intenso do corpo à cauda, sem manchas. Macho com caudal delta bem aberta.',
    startingPrice: 120, minIncrement: 10, bidCount: 7, startsAt: minutesFromNow(-360), endsAt: minutesFromNow(5.2), status: 'ativo',
    aliases: ['Participante 08', 'Participante 33'], photos: 4,
  },
  {
    id: 'l102', auctionId: 'a1', number: 2, title: 'Albino Full Red', variety: 'Albino Full Red',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 5 meses',
    description: 'Casal Albino Full Red de olhos vermelhos, linhagem estável há 6 gerações.',
    startingPrice: 120, minIncrement: 10, bidCount: 10, startsAt: minutesFromNow(-360), endsAt: minutesFromNow(7.5), status: 'ativo',
  },
  {
    id: 'l103', auctionId: 'a1', number: 3, title: 'Moscow Blue Premium', variety: 'Moscow Blue',
    quantity: 2, composition: 'Casal adulto', ageApprox: 'aprox. 5 meses',
    description: 'Casal Moscow Blue com coloração azul profunda e uniforme. Fêmea já com primeira gestação concluída.',
    startingPrice: 40, minIncrement: 10, bidCount: 12, startsAt: minutesFromNow(-360), endsAt: minutesFromNow(8.72), status: 'ativo',
    aliases: ['Participante 21', 'Participante 08', 'Participante 21', 'Participante 08'], photos: 4,
  },
  {
    id: 'l104', auctionId: 'a1', number: 4, title: 'Dumbo Ear Grey', variety: 'Dumbo Ear',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 4 meses',
    description: 'Dumbo Ear com peitorais grandes e simétricas. Excelente para cruzamentos de orelha.',
    startingPrice: 80, minIncrement: 5, bidCount: 4, startsAt: minutesFromNow(-360), endsAt: minutesFromNow(14), status: 'ativo',
  },
  {
    id: 'l105', auctionId: 'a1', number: 5, title: 'Blue Grass Delta', variety: 'Blue Grass',
    quantity: 3, composition: 'Trio (1 macho + 2 fêmeas)', ageApprox: 'aprox. 3 meses',
    description: 'Blue Grass com padrão de cauda pontilhado bem definido. Exemplares jovens, em fase de coloração.',
    startingPrice: 90, minIncrement: 10, bidCount: 0, startsAt: minutesFromNow(-360), endsAt: minutesFromNow(17), status: 'ativo',
    video: false,
  },
  {
    id: 'l106', auctionId: 'a1', number: 6, title: 'Japan Blue Seleção', variety: 'Japan Blue',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 6 meses',
    description: 'Japan Blue com brilho metálico no dorso. Lote abre para lances em 1 hora.',
    startingPrice: 100, minIncrement: 10, bidCount: 0, startsAt: minutesFromNow(60), endsAt: daysFromNow(1.2), status: 'agendado',
  },

  // ── a2 · Blue Collection — Serra Azul (ao vivo, encerramentos em horas/dias) ──
  {
    id: 'l201', auctionId: 'a2', number: 1, title: 'Blue Grass Casal', variety: 'Blue Grass',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 5 meses',
    description: 'Casal Blue Grass de cauda delta com ótimo contraste.',
    startingPrice: 70, minIncrement: 10, bidCount: 6, startsAt: minutesFromNow(-120), endsAt: minutesFromNow(80), status: 'ativo',
    aliases: ['Participante 14', 'Participante 08'],
  },
  {
    id: 'l202', auctionId: 'a2', number: 2, title: 'Japan Blue Trio', variety: 'Japan Blue',
    quantity: 3, composition: 'Trio (1 macho + 2 fêmeas)', ageApprox: 'aprox. 4 meses',
    description: 'Trio Japan Blue, macho com dorsal longa e reflexo metálico.',
    startingPrice: 130, minIncrement: 5, bidCount: 8, startsAt: minutesFromNow(-120), endsAt: minutesFromNow(125), status: 'ativo',
    aliases: ['Participante 08', 'Participante 12'],
  },
  {
    id: 'l203', auctionId: 'a2', number: 3, title: 'Fêmeas Blue Grass', variety: 'Blue Grass',
    quantity: 5, composition: '5 fêmeas', ageApprox: 'aprox. 4 meses',
    description: 'Lote com 5 fêmeas Blue Grass para formação de plantel.',
    startingPrice: 80, minIncrement: 5, bidCount: 3, startsAt: minutesFromNow(-120), endsAt: minutesFromNow(60 * 28), status: 'ativo',
  },
  {
    id: 'l204', auctionId: 'a2', number: 4, title: 'Japan Blue Casal', variety: 'Japan Blue',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 3 meses',
    description: 'Casal jovem de Japan Blue, ótimo custo-benefício.',
    startingPrice: 70, minIncrement: 5, bidCount: 0, startsAt: minutesFromNow(-120), endsAt: minutesFromNow(60 * 52 + 12), status: 'ativo',
  },
  {
    id: 'l205', auctionId: 'a2', number: 5, title: 'Moscow Blue Machos', variety: 'Moscow Blue',
    quantity: 3, composition: '3 machos', ageApprox: 'aprox. 6 meses',
    description: 'Três machos Moscow Blue adultos para reforço de linhagem.',
    startingPrice: 90, minIncrement: 10, bidCount: 5, startsAt: minutesFromNow(-120), endsAt: minutesFromNow(60 * 53), status: 'ativo',
  },

  // ── a3 · Dragões & Serpentes (agendado, encerramento sequencial de 3 em 3 min) ──
  {
    id: 'l301', auctionId: 'a3', number: 1, title: 'Red Dragon Casal', variety: 'Red Dragon',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 5 meses',
    description: 'Red Dragon com escamas metálicas e cabeça vermelha intensa.',
    startingPrice: 150, minIncrement: 10, bidCount: 0, startsAt: daysFromNow(2), endsAt: daysFromNow(3), status: 'agendado',
  },
  {
    id: 'l302', auctionId: 'a3', number: 2, title: 'Snakeskin Trio', variety: 'Snakeskin',
    quantity: 3, composition: 'Trio (1 macho + 2 fêmeas)', ageApprox: 'aprox. 4 meses',
    description: 'Snakeskin com padrão rendado nítido no corpo.',
    startingPrice: 110, minIncrement: 10, bidCount: 0, startsAt: daysFromNow(2), endsAt: minutesFromNow(3 * 24 * 60 + 3), status: 'agendado',
  },
  {
    id: 'l303', auctionId: 'a3', number: 3, title: 'Red Dragon Macho', variety: 'Red Dragon',
    quantity: 1, composition: 'Macho solo', ageApprox: 'aprox. 7 meses',
    description: 'Macho reprodutor Red Dragon, exemplar de exposição.',
    startingPrice: 90, minIncrement: 5, bidCount: 0, startsAt: daysFromNow(2), endsAt: minutesFromNow(3 * 24 * 60 + 6), status: 'agendado',
  },
  {
    id: 'l304', auctionId: 'a3', number: 4, title: 'Snakeskin Casal', variety: 'Snakeskin',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 5 meses',
    description: 'Casal Snakeskin de cauda véu.',
    startingPrice: 120, minIncrement: 10, bidCount: 0, startsAt: daysFromNow(2), endsAt: minutesFromNow(3 * 24 * 60 + 9), status: 'agendado',
  },

  // ── a5 · Mix Hobbista — Rafa Guppys (ao vivo, com lote cancelado) ──
  {
    id: 'l501', auctionId: 'a5', number: 1, title: 'Snakeskin Iniciante', variety: 'Snakeskin',
    quantity: 4, composition: '2 machos + 2 fêmeas', ageApprox: 'aprox. 4 meses',
    description: 'Lote ideal para quem está começando na criação.',
    startingPrice: 65, minIncrement: 5, bidCount: 5, startsAt: minutesFromNow(-60), endsAt: minutesFromNow(40), status: 'ativo',
  },
  {
    id: 'l502', auctionId: 'a5', number: 2, title: 'Full Red Casal', variety: 'Full Red',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 5 meses',
    description: 'Lote cancelado pelo vendedor antes do início dos lances.',
    startingPrice: 100, minIncrement: 10, bidCount: 0, startsAt: minutesFromNow(-60), endsAt: minutesFromNow(45), status: 'cancelado',
  },
  {
    id: 'l503', auctionId: 'a5', number: 3, title: 'Platinum Fêmeas', variety: 'Platinum',
    quantity: 3, composition: '3 fêmeas', ageApprox: 'aprox. 4 meses',
    description: 'Três fêmeas Platinum de corpo branco perolado.',
    startingPrice: 60, minIncrement: 5, bidCount: 0, startsAt: minutesFromNow(-60), endsAt: minutesFromNow(180), status: 'ativo',
  },

  // ── a6 · Leilão Guppys Premium — Setembro (encerrado; lotes ganhos pelo usuário demo) ──
  {
    id: 'l601', auctionId: 'a6', number: 1, title: 'Full Red', variety: 'Full Red',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 5 meses',
    description: 'Casal Full Red de linhagem própria.',
    startingPrice: 100, minIncrement: 10, bidCount: 6, startsAt: daysFromNow(-20), endsAt: daysFromNow(-19), status: 'vendido',
    aliases: ['Participante 08'],
  },
  {
    id: 'l602', auctionId: 'a6', number: 2, title: 'Moscow Blue', variety: 'Moscow Blue',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 6 meses',
    description: 'Casal Moscow Blue adulto.',
    startingPrice: 120, minIncrement: 10, bidCount: 9, startsAt: daysFromNow(-20), endsAt: daysFromNow(-19), status: 'vendido',
  },
  {
    id: 'l603', auctionId: 'a6', number: 3, title: 'Snakeskin', variety: 'Snakeskin',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 4 meses',
    description: 'Casal Snakeskin.',
    startingPrice: 130, minIncrement: 10, bidCount: 0, startsAt: daysFromNow(-20), endsAt: daysFromNow(-19), status: 'sem_lances',
  },
  {
    id: 'l604', auctionId: 'a6', number: 4, title: 'Blue Grass', variety: 'Blue Grass',
    quantity: 3, composition: 'Trio', ageApprox: 'aprox. 5 meses',
    description: 'Trio Blue Grass de cauda delta.',
    startingPrice: 160, minIncrement: 10, bidCount: 8, startsAt: daysFromNow(-20), endsAt: daysFromNow(-19), status: 'vendido',
    aliases: ['Participante 08'],
  },
  {
    id: 'l605', auctionId: 'a6', number: 5, title: 'Red Dragon', variety: 'Red Dragon',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 6 meses',
    description: 'Casal Red Dragon.',
    startingPrice: 150, minIncrement: 5, bidCount: 6, startsAt: daysFromNow(-20), endsAt: daysFromNow(-19), status: 'vendido',
  },

  // ── a4 · Platinum & Dumbo — Setembro (encerrado, vendedor = usuário demo) ──
  {
    id: 'l401', auctionId: 'a4', number: 1, title: 'Platinum Exposição', variety: 'Platinum',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 6 meses',
    description: 'Casal Platinum de exposição.',
    startingPrice: 80, minIncrement: 10, bidCount: 5, startsAt: daysFromNow(-12), endsAt: daysFromNow(-11), status: 'vendido',
  },
  {
    id: 'l402', auctionId: 'a4', number: 2, title: 'Dumbo Ear Blue', variety: 'Dumbo Ear',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 5 meses',
    description: 'Dumbo Ear com dorso azulado.',
    startingPrice: 60, minIncrement: 5, bidCount: 7, startsAt: daysFromNow(-12), endsAt: daysFromNow(-11), status: 'vendido',
  },
  {
    id: 'l403', auctionId: 'a4', number: 3, title: 'Platinum Machos', variety: 'Platinum',
    quantity: 3, composition: '3 machos', ageApprox: 'aprox. 5 meses',
    description: 'Três machos Platinum.',
    startingPrice: 90, minIncrement: 10, bidCount: 0, startsAt: daysFromNow(-12), endsAt: daysFromNow(-11), status: 'sem_lances',
  },
  {
    id: 'l404', auctionId: 'a4', number: 4, title: 'Dumbo Ear Red', variety: 'Dumbo Ear',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 6 meses',
    description: 'Dumbo Ear com cauda vermelha.',
    startingPrice: 140, minIncrement: 10, bidCount: 3, startsAt: daysFromNow(-12), endsAt: daysFromNow(-11), status: 'vendido',
  },
  {
    id: 'l405', auctionId: 'a4', number: 5, title: 'Albino Full Red', variety: 'Albino Full Red',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 4 meses',
    description: 'Casal Albino Full Red.',
    startingPrice: 150, minIncrement: 10, bidCount: 0, startsAt: daysFromNow(-12), endsAt: daysFromNow(-11), status: 'sem_lances',
  },

  // ── a7 · rascunho do vendedor demo ──
  {
    id: 'l701', auctionId: 'a7', number: 1, title: 'Japan Blue Casal', variety: 'Japan Blue',
    quantity: 2, composition: 'Casal', ageApprox: 'aprox. 4 meses',
    description: 'Rascunho.', startingPrice: 90, minIncrement: 10, bidCount: 0,
    startsAt: daysFromNow(20), endsAt: daysFromNow(21), status: 'rascunho', video: false,
  },
  {
    id: 'l702', auctionId: 'a7', number: 2, title: 'Japan Blue Trio', variety: 'Japan Blue',
    quantity: 3, composition: 'Trio', ageApprox: 'aprox. 4 meses',
    description: 'Rascunho.', startingPrice: 120, minIncrement: 10, bidCount: 0,
    startsAt: daysFromNow(20), endsAt: minutesFromNow(21 * 24 * 60 + 3), status: 'rascunho', video: false,
  },
]

export const lots: Lot[] = seeds.map(buildLot)

/** Histórico de lances de todos os lotes (mais recente primeiro dentro de cada lote). */
export const bids: Bid[] = seeds.flatMap(buildBids)
