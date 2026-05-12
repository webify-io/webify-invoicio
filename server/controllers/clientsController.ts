import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../configs/db.js'
import { clients, invoices } from '../db/schema/index.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { createError } from '../middleware/errorHandler.js'

// ─── Validation Schemas ───────────────────────────────────────────────────────

const clientSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxNumber: z.string().optional(),
  notes: z.string().optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'ZAR', 'AUD', 'CAD']).optional(),
})

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function listClients(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId
    const rows = await db.query.clients.findMany({
      where: eq(clients.userId, userId),
      orderBy: [desc(clients.createdAt)],
    })
    res.json({ data: rows })
  } catch (err) {
    next(err)
  }
}

export async function getClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId
    const client = await db.query.clients.findFirst({
      where: and(eq(clients.id, req.params.id), eq(clients.userId, userId)),
      with: { invoices: { orderBy: [desc(invoices.createdAt)], limit: 10 } },
    })
    if (!client) throw createError('Client not found', 404)
    res.json({ data: client })
  } catch (err) {
    next(err)
  }
}

export async function createClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId
    const input = clientSchema.parse(req.body)
    const [client] = await db.insert(clients).values({ userId, ...input }).returning()
    res.status(201).json({ data: client })
  } catch (err) {
    next(err)
  }
}

export async function updateClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId
    const existing = await db.query.clients.findFirst({
      where: and(eq(clients.id, req.params.id), eq(clients.userId, userId)),
    })
    if (!existing) throw createError('Client not found', 404)

    const input = clientSchema.partial().parse(req.body)
    const [updated] = await db
      .update(clients)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(clients.id, req.params.id))
      .returning()
    res.json({ data: updated })
  } catch (err) {
    next(err)
  }
}

export async function deleteClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId
    const existing = await db.query.clients.findFirst({
      where: and(eq(clients.id, req.params.id), eq(clients.userId, userId)),
    })
    if (!existing) throw createError('Client not found', 404)
    await db.delete(clients).where(eq(clients.id, req.params.id))
    res.json({ message: 'Client deleted' })
  } catch (err) {
    next(err)
  }
}
