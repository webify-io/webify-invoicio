import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, FileText, Plus, Trash2, Mail, Phone, Building2 } from 'lucide-react'
import { useClient, useUpdateClient, useDeleteClient } from '@/api/clients'
import { useInvoices } from '@/api/invoices'
import { Button, Card, Modal, Input, EmptyState } from '@/components/ui'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CurrencyCode, InvoiceStatus } from '@/types'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading } = useClient(id!)
  const { data: allInvoices = [] } = useInvoices({ clientId: id })
  const updateClient = useUpdateClient(id!)
  const deleteClient = useDeleteClient()
  const [editModal, setEditModal] = useState(false)

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  function openEdit() {
    if (!client) return
    form.reset({ name: client.name, email: client.email, company: client.company, phone: client.phone, address: client.address })
    setEditModal(true)
  }

  async function onEdit(data: FormData) {
    await updateClient.mutateAsync(data)
    setEditModal(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this client? Their invoices will be preserved.')) return
    await deleteClient.mutateAsync(id!)
    navigate('/clients')
  }

  if (isLoading) return <div className="p-8 text-sm text-slate-400">Loading…</div>
  if (!client) return null

  const totalBilled = allInvoices.reduce((s, i) => s + Number(i.total), 0)
  const totalPaid = allInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)

  return (
    <div className="p-8 max-w-4xl">
      <button onClick={() => navigate('/clients')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6">
        <ArrowLeft size={14} /> Back to clients
      </button>

      {/* Client header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0f172a] flex items-center justify-center text-white text-lg font-bold">
              {getInitials(client.name)}
            </div>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold text-[#0f172a]">
                {client.name}
              </h1>
              <div className="flex items-center gap-4 mt-1">
                {client.company && (
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <Building2 size={12} /> {client.company}
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <Mail size={12} /> {client.email}
                </span>
                {client.phone && (
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <Phone size={12} /> {client.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<Edit size={13} />} onClick={openEdit}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus size={13} />}
              onClick={() => navigate(`/invoices/new?clientId=${client.id}`)}
            >
              New Invoice
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-400 hover:text-red-600">
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
          {[
            { label: 'Total billed', value: formatCurrency(totalBilled) },
            { label: 'Total paid', value: formatCurrency(totalPaid) },
            { label: 'Invoices', value: String(allInvoices.length) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
              <p className="text-lg font-bold text-[#0f172a] mt-0.5" style={{ fontFamily: 'Playfair Display, serif' }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Invoices */}
      <Card>
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Invoices</h2>
          <Button size="sm" variant="ghost" icon={<Plus size={13} />} onClick={() => navigate(`/invoices/new`)}>
            New
          </Button>
        </div>
        {allInvoices.length === 0 ? (
          <EmptyState
            icon={<FileText size={18} />}
            title="No invoices for this client"
            action={
              <Button size="sm" icon={<Plus size={13} />} onClick={() => navigate('/invoices/new')}>
                Create Invoice
              </Button>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {['#', 'Date', 'Due', 'Status', 'Amount'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-gray-50/60 cursor-pointer transition-colors"
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                >
                  <td className="px-5 py-3 text-sm font-mono text-slate-600">{inv.number}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{formatDate(inv.issueDate)}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{formatDate(inv.dueDate)}</td>
                  <td className="px-5 py-3"><StatusBadge status={inv.status as InvoiceStatus} /></td>
                  <td className="px-5 py-3 text-sm font-semibold text-[#0f172a]">
                    {formatCurrency(inv.total, inv.currency as CurrencyCode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title={`Edit ${client.name}`}>
        <form onSubmit={form.handleSubmit(onEdit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" error={form.formState.errors.name?.message} {...form.register('name')} />
            <Input label="Email" type="email" error={form.formState.errors.email?.message} {...form.register('email')} />
            <Input label="Company" {...form.register('company')} />
            <Input label="Phone" {...form.register('phone')} />
            <div className="col-span-2">
              <Input label="Address" {...form.register('address')} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" type="button" className="flex-1" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button type="submit" loading={updateClient.isPending} className="flex-1">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
