// Endpoint paths for client routes
export const CLIENT_PATHS = {
  ALL:   '/api/clients',
  BY_ID: (id: string) => `/api/clients/${id}`,
} as const
