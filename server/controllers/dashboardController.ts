import type { Request, Response, NextFunction } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../configs/db.js'
import { invoices } from '../db/schema/index.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId

    const allInvoices = await db.query.invoices.findMany({
      where: eq(invoices.userId, userId),
    })

    const totalRevenue = allInvoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + Number(i.total), 0)

    const outstandingAmount = allInvoices
      .filter((i) => ['sent', 'viewed'].includes(i.status))
      .reduce((sum, i) => sum + Number(i.total), 0)

    const overdueAmount = allInvoices
      .filter((i) => i.status === 'overdue')
      .reduce((sum, i) => sum + Number(i.total), 0)

    const revenueByMonth: Record<string, { revenue: number; invoices: number }> = {}
    allInvoices
      .filter((i) => i.status === 'paid' && i.paidAt)
      .forEach((i) => {
        const month = i.paidAt!.toISOString().slice(0, 7)
        if (!revenueByMonth[month]) revenueByMonth[month] = { revenue: 0, invoices: 0 }
        revenueByMonth[month].revenue += Number(i.total)
        revenueByMonth[month].invoices += 1
      })

    res.json({
      data: {
        totalRevenue,
        outstandingAmount,
        overdueAmount,
        invoiceCount: allInvoices.length,
        paidCount: allInvoices.filter((i) => i.status === 'paid').length,
        overdueCount: allInvoices.filter((i) => i.status === 'overdue').length,
        draftCount: allInvoices.filter((i) => i.status === 'draft').length,
        revenueByMonth: Object.entries(revenueByMonth)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-12)
          .map(([month, data]) => ({ month, ...data })),
      },
    })
  } catch (err) {
    next(err)
  }
}
