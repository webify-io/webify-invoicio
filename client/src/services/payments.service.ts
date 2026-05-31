// Payments service — records a payment against an invoice
import client from '../lib/axiosClient'
import { PAYMENT_PATHS } from './apiPaths/payments.paths'
import type { ApiResponse, Payment, RecordPaymentInput } from '../types'

export const paymentService = {
  record: (body: RecordPaymentInput) =>
    client.post<ApiResponse<Payment>>(PAYMENT_PATHS.ALL, body),
}
