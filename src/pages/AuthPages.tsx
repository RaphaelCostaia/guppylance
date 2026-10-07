import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, MailCheck } from 'lucide-react'
import { useAuth } from '../state/AuthProvider'
import { Logo } from '../components/layout/Header'
import { useToast } from '../components/ui/Toast'

function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

function ErrorBox({ text }: { text: string | null }) {
  return text ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{text}</p> : null
}

/** Só aceita caminhos internos no "voltar" (evita redirecionamento aberto). */
const safeBack = (v: string | null) => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/')

export function LoginPage() {
  const { signIn, session } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const back = safeBack(params.get('voltar'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to={back} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const err = await signIn(email.trim(), password)
    setBusy(false)
    if (err) return setError(err)
    navigate(back, { replace: true })
  }

  return (
    <AuthCard title="Entrar" subtitle="Acesse sua conta para dar lances e acompanhar seus lotes.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="l-email">E-mail</label>
          <input id="l-email" type="email" autoComplete="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="l-pass">Senha</label>
            <Link to="/recuperar-senha" className="mb-1.5 text-xs font-medium text-abyss-700 hover:underline">Esqueci a senha</Link>
          </div>
          <input id="l-pass" type="password" autoComplete="current-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <ErrorBox text={error} />
        <button className="btn-primary w-full py-3" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Ainda não tem conta? <Link to="/criar-conta" className="font-semibold text-abyss-700 hover:underline">Criar conta</Link>
      </p>
    </AuthCard>
  )
}

export function SignupPage() {
  const { signUp, session, isNicknameAvailable } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nickname: '', fullName: '', email: '', password: '' })
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  if (session && !sentTo) return <Navigate to="/" replace />

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const nick = form.nickname.trim()
    if (!/^[A-Za-zÀ-ÿ0-9_. -]{3,24}$/.test(nick)) return setError('Apelido: 3 a 24 caracteres (letras, números, espaço, ponto, hífen ou _).')
    if (form.password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.')
    setBusy(true)
    if (!(await isNicknameAvailable(nick))) {
      setBusy(false)
      return setError('Este apelido já está em uso. Escolha outro.')
    }
    const res = await signUp({ ...form, email: form.email.trim(), nickname: nick })
    setBusy(false)
    if (res.error) return setError(res.error)
    if (res.needsConfirmation) setSentTo(form.email.trim())
    else navigate('/', { replace: true })
  }

  if (sentTo) {
    return (
      <AuthCard title="Confirme seu e-mail">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <MailCheck className="h-7 w-7" />
          </span>
          <p className="mt-4 text-sm text-slate-600">
            Enviamos um link de confirmação para <strong>{sentTo}</strong>. Abra o e-mail e clique no link para ativar sua conta.
          </p>
          <Link to="/entrar" className="btn-dark mt-6">Ir para o login</Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Criar conta" subtitle="Cadastre-se para participar dos leilões.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="s-nick">Apelido público *</label>
          <input id="s-nick" required minLength={3} maxLength={24} className="input" placeholder="Ex.: Rafa Guppys" value={form.nickname} onChange={set('nickname')} />
          <p className="mt-1 text-xs text-slate-500">É assim que você aparece no histórico de lances.</p>
        </div>
        <div>
          <label className="label" htmlFor="s-name">Nome completo</label>
          <input id="s-name" autoComplete="name" className="input" value={form.fullName} onChange={set('fullName')} />
          <p className="mt-1 text-xs text-slate-500">Não é exibido publicamente.</p>
        </div>
        <div>
          <label className="label" htmlFor="s-email">E-mail *</label>
          <input id="s-email" type="email" autoComplete="email" required className="input" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label" htmlFor="s-pass">Senha *</label>
          <input id="s-pass" type="password" autoComplete="new-password" required minLength={6} className="input" value={form.password} onChange={set('password')} />
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" className="mt-1" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} required />
          <span>Entendo que cada lance é um compromisso de compra do lote.</span>
        </label>
        <ErrorBox text={error} />
        <button className="btn-primary w-full py-3" disabled={busy || !accepted}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Criar conta
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem conta? <Link to="/entrar" className="font-semibold text-abyss-700 hover:underline">Entrar</Link>
      </p>
    </AuthCard>
  )
}

export function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const err = await sendPasswordReset(email.trim())
    setBusy(false)
    if (err) return setError(err)
    setSent(true)
  }

  return (
    <AuthCard title="Recuperar senha" subtitle="Enviaremos um link para você criar uma nova senha.">
      {sent ? (
        <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> Se houver uma conta com {email}, você receberá o link em instantes.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="f-email">E-mail</label>
            <input id="f-email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <ErrorBox text={error} />
          <button className="btn-primary w-full py-3" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Enviar link
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to="/entrar" className="font-semibold text-abyss-700 hover:underline">Voltar ao login</Link>
      </p>
    </AuthCard>
  )
}

/** Destino do link de recuperação: o Supabase abre uma sessão temporária e aqui se define a nova senha. */
export function ResetPasswordPage() {
  const { session, loading, updatePassword } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [waited, setWaited] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 2500)
    return () => clearTimeout(t)
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.')
    setBusy(true)
    const err = await updatePassword(password)
    setBusy(false)
    if (err) return setError(err)
    toast('Senha alterada com sucesso.', 'success')
    navigate('/', { replace: true })
  }

  if (!session) {
    return (
      <AuthCard title="Redefinir senha">
        {loading || !waited ? (
          <div className="grid place-items-center py-6 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <p className="text-sm text-slate-600">
            Link inválido ou expirado. <Link to="/recuperar-senha" className="font-semibold text-abyss-700 hover:underline">Solicite um novo</Link>.
          </p>
        )}
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Nova senha">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="r-pass">Nova senha</label>
          <input id="r-pass" type="password" autoComplete="new-password" required minLength={6} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <ErrorBox text={error} />
        <button className="btn-primary w-full py-3" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Salvar nova senha
        </button>
      </form>
    </AuthCard>
  )
}
