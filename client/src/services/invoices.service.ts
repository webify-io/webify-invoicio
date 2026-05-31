// Invoices service — CRUD + send for /api/invoices
import client from '../lib/axiosClient'
import { INVOICE_PATHS } from './apiPaths/invoices.paths'
import type { ApiResponse, Invoice, CreateInvoiceInput } from '../types'

export const invoiceService = {
  getAll:  (params?: { status?: string; clientId?: string }) =>
    client.get<ApiResponse<Invoice[]>>(INVOICE_PATHS.ALL, { params }),
  getById: (id: string) =>
    client.get<ApiResponse<Invoice>>(INVOICE_PATHS.BY_ID(id)),
  create:  (body: CreateInvoiceInput) =>
    client.post<ApiResponse<Invoice>>(INVOICE_PATHS.ALL, body),
  update:  (id: string, body: Partial<CreateInvoiceInput>) =>
    client.patch<ApiResponse<Invoice>>(INVOICE_PATHS.BY_ID(id), body),
  send:    (id: string) =>
    client.post<ApiResponse<Invoice>>(INVOICE_PATHS.SEND(id)),
  delete:  (id: string) =>
    client.delete<void>(INVOICE_PATHS.BY_ID(id)),
}
