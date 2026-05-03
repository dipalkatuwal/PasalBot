# 🏪 PasalBot — Frontend v1.1

> Smart Shop Assistant · Chat, Sell & Manage  
> Built for Nepali social media sellers on Facebook & Instagram.

---

## Tech Stack

| Layer       | Choice                          |
|-------------|---------------------------------|
| Framework   | React 18 + Vite 5               |
| Routing     | React Router v6                 |
| State       | Context API + useReducer        |
| Styling     | CSS Modules + CSS Variables     |
| Data        | Mock layer (API-ready)          |
| Deployment  | Vercel (recommended)            |

---

## Getting Started

```bash
# 1. Enter client directory
cd client

# 2. Install dependencies
pnpm install

# 3. Start dev server (http://localhost:3000)
pnpm run dev

# 4. Build for production
pnpm run build

# 5. Preview production build
pnpm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── ui/                  # Reusable primitives (Button, Card, Badge …)
│   ├── layout/              # Navbar, PageLayout
│   └── features/
│       ├── landing/         # Hero, ProblemSolution, FeaturesGrid …
│       ├── dashboard/       # (page-level, logic lives in page)
│       ├── products/        # ProductCard, ProductForm
│       ├── orders/          # OrderRow
│       ├── bot/             # BotChat, KeywordEditor
│       ├── themes/          # ThemeCard
│       └── shop/            # DemoShop modal
├── context/
│   ├── ShopContext.jsx      # Global shop state + actions (useReducer)
│   └── UIContext.jsx        # UI state (modals, etc.)
├── data/
│   └── mockData.js          # All mock constants (products, orders …)
├── hooks/
│   ├── useBot.js            # Bot chat logic (keyword matching + order flow)
│   └── useIntersection.js   # Scroll-reveal helper
├── pages/                   # One file per route
├── services/
│   └── api.js               # ⚡ Swap mock bodies for real fetch() calls here
├── styles/
│   └── globals.css          # Design tokens (CSS variables) + reset
└── utils/
    └── formatters.js        # formatNPR, formatDate, generateId …
```

---

## Connecting a Real Backend

All API calls are isolated in `src/services/api.js`.  
Each function has a comment like:

```js
// Future: GET /api/products?shopId=
export async function productsGetAll() { … }
```

To connect to a real backend:
1. Replace the function body with a `fetch` (or `axios`) call.
2. Add your base URL to a `.env` file: `VITE_API_URL=https://api.yourbackend.com`
3. No changes needed in Context, hooks, or components.

---

## Environment Variables

```env
# .env.example
VITE_API_URL=http://localhost:5000
VITE_SHOP_SLUG=demo
```

---

## Deployment (Vercel)

```bash
npm run build
# Upload /dist to Vercel, or connect GitHub repo for auto-deploy.
```

Add a `vercel.json` for SPA routing:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## Roadmap (Post-MVP)

- [ ] Auth (JWT login / register)
- [ ] Real MongoDB backend (Node + Express)
- [ ] Image upload for products (Cloudinary)
- [ ] WhatsApp / Messenger bot integration
- [ ] Analytics dashboard with charts
- [ ] Multi-language: Nepali / English toggle
