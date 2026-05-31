import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, DollarSign, Printer, Trash2 } from 'lucide-react'
import { useInvoice, useSendInvoice, useDeleteInvoice, useRecordPayment } from '@/api/invoices'
import { Button, Card, Modal, Input, Select } from '@/components/ui'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import type { CurrencyCode } from '@/types'

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: invoice, isLoading } = useInvoice(id!)
  const sendInvoice = useSendInvoice(id!)
  const deleteInvoice = useDeleteInvoice()
  const recordPayment = useRecordPayment()

  const [payModal, setPayModal] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('bank_transfer')
  const [payRef, setPayRef] = useState('')

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center text-sm text-slate-400">
        Loading invoice…
      </div>
    )
  }

  if (!invoice) return null

  async function handleSend() {
    if (!confirm('Send this invoice to the client?')) return
    await sendInvoice.mutateAsync()
  }

  async function handleDelete() {
    if (!confirm('Delete this invoice permanently?')) return
    await deleteInvoice.mutateAsync(id!)
    navigate('/invoices')
  }

  async function handlePayment() {
    await recordPayment.mutateAsync({
      invoiceId: id!,
      amount: Number(payAmount),
      method: payMethod,
      reference: payRef || undefined,
    })
    setPayModal(false)
  }

  function handlePrint() {
    window.print()
  }

  const canSend = invoice.status === 'draft'
  const canPay  = ['sent', 'viewed', 'overdue'].includes(invoice.status)

  return (
    <>
      {/* ── Screen UI (hidden on print) ──────────────────────────────────── */}
      <div className="print:hidden p-4 sm:p-8 max-w-4xl">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
          <button
            onClick={() => navigate('/invoices')}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            {canSend && (
              <Button icon={<Send size={14} />} loading={sendInvoice.isPending} onClick={handleSend}>
                Send Invoice
              </Button>
            )}
            {canPay && (
              <Button
                variant="secondary"
                icon={<DollarSign size={14} />}
                onClick={() => { setPayAmount(String(invoice.total)); setPayModal(true) }}
              >
                Record Payment
              </Button>
            )}
            <Button variant="ghost" size="sm" icon={<Printer size={14} />} onClick={handlePrint}>
              Print
            </Button>
            {invoice.status === 'draft' && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={handleDelete}
                className="text-red-400 hover:text-red-600"
              />
            )}
          </div>
        </div>

        {/* Invoice card (screen view) */}
        <InvoiceContent invoice={invoice} />
      </div>

      {/* ── Print-only: bare invoice with no chrome ───────────────────────── */}
      <div className="hidden print:block">
        <InvoiceContent invoice={invoice} />
      </div>

      {/* Record Payment Modal */}
      <Modal open={payModal} onClose={() => setPayModal(false)} title="Record Payment">
        <div className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
          />
          <Select
            label="Payment method"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            options={[
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'card', label: 'Card' },
              { value: 'cash', label: 'Cash' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input
            label="Reference (optional)"
            placeholder="Transaction ID, cheque number…"
            value={payRef}
            onChange={(e) => setPayRef(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setPayModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1" loading={recordPayment.isPending} onClick={handlePayment}>
              Record Payment
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ── Shared invoice content (screen + print) ───────────────────────────────────
function InvoiceContent({ invoice }: { invoice: ReturnType<typeof useInvoice>['data'] & object }) {
  return (
    <Card className="print:shadow-none print:border-none print:rounded-none">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 sm:mb-10">
          <div>
            <h1
              style={{ fontFamily: 'Playfair Display, serif' }}
              className="text-3xl sm:text-4xl font-bold text-brand-900"
            >
              INVOICE
            </h1>
            <p className="text-slate-400 mt-1 font-mono text-sm">{invoice.number}</p>
          </div>
          <div className="sm:text-right">
            <StatusBadge status={invoice.status} />
            <div className="mt-2 text-xs text-slate-400 space-y-0.5">
              <p>Issued: <span className="text-slate-600">{formatDate(invoice.issueDate)}</span></p>
              <p>Due: <span className="text-slate-600">{formatDate(invoice.dueDate)}</span></p>
            </div>
          </div>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">From</p>
            <p className="font-semibold text-brand-900">Your Business</p>
            <p className="text-sm text-slate-500">your@email.com</p>
          </div>
          {invoice.client && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Bill To</p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(invoice.client.name)}
                </div>
                <div>
                  <p className="font-semibold text-brand-900">{invoice.client.name}</p>
                  {invoice.client.company && <p className="text-sm text-slate-500">{invoice.client.company}</p>}
                  <p className="text-sm text-slate-500">{invoice.client.email}</p>
                  {invoice.client.address && <p className="text-sm text-slate-400 mt-1">{invoice.client.address}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Line items — scrollable on mobile */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b-2 border-brand-900">
                {['Description', 'Qty', 'Unit Price', 'Tax', 'Total'].map((h) => (
                  <th
                    key={h}
                    className={`py-2 text-xs font-semibold text-slate-600 uppercase tracking-wide ${
                      h === 'Description' ? 'text-left' : 'text-right'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoice.lineItems?.map((item, i) => (
                <tr key={i} className="group">
                  <td className="py-3 text-sm text-brand-900">{item.description}</td>
                  <td className="py-3 text-sm text-slate-500 text-right">{item.quantity}</td>
                  <td className="py-3 text-sm text-slate-500 text-right">
                    {formatCurrency(item.unitPrice, invoice.currency as CurrencyCode)}
                  </td>
                  <td className="py-3 text-sm text-slate-500 text-right">
                    {item.taxRate ? `${(item.taxRate * 100).toFixed(0)}%` : '—'}
                  </td>
                  <td className="py-3 text-sm font-medium text-brand-900 text-right">
                    {formatCurrency(item.total, invoice.currency as CurrencyCode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal, invoice.currency as CurrencyCode)}</span>
            </div>
            {Number(invoice.discountTotal) > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount</span>
                <span>−{formatCurrency(invoice.discountTotal, invoice.currency as CurrencyCode)}</span>
              </div>
            )}
            {Number(invoice.taxTotal) > 0 && (
              <div className="flex justify-between text-sm text-slate-500">
                <span>Tax</span>
                <span>{formatCurrency(invoice.taxTotal, invoice.currency as CurrencyCode)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-brand-900 border-t-2 border-brand-900 pt-2">
              <span>Total</span>
              <span style={{ fontFamily: 'Playfair Display, serif' }} className="text-xl">
                {formatCurrency(invoice.total, invoice.currency as CurrencyCode)}
              </span>
            </div>
            {invoice.status === 'paid' && invoice.paidAt && (
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Paid on {formatDate(invoice.paidAt.toString().slice(0, 10))}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {(invoice.notes || invoice.terms) && (
          <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {invoice.notes && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                <p className="text-sm text-slate-600">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Payment Terms</p>
                <p className="text-sm text-slate-600">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
