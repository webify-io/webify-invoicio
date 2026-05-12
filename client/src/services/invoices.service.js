import client from '../lib/axiosClient.js'
import { INVOICE_PATHS } from './apiPaths/invoices.paths.js'

export const invoiceService = {
  getAll:  (params)     => client.get(INVOICE_PATHS.ALL, { params }),
  getById: (id)         => client.get(INVOICE_PATHS.BY_ID(id)),
  create:  (body)       => client.post(INVOICE_PATHS.ALL, body),
  update:  (id, body)   => client.patch(INVOICE_PATHS.BY_ID(id), body),
  send:    (id)         => client.post(INVOICE_PATHS.SEND(id)),
  delete:  (id)         => client.delete(INVOICE_PATHS.BY_ID(id)),
}
