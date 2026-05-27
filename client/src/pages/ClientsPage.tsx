import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users } from 'lucide-react'
import { useClients, useCreateClient } from '@/api/clients'
import { Button, Card, PageHeader, EmptyState, Modal, Input } from '@/components/ui'
import { getInitials, formatCurrency } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function ClientsPage() {
  const navigate = useNavigate()
  const { data: clients = [], isLoading } = useClients()
  const createClient = useCreateClient()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const filtered = clients.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q)
  })

  async function onSubmit(data: FormData) {
    await createClient.mutateAsync(data)
    reset()
    setModal(false)
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} total`}
        action={
          <Button icon={<Plus size={16} />} onClick={() => setModal(true)}>
            Add Client
          </Button>
        }
      />

      <Card>
        <div className="px-5 py-4 border-b border-gray-50">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a]/10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading clients…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={20} />}
            title="No clients yet"
            description="Add your first client to start creating invoices"
            action={
              <Button icon={<Plus size={14} />} onClick={() => setModal(true)}>
                Add Client
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((client) => (
              <button
                key={client.id}
                onClick={() => navigate(`/clients/${client.id}`)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-[#0f172a] flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {getInitials(client.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0f172a]">{client.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {client.company ? `${client.company} · ` : ''}{client.email}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {client.invoiceCount !== undefined && (
                    <p className="text-xs text-slate-400">{client.invoiceCount} invoice{client.invoiceCount !== 1 ? 's' : ''}</p>
                  )}
                  {client.totalBilled !== undefined && client.totalBilled > 0 && (
                    <p className="text-sm font-semibold text-[#0f172a]">{formatCurrency(client.totalBilled)}</p>
                  )}
                </div>
                <span className="text-slate-300 group-hover:text-slate-400 text-lg">›</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Client">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full name" placeholder="Jane Smith" error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" placeholder="jane@acme.com" error={errors.email?.message} {...register('email')} />
            <Input label="Company (optional)" placeholder="Acme Inc." {...register('company')} />
            <Input label="Phone (optional)" placeholder="+1 555 000 0000" {...register('phone')} />
            <div className="col-span-2">
              <Input label="Address (optional)" placeholder="123 Main St, City, Country" {...register('address')} />
            </div>
          </div>
          {createClient.error && (
            <p className="text-sm text-red-500">{(createClient.error as any)?.message ?? 'Failed to create client'}</p>
          )}
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" type="button" className="flex-1" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={createClient.isPending} className="flex-1">Add Client</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
