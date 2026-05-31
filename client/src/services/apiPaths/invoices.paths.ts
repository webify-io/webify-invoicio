// Endpoint paths for invoice routes
export const INVOICE_PATHS = {
  ALL:   '/api/invoices',
  BY_ID: (id: string) => `/api/invoices/${id}`,
  SEND:  (id: string) => `/api/invoices/${id}/send`,
} as const
