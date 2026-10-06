import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { auctions } from '../mocks/auctions'
import { bids as initialBids, lots as initialLots } from '../mocks/lots'
import { sellers } from '../mocks/sellers'
import { currentUser } from '../mocks/currentUser'
import type { MockDb } from '../services/auctionService'
import { simulatePlaceBid, type PlaceBidResult } from '../services/bidService'

/**
 * "Banco" em memória do demo: mock data + alterações locais (lances simulados).
 * Recarregar a página volta tudo ao estado inicial.
 * Futuro: substituir por cache de dados do backend (ex.: React Query) + atualizações realtime.
 */
interface MockDbContextValue {
  db: MockDb
  user: typeof currentUser
  placeBid: (lotId: string, amount: number) => PlaceBidResult
}

const MockDbContext = createContext<MockDbContextValue | null>(null)

export function MockDbProvider({ children }: { children: ReactNode }) {
  const [lots, setLots] = useState(initialLots)
  const [bids, setBids] = useState(initialBids)

  const db = useMemo<MockDb>(() => ({ auctions, sellers, lots, bids }), [lots, bids])

  const placeBid = useCallback(
    (lotId: string, amount: number): PlaceBidResult => {
      const lot = lots.find((l) => l.id === lotId)
      const auction = lot && auctions.find((a) => a.id === lot.auctionId)
      if (!lot || !auction) return { ok: false, error: 'Lote não encontrado.' }
      const result = simulatePlaceBid({ lot, sellerId: auction.sellerId, amount, user: currentUser })
      if (result.ok) {
        setLots((prev) => prev.map((l) => (l.id === lotId ? result.lot : l)))
        setBids((prev) => [result.bid, ...prev])
      }
      return result
    },
    [lots],
  )

  const value = useMemo(() => ({ db, user: currentUser, placeBid }), [db, placeBid])
  return <MockDbContext.Provider value={value}>{children}</MockDbContext.Provider>
}

export function useMockDb() {
  const ctx = useContext(MockDbContext)
  if (!ctx) throw new Error('useMockDb precisa estar dentro de <MockDbProvider>')
  return ctx
}
