import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }    from '@/context/AuthContext'
import { ShopProvider }    from '@/context/ShopContext'
import { UIProvider }      from '@/context/UIContext'
import { ProtectedRoute }  from '@/components/ProtectedRoute'
import { Navbar }          from '@/components/layout/Navbar'
import { DemoShop }        from '@/components/features/shop/DemoShop'
import { PublicShop }      from '@/components/features/shop/PublicShop'

import LandingPage        from '@/pages/LandingPage'
import AuthPage           from '@/pages/AuthPage'
import DashboardPage      from '@/pages/DashboardPage'
import ProductsPage       from '@/pages/ProductsPage'
import OrdersPage         from '@/pages/OrdersPage'
import BotPage            from '@/pages/BotPage'
import CreateMyShopPage   from '@/pages/CreateMyShopPage'

// Dashboard shell — only rendered when logged in
function AppShell() {
  return (
    <ShopProvider>
      
        <Navbar />
        <DemoShop />
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage    /></ProtectedRoute>} />
          <Route path="/products"  element={<ProtectedRoute><ProductsPage     /></ProtectedRoute>} />
          <Route path="/orders"    element={<ProtectedRoute><OrdersPage       /></ProtectedRoute>} />
          <Route path="/bot"       element={<ProtectedRoute><BotPage          /></ProtectedRoute>} />
          <Route path="/shop-setup"element={<ProtectedRoute><CreateMyShopPage /></ProtectedRoute>} />
          <Route path="*"          element={<Navigate to="/dashboard" replace />} />
        </Routes>
      
    </ShopProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
    <UIProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/"           element={<LandingPage />} />
        <Route path="/auth"       element={<AuthPage />} />
        {/* Public shop — no auth, no navbar, no shell */}
        <Route path="/shop/:slug" element={<PublicShop />} />
        {/* Dashboard */}
        <Route path="/*"          element={<AppShell />} />
      </Routes>
      </UIProvider>
    </AuthProvider>
  )
}
