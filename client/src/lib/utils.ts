import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isPast } from 'date-fns'
import type { CurrencyCode, InvoiceStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  ZAR: 'en-ZA',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  AUD: 'en-AU',
  CAD: 'en-CA',
}

export function formatCurrency(amount: number | string, currency: CurrencyCode = 'ZAR'): string {
  const locale = CURRENCY_LOCALE[currency] ?? 'en-ZA'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount))
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'dd MMM yyyy')
}

export function formatDateShort(date: string): string {
  return format(parseISO(date), 'MMM d')
}

export function isOverdue(dueDate: string, status: InvoiceStatus): boolean {
  return status !== 'paid' && status !== 'cancelled' && isPast(parseISO(dueDate))
}

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
}

export const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-violet-100 text-violet-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-600',
  cancelled: 'bg-gray-100 text-gray-400',
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function pluralize(count: number, word: string): string {
  return `${count} ${word}${count !== 1 ? 's' : ''}`
}
