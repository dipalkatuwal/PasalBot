# 🏪 PasalBot

A full-stack shop-bot platform for Nepali Facebook/Instagram sellers. Automates DM replies, manages products and orders, and gives sellers a real-time dashboard.

## Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express
- **Database**: MongoDB 
- **Auth**: JWT (httpOnly-ready)

---

## Quick Start

### 1. Clone & install
```bash
git clone <your-repo>
cd client
pnpm run install
pnpm run dev
```

```bash
cd server
pnpm run install
pnpm run dev
```

### 2. Configure environment

**Server** — copy and fill in:
```bash
cp server/.env.example server/.env
```

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/pasalbot
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Client** — copy and fill in:
```bash
cp client/.env.example client/.env
```

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run in development
```bash
pnpm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## Pages & Navigation

| Route | Auth | Description |
|-------|------|-------------|
| `/` | ❌ | Landing page |
| `/auth` | ❌ | Login / Register |
| `/dashboard` | ✅ | Stats, recent orders, low-stock alerts |
| `/products` | ✅ | Add, edit, delete products |
| `/orders` | ✅ | View and update order status |
| `/bot` | ✅ | Configure bot keyword triggers |
| `/themes` | ✅ | Pick and preview shop themes |
| `/shop-setup` | ✅ | Edit shop info, delivery, payment, social links |
| `/shop/:slug` | ❌ | Public-facing shop page (shareable link) |

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account + shop |
| POST | `/api/auth/login` | ❌ | Get JWT |
| GET | `/api/auth/me` | ✅ | Current user |
| PATCH | `/api/auth/shop` | ✅ | Update shop settings/theme (slug conflict-checked) |
| GET | `/api/products` | ✅ | List products |
| POST | `/api/products` | ✅ | Add product |
| PATCH | `/api/products/:id` | ✅ | Update product |
| DELETE | `/api/products/:id` | ✅ | Delete product |
| GET | `/api/orders` | ✅ | List orders |
| POST | `/api/orders` | ✅ | Create order |
| PATCH | `/api/orders/:id/status` | ✅ | Update order status |
| GET | `/api/orders/stats` | ✅ | Dashboard stats |
| GET | `/api/keywords` | ✅ | List bot keywords |
| PUT | `/api/keywords` | ✅ | Save all keywords |
| POST | `/api/keywords` | ✅ | Add one keyword |
| DELETE | `/api/keywords/:id` | ✅ | Delete keyword |
| GET | `/api/shop/:slug` | ❌ | Full public shop data (products, keywords, categories, all shop fields) |

---

## Production Deployment

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add your server IP to Network Access
3. Copy the connection string into `server/.env`

### Render (recommended for backend)
1. Create a new Web Service pointing to `/server`
2. Set all env vars from `server/.env.example`
3. Build command: `pnpm install`
4. Start command: `pnpm start`

### Vercel (frontend)
1. Import the repo, set root to `/client`
2. Set `VITE_API_URL` to your Render backend URL
3. Deploy

---

## Roadmap

- [ ] Facebook Messenger webhook integration
- [ ] Instagram Graph API DM automation
- [ ] Product image upload (Cloudinary)
- [ ] Nepali (Devanagari) language support
- [ ] Vitest unit tests for `useBot` and ShopContext
- [ ] Customer profiles from phone numbers