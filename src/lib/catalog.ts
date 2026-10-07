import type { FishCategory } from '../types/auction'

/** Categorias de peixes leiloados pela Guppy Boroski. */
export const CATEGORY_LABEL: Record<FishCategory, string> = {
  guppy: 'Guppys',
  agua_salgada: 'Água salgada',
}

/** Sugestões de variedade/espécie por categoria (o admin também pode digitar outra). */
export const VARIETY_SUGGESTIONS: Record<FishCategory, string[]> = {
  guppy: [
    'Full Red',
    'Albino Full Red',
    'Moscow Blue',
    'Blue Grass',
    'Red Grass',
    'Leopard',
    'Red Dragon',
    'Dumbo Ear',
    'Japan Blue',
    'Platinum',
    'Snakeskin',
    'Mosaic',
    'Tuxedo',
  ],
  agua_salgada: [
    'Palhaço Ocellaris',
    'Palhaço Percula',
    'Cirurgião Azul',
    'Cirurgião Amarelo',
    'Donzela Azul',
    'Gramma Loreto',
    'Mandarim',
    'Anthias',
    'Gobi',
    'Peixe-anjo',
    'Blenny',
  ],
}
