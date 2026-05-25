import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShopUI } from './ShopUI'

export function PublicShop() {
  const { slug }   = useParams()
  const navigate   = useNavigate()
  const [shopData, setShopData] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  const fetchShop = useCallback((showLoader = false) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    if (showLoader) setLoading(true)
    fetch(`${base}/shop/${slug}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => setShopData(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  // Initial load
  useEffect(() => { fetchShop(true) }, [fetchShop])

  // Re-fetch silently when admin saves changes (no page refresh needed)
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return
    const ch = new BroadcastChannel('pasalbot_shop_update')
    ch.onmessage = (e) => { if (e.data?.slug === slug) fetchShop(false) }
    return () => ch.close()
  }, [slug, fetchShop])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🏪</div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <p style={{ fontSize: 48 }}>🔍</p>
      <p style={{ fontSize: 20, fontWeight: 700 }}>Shop not found</p>
      <button onClick={() => navigate('/')} style={{ background: '#F97316', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Go Home</button>
    </div>
  )

  return (
    <ShopUI
      shop={shopData.shop}
      products={shopData.products}
      keywords={shopData.keywords}
      categories={shopData.categories}
      themeId={shopData.activeTheme}
      templateId={shopData.activeTemplate}
    />
  )
}
