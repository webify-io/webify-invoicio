import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { db } from '../configs/db.js'
import { invoices, clients, invoiceCounters } from '../db/schema/index.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { createError } from '../middleware/errorHandler.js'

// ─── Validation Schemas ───────────────────────────────────────────────────────

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  taxRate: z.number().min(0).max(1).optional(),
  discount: z.number().min(0).max(100).optional(),
})

const createInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paymentTerm: z.enum(['due_on_receipt', 'net_7', 'net_15', 'net_30', 'net_60', 'custom']),
  currency: z.enum(['USD', 'EUR', 'GBP', 'ZAR', 'AUD', 'CAD']),
  lineItems: z.array(lineItemSchema).min(1),
  notes: z.string().optional(),
  terms: z.string().optional(),
})

// ─── Private Helpers ──────────────────────────────────────────────────────────

function computeTotals(rawItems: z.infer<typeof lineItemSchema>[]) {
  let subtotal = 0, taxTotal = 0, discountTotal = 0

  const lineItems = rawItems.map((item) => {
    const base = item.quantity * item.unitPrice
    const disc = base * ((item.discount ?? 0) / 100)
    const afterDiscount = base - disc
    const tax = afterDiscount * (item.taxRate ?? 0)
    const total = afterDiscount + tax

    subtotal += afterDiscount
    discountTotal += disc
    taxTotal += tax

    return { id: randomUUID(), ...item, total: +total.toFixed(2) }
  })

  return {
    lineItems,
    subtotal: +subtotal.toFixed(2),
    taxTotal: +taxTotal.toFixed(2),
    discountTotal: +discountTotal.toFixed(2),
    total: +(subtotal + taxTotal).toFixed(2),
  }
}

async function nextInvoiceNumber(userId: string): Promise<string> {
  const [counter] = await db
    .insert(invoiceCounters)
    .values({ userId, nextNumber: 1, prefix: 'INV' })
    .onConflictDoUpdate({
      target: invoiceCounters.userId,
      set: { nextNumber: invoiceCounters.nextNumber },
    })
    .returning()

  const [updated] = await db
    .update(invoiceCounters)
    .set({ nextNumber: counter.nextNumber + 1 })
    .where(eq(invoiceCounters.userId, userId))
    .returning()

  return `${updated.prefix}-${String(counter.nextNumber).padStart(4, '0')}`
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function listInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId
    const { status, clientId, page = '1', pageSize = '20' } = req.query

    const conditions = [eq(invoices.userId, userId)]
    if (status) conditions.push(eq(invoices.status, status as any))
    if (clientId) conditions.push(eq(invoices.clientId, clientId as string))

    const rows = await db.query.invoices.findMany({
      where: and(...conditions),
      orderBy: [desc(invoices.createdAt)],
      with: { client: true },
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
    })

    res.json({ data: rows })
  } catch (err) {
    next(err)
  }
}

export async function getInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId
    const invoice = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, req.params.id), eq(invoices.userId, userId)),
      with: { client: true, payments: true },
    })
    if (!invoice) throw createError('Invoice not found', 404)
    res.json({ data: invoice })
  } catch (err) {
    next(err)
  }
}

export async function createInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId
    const input = createInvoiceSchema.parse(req.body)

    const client = await db.query.clients.findFirst({
      where: and(eq(clients.id, input.clientId), eq(clients.userId, userId)),
    })
    if (!client) throw createError('Client not found', 404)

    const { lineItems, subtotal, taxTotal, discountTotal, total } = computeTotals(input.lineItems)
    const number = await nextInvoiceNumber(userId)

    const [invoice] = await db
      .insert(invoices)
      .values({
        userId,
        clientId: input.clientId,
        number,
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        paymentTerm: input.paymentTerm,
        currency: input.currency,
        lineItems,
        subtotal: String(subtotal),
        taxTotal: String(taxTotal),
        discountTotal: String(discountTotal),
        total: String(total),
        notes: input.notes,
        terms: input.terms,
        status: 'draft',
      })
      .returning()

    res.status(201).json({ data: invoice })
  } catch (err) {
    next(err)
  }
}

export async function updateInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId
    const existing = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, req.params.id), eq(invoices.userId, userId)),
    })
    if (!existing) throw createError('Invoice not found', 404)
    if (existing.status === 'paid') throw createError('Cannot edit a paid invoice', 400)

    const partial = createInvoiceSchema.partial().parse(req.body)
    const updates: Record<string, any> = { ...partial, updatedAt: new Date() }

    if (partial.lineItems) {
      const computed = computeTotals(partial.lineItems)
      updates.lineItems = computed.lineItems
      updates.subtotal = String(computed.subtotal)
      updates.taxTotal = String(computed.taxTotal)
      updates.discountTotal = String(computed.discountTotal)
      updates.total = String(computed.total)
    }

    const [updated] = await db
      .update(invoices)
      .set(updates)
      .where(eq(invoices.id, req.params.id))
      .returning()

    res.json({ data: updated })
  } catch (err) {
    next(err)
  }
}

export async function sendInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId
    const existing = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, req.params.id), eq(invoices.userId, userId)),
    })
    if (!existing) throw createError('Invoice not found', 404)
    if (existing.status !== 'draft') throw createError('Only draft invoices can be sent', 400)

    const [updated] = await db
      .update(invoices)
      .set({ status: 'sent', updatedAt: new Date() })
      .where(eq(invoices.id, req.params.id))
      .returning()

    // TODO: trigger email via Resend
    res.json({ data: updated, message: 'Invoice sent' })
  } catch (err) {
    next(err)
  }
}

export async function deleteInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId
    const existing = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, req.params.id), eq(invoices.userId, userId)),
    })
    if (!existing) throw createError('Invoice not found', 404)
    if (existing.status === 'paid') throw createError('Cannot delete a paid invoice', 400)

    await db.delete(invoices).where(eq(invoices.id, req.params.id))
    res.json({ message: 'Invoice deleted' })
  } catch (err) {
    next(err)
  }
}
