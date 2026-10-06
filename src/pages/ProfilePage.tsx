import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Gavel, Loader2, MapPin, Pencil, Trophy, Wallet } from 'lucide-react'
import { useData } from '../state/DataProvider'
import { useAuth } from '../state/AuthProvider'
import { fetchMyBidTotals, getMyBids, getWonLots } from '../services/auctionService'
import { formatBRL, initials } from '../lib/format'
import { useToast } from '../components/ui/Toast'
import { PageLoader } from '../components/layout/Guards'

export function ProfilePage() {
  const { db } = useData()
  const { session, profile, isAdmin, updateProfile } = useAuth()
  const toast = useToast()
  const userId = session!.user.id
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState({ nickname: '', fullName: '', city: '', state: '' })
  const [totals, setTotals] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    fetchMyBidTotals(userId).then(setTotals).catch(console.error)
  }, [userId])

  if (!profile) return <PageLoader />

  const won = getWonLots(db, userId)
  const wonLots = won.reduce((n, g) => n + g.lots.length, 0)
  const wonTotal = won.reduce((n, g) => n + g.total, 0)
  const participating = getMyBids(db, totals, userId).filter((e) => e.lot.status === 'ativo').length

  const startEdit = () => {
    setDraft({ nickname: profile.nickname, fullName: profile.fullName, city: profile.city, state: profile.state })
    setError(null)
    setEditing(true)
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const err = await updateProfile(draft)
    setSaving(false)
    if (err) return setError(err)
    setEditing(false)
    toast('Perfil atualizado.', 'success')
  }

  const place = [profile.city, profile.state].filter(Boolean).join('/')

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-abyss-700 via-abyss-900 to-abyss-950" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <span className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-coral-100 text-3xl font-extrabold text-coral-700 ring-4 ring-white">
                {initials(profile.nickname)}
              </span>
              <div className="min-w-0 pb-1">
                <h1 className="truncate text-2xl font-bold">{profile.nickname}</h1>
                <p className="text-sm text-slate-500">{profile.fullName || session!.user.email}</p>
                {place && (
                  <p className="flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" /> {place}
                  </p>
                )}
              </div>
            </div>
            {!editing && (
              <button onClick={startEdit} className="btn-outline">
                <Pencil className="h-4 w-4" /> Editar perfil
              </button>
            )}
          </div>

          {editing && (
            <form onSubmit={save} className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="p-nick">Apelido público *</label>
                <input id="p-nick" className="input" value={draft.nickname} minLength={3} maxLength={24} required onChange={(e) => setDraft({ ...draft, nickname: e.target.value })} />
                <p className="mt-1 text-xs text-slate-500">É assim que você aparece nos lances.</p>
              </div>
              <div>
                <label className="label" htmlFor="p-name">Nome completo (privado)</label>
                <input id="p-name" className="input" value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="p-city">Cidade</label>
                <input id="p-city" className="input" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="p-uf">UF</label>
                <input id="p-uf" className="input uppercase" maxLength={2} value={draft.state} onChange={(e) => setDraft({ ...draft, state: e.target.value.toUpperCase() })} />
              </div>
              {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">{error}</p>}
              <div className="flex justify-end gap-2 sm:col-span-2">
                <button type="button" onClick={() => setEditing(false)} className="btn-ghost">Cancelar</button>
                <button className="btn-primary" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <Gavel className="h-5 w-5 text-abyss-600" />
              <p className="mt-3 text-2xl font-extrabold text-abyss-950">{participating}</p>
              <p className="text-sm text-slate-500">Disputas em andamento</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <Trophy className="h-5 w-5 text-coral-500" />
              <p className="mt-3 text-2xl font-extrabold text-abyss-950">{wonLots}</p>
              <p className="text-sm text-slate-500">Lotes ganhos</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-2xl font-extrabold text-abyss-950">{formatBRL(wonTotal)}</p>
              <p className="text-sm text-slate-500">Total arrematado</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link to="/meus-lances" className="btn-outline">Meus lances</Link>
            <Link to="/leiloes-ganhos" className="btn-outline">Lotes ganhos</Link>
            {isAdmin && <Link to="/vendedor" className="btn-outline">Painel admin</Link>}
          </div>
          <p className="mt-6 text-xs text-slate-400">Seu nome completo e e-mail não são exibidos a outros participantes.</p>
        </div>
      </div>
    </div>
  )
}
