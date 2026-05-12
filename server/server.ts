import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'

import authRouter from './routes/auth.js'
import clientsRouter from './routes/clients.js'
import invoicesRouter from './routes/invoices.js'
import paymentsRouter from './routes/payments.js'
import dashboardRouter from './routes/dashboard.js'
import { errorHandler } from './middleware/errorHandler.js'
import auth from './middleware/auth.js'

const app = express()
const PORT = process.env.PORT ?? 4000

// ─── Security & Middleware ────────────────────────────────────────────────────

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL, // never hardcoded — must be set in .env
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}))

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth',      authRouter)
app.use('/api/clients',   auth, clientsRouter)
app.use('/api/invoices',  auth, invoicesRouter)
app.use('/api/payments',  auth, paymentsRouter)
app.use('/api/dashboard', auth, dashboardRouter)

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Invoicio API running on http://localhost:${PORT}`)
})

export default app
