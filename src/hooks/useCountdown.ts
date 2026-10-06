import { useEffect, useState } from 'react'
import { formatRemaining, getRemaining } from '../lib/time'

/**
 * Relógio visual compartilhado: um único intervalo para todos os contadores da página.
 * O horário é corrigido pelo offset do servidor (setServerOffset), mas continua sendo
 * SOMENTE exibição — quem aceita/recusa lances e encerra lotes é o servidor.
 */
const listeners = new Set<(now: number) => void>()
let timer: ReturnType<typeof setInterval> | undefined
let offsetMs = 0

export function setServerOffset(serverNowMs: number) {
  offsetMs = serverNowMs - Date.now()
}

export const serverNow = () => Date.now() + offsetMs

function subscribe(fn: (now: number) => void) {
  listeners.add(fn)
  if (!timer) timer = setInterval(() => listeners.forEach((l) => l(serverNow())), 1000)
  return () => {
    listeners.delete(fn)
    if (listeners.size === 0 && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

export function useNow() {
  const [now, setNow] = useState(serverNow)
  useEffect(() => subscribe(setNow), [])
  return now
}

export function useCountdown(targetIso: string) {
  const now = useNow()
  const remaining = getRemaining(targetIso, now)
  return { ...remaining, label: formatRemaining(remaining), done: remaining.totalMs === 0, now }
}
