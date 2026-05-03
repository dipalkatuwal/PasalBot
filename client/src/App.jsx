import { Routes, Route, useLocation } from 'react-router-dom'
import { ShopProvider } from '@/context/ShopContext'
import { UIProvider } from '@/context/UIContext'
import { Navbar } from '@/components/layout/Navbar'
import { DemoShop } from '@/components/features/shop/DemoShop'

import LandingPage   from '@/pages/LandingPage'
import DashboardPage from '@/pages/DashboardPage'
import ProductsPage  from '@/pages/ProductsPage'
import OrdersPage    from '@/pages/OrdersPage'
import BotPage       from '@/pages/BotPage'
import ThemesPage    from '@/pages/ThemesPage'
import NotFoundPage  from '@/pages/NotFoundPage'

function AppShell() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<LandingPage />}   />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products"  element={<ProductsPage />}  />
        <Route path="/orders"    element={<OrdersPage />}    />
        <Route path="/bot"       element={<BotPage />}       />
        <Route path="/themes"    element={<ThemesPage />}    />
        <Route path="*"          element={<NotFoundPage />}  />
      </Routes>
      {/* Global modal — always mounted, shown/hidden via UIContext */}
      <DemoShop />
    </>
  )
}

export default function App() {
  return (
    <ShopProvider>
      <UIProvider>
        <AppShell />
      </UIProvider>
    </ShopProvider>
  )
}
