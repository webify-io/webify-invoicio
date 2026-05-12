// ─── Core Enums ───────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'ZAR' | 'AUD' | 'CAD'
export type PaymentTerm = 'due_on_receipt' | 'net_7' | 'net_15' | 'net_30' | 'net_60' | 'custom'

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  businessName?: string
  businessLogo?: string
  address?: string
  taxNumber?: string
  currency: CurrencyCode
  createdAt: string
}

export interface Client {
  id: string
  userId: string
  name: string
  email: string
  company?: string
  phone?: string
  address?: string
  taxNumber?: string
  notes?: string
  currency?: CurrencyCode
  createdAt: string
  updatedAt: string
  // Computed
  totalBilled?: number
  totalPaid?: number
  invoiceCount?: number
}

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate?: number   // e.g. 0.15 for 15%
  discount?: number  // percentage 0–100
  total: number      // computed: qty * unitPrice * (1 - discount) * (1 + taxRate)
}

export interface Invoice {
  id: string
  userId: string
  clientId: string
  client?: Client
  number: string        // e.g. INV-0042
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  currency: CurrencyCode
  lineItems: LineItem[]
  subtotal: number
  taxTotal: number
  discountTotal: number
  total: number
  notes?: string
  terms?: string
  paymentTerm: PaymentTerm
  paidAt?: string
  paidAmount?: number
  viewedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: 'bank_transfer' | 'card' | 'cash' | 'other'
  reference?: string
  paidAt: string
  notes?: string
}

// ─── Dashboard / Analytics ────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number
  outstandingAmount: number
  overdueAmount: number
  invoiceCount: number
  paidCount: number
  overdueCount: number
  draftCount: number
  revenueByMonth: { month: string; revenue: number; invoices: number }[]
  topClients: { clientId: string; name: string; total: number }[]
}

// ─── API Shapes ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  field?: string
}

// ─── Form Inputs ──────────────────────────────────────────────────────────────

export interface CreateInvoiceInput {
  clientId: string
  issueDate: string
  dueDate: string
  paymentTerm: PaymentTerm
  currency: CurrencyCode
  lineItems: Omit<LineItem, 'id' | 'total'>[]
  notes?: string
  terms?: string
}

export interface CreateClientInput {
  name: string
  email: string
  company?: string
  phone?: string
  address?: string
  taxNumber?: string
  notes?: string
  currency?: CurrencyCode
}
