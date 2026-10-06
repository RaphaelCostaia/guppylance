/**
 * Formatação do tempo restante — APENAS VISUAL.
 *
 * IMPORTANTE (regra de arquitetura):
 * - O horário oficial de encerramento virá do backend.
 * - O servidor decide se um lance ainda é válido.
 * - O frontend somente exibe o tempo restante; nenhuma regra crítica
 *   (aceitar lance, encerrar lote, definir vencedor) depende do relógio do navegador.
 *
 * Futuro: receber `serverNow` do backend e aplicar um offset (serverNow − Date.now())
 * para corrigir relógios de dispositivos desajustados.
 */

export interface Remaining {
  totalMs: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function getRemaining(targetIso: string, nowMs: number): Remaining {
  const totalMs = Math.max(0, new Date(targetIso).getTime() - nowMs)
  const s = Math.floor(totalMs / 1000)
  return {
    totalMs,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

const p2 = (n: number) => String(n).padStart(2, '0')

/** `02d 04h 12m` quando ≥ 1 dia; `00:12:43` para períodos menores. */
export function formatRemaining(r: Remaining): string {
  if (r.days >= 1) return `${p2(r.days)}d ${p2(r.hours)}h ${p2(r.minutes)}m`
  return `${p2(r.hours)}:${p2(r.minutes)}:${p2(r.seconds)}`
}

/** Faixa visual de urgência (não é regra de negócio). */
export const URGENT_MS = 2 * 60_000
export const SOON_MS = 15 * 60_000
