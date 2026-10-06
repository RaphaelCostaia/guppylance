import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Pencil, ShoppingBag, Star, Trophy } from 'lucide-react'
import { useMockDb } from '../state/MockDbProvider'
import { getMyBids, getWonLots } from '../services/auctionService'
import { initials } from '../lib/format'
import { useToast } from '../components/ui/Toast'

export function ProfilePage() {
  const { db, user } = useMockDb()
  const toast = useToast()
  // Edição apenas local — sem persistência nesta etapa.
  const [profile, setProfile] = useState({ name: user.name, city: user.city, state: user.state })
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile)

  const wonLots = getWonLots(db, user.alias).reduce((n, g) => n + g.lots.length, 0)
  const participating = getMyBids(db, user.alias).filter((e) => e.lot.status === 'ativo').length

  const save = (e: FormEvent) => {
    e.preventDefault()
    setProfile(draft)
    setEditing(false)
    toast('Perfil atualizado localmente (não persistido).', 'success')
  }

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-abyss-700 via-abyss-900 to-abyss-950" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <span className="grid h-24 w-24 place-items-center rounded-3xl bg-coral-100 text-3xl font-extrabold text-coral-700 ring-4 ring-white">
                {initials(profile.name)}
              </span>
              <div className="pb-1">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-4 w-4" /> {profile.city}/{profile.state} · membro desde {user.memberSince}
                </p>
              </div>
            </div>
            {!editing && (
              <button onClick={() => { setDraft(profile); setEditing(true) }} className="btn-outline">
                <Pencil className="h-4 w-4" /> Editar perfil
              </button>
            )}
          </div>

          {editing && (
            <form onSubmit={save} className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[2fr_2fr_1fr]">
              <div>
                <label className="label">Nome</label>
                <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Cidade</label>
                <input className="input" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
              </div>
              <div>
                <label className="label">UF</label>
                <input className="input uppercase" maxLength={2} value={draft.state} onChange={(e) => setDraft({ ...draft, state: e.target.value.toUpperCase() })} />
              </div>
              <div className="flex justify-end gap-2 sm:col-span-3">
                <button type="button" onClick={() => setEditing(false)} className="btn-ghost">Cancelar</button>
                <button className="btn-primary">Salvar</button>
              </div>
            </form>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <p className="mt-3 text-2xl font-extrabold text-abyss-950">{user.rating.toFixed(1)}</p>
              <p className="text-sm text-slate-500">Reputação (simulada)</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <ShoppingBag className="h-5 w-5 text-abyss-600" />
              <p className="mt-3 text-2xl font-extrabold text-abyss-950">{user.purchases}</p>
              <p className="text-sm text-slate-500">Compras</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <Trophy className="h-5 w-5 text-coral-500" />
              <p className="mt-3 text-2xl font-extrabold text-abyss-950">{wonLots}</p>
              <p className="text-sm text-slate-500">Lotes ganhos</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link to="/meus-lances" className="btn-outline">Meus lances ({participating} ativos)</Link>
            <Link to="/leiloes-ganhos" className="btn-outline">Lotes ganhos</Link>
            <Link to="/vendedor" className="btn-outline">Painel do vendedor</Link>
          </div>
          <p className="mt-6 text-xs text-slate-400">Identificação pública nos lances: {user.alias}. Nomes completos não são exibidos a outros participantes.</p>
        </div>
      </div>
    </div>
  )
}
