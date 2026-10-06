import { useState } from 'react'
import { Info, Plus } from 'lucide-react'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LotFormCard } from './LotFormCard'
import { emptyLot, newKey, validateLot, type DraftLot } from './draft'

interface Props {
  lots: DraftLot[]
  startsAt: string
  showErrors: boolean
  onChange: (lots: DraftLot[]) => void
}

/** Gerenciamento local dos lotes: adicionar, editar, excluir (com confirmação), duplicar e reordenar. */
export function LotsStep({ lots, startsAt, showErrors, onChange }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(lots[0]?.key ?? null)
  const [toDelete, setToDelete] = useState<DraftLot | null>(null)

  const update = (key: string, patch: Partial<DraftLot>) => onChange(lots.map((l) => (l.key === key ? { ...l, ...patch } : l)))

  const add = () => {
    const lot = emptyLot()
    onChange([...lots, lot])
    setOpenKey(lot.key)
  }

  const duplicate = (i: number) => {
    const src = lots[i]!
    const copy: DraftLot = {
      ...src,
      key: newKey(),
      title: src.title ? `${src.title} (cópia)` : '',
      media: src.media.map((m) => ({ ...m, id: `${m.id}-c${Date.now()}` })),
    }
    const next = [...lots]
    next.splice(i + 1, 0, copy)
    onChange(next)
    setOpenKey(copy.key)
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= lots.length) return
    const next = [...lots]
    ;[next[i], next[j]] = [next[j]!, next[i]!]
    onChange(next)
  }

  const confirmDelete = () => {
    if (toDelete) onChange(lots.filter((l) => l.key !== toDelete.key))
    setToDelete(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Lotes</h2>
          <p className="text-sm text-slate-500">Cada lote é uma disputa independente, com valor, incremento e encerramento próprios.</p>
        </div>
        <button type="button" onClick={add} className="btn-dark">
          <Plus className="h-4 w-4" /> Adicionar lote
        </button>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs text-sky-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Encerramento sequencial (ex.: 20:00, 20:03, 20:06…) poderá ser configurado automaticamente no futuro. Por enquanto, defina o horário de cada lote.
      </p>

      {lots.length === 0 && (
        <button type="button" onClick={add} className="card flex w-full flex-col items-center border-dashed py-12 text-slate-500 hover:border-abyss-300 hover:text-abyss-700">
          <Plus className="h-6 w-6" />
          <span className="mt-2 font-medium">Adicione o primeiro lote</span>
        </button>
      )}

      {lots.map((lot, i) => (
        <LotFormCard
          key={lot.key}
          lot={lot}
          number={i + 1}
          total={lots.length}
          open={openKey === lot.key}
          errors={validateLot(lot, startsAt)}
          showErrors={showErrors}
          onToggle={() => setOpenKey(openKey === lot.key ? null : lot.key)}
          onChange={(p) => update(lot.key, p)}
          onDuplicate={() => duplicate(i)}
          onDelete={() => setToDelete(lot)}
          onMove={(d) => move(i, d)}
        />
      ))}

      {lots.length > 0 && (
        <button type="button" onClick={add} className="btn-outline w-full border-dashed">
          <Plus className="h-4 w-4" /> Adicionar lote
        </button>
      )}

      <ConfirmDialog
        open={!!toDelete}
        danger
        title="Excluir este lote?"
        description={`"${toDelete?.title || 'Lote sem título'}" e suas mídias serão removidos deste cadastro.`}
        confirmLabel="Excluir lote"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
