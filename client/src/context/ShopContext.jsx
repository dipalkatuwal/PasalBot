import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { SHOP_THEMES, SHOP_TEMPLATES } from '@/data/mockData'
import { getTheme } from '@/data/themes'
import {
  productsGetAll, productsCreate, productsUpdate, productsDelete,
  ordersGetAll, ordersCreate, ordersSetStatus, ordersGetStats,
  keywordsGetAll, keywordsSaveAll,
  categoriesGetAll, categoriesCreate, categoriesUpdate, categoriesDelete,
  updateShop,
} from '@/services/api'

const ShopContext = createContext(null)

// "All" is always the first virtual category — never stored in DB
const ALL_CAT = { _id: 'all', label: 'All', emoji: '🛍️' }

// Notify any open public-shop tabs (or the demo iframe) that data changed.
function broadcastShopUpdate(slug) {
  if (!slug || !('BroadcastChannel' in window)) return
  const ch = new BroadcastChannel('pasalbot_shop_update')
  ch.postMessage({ slug })
  ch.close()
}

export function ShopProvider({ children }) {
  const { user, updateUser } = useAuth()

  const [products,   setProducts]   = useState([])
  const [orders,     setOrders]     = useState([])
  const [keywords,   setKeywords]   = useState([])
  const [categories, setCategories] = useState([])
  const [stats,      setStats]      = useState({ total: 0, pending: 0, delivered: 0, revenue: 0, weekOrders: 0 })
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [previewShop, setPreviewShop] = useState(null)

  const activeTheme    = getTheme(user?.activeTheme)
  const activeTemplate = SHOP_TEMPLATES.find(t => t.id === user?.activeTemplate) || SHOP_TEMPLATES[0]

  // Load all shop data when user logs in
  useEffect(() => {
    if (!user) {
      // Only set loading to false if we're NOT currently waiting for auth
      // This prevents "Empty State" flicker on refresh
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([
      productsGetAll(),
      ordersGetAll(),
      keywordsGetAll(),
      ordersGetStats(),
      categoriesGetAll(),
    ])
      .then(([prods, ords, kws, st, cats]) => {
        setProducts(prods)
        setOrders(ords)
        setKeywords(kws)
        setStats(st)
        setCategories(cats)
      })
      .catch(() => setError('Failed to load shop data. Please refresh.'))
      .finally(() => setLoading(false))
  }, [user?.id])

  // ── Shop settings ──────────────────────────────────────────────────────────
  const setTheme = useCallback(async (theme) => {
    const updated = await updateShop({ activeTheme: theme.id })
    updateUser(updated)
    broadcastShopUpdate(user?.shop?.slug)
  }, [updateUser, user?.shop?.slug])

  const setTemplate = useCallback(async (template) => {
    const updated = await updateShop({ activeTemplate: template.id })
    updateUser(updated)
    broadcastShopUpdate(user?.shop?.slug)
  }, [updateUser, user?.shop?.slug])

  // ── Products ───────────────────────────────────────────────────────────────
  const addProduct = useCallback(async (data) => {
    const product = await productsCreate(data)
    setProducts(prev => [product, ...prev])
    broadcastShopUpdate(user?.shop?.slug)
  }, [user?.shop?.slug])

  const toggleProductVisibility = useCallback(async (id) => {
    const product = products.find(p => p._id === id)
    if (!product) return
    const updated = await productsUpdate(id, { visible: !product.visible })
    setProducts(prev => prev.map(p => p._id === id ? updated : p))
    broadcastShopUpdate(user?.shop?.slug)
  }, [products, user?.shop?.slug])

  const deleteProduct = useCallback(async (id) => {
    await productsDelete(id)
    setProducts(prev => prev.filter(p => p._id !== id))
    broadcastShopUpdate(user?.shop?.slug)
  }, [user?.shop?.slug])

  // ── Orders ─────────────────────────────────────────────────────────────────
  const addOrder = useCallback(async (data) => {
    const order = await ordersCreate(data)
    setOrders(prev => [order, ...prev])
    setStats(prev => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1 }))
    return order
  }, [])

  const updateOrderStatus = useCallback(async (id, status) => {
    const updated = await ordersSetStatus(id, status)
    setOrders(prev => prev.map(o => o._id === id ? updated : o))
    ordersGetStats().then(setStats).catch(() => {})
  }, [])

  // ── Keywords ───────────────────────────────────────────────────────────────
  const saveKeywords = useCallback(async (list) => {
    const saved = await keywordsSaveAll(list)
    setKeywords(saved)
  }, [])

  // ── Categories ─────────────────────────────────────────────────────────────
  const addCategory = useCallback(async (label, emoji = '🏷️') => {
    const cat = await categoriesCreate({ label, emoji })
    setCategories(prev => [...prev, cat])
    return cat
  }, [])

  const updateCategory = useCallback(async (id, data) => {
    const updated = await categoriesUpdate(id, data)
    setCategories(prev => prev.map(c => c._id === id ? updated : c))
  }, [])

  const deleteCategoryById = useCallback(async (id) => {
    await categoriesDelete(id)
    setCategories(prev => prev.filter(c => c._id !== id))
  }, [])

  // "All" prepended as virtual entry for UI filtering
  const allCategories = [ALL_CAT, ...categories]

  const visibleProducts = products.filter(p => p.visible)
  const baseShop = user?.shop || { 
    name: 'My Pasal', 
    slug: '', 
    logo: '🏪', 
    description: '',
    location: '',
    phone: '',
    deliveryTime: '1-3 days',
    deliveryAreas: 'Inside Kathmandu Valley',
    paymentMethods: ['COD'],
    returnPolicy: 'Return/exchange within 3 days',
    howToOrder: 'Order via the shop bot or DM us',
    businessHours: '10 AM - 8 PM',
    socialLinks: { facebook: '', instagram: '' },
    freeDeliveryThreshold: 0
  }

  const shop = previewShop || baseShop

  return (
    <ShopContext.Provider value={{
      // shop identity
      shop, activeTheme, setTheme, activeTemplate, setTemplate,
      setPreviewShop,
      // products
      products, visibleProducts, addProduct, toggleProductVisibility, deleteProduct,
      // orders
      orders, addOrder, updateOrderStatus,
      // keywords
      keywords, saveKeywords,
      // categories
      categories: allCategories,   // includes the virtual "All" at index 0
      addCategory, updateCategory, deleteCategory: deleteCategoryById,
      // stats + loading
      stats, loading, error,
    }}>
      {error && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, background: '#fee2e2',
          color: '#991b1b', padding: '12px 20px', borderRadius: 8,
          border: '1px solid #f87171', fontSize: 14, fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          ⚠️ {error}
        </div>
      )}
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within <ShopProvider>')
  return ctx
}
