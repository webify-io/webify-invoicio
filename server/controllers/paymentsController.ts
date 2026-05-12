import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../configs/db.js'
import { payments, invoices } from '../db/schema/index.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { createError } from '../middleware/errorHandler.js'

// ─── Validation Schemas ───────────────────────────────────────────────────────

const paymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(['bank_transfer', 'card', 'cash', 'other']),
  reference: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string().datetime().optional(),
})

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function recordPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId
    const input = paymentSchema.parse(req.body)

    const invoice = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, input.invoiceId), eq(invoices.userId, userId)),
    })
    if (!invoice) throw createError('Invoice not found', 404)

    const [payment] = await db.insert(payments).values({
      ...input,
      amount: String(input.amount),
      paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
    }).returning()

    await db.update(invoices).set({
      status: 'paid',
      paidAt: new Date(),
      paidAmount: String(input.amount),
      updatedAt: new Date(),
    }).where(eq(invoices.id, input.invoiceId))

    res.status(201).json({ data: payment })
  } catch (err) {
    next(err)
  }
}
