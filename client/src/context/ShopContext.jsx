import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import {
  productsGetAll, productsCreate, productsUpdate, productsDelete,
  ordersGetAll, ordersUpdateStatus,
  botGetKeywords, botSaveKeywords,
} from '@/services/api'
import { SHOP_THEMES } from '@/data/mockData'

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  // Shop meta
  shop: { name: "Priya's Pasal", slug: 'priya', logo: '🏪', description: 'Handmade & organic products from Kathmandu 🌿' },
  activeTheme: SHOP_THEMES[0],

  // Data
  products: [],
  orders:   [],
  keywords: [],

  // UI loading flags
  loading: { products: false, orders: false, keywords: false },
  error:   null,
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, [action.key]: action.value } }

    case 'SET_ERROR':
      return { ...state, error: action.error }

    case 'SET_PRODUCTS':
      return { ...state, products: action.products }

    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.product] }

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.product.id ? { ...p, ...action.product } : p
        ),
      }

    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.id) }

    case 'SET_ORDERS':
      return { ...state, orders: action.orders }

    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.id ? { ...o, status: action.status } : o
        ),
      }

    case 'SET_KEYWORDS':
      return { ...state, keywords: action.keywords }

    case 'SET_THEME':
      return { ...state, activeTheme: action.theme }

    case 'UPDATE_SHOP':
      return { ...state, shop: { ...state.shop, ...action.patch } }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ShopContext = createContext(null)

export function ShopProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function bootstrap() {
      dispatch({ type: 'SET_LOADING', key: 'products', value: true })
      dispatch({ type: 'SET_LOADING', key: 'orders',   value: true })
      dispatch({ type: 'SET_LOADING', key: 'keywords', value: true })
      try {
        const [products, orders, keywords] = await Promise.all([
          productsGetAll(),
          ordersGetAll(),
          botGetKeywords(),
        ])
        dispatch({ type: 'SET_PRODUCTS', products })
        dispatch({ type: 'SET_ORDERS',   orders   })
        dispatch({ type: 'SET_KEYWORDS', keywords })
      } catch (err) {
        dispatch({ type: 'SET_ERROR', error: err.message })
      } finally {
        dispatch({ type: 'SET_LOADING', key: 'products', value: false })
        dispatch({ type: 'SET_LOADING', key: 'orders',   value: false })
        dispatch({ type: 'SET_LOADING', key: 'keywords', value: false })
      }
    }
    bootstrap()
  }, [])

  // ── Actions ────────────────────────────────────────────────────────────────
  const addProduct = useCallback(async (productData) => {
    const product = await productsCreate(productData)
    dispatch({ type: 'ADD_PRODUCT', product })
    return product
  }, [])

  const updateProduct = useCallback(async (id, patch) => {
    const product = await productsUpdate(id, patch)
    dispatch({ type: 'UPDATE_PRODUCT', product: { id, ...patch } })
    return product
  }, [])

  const deleteProduct = useCallback(async (id) => {
    await productsDelete(id)
    dispatch({ type: 'DELETE_PRODUCT', id })
  }, [])

  const toggleProductVisibility = useCallback((id) => {
    const product = state.products.find((p) => p.id === id)
    if (!product) return
    updateProduct(id, { visible: !product.visible })
  }, [state.products, updateProduct])

  const updateOrderStatus = useCallback(async (id, status) => {
    await ordersUpdateStatus(id, status)
    dispatch({ type: 'UPDATE_ORDER_STATUS', id, status })
  }, [])

  const saveKeywords = useCallback(async (keywords) => {
    const saved = await botSaveKeywords(keywords)
    dispatch({ type: 'SET_KEYWORDS', keywords: saved })
  }, [])

  const setTheme = useCallback((theme) => {
    dispatch({ type: 'SET_THEME', theme })
  }, [])

  const updateShop = useCallback((patch) => {
    dispatch({ type: 'UPDATE_SHOP', patch })
  }, [])

  // ── Derived ────────────────────────────────────────────────────────────────
  const derived = {
    totalRevenue:    state.orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.amount, 0),
    pendingCount:    state.orders.filter(o => o.status === 'Pending').length,
    lowStockProducts: state.products.filter(p => p.stock <= 9),
    visibleProducts: state.products.filter(p => p.visible),
  }

  const value = {
    ...state,
    ...derived,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility,
    updateOrderStatus,
    saveKeywords,
    setTheme,
    updateShop,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within <ShopProvider>')
  return ctx
}
