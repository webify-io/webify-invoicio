// Single source of truth for all domain types, request shapes, and API envelopes.
// Services, hooks, and pages all import from here — no inline types or `any`.

// ─── Enums ────────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
export type CurrencyCode  = 'USD' | 'EUR' | 'GBP' | 'ZAR' | 'AUD' | 'CAD'
export type PaymentTerm   = 'due_on_receipt' | 'net_7' | 'net_15' | 'net_30' | 'net_60' | 'custom'
export type PaymentMethod = 'bank_transfer' | 'card' | 'cash' | 'other'

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface User {
  id:            string
  email:         string
  name:          string
  businessName?: string
  businessLogo?: string
  address?:      string
  taxNumber?:    string
  currency:      CurrencyCode
  createdAt:     string
}

// Alias used by the auth store — same shape, named for clarity at the store layer
export type AuthUser = Pick<User, 'id' | 'email' | 'name' | 'businessName'>

export interface Client {
  id:           string
  userId:       string
  name:         string
  email:        string
  company?:     string
  phone?:       string
  address?:     string
  taxNumber?:   string
  notes?:       string
  currency?:    CurrencyCode
  createdAt:    string
  updatedAt:    string
  // Computed fields returned by some endpoints
  totalBilled?:  number
  totalPaid?:    number
  invoiceCount?: number
}

export interface LineItem {
  id:          string
  description: string
  quantity:    number
  unitPrice:   number
  taxRate?:    number  // e.g. 0.15 for 15%
  discount?:   number  // percentage 0–100
  total:       number  // qty * unitPrice * (1 - discount) * (1 + taxRate)
}

export interface Invoice {
  id:            string
  userId:        string
  clientId:      string
  client?:       Client
  number:        string
  status:        InvoiceStatus
  issueDate:     string
  dueDate:       string
  currency:      CurrencyCode
  lineItems:     LineItem[]
  subtotal:      number
  taxTotal:      number
  discountTotal: number
  total:         number
  notes?:        string
  terms?:        string
  paymentTerm:   PaymentTerm
  paidAt?:       string
  paidAmount?:   number
  viewedAt?:     string
  createdAt:     string
  updatedAt:     string
}

export interface Payment {
  id:          string
  invoiceId:   string
  amount:      number
  method:      PaymentMethod
  reference?:  string
  paidAt:      string
  notes?:      string
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue:      number
  outstandingAmount: number
  overdueAmount:     number
  invoiceCount:      number
  paidCount:         number
  overdueCount:      number
  draftCount:        number
  revenueByMonth:    { month: string; revenue: number; invoices: number }[]
  topClients:        { clientId: string; name: string; total: number }[]
}

// ─── API envelope ─────────────────────────────────────────────────────────────

// Every server response wraps its payload in { data: T }
export interface ApiResponse<T> {
  data:     T
  message?: string
}

export interface PaginatedResponse<T> {
  data:       T[]
  total:      number
  page:       number
  pageSize:   number
  totalPages: number
}

// Shape rejected by axiosClient interceptor on error — pages read .message directly
export interface ApiError {
  message: string
  code?:   string
  field?:  string
}

// ─── Request inputs ───────────────────────────────────────────────────────────

export interface LoginInput    { email: string; password: string }
export interface RegisterInput { email: string; password: string; name: string; businessName?: string }

export interface CreateClientInput {
  name:       string
  email:      string
  company?:   string
  phone?:     string
  address?:   string
  taxNumber?: string
  notes?:     string
  currency?:  CurrencyCode
}

export interface CreateInvoiceInput {
  clientId:    string
  issueDate:   string
  dueDate:     string
  paymentTerm: PaymentTerm
  currency:    CurrencyCode
  lineItems:   Omit<LineItem, 'id' | 'total'>[]
  notes?:      string
  terms?:      string
}

export interface RecordPaymentInput {
  invoiceId:  string
  amount:     number
  method:     PaymentMethod
  reference?: string
  notes?:     string
  paidAt?:    string
}
