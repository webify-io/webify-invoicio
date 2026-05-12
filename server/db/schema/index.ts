import {
  pgTable,
  text,
  numeric,
  timestamp,
  integer,
  pgEnum,
  jsonb,
  uuid,
  boolean,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ─────────────────────────────────────────────────────────────────────

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled',
])

export const paymentTermEnum = pgEnum('payment_term', [
  'due_on_receipt', 'net_7', 'net_15', 'net_30', 'net_60', 'custom',
])

export const paymentMethodEnum = pgEnum('payment_method', [
  'bank_transfer', 'card', 'cash', 'other',
])

export const currencyEnum = pgEnum('currency_code', [
  'USD', 'EUR', 'GBP', 'ZAR', 'AUD', 'CAD',
])

// ─── Users ─────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  businessName: text('business_name'),
  businessLogo: text('business_logo'),
  address: text('address'),
  taxNumber: text('tax_number'),
  currency: currencyEnum('currency').notNull().default('USD'),
  emailVerified: boolean('email_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─── Clients ───────────────────────────────────────────────────────────────────

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company'),
  phone: text('phone'),
  address: text('address'),
  taxNumber: text('tax_number'),
  notes: text('notes'),
  currency: currencyEnum('currency'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  index('clients_user_id_idx').on(t.userId),
])

// ─── Invoices ──────────────────────────────────────────────────────────────────

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'restrict' }),
  number: text('number').notNull(),            // INV-0001
  status: invoiceStatusEnum('status').notNull().default('draft'),
  issueDate: text('issue_date').notNull(),     // ISO date string
  dueDate: text('due_date').notNull(),
  currency: currencyEnum('currency').notNull().default('USD'),
  paymentTerm: paymentTermEnum('payment_term').notNull().default('net_30'),
  // Line items stored as JSONB for flexibility
  lineItems: jsonb('line_items').notNull().$type<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    taxRate?: number
    discount?: number
    total: number
  }[]>(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  taxTotal: numeric('tax_total', { precision: 12, scale: 2 }).notNull().default('0'),
  discountTotal: numeric('discount_total', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  terms: text('terms'),
  paidAt: timestamp('paid_at'),
  paidAmount: numeric('paid_amount', { precision: 12, scale: 2 }),
  viewedAt: timestamp('viewed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  index('invoices_user_id_idx').on(t.userId),
  index('invoices_client_id_idx').on(t.clientId),
  index('invoices_status_idx').on(t.status),
  index('invoices_number_user_idx').on(t.userId, t.number),
])

// ─── Payments ──────────────────────────────────────────────────────────────────

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  method: paymentMethodEnum('method').notNull().default('bank_transfer'),
  reference: text('reference'),
  notes: text('notes'),
  paidAt: timestamp('paid_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [
  index('payments_invoice_id_idx').on(t.invoiceId),
])

// ─── Invoice Number Counter ────────────────────────────────────────────────────

export const invoiceCounters = pgTable('invoice_counters', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  nextNumber: integer('next_number').notNull().default(1),
  prefix: text('prefix').notNull().default('INV'),
})

// ─── Relations ─────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  clients: many(clients),
  invoices: many(invoices),
  counter: one(invoiceCounters, {
    fields: [users.id],
    references: [invoiceCounters.userId],
  }),
}))

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.userId], references: [users.id] }),
  invoices: many(invoices),
}))

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  payments: many(payments),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}))
