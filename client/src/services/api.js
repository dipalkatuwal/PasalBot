/**
 * api.js – Service layer
 *
 * All functions currently return mock data (simulated latency included).
 * To wire up a real backend, replace the body of each function with a
 * `fetch` call to the corresponding REST endpoint. The calling code
 * (hooks / context) does NOT need to change.
 *
 * Naming convention: <resource><Action>  e.g. productsGetAll, ordersCreate
 */

import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_BOT_KEYWORDS,
} from '@/data/mockData'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

// ─── Auth ─────────────────────────────────────────────────────────────────────
// Future: POST /api/auth/login
export async function authLogin({ email, password }) {
  await delay(400)
  return { token: 'mock-jwt-token', shopId: 'shop_priya', shopName: "Priya's Pasal" }
}

// Future: POST /api/auth/register
export async function authRegister(payload) {
  await delay(500)
  return { token: 'mock-jwt-token', shopId: 'shop_new', shopName: payload.shopName }
}

// ─── Products ─────────────────────────────────────────────────────────────────
// Future: GET /api/products?shopId=
export async function productsGetAll() {
  await delay(200)
  return [...INITIAL_PRODUCTS]
}

// Future: POST /api/products
export async function productsCreate(product) {
  await delay(300)
  return { ...product, id: Date.now() }
}

// Future: PATCH /api/products/:id
export async function productsUpdate(id, patch) {
  await delay(200)
  return { id, ...patch }
}

// Future: DELETE /api/products/:id
export async function productsDelete(id) {
  await delay(200)
  return { id }
}

// ─── Orders ───────────────────────────────────────────────────────────────────
// Future: GET /api/orders?shopId=
export async function ordersGetAll() {
  await delay(200)
  return [...INITIAL_ORDERS]
}

// Future: PATCH /api/orders/:id
export async function ordersUpdateStatus(id, status) {
  await delay(200)
  return { id, status }
}

// ─── Bot ──────────────────────────────────────────────────────────────────────
// Future: GET /api/bot/keywords?shopId=
export async function botGetKeywords() {
  await delay(200)
  return [...INITIAL_BOT_KEYWORDS]
}

// Future: PUT /api/bot/keywords
export async function botSaveKeywords(keywords) {
  await delay(300)
  return keywords
}
