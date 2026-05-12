import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceService } from '../services/invoices.service.js'
import { paymentService } from '../services/payments.service.js'
import type { Invoice, CreateInvoiceInput } from '../types'

export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filters: object) => [...invoiceKeys.lists(), filters] as const,
  detail: (id: string) => [...invoiceKeys.all, id] as const,
}

export function useInvoices(filters: { status?: string; clientId?: string } = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: () => invoiceService.getAll(filters).then((r: any) => r.data as Invoice[]),
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoiceService.getById(id).then((r: any) => r.data as Invoice),
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInvoiceInput) =>
      invoiceService.create(data).then((r: any) => r.data as Invoice),
    onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.lists() }),
  })
}

export function useUpdateInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CreateInvoiceInput>) =>
      invoiceService.update(id, data).then((r: any) => r.data as Invoice),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() })
      qc.invalidateQueries({ queryKey: invoiceKeys.detail(id) })
    },
  })
}

export function useSendInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => invoiceService.send(id).then((r: any) => r.data as Invoice),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.lists() }),
  })
}

export function useRecordPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { invoiceId: string; amount: number; method: string; reference?: string }) =>
      paymentService.record(data).then((r: any) => r.data),
    onSuccess: (_data: any, vars: any) => {
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() })
      qc.invalidateQueries({ queryKey: invoiceKeys.detail(vars.invoiceId) })
    },
  })
}
