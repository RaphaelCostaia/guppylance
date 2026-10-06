import type { CurrentUser } from '../types/auction'

/**
 * Usuário "logado" de demonstração. NÃO há autenticação real nesta etapa.
 * Futuro: virá da sessão autenticada (o backend identifica o usuário, nunca o frontend).
 *
 * - Como comprador, aparece nos históricos como "Participante 08".
 * - Como vendedor, é dono da loja "Rafa Guppys" (s5) — por isso não pode dar lance nos lotes dela.
 */
export const currentUser: CurrentUser = {
  id: 'u08',
  name: 'Rafael Martins',
  alias: 'Participante 08',
  city: 'Rio de Janeiro',
  state: 'RJ',
  rating: 4.8,
  purchases: 14,
  memberSince: '2024',
  sellerId: 's5',
}
