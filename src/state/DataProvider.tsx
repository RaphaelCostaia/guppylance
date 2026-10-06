import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { fetchCatalog, fetchServerNow, requestCloseExpiredLots, type Db } from '../services/auctionService'
import { toLot, type LotRow } from '../services/mappers'
import { serverNow, setServerOffset } from '../hooks/useCountdown'
import { useAuth } from './AuthProvider'
import type { Lot } from '../types/auction'

/**
 * Catálogo carregado do Supabase + atualizações ao vivo (Realtime) dos lotes.
 * Lance atual, contagem, prorrogação (anti-sniping) e encerramento chegam pelo canal
 * `lots` — todos os participantes veem a mesma coisa sem recarregar a página.
 */
interface DataContextValue {
  db: Db
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  /** Aplica um lote atualizado (ex.: retorno do place_bid) sem esperar o realtime. */
  patchLot: (lot: Lot) => void
}

const EMPTY: Db = { auctions: [], lots: [], sellers: [] }
const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [db, setDb] = useState<Db>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dbRef = useRef(db)
  dbRef.current = db

  const reload = useCallback(async () => {
    try {
      const [catalog, now] = await Promise.all([fetchCatalog(), fetchServerNow()])
      setServerOffset(now)
      setDb(catalog)
      setError(null)
    } catch (e) {
      console.error(e)
      setError('Não foi possível carregar os leilões. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Recarrega quando o usuário muda (admin enxerga rascunhos).
  const userId = session?.user.id
  useEffect(() => {
    void reload()
  }, [reload, userId])

  const patchLot = useCallback((lot: Lot) => {
    setDb((prev) => ({
      ...prev,
      lots: prev.lots.map((l) => (l.id === lot.id ? { ...lot, media: lot.media.length ? lot.media : l.media } : l)),
    }))
  }, [])

  // Realtime: atualizações de lotes.
  useEffect(() => {
    let reloadTimer: ReturnType<typeof setTimeout> | undefined
    const channel = supabase
      .channel('lots-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lots' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          const row = payload.new as LotRow
          const existing = dbRef.current.lots.find((l) => l.id === row.id)
          if (existing) return patchLot(toLot(row, existing.media))
        }
        // Lote novo/removido ou desconhecido: recarrega o catálogo (com debounce).
        clearTimeout(reloadTimer)
        reloadTimer = setTimeout(() => void reload(), 800)
      })
      .subscribe()
    return () => {
      clearTimeout(reloadTimer)
      void supabase.removeChannel(channel)
    }
  }, [patchLot, reload])

  // Quando algum contador zera (ou um lote agendado deveria abrir), pede ao servidor para
  // processar. O servidor decide com o PRÓPRIO relógio; o resultado volta pelo realtime.
  useEffect(() => {
    let lastCall = 0
    const id = setInterval(() => {
      const now = serverNow()
      const due = dbRef.current.lots.some(
        (l) =>
          (l.status === 'ativo' && new Date(l.endsAt).getTime() <= now) ||
          (l.status === 'agendado' && new Date(l.startsAt).getTime() <= now),
      )
      if (due && now - lastCall > 8000) {
        lastCall = now
        void requestCloseExpiredLots()
      }
    }, 2000)
    return () => clearInterval(id)
  }, [])

  const value = useMemo(() => ({ db, loading, error, reload, patchLot }), [db, loading, error, reload, patchLot])
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData precisa estar dentro de <DataProvider>')
  return ctx
}
