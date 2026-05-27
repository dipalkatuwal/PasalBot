<div align="center">
  <h1>🏪 PasalBot</h1>
  <p><strong>Chat-first shop platform for Nepali social commerce sellers</strong></p>
  <p>Customers order by typing words — no forms, no app downloads.<br/>Sellers get a live dashboard, a shareable shop link, and a configurable bot that never sleeps.</p>

</div>

---

## What it does

Nepali sellers on Facebook and Instagram spend hours replying to the same DMs — price? stock? delivery? PasalBot automates that and turns every conversation into a tracked order.

**For customers:** type `price honey` or `order pashmina` in the shop chat — the bot replies instantly, walks through checkout, and confirms the order.

**For sellers:** every order lands in the dashboard with customer name, phone, address, and amount. Update status from Pending → Confirmed → Delivered in one click.

---

## Features

### 🤖 Keyword-triggered bot
Sellers define triggers (e.g. `price, rate, cost`) and custom replies. The bot matches any incoming message against those triggers and responds instantly. Multiple triggers per keyword, comma-separated.

### 🛒 Full cart & checkout flow
Customers can browse products, add to cart, adjust quantities, remove items, and check out — all through natural text. The bot collects name, delivery address, and phone number step by step, then creates the order via the API.

### 🔍 Smart product matching
Fuzzy product search by name, category, or word fragments. Numeric references (`#2`, `2`) let customers select from a list. Compare two products side by side with `compare X vs Y`.

### 🏪 Public shop page
Every seller gets a unique URL — `/shop/your-shop-name` — with their full product catalog, categories, and embedded bot. No login required for customers.

### 📊 Real-time seller dashboard
- Total orders, pending, delivered, revenue, and weekly order count
- Live order list with status pipeline
- Low-stock alerts
- New orders appear without page reload via **BroadcastChannel** (same-browser instant push) + **30-second polling** fallback

### 🎨 6 themes × 5 templates
Sellers pick a color theme and a layout template independently. Changes reflect on the public shop page immediately.

**Themes:** Mountain Sunrise · Rangeen Bazaar · Himalayan Mist · Rhododendron Forest · Sacred Gold · Midnight Slate

**Templates:** Himalaya Haven · Shanti Collective · Kailash · Story · Minimal

### 🏷️ Categories
Sellers create their own categories with custom emoji. Products are filtered by category on the public shop. No defaults imposed — the seller's inventory defines the structure.

### ⚙️ Full shop configuration
Shop name (with slug auto-generation and conflict checking), tagline, logo, hero image, location, phone, WhatsApp, website, delivery time, delivery areas, payment methods, return policy, business hours, social links, and free delivery threshold.

---

## Architecture

```
pasalbot/
├── client/                    # React 18 + Vite SPA
│   └── src/
│       ├── components/
│       │   ├── features/      # bot/, categories/, orders/, products/, shop/, themes/
│       │   ├── layout/        # Navbar, PageLayout
│       │   └── ui/            # Button, ErrorToast
│       ├── context/           # AuthContext, ShopContext, UIContext
│       ├── hooks/             # useBot (all bot logic), useIntersection
│       ├── pages/             # Route-level components
│       ├── services/          # api.js — typed fetch wrappers
│       └── utils/             # formatters (NPR, date, truncate, …)
└── server/                    # Node.js + Express REST API
    └── src/
        ├── config/            # MongoDB connection
        ├── middleware/        # JWT protect guard
        ├── models/            # User, Product, Order, OrderCounter, Keyword, Category
        └── routes/            # auth, products, orders, keywords, categories, shop
```

**Stack**

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, CSS Modules |
| Backend | Node.js, Express, express-validator, express-rate-limit |
| Database | MongoDB Atlas via Mongoose 8 |
| Auth | JWT (Bearer token) |
| Real-time | BroadcastChannel API + 30s polling |
| Deployment | Vercel (client) + Render (server) |

---

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (`npm i -g pnpm`)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone

```bash
git clone https://github.com/your-username/pasalbot.git
cd pasalbot
```

### 3. Install and run

```bash
# Terminal 1 — backend
cd server && pnpm install && pnpm dev

# Terminal 2 — frontend
cd client && pnpm install && pnpm dev
```
---

## API Reference

All authenticated routes require `Authorization: Bearer <token>`.

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Create account + shop. Seeds 3 default bot keywords. |
| `POST` | `/api/auth/login` | ❌ | Returns JWT and user object. |
| `GET` | `/api/auth/me` | ✅ | Current authenticated user. |
| `PATCH` | `/api/auth/shop` | ✅ | Update any shop field. Regenerates slug on name change with conflict check. |

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
| `POST` | `/api/orders/public` | ❌ | Create an order from the public shop bot. Identified by `shopSlug`. |
| `GET` | `/api/orders/stats` | ✅ | Dashboard stats: total, pending, delivered, revenue, weekOrders. |
| `GET` | `/api/orders` | ✅ | All orders. Filterable by `?status=Pending\|Confirmed\|Delivered\|Cancelled`. |
| `POST` | `/api/orders` | ✅ | Create an order manually from the dashboard. |
| `PATCH` | `/api/orders/:id/status` | ✅ | Update order status. |

### Keywords

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/keywords` | ✅ | All bot keywords for the shop. |
| `PUT` | `/api/keywords` | ✅ | Full replace — saves the complete keyword list at once. |
| `POST` | `/api/keywords` | ✅ | Add a single keyword. |
| `DELETE` | `/api/keywords/:id` | ✅ | Delete a keyword. |

### Categories

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/categories` | ✅ | All categories for the shop. |
| `POST` | `/api/categories` | ✅ | Create a category. |
| `PATCH` | `/api/categories/:id` | ✅ | Rename or change emoji. |
| `DELETE` | `/api/categories/:id` | ✅ | Delete a category. |

### Public shop

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/shop/:slug` | ❌ | Full public shop payload — shop info, visible products, keywords, categories. |

---

## Pages

| Route | Auth | Description |
|---|---|---|
| `/` | No | Landing page |
| `/auth` | No | Login / Register |
| `/dashboard` | Yes | Stats overview, recent orders, low-stock alerts |
| `/products` | Yes | Add, edit, delete, toggle visibility |
| `/orders` | Yes | Full order list with status pipeline |
| `/bot` | Yes | Configure keyword triggers and replies |
| `/themes` | Yes | Pick color theme and shop template |
| `/shop-setup` | Yes | Edit all shop info, delivery, payment, social links |
| `/shop/:slug` | No | Public shop page with embedded bot |

---

## Bot commands

Customers can use these in the public shop chat:

| Input | What happens |
|---|---|
| `products` / `show all` | Full product catalog |
| `[category name]` | Filter by category |
| `price [item]` | Price check |
| `stock [item]` | Availability check |
| `about [item]` / `#2` | Product detail |
| `compare X vs Y` | Side-by-side comparison |
| `new` / `latest` | Newest arrivals |
| `cheap` / `under NPR 500` | Budget filter |
| `add [item] to cart` | Add to cart |
| `cart` | View cart |
| `checkout` | Start checkout flow |
| `remove [item]` | Remove from cart |
| `clear cart` | Empty cart |
| `order [item]` | Direct order flow |
| `delivery` | Delivery info |
| `payment` | Payment options |
| `return policy` | Return & exchange policy |
| `contact` | Phone, WhatsApp, social links |
| `shop info` | Hours, location, about |
| `help` | Full command list |

Seller-defined keyword triggers are matched first before any built-in command.

---

## Deployment

### MongoDB Atlas
### Backend — Render
### Frontend — Vercel


## Security

- Passwords hashed with bcrypt (cost 12)
- JWT signed with HS256, configurable expiry
- Login/register rate-limited to 30 req / 15 min
- All API routes rate-limited to 500 req / 15 min
- Write endpoints validated with express-validator
- Shop PATCH uses an explicit field whitelist (no mass-assignment)
- orderId generated with an atomic per-shop counter — no race conditions under concurrent inserts
- Public shop route exposes only whitelisted fields — no internal data leaks

---

## Roadmap

- [ ] Facebook Messenger webhook integration
- [ ] Instagram Graph API DM automation
- [ ] Product image upload (Cloudinary)
- [ ] Nepali / Devanagari language support
- [ ] Customer profiles from phone numbers
- [ ] WebSocket real-time push (replace polling)
- [ ] Multi-image products
- [ ] Unit tests for `useBot` and ShopContext