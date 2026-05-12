import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, ArrowLeft, ChevronDown } from 'lucide-react'
import { useCreateInvoice } from '@/api/invoices'
import { useClients } from '@/api/clients'
import { Button, Input, Textarea, Select, Card, PageHeader } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import type { CurrencyCode } from '@/types'

const lineItemSchema = z.object({
  description: z.string().min(1, 'Required'),
  quantity: z.coerce.number().positive('Must be > 0'),
  unitPrice: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
})

const schema = z.object({
  clientId: z.string().uuid('Select a client'),
  issueDate: z.string().min(1, 'Required'),
  dueDate: z.string().min(1, 'Required'),
  paymentTerm: z.enum(['due_on_receipt', 'net_7', 'net_15', 'net_30', 'net_60', 'custom']),
  currency: z.enum(['USD', 'EUR', 'GBP', 'ZAR', 'AUD', 'CAD']),
  lineItems: z.array(lineItemSchema).min(1, 'Add at least one line item'),
  notes: z.string().optional(),
  terms: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const today = new Date().toISOString().slice(0, 10)
const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)

function calcLine(item: { quantity: number | string; unitPrice: number | string; taxRate?: number | string; discount?: number | string }) {
  const qty = Number(item.quantity) || 0
  const price = Number(item.unitPrice) || 0
  const disc = Number(item.discount) || 0
  const tax = Number(item.taxRate) || 0
  const base = qty * price
  const afterDisc = base * (1 - disc / 100)
  return afterDisc * (1 + tax / 100)
}

export default function NewInvoicePage() {
  const navigate = useNavigate()
  const createInvoice = useCreateInvoice()
  const { data: clients = [] } = useClients()
  const [watchItems, setWatchItems] = useState<FormData['lineItems']>([])

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      issueDate: today,
      dueDate: in30,
      paymentTerm: 'net_30',
      currency: 'USD',
      lineItems: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'lineItems' })
  const watchedItems = form.watch('lineItems')
  const currency = form.watch('currency') as CurrencyCode
  const subtotal = watchedItems.reduce((s, i) => s + calcLine(i), 0)

  async function onSubmit(data: FormData) {
    const payload = {
      ...data,
      lineItems: data.lineItems.map((item) => ({
        ...item,
        taxRate: (item.taxRate ?? 0) / 100,
      })),
    }
    const inv = await createInvoice.mutateAsync(payload)
    navigate(`/invoices/${inv.id}`)
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <button onClick={() => navigate('/invoices')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-4">
          <ArrowLeft size={14} /> Back to invoices
        </button>
        <PageHeader title="New Invoice" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Client & dates */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Invoice details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Select
                label="Client"
                error={form.formState.errors.clientId?.message}
                options={[
                  { value: '', label: 'Select a client…' },
                  ...clients.map((c) => ({ value: c.id, label: c.company ? `${c.name} (${c.company})` : c.name })),
                ]}
                {...form.register('clientId')}
              />
              {clients.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No clients yet —{' '}
                  <button type="button" className="underline" onClick={() => navigate('/clients')}>add one first</button>
                </p>
              )}
            </div>
            <Input label="Issue date" type="date" error={form.formState.errors.issueDate?.message} {...form.register('issueDate')} />
            <Input label="Due date" type="date" error={form.formState.errors.dueDate?.message} {...form.register('dueDate')} />
            <Select
              label="Payment terms"
              options={[
                { value: 'due_on_receipt', label: 'Due on receipt' },
                { value: 'net_7', label: 'Net 7' },
                { value: 'net_15', label: 'Net 15' },
                { value: 'net_30', label: 'Net 30' },
                { value: 'net_60', label: 'Net 60' },
                { value: 'custom', label: 'Custom' },
              ]}
              {...form.register('paymentTerm')}
            />
            <Select
              label="Currency"
              options={['USD', 'EUR', 'GBP', 'ZAR', 'AUD', 'CAD'].map((c) => ({ value: c, label: c }))}
              {...form.register('currency')}
            />
          </div>
        </Card>

        {/* Line items */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Line Items</h2>
          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide px-1">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-1">Tax %</div>
              <div className="col-span-1">Disc %</div>
              <div className="col-span-1" />
            </div>

            {fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-5">
                  <Input
                    placeholder="Service description…"
                    error={form.formState.errors.lineItems?.[i]?.description?.message}
                    {...form.register(`lineItems.${i}.description`)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number" step="0.01" min="0" placeholder="1"
                    {...form.register(`lineItems.${i}.quantity`)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number" step="0.01" min="0" placeholder="0.00"
                    {...form.register(`lineItems.${i}.unitPrice`)}
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    type="number" step="0.1" min="0" max="100" placeholder="0"
                    {...form.register(`lineItems.${i}.taxRate`)}
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    type="number" step="0.1" min="0" max="100" placeholder="0"
                    {...form.register(`lineItems.${i}.discount`)}
                  />
                </div>
                <div className="col-span-1 pt-1 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    {formatCurrency(calcLine(watchedItems[i] ?? {}), currency)}
                  </span>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(i)} className="text-slate-300 hover:text-red-400 transition-colors ml-1">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 })}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f172a] transition-colors mt-2"
            >
              <Plus size={14} /> Add line item
            </button>
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#0f172a] border-t border-gray-100 pt-2">
                <span>Total</span>
                <span style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg">
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes & Terms */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Additional info</h2>
          <div className="grid grid-cols-2 gap-4">
            <Textarea label="Notes" placeholder="Thank you for your business…" rows={3} {...form.register('notes')} />
            <Textarea label="Payment terms" placeholder="Payment is due within 30 days…" rows={3} {...form.register('terms')} />
          </div>
        </Card>

        {createInvoice.error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            {(createInvoice.error as any)?.response?.data?.message ?? 'Failed to create invoice'}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" type="button" onClick={() => navigate('/invoices')}>
            Cancel
          </Button>
          <Button type="submit" loading={createInvoice.isPending}>
            Create Invoice
          </Button>
        </div>
      </form>
    </div>
  )
}
