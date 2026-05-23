import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db.js'
import authRoutes     from './routes/auth.js'
import productRoutes  from './routes/products.js'
import orderRoutes    from './routes/orders.js'
import keywordRoutes  from './routes/keywords.js'
import categoryRoutes from './routes/categories.js'
import shopRoutes     from './routes/shop.js'

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())

// Rate limiting — stricter on auth
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: 'Too many requests, try again later.' } })
const apiLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })

app.use('/api/auth', authLimiter)
app.use('/api',      apiLimiter)

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes)
app.use('/api/products',   productRoutes)
app.use('/api/orders',     orderRoutes)
app.use('/api/keywords',   keywordRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/shop',       shopRoutes)

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

// 404
app.use((_, res) => res.status(404).json({ message: 'Route not found.' }))

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error.' })
})

// ── Start ────────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
})
