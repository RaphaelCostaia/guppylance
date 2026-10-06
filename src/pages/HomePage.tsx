import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search, ShieldCheck, Timer, Video } from 'lucide-react'
import { useData } from '../state/DataProvider'
import { getPublicAuctions } from '../services/auctionService'
import { AuctionCard } from '../components/auction/AuctionCard'
import { FishPlaceholder } from '../components/media/FishPlaceholder'
import { EmptyState } from '../components/ui/EmptyState'
import { PageLoader } from '../components/layout/Guards'

function Section({ title, subtitle, children, link }: { title: string; subtitle?: string; children: ReactNode; link?: string }) {
  return (
    <section className="container-page mt-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {link && (
          <Link to={link} className="hidden items-center gap-1 text-sm font-semibold text-abyss-700 hover:text-abyss-900 sm:inline-flex">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  )
}

const VARIETIES = ['Full Red', 'Moscow Blue', 'Blue Grass', 'Red Dragon', 'Japan Blue', 'Snakeskin', 'Platinum', 'Dumbo Ear'] as const

export function HomePage() {
  const { db, loading } = useData()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const all = getPublicAuctions(db)

  const open = all.filter((s) => s.status === 'ativo' || s.status === 'agendado')
  // Sem destaque marcado, mostra os leilões em andamento/agendados.
  const featured = (open.some((s) => s.auction.featured) ? open.filter((s) => s.auction.featured) : open).slice(0, 3)
  const endingSoon = all
    .filter((s) => s.nextEndsAt)
    .sort((a, b) => a.nextEndsAt!.localeCompare(b.nextEndsAt!))
    .slice(0, 3)
  const newest = [...all].filter((s) => s.status !== 'encerrado').sort((a, b) => b.auction.createdAt.localeCompare(a.auction.createdAt)).slice(0, 3)

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    navigate(`/leiloes${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-abyss-950">
        <div className="absolute inset-0 opacity-60">
          <FishPlaceholder variety="Moscow Blue" variant={2} className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-abyss-950 via-abyss-950/85 to-abyss-950/20" />
        <div className="container-page relative py-16 sm:py-24">
          <p className="eyebrow text-abyss-300">Leilões especializados em aquarismo</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Os melhores Guppys do Brasil, <span className="text-coral-400">lote a lote</span>.
          </h1>
          <p className="mt-4 max-w-xl text-base text-abyss-200 sm:text-lg">
            Acompanhe leilões de criadores selecionados, veja fotos e vídeos de cada lote e dispute cada um de forma independente.
          </p>

          <form onSubmit={onSearch} className="mt-8 flex max-w-xl gap-2 rounded-2xl bg-white p-2 shadow-lift">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busque por leilão ou variedade…" className="h-full w-full rounded-xl py-3 pl-10 pr-3 text-sm outline-none" />
            </div>
            <button className="btn-primary px-5">Buscar</button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {VARIETIES.map((v) => (
              <Link key={v} to={`/leiloes?q=${encodeURIComponent(v)}`} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-abyss-100 backdrop-blur hover:bg-white/15">
                {v}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="container-page -mt-6 relative">
        <div className="card grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: Timer, t: 'Cada lote, sua disputa', d: 'Contador e histórico independentes por lote.' },
            { icon: Video, t: 'Fotos e vídeos', d: 'Veja os peixes nadando antes de dar lance.' },
            { icon: ShieldCheck, t: 'Lances seguros', d: 'Cada lance é validado no servidor, em tempo real.' },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-3 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coral-50 text-coral-600">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-abyss-950">{f.t}</p>
                <p className="text-sm text-slate-500">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {loading ? (
        <PageLoader />
      ) : all.length === 0 ? (
        <section className="container-page mt-14">
          <EmptyState title="Nenhum leilão publicado ainda" description="Os primeiros leilões aparecerão aqui assim que forem publicados." />
        </section>
      ) : (
        <>
          {featured.length > 0 && (
            <Section title="Leilões em destaque" subtitle="Seleções especiais dos criadores" link="/leiloes">
              {featured.map((s) => (
                <AuctionCard key={s.auction.id} summary={s} />
              ))}
            </Section>
          )}

          {endingSoon.length > 0 && (
            <Section title="Encerrando em breve" subtitle="Lotes com disputa nos minutos finais" link="/leiloes?status=ativos">
              {endingSoon.map((s) => (
                <AuctionCard key={s.auction.id} summary={s} />
              ))}
            </Section>
          )}

          {newest.length > 0 && (
            <Section title="Novos leilões" subtitle="Publicados recentemente" link="/leiloes">
              {newest.map((s) => (
                <AuctionCard key={s.auction.id} summary={s} />
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  )
}
