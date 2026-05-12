export const INVOICE_PATHS = {
  ALL:         '/api/invoices',
  BY_ID:       (id) => `/api/invoices/${id}`,
  SEND:        (id) => `/api/invoices/${id}/send`,
}
