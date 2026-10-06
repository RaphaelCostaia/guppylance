import { Link, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { SellerLayout } from './components/layout/SellerLayout'
import { EmptyState } from './components/ui/EmptyState'
import { HomePage } from './pages/HomePage'
import { AuctionsPage } from './pages/AuctionsPage'
import { AuctionDetailPage } from './pages/AuctionDetailPage'
import { LotPage } from './pages/LotPage'
import { MyBidsPage } from './pages/MyBidsPage'
import { WonLotsPage } from './pages/WonLotsPage'
import { ProfilePage } from './pages/ProfilePage'
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
        <Route path="meus-lances" element={<MyBidsPage />} />
        <Route path="leiloes-ganhos" element={<WonLotsPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        {/* Futuro: proteger rotas do vendedor com autenticação/permissão real. */}
        <Route path="vendedor" element={<SellerLayout />}>
          <Route index element={<SellerDashboardPage />} />
          <Route path="meus-leiloes" element={<MyAuctionsPage />} />
          <Route path="novo-leilao" element={<NewAuctionPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
