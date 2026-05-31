// React Query hooks for invoice CRUD, sending, and payment recording
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceService } from '../services/invoices.service'
import { paymentService } from '../services/payments.service'
import type { Invoice, CreateInvoiceInput, RecordPaymentInput } from '../types'

// Centralised query key factory
export const invoiceKeys = {
  all:    ['invoices'] as const,
  lists:  () => [...invoiceKeys.all, 'list'] as const,
  list:   (filters: object) => [...invoiceKeys.lists(), filters] as const,
  detail: (id: string) => [...invoiceKeys.all, id] as const,
}

export function useInvoices(filters: { status?: string; clientId?: string } = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn:  () => invoiceService.getAll(filters).then((r) => r.data),
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn:  () => invoiceService.getById(id).then((r) => r.data),
    enabled:  !!id,
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInvoiceInput) =>
      invoiceService.create(data).then((r) => r.data as Invoice),
    onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.lists() }),
  })
}

export function useUpdateInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CreateInvoiceInput>) =>
      invoiceService.update(id, data).then((r) => r.data as Invoice),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() })
      qc.invalidateQueries({ queryKey: invoiceKeys.detail(id) })
    },
  })
}

export function useSendInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => invoiceService.send(id).then((r) => r.data as Invoice),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() })
      qc.invalidateQueries({ queryKey: invoiceKeys.detail(id) })
    },
  })
}

export function useDeleteInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => invoiceService.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: invoiceKeys.lists() }),
  })
}

export function useRecordPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RecordPaymentInput) =>
      paymentService.record(data).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() })
      qc.invalidateQueries({ queryKey: invoiceKeys.detail(vars.invoiceId) })
    },
  })
}
