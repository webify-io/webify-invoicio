# Invoicio

A clean, full-stack invoicing application for freelancers and small businesses.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18 · Vite · Tailwind CSS v4               |
| Backend   | Node.js · Express (ESM)                         |
| Database  | Neon (serverless Postgres) · Drizzle ORM        |
| Auth      | JWT (Bearer token via Axios interceptor)        |

---

## Project Structure

```
invoicio/
├── client/
│   └── src/
│       ├── api/                    # React Query hooks (consume services)
│       ├── components/
│       ├── lib/
│       │   └── axiosClient.js      # Single Axios instance + interceptors
│       ├── pages/
│       ├── services/               # Domain-split HTTP services
│       │   ├── apiPaths/           # Route strings (one file per domain)
│       │   │   ├── auth.paths.js
│       │   │   ├── clients.paths.js
│       │   │   ├── dashboard.paths.js
│       │   │   ├── invoices.paths.js
│       │   │   └── payments.paths.js
│       │   ├── auth.service.js
│       │   ├── clients.service.js
│       │   ├── dashboard.service.js
│       │   ├── invoices.service.js
│       │   └── payments.service.js
│       ├── store/                  # Zustand auth store
│       └── types/
└── server/
    ├── configs/db.ts               # Neon + Drizzle connection
    ├── controllers/                # All business logic
    ├── db/schema/                  # Drizzle schema
    ├── middleware/
    │   ├── auth.ts                 # JWT verify (default export)
    │   └── errorHandler.ts
    ├── routes/                     # Thin routers — wiring only
    └── server.ts
```

---

## Getting Started

### 1. Install

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env    # fill in DATABASE_URL, JWT_SECRET
cp client/.env.example client/.env   # fill in VITE_BACKEND_URL
```

> **DATABASE_URL must include the database name before `?`:**
> `postgresql://user:pass@host/invoicio-dev?sslmode=require`

### 3. Database setup

```bash
cd server
npm run db:generate
npm run db:migrate
```

### 4. Run

```bash
# Terminal 1
cd server && npm run server    # → http://localhost:4000

# Terminal 2
cd client && npm run dev       # → http://localhost:5173
```

---

## API

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/invoices` | ✓ | List invoices |
| POST | `/api/invoices` | ✓ | Create invoice |
| GET | `/api/invoices/:id` | ✓ | Invoice detail |
| PATCH | `/api/invoices/:id` | ✓ | Update invoice |
| POST | `/api/invoices/:id/send` | ✓ | Send invoice |
| DELETE | `/api/invoices/:id` | ✓ | Delete draft |
| GET | `/api/clients` | ✓ | List clients |
| POST | `/api/clients` | ✓ | Create client |
| GET | `/api/clients/:id` | ✓ | Client + invoices |
| PATCH | `/api/clients/:id` | ✓ | Update client |
| DELETE | `/api/clients/:id` | ✓ | Delete client |
| POST | `/api/payments` | ✓ | Record payment |
| GET | `/api/dashboard` | ✓ | Revenue stats |

---

## Deployment

### Frontend → Vercel
Set root to `client/`, framework to Vite, env var: `VITE_BACKEND_URL=https://api.yourdomain.co.za`

### Backend → Railway / Render
Env vars: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `PORT=4000`
Start: `npm start`
