import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Rocket } from 'lucide-react'
import { Stepper } from '../../components/wizard/Stepper'
import { AuctionInfoStep } from '../../components/wizard/AuctionInfoStep'
import { LotsStep } from '../../components/wizard/LotsStep'
import { ReviewStep } from '../../components/wizard/ReviewStep'
import { emptyLot, validateAuction, validateLot, type DraftAuction, type DraftLot } from '../../components/wizard/draft'
import { simulatePublishAuction } from '../../services/sellerService'
import { useMockDb } from '../../state/MockDbProvider'
import { getSeller } from '../../services/auctionService'

const STEPS = ['Dados do leilão', 'Lotes', 'Revisão']

export function NewAuctionPage() {
  const { db, user } = useMockDb()
  const seller = user.sellerId ? getSeller(db, user.sellerId) : undefined

  const [step, setStep] = useState(0)
  const [auction, setAuction] = useState<DraftAuction>({
    title: '',
    description: '',
    startsAt: '',
    location: seller ? `${seller.city}/${seller.state}` : '',
    pickupShipping: '',
  })
  const [lots, setLots] = useState<DraftLot[]>([emptyLot()])
  const [showErrors, setShowErrors] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  const auctionErrors = validateAuction(auction)
  const lotsValid = lots.length > 0 && lots.every((l) => validateLot(l, auction.startsAt).length === 0)

  const goTo = (s: number) => {
    setStep(s)
    setShowErrors(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = () => {
    if (step === 0 && Object.keys(auctionErrors).length) return setShowErrors(true)
    if (step === 1 && !lotsValid) return setShowErrors(true)
    goTo(step + 1)
  }

  const publish = async () => {
    setPublishing(true)
    await simulatePublishAuction({ title: auction.title, lots })
    setPublishing(false)
    setPublished(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (published) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h2 className="mt-4 text-2xl font-bold">Leilão publicado!</h2>
        <p className="mt-2 text-slate-600">
          <strong>{auction.title}</strong> com {lots.length} {lots.length === 1 ? 'lote' : 'lotes'} foi publicado com sucesso.
        </p>
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">Simulação: nada foi salvo. Na próxima etapa a publicação será enviada ao servidor.</p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to="/vendedor/meus-leiloes" className="btn-dark">Ir para Meus leilões</Link>
          <button
            className="btn-outline"
            onClick={() => {
              setAuction({ title: '', description: '', startsAt: '', location: auction.location, pickupShipping: '' })
              setLots([emptyLot()])
              setPublished(false)
              goTo(0)
            }}
          >
            Criar outro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Novo leilão</h2>
        <p className="mb-6 text-sm text-slate-500">Cadastre o leilão e todos os lotes. Você poderá revisar antes de publicar.</p>
        <Stepper steps={STEPS} current={step} />
      </div>

      {step === 0 && <AuctionInfoStep value={auction} errors={showErrors ? auctionErrors : {}} onChange={(p) => setAuction((a) => ({ ...a, ...p }))} />}
      {step === 1 && <LotsStep lots={lots} startsAt={auction.startsAt} showErrors={showErrors} onChange={setLots} />}
      {step === 2 && <ReviewStep auction={auction} lots={lots} />}

      {showErrors && step === 1 && !lotsValid && (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {lots.length === 0 ? 'Adicione pelo menos um lote.' : 'Há lotes com campos obrigatórios pendentes (destacados acima).'}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-slate-200 bg-[#f4f8f9]/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
        {step > 0 ? (
          <button onClick={() => goTo(step - 1)} className="btn-outline">
            <ArrowLeft className="h-4 w-4" /> {step === 2 ? 'Voltar e editar' : 'Voltar'}
          </button>
        ) : (
          <Link to="/vendedor" className="btn-ghost">Cancelar</Link>
        )}
        {step < 2 ? (
          <button onClick={next} className="btn-primary">
            Continuar <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={publish} disabled={publishing} className="btn-primary">
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />} Publicar leilão
          </button>
        )}
      </div>
    </div>
  )
}
