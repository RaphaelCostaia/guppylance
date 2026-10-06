import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header, Logo } from './Header'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Footer() {
  return (
    <footer className="mt-20 bg-abyss-950 text-abyss-200">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo light />
          <p className="mt-3 max-w-sm text-sm text-abyss-300">Leilões especializados em Guppys e lotes de peixes ornamentais.</p>
        </div>
        <p className="rounded-xl border border-abyss-800 bg-abyss-900/60 px-4 py-3 text-xs text-abyss-300">
          Versão de demonstração · dados fictícios · nenhum lance ou pagamento é real.
        </p>
      </div>
    </footer>
  )
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
