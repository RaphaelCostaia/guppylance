// Gera datas relativas ao carregamento da página para que os contadores do demo
// sempre tenham lotes "ao vivo", agendados e encerrados.
const now = Date.now()

export const minutesFromNow = (m: number) => new Date(now + m * 60_000).toISOString()
export const hoursFromNow = (h: number) => minutesFromNow(h * 60)
export const daysFromNow = (d: number) => minutesFromNow(d * 24 * 60)
