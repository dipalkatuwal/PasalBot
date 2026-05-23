const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── Token helpers ────────────────────────────────────────────────────────────
export function getToken()   { return localStorage.getItem('pb_token') }
export function setToken(t)  { localStorage.setItem('pb_token', t) }
export function clearToken() { localStorage.removeItem('pb_token') }

// ── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong')
    err.status = res.status
    throw err
  }
  return data
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authRegister = (email, password, shopName) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, shopName }) })

export const authLogin = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const authGetMe   = ()        => request('/auth/me')
export const updateShop  = (updates) => request('/auth/shop', { method: 'PATCH', body: JSON.stringify(updates) })

// ── Products ──────────────────────────────────────────────────────────────────
export const productsGetAll = ()          => request('/products')
export const productsCreate = (data)      => request('/products', { method: 'POST', body: JSON.stringify(data) })
export const productsUpdate = (id, data)  => request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const productsDelete = (id)        => request(`/products/${id}`, { method: 'DELETE' })

// ── Orders ───────────────────────────────────────────────────────────────────
export const ordersGetAll    = ()           => request('/orders')
export const ordersCreate    = (data)       => request('/orders', { method: 'POST', body: JSON.stringify(data) })
export const ordersSetStatus = (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
export const ordersGetStats  = ()           => request('/orders/stats')

// ── Keywords ─────────────────────────────────────────────────────────────────
export const keywordsGetAll  = ()      => request('/keywords')
export const keywordsSaveAll = (list)  => request('/keywords', { method: 'PUT', body: JSON.stringify(list) })
export const keywordsCreate  = (data)  => request('/keywords', { method: 'POST', body: JSON.stringify(data) })
export const keywordsDelete  = (id)    => request(`/keywords/${id}`, { method: 'DELETE' })

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesGetAll  = ()          => request('/categories')
export const categoriesCreate  = (data)      => request('/categories', { method: 'POST', body: JSON.stringify(data) })
export const categoriesUpdate  = (id, data)  => request(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const categoriesDelete  = (id)        => request(`/categories/${id}`, { method: 'DELETE' })
