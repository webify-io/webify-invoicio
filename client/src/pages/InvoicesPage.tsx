import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, FileText, Filter } from 'lucide-react'
import { useInvoices, useDeleteInvoice } from '@/api/invoices'
import { Button, Card, PageHeader, EmptyState } from '@/components/ui'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { InvoiceStatus } from '@/types'

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
]

export default function InvoicesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') ?? ''
  const [search, setSearch] = useState('')

  const { data: invoices = [], isLoading } = useInvoices(status ? { status } : {})
  const deleteInvoice = useDeleteInvoice()

  const filtered = invoices.filter((inv) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      inv.number?.toLowerCase().includes(q) ||
      inv.client?.name?.toLowerCase().includes(q) ||
      inv.client?.company?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-8">
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} total`}
        action={
          <Button icon={<Plus size={16} />} onClick={() => navigate('/invoices/new')}>
            New Invoice
          </Button>
        }
      />

      <Card>
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-50 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices or clients…"
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-900/10 focus:border-brand-900/30"
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setSearchParams(f.value ? { status: f.value } : {})}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  status === f.value
                    ? 'bg-white text-brand-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading invoices…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText size={20} />}
            title="No invoices found"
            description={search ? 'Try a different search term' : 'Create your first invoice to get started'}
            action={
              !search && (
                <Button icon={<Plus size={14} />} onClick={() => navigate('/invoices/new')}>
                  Create Invoice
                </Button>
              )
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {['Invoice', 'Client', 'Issue Date', 'Due Date', 'Status', 'Amount', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-gray-50/60 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-mono font-medium text-brand-900">{inv.number}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-brand-900">{inv.client?.name}</p>
                    {inv.client?.company && (
                      <p className="text-xs text-slate-400">{inv.client.company}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{formatDate(inv.issueDate)}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{formatDate(inv.dueDate)}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={inv.status as InvoiceStatus} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-brand-900">
                      {formatCurrency(inv.total, inv.currency)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Delete this invoice?')) deleteInvoice.mutate(inv.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition-all"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
