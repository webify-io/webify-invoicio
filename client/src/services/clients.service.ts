// Clients service — CRUD for /api/clients
import client from '../lib/axiosClient'
import { CLIENT_PATHS } from './apiPaths/clients.paths'
import type { ApiResponse, Client, CreateClientInput } from '../types'

export const clientService = {
  getAll:  ()                                          => client.get<ApiResponse<Client[]>>(CLIENT_PATHS.ALL),
  getById: (id: string)                                => client.get<ApiResponse<Client>>(CLIENT_PATHS.BY_ID(id)),
  create:  (body: CreateClientInput)                   => client.post<ApiResponse<Client>>(CLIENT_PATHS.ALL, body),
  update:  (id: string, body: Partial<CreateClientInput>) => client.patch<ApiResponse<Client>>(CLIENT_PATHS.BY_ID(id), body),
  delete:  (id: string)                                => client.delete<void>(CLIENT_PATHS.BY_ID(id)),
}
