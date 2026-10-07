import { ArrowDown, ArrowUp, ChevronDown, Copy, Trash2 } from 'lucide-react'
import { VARIETY_SUGGESTIONS } from '../../lib/catalog'
import { MediaPicker } from './MediaPicker'
import type { DraftLot } from './draft'
import { formatBRL, padLotNumber } from '../../lib/format'

interface Props {
  lot: DraftLot
  number: number
  total: number
  open: boolean
  errors: string[]
  showErrors: boolean
  onToggle: () => void
  onChange: (patch: Partial<DraftLot>) => void
  onDuplicate: () => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
}

export function LotFormCard({ lot, number, total, open, errors, showErrors, onToggle, onChange, onDuplicate, onDelete, onMove }: Props) {
  const num = (v: string) => (v === '' ? 0 : Number(v))
  const invalid = showErrors && errors.length > 0

  return (
    <div className={`card overflow-hidden ${invalid ? 'border-rose-300 ring-1 ring-rose-200' : ''}`}>
      {/* Cabeçalho com ações */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="grid h-9 w-12 shrink-0 place-items-center rounded-lg bg-abyss-900 text-xs font-bold text-white">{String(number).padStart(2, '0')}</span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-abyss-950">{lot.title || <span className="text-slate-400">{padLotNumber(number)} sem título</span>}</span>
            <span className="block truncate text-xs text-slate-500">
              {lot.variety || '—'} · {lot.composition || '—'} · {lot.startingPrice ? formatBRL(lot.startingPrice) : 'sem valor'} · {lot.media.length} mídia(s)
            </span>
          </span>
          <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex shrink-0 items-center">
          <button type="button" title="Mover para cima" disabled={number === 1} onClick={() => onMove(-1)} className="btn-ghost p-2">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" title="Mover para baixo" disabled={number === total} onClick={() => onMove(1)} className="btn-ghost p-2">
            <ArrowDown className="h-4 w-4" />
          </button>
          <button type="button" title="Duplicar lote" onClick={onDuplicate} className="btn-ghost p-2">
            <Copy className="h-4 w-4" />
          </button>
          <button type="button" title="Excluir lote" onClick={onDelete} className="btn-ghost p-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {invalid && !open && <p className="px-4 pb-3 text-xs text-rose-600">Corrija: {errors.join(', ')}.</p>}

      {open && (
        <div className="space-y-4 border-t border-slate-100 bg-slate-50/50 p-4">
          <div className="grid gap-4 sm:grid-cols-[90px_1fr]">
            <div>
              <label className="label">Número</label>
              <input className="input bg-slate-100" value={String(number).padStart(2, '0')} readOnly title="Definido pela ordem dos lotes" />
            </div>
            <div>
              <label className="label">Título *</label>
              <input className="input" placeholder="Ex.: Moscow Blue Premium" value={lot.title} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Variedade *</label>
              <input
                className="input"
                list={`sug-${lot.key}`}
                placeholder="Ex.: Full Red"
                value={lot.variety}
                onChange={(e) => onChange({ variety: e.target.value })}
              />
              <datalist id={`sug-${lot.key}`}>
                {VARIETY_SUGGESTIONS.map((v) => <option key={v} value={v} />)}
              </datalist>
            </div>
            <div>
              <label className="label">Quantidade *</label>
              <input type="number" min={1} className="input" value={lot.quantity || ''} onChange={(e) => onChange({ quantity: num(e.target.value) })} />
            </div>
            <div>
              <label className="label">Sexo / composição</label>
              <input className="input" placeholder="Casal, Trio, 3 machos…" value={lot.composition} onChange={(e) => onChange({ composition: e.target.value })} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
            <div>
              <label className="label">Idade aproximada</label>
              <input className="input" placeholder="Ex.: 5 meses" value={lot.ageApprox} onChange={(e) => onChange({ ageApprox: e.target.value })} />
            </div>
            <div>
              <label className="label">Descrição</label>
              <input className="input" placeholder="Características, linhagem, cuidados…" value={lot.description} onChange={(e) => onChange({ description: e.target.value })} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Valor inicial (R$) *</label>
              <input type="number" min={0} step="1" className="input" value={lot.startingPrice || ''} onChange={(e) => onChange({ startingPrice: num(e.target.value) })} />
            </div>
            <div>
              <label className="label">Incremento mínimo (R$) *</label>
              <input type="number" min={1} step="1" className="input" value={lot.minIncrement || ''} onChange={(e) => onChange({ minIncrement: num(e.target.value) })} />
            </div>
            <div>
              <label className="label">Encerramento *</label>
              <input type="datetime-local" className="input" value={lot.endsAt} onChange={(e) => onChange({ endsAt: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Fotos e vídeos</label>
            <MediaPicker media={lot.media} variety={lot.variety} onChange={(media) => onChange({ media })} />
          </div>

          {invalid && <p className="text-xs text-rose-600">Corrija: {errors.join(', ')}.</p>}
        </div>
      )}
    </div>
  )
}
