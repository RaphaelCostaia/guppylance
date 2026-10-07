import { Search } from 'lucide-react'
import { CATEGORY_LABEL } from '../../lib/catalog'

export type StatusFilter = 'todos' | 'ativos' | 'proximos' | 'encerrados'
export type SortKey = 'encerra' | 'recentes' | 'lotes'

const TABS: { key: StatusFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'ativos', label: 'Ativos' },
  { key: 'proximos', label: 'Próximos' },
  { key: 'encerrados', label: 'Encerrados' },
]

interface Props {
  status: StatusFilter
  q: string
  variety: string
  sort: SortKey
  varieties: string[]
  counts: Record<StatusFilter, number>
  category: string
  onChange: (patch: Partial<{ status: StatusFilter; q: string; variety: string; sort: SortKey; category: string }>) => void
}

export function AuctionFilters({ status, q, variety, sort, varieties, counts, category, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[['', 'Todas as categorias'], ...Object.entries(CATEGORY_LABEL)].map(([key, label]) => (
          <button
            key={key}
            onClick={() => onChange({ category: key, variety: '' })}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              category === key ? 'bg-abyss-950 text-coral-200' : 'border border-slate-300 bg-white text-slate-600 hover:border-abyss-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange({ status: t.key })}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
              status === t.key ? 'bg-white text-abyss-950 shadow-sm' : 'text-slate-500 hover:text-abyss-900'
            }`}
          >
            {t.label} <span className="ml-1 text-xs font-medium text-slate-400">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_200px_200px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => onChange({ q: e.target.value })} placeholder="Buscar por nome do leilão" className="input pl-9" />
        </div>
        <select value={variety} onChange={(e) => onChange({ variety: e.target.value })} className="input">
          <option value="">Todas as variedades/espécies</option>
          {varieties.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => onChange({ sort: e.target.value as SortKey })} className="input">
          <option value="encerra">Encerrando primeiro</option>
          <option value="recentes">Mais recentes</option>
          <option value="lotes">Mais lotes</option>
        </select>
      </div>
    </div>
  )
}
