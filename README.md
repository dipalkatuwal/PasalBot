<div align="center">
  <h1>🏪 PasalBot</h1>
  <p><strong>Full-stack shop automation for Nepali social commerce sellers</strong></p>
  <p>Automate DM replies · Manage products & orders · Share a public shop link · Real-time seller dashboard</p>
</div>

---

## Overview

PasalBot is a platform built for small Nepali businesses selling on Facebook and Instagram. It gives sellers:

- **A configurable chat bot** that answers product questions, checks stock, and takes orders automatically
- **A public shop page** (e.g. `pasalbot.com/shop/your-shop`) customers can browse without social media
- **A real-time seller dashboard** showing orders, revenue, low-stock alerts, and live order notifications
- **Full product and category management** with visibility toggling and theme selection

## Architecture

```
pasalbot/
├── client/          # React 18 + Vite SPA
│   └── src/
│       ├── components/   # UI, layout, and feature components
│       ├── context/      # AuthContext, ShopContext, UIContext
│       ├── hooks/        # useBot (bot logic), useIntersection
│       ├── pages/        # Route-level page components
│       ├── services/     # api.js — typed fetch wrappers
│       └── utils/        # formatters, helpers
└── server/          # Node.js + Express REST API
    └── src/
        ├── config/       # MongoDB connection
        ├── middleware/    # JWT auth guard
        ├── models/       # Mongoose schemas (User, Product, Order, …)
        └── routes/       # auth, products, orders, keywords, categories, shop
```

**Tech stack**

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, CSS Modules |
| Backend | Node.js, Express 5, express-validator, express-rate-limit |
| Database | MongoDB (Atlas) via Mongoose 8 |
| Auth | JWT (Bearer token, `localStorage`) |
| Deployment | Vercel (client) + Render (server) |

---

## Quick Start

```bash
# Terminal 1 — backend
cd server && pnpm install && pnpm dev

# Terminal 2 — frontend
cd client && pnpm install && pnpm dev
```

## API Reference

All authenticated routes require `Authorization: Bearer <token>`.

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Create account + shop. Seeds default keywords and categories. |
| `POST` | `/api/auth/login` | ❌ | Returns JWT and user object. |
| `GET` | `/api/auth/me` | ✅ | Current authenticated user. |
| `PATCH` | `/api/auth/shop` | ✅ | Update shop settings. Regenerates slug on name change with conflict check. |

### Products

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | ✅ | All products for the authenticated shop. |
| `POST` | `/api/products` | ✅ | Create a product. |
| `PATCH` | `/api/products/:id` | ✅ | Update a product (partial). |
| `DELETE` | `/api/products/:id` | ✅ | Delete a product. |

### Orders

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders/public` | ❌ | Create an order from the public shop bot. Identifies shop by `shopSlug`. |
| `GET` | `/api/orders/stats` | ✅ | Dashboard stats (total, pending, delivered, revenue, weekOrders). |
| `GET` | `/api/orders` | ✅ | All orders. Filterable by `?status=Pending`. |
| `POST` | `/api/orders` | ✅ | Create an order manually. |
| `PATCH` | `/api/orders/:id/status` | ✅ | Update order status (`Pending` · `Confirmed` · `Delivered` · `Cancelled`). |

### Keywords, Categories

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/keywords` | ✅ | All bot keywords. |
| `PUT` | `/api/keywords` | ✅ | Full replace (save all at once). |
| `POST` | `/api/keywords` | ✅ | Add a single keyword. |
| `DELETE` | `/api/keywords/:id` | ✅ | Delete a keyword. |
| `GET` | `/api/categories` | ✅ | All categories. |
| `POST` | `/api/categories` | ✅ | Create a category. |
| `PATCH` | `/api/categories/:id` | ✅ | Rename / re-emoji a category. |
| `DELETE` | `/api/categories/:id` | ✅ | Delete a category. |

### Public shop

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/shop/:slug` | ❌ | Full public shop payload: shop info, visible products, keywords, categories. |

---

## Pages

| Route | Auth required | Description |
|---|---|---|
| `/` | No | Landing page |
| `/auth` | No | Login / Register |
| `/dashboard` | Yes | Stats, recent orders, low-stock alerts |
| `/products` | Yes | Add, edit, delete, toggle visibility |
| `/orders` | Yes | View and update order status |
| `/bot` | Yes | Configure keyword auto-replies |
| `/themes` | Yes | Pick and preview shop themes |
| `/shop-setup` | Yes | Edit shop info, delivery, payment, social links |
| `/shop/:slug` | No | Public-facing shop with bot (shareable link) |

---

## Bot Logic

The `useBot` hook (`client/src/hooks/useBot.js`) powers the chat interface. It handles:

- **Seller-defined keyword triggers** — configurable comma-separated triggers with custom replies
- **Product search** — fuzzy matching by name, category, and word fragments
- **Shopping cart** — add/remove items, quantity changes, cart review
- **Multi-step checkout** — collects name → address → phone, then creates an order via the API
- **Contextual commands** — `products`, `categories`, `price`, `stock`, `delivery`, `contact`, `compare`, `help`, and more
- **Numeric references** — `#2` or `2` selects the second item from the last shown list

Bot responses are plain text with `*bold*` markdown for client rendering.

---

## Deployment

### MongoDB Atlas

1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Add your server's IP (or `0.0.0.0/0` for Render) to Network Access
3. Copy the connection string into `server/.env`

### Backend — Render

1. Create a new **Web Service** pointing to the `/server` directory
2. Build command: `pnpm install`
3. Start command: `pnpm start`
4. Add all variables from `server/.env.example` as environment variables

### Frontend — Vercel

1. Import the repo, set the **Root Directory** to `client`
2. Add `VITE_API_URL` pointing to your Render service URL (e.g. `https://pasalbot.onrender.com/api`)
3. Deploy — Vercel auto-detects Vite

The `client/vercel.json` already includes the SPA rewrite rule so React Router works on direct URL access.

---

## Security Notes

- **JWT secret**: use at least 32 random characters in production (`openssl rand -hex 32`)
- **Rate limiting**: login/register are limited to 30 requests per 15 minutes; all other API routes to 500
- **Input validation**: all write endpoints use `express-validator`; shop PATCH uses a field whitelist to prevent mass-assignment
- **Password hashing**: bcrypt with cost factor 12
- **Slug conflicts**: checked atomically before any name update
- **orderId generation**: uses an atomic per-shop counter collection to prevent collisions under concurrent inserts

---

## Roadmap

- [ ] Facebook Messenger webhook integration
- [ ] Instagram Graph API DM automation
- [ ] Product image upload via Cloudinary
- [ ] Nepali / Devanagari language support
- [ ] Unit tests for `useBot` and ShopContext
- [ ] Customer profiles from phone numbers
- [ ] Webhook-based real-time order push (replace polling)
- [ ] Multi-image products
