import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientService } from '../services/clients.service.js'
import type { Client, CreateClientInput } from '../types'

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  detail: (id: string) => [...clientKeys.all, id] as const,
}

export function useClients() {
  return useQuery({
    queryKey: clientKeys.lists(),
    queryFn: () => clientService.getAll().then((r: any) => r.data as Client[]),
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientService.getById(id).then((r: any) => r.data as Client),
    enabled: !!id,
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateClientInput) =>
      clientService.create(data).then((r: any) => r.data as Client),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.lists() }),
  })
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CreateClientInput>) =>
      clientService.update(id, data).then((r: any) => r.data as Client),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.lists() })
      qc.invalidateQueries({ queryKey: clientKeys.detail(id) })
    },
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.lists() }),
  })
}
