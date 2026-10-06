import type { DraftAuction } from './draft'

interface Props {
  value: DraftAuction
  errors: Partial<Record<keyof DraftAuction, string>>
  onChange: (patch: Partial<DraftAuction>) => void
}

export function AuctionInfoStep({ value, errors, onChange }: Props) {
  return (
    <div className="card space-y-5 p-6">
      <div>
        <h2 className="text-lg font-semibold">Dados do leilão</h2>
        <p className="text-sm text-slate-500">Informações gerais exibidas na página do leilão.</p>
      </div>

      <div>
        <label className="label">Título *</label>
        <input className="input" placeholder="Ex.: Leilão Guppys Premium — Novembro" value={value.title} onChange={(e) => onChange({ title: e.target.value })} />
        {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
      </div>

      <div>
        <label className="label">Descrição</label>
        <textarea className="input min-h-[110px]" placeholder="Conte sobre a origem dos peixes, cuidados, linhagem…" value={value.description} onChange={(e) => onChange({ description: e.target.value })} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Data de início *</label>
          <input type="datetime-local" className="input" value={value.startsAt} onChange={(e) => onChange({ startsAt: e.target.value })} />
          {errors.startsAt && <p className="mt-1 text-xs text-rose-600">{errors.startsAt}</p>}
        </div>
        <div>
          <label className="label">Localização *</label>
          <input className="input" placeholder="Cidade/UF" value={value.location} onChange={(e) => onChange({ location: e.target.value })} />
          {errors.location && <p className="mt-1 text-xs text-rose-600">{errors.location}</p>}
        </div>
      </div>

      <div>
        <label className="label">Informações de retirada / envio</label>
        <textarea className="input min-h-[80px]" placeholder="Ex.: Retirada no local ou envio por transportadora especializada…" value={value.pickupShipping} onChange={(e) => onChange({ pickupShipping: e.target.value })} />
      </div>
    </div>
  )
}
