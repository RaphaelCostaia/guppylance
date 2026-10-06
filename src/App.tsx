import { Link, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { SellerLayout } from './components/layout/SellerLayout'
import { RequireAdmin, RequireAuth } from './components/layout/Guards'
import { EmptyState } from './components/ui/EmptyState'
import { HomePage } from './pages/HomePage'
import { AuctionsPage } from './pages/AuctionsPage'
import { AuctionDetailPage } from './pages/AuctionDetailPage'
import { LotPage } from './pages/LotPage'
import { MyBidsPage } from './pages/MyBidsPage'
import { WonLotsPage } from './pages/WonLotsPage'
import { ProfilePage } from './pages/ProfilePage'
import { ForgotPasswordPage, LoginPage, ResetPasswordPage, SignupPage } from './pages/AuthPages'
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage'
import { MyAuctionsPage } from './pages/seller/MyAuctionsPage'
import { NewAuctionPage } from './pages/seller/NewAuctionPage'

function NotFoundPage() {
  return (
    <div className="container-page py-16">
      <EmptyState title="Página não encontrada" action={<Link to="/" className="btn-dark">Voltar ao início</Link>} />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="leiloes" element={<AuctionsPage />} />
        <Route path="leiloes/:id" element={<AuctionDetailPage />} />
        <Route path="leiloes/:leilaoId/lotes/:loteId" element={<LotPage />} />

        <Route path="entrar" element={<LoginPage />} />
        <Route path="criar-conta" element={<SignupPage />} />
        <Route path="recuperar-senha" element={<ForgotPasswordPage />} />
        <Route path="redefinir-senha" element={<ResetPasswordPage />} />

        <Route path="meus-lances" element={<RequireAuth><MyBidsPage /></RequireAuth>} />
        <Route path="leiloes-ganhos" element={<RequireAuth><WonLotsPage /></RequireAuth>} />
        <Route path="perfil" element={<RequireAuth><ProfilePage /></RequireAuth>} />

        {/* Somente administradores criam e gerenciam leilões (também garantido por RLS no banco). */}
        <Route path="vendedor" element={<RequireAdmin><SellerLayout /></RequireAdmin>}>
          <Route index element={<SellerDashboardPage />} />
          <Route path="meus-leiloes" element={<MyAuctionsPage />} />
          <Route path="novo-leilao" element={<NewAuctionPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
