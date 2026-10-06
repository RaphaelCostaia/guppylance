import type { Seller } from '../types/auction'

export const sellers: Seller[] = [
  {
    id: 's1',
    name: 'Guppy House',
    city: 'Campinas',
    state: 'SP',
    rating: 4.9,
    salesCount: 312,
    memberSince: '2021',
    bio: 'Criação especializada em linhagens sólidas (Full Red, Moscow e Albino), com seleção há mais de 8 anos.',
  },
  {
    id: 's2',
    name: 'Aquário Serra Azul',
    city: 'Belo Horizonte',
    state: 'MG',
    rating: 4.8,
    salesCount: 188,
    memberSince: '2022',
    bio: 'Plantel focado em Blue Grass, Japan Blue e variedades de cauda longa.',
  },
  {
    id: 's3',
    name: 'Dragão Vermelho Guppys',
    city: 'Curitiba',
    state: 'PR',
    rating: 4.7,
    salesCount: 96,
    memberSince: '2023',
    bio: 'Red Dragon e Snakeskin de linhagem importada, aclimatados no Sul.',
  },
  {
    // Loja do usuário de demonstração (ver mocks/currentUser.ts) — usada no Painel do vendedor.
    id: 's5',
    name: 'Rafa Guppys',
    city: 'Rio de Janeiro',
    state: 'RJ',
    rating: 4.9,
    salesCount: 41,
    memberSince: '2024',
    bio: 'Criador hobbista com foco em qualidade de nadadeira, cor e exemplares de exposição.',
  },
]
