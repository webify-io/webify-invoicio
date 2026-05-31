// Express entry point — loads env, mounts middleware and routes, starts the server.
// env.ts is imported first so any missing required variables throw at startup,
// not mid-request.

import 'dotenv/config'
import express from 'express'
import cors    from 'cors'
import helmet  from 'helmet'
import morgan  from 'morgan'
import { rateLimit } from 'express-rate-limit'

import { env } from './configs/env.js'
import authRouter      from './routes/auth.js'
import clientsRouter   from './routes/clients.js'
import invoicesRouter  from './routes/invoices.js'
import paymentsRouter  from './routes/payments.js'
import dashboardRouter from './routes/dashboard.js'
import { errorHandler } from './middleware/errorHandler.js'
import auth             from './middleware/auth.js'

const app = express()

// ── Security middleware ───────────────────────────────────────────────────────

app.use(helmet())
app.use(cors({
  origin:      env.CLIENT_URL,  // set via CLIENT_URL in .env — never hardcoded
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))
app.use(rateLimit({
  windowMs:       15 * 60 * 1000, // 15 minutes
  max:            300,
  standardHeaders: true,
  legacyHeaders:  false,
}))

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Public
app.use('/api/auth', authRouter)

// Protected — auth middleware validates the Bearer JWT on every request
app.use('/api/clients',   auth, clientsRouter)
app.use('/api/invoices',  auth, invoicesRouter)
app.use('/api/payments',  auth, paymentsRouter)
app.use('/api/dashboard', auth, dashboardRouter)

// ── Global error handler ──────────────────────────────────────────────────────
// Must come AFTER all routes to catch errors forwarded via next(err)

app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(Number(env.PORT), () => {
  console.log(`Invoicio API running on http://localhost:${env.PORT}`)
})

export default app
