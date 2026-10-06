import { useEffect, useState } from 'react'
import { formatRemaining, getRemaining } from '../lib/time'

/**
 * Relógio visual compartilhado: um único intervalo para todos os contadores da página.
 * Somente exibição — ver aviso em lib/time.ts.
 */
const listeners = new Set<(now: number) => void>()
let timer: ReturnType<typeof setInterval> | undefined

function subscribe(fn: (now: number) => void) {
  listeners.add(fn)
  if (!timer) timer = setInterval(() => listeners.forEach((l) => l(Date.now())), 1000)
  return () => {
    listeners.delete(fn)
    if (listeners.size === 0 && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

export function useNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => subscribe(setNow), [])
  return now
}

export function useCountdown(targetIso: string) {
  const now = useNow()
  const remaining = getRemaining(targetIso, now)
  return { ...remaining, label: formatRemaining(remaining), done: remaining.totalMs === 0, now }
}
