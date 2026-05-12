import client from '../lib/axiosClient.js'
import { PAYMENT_PATHS } from './apiPaths/payments.paths.js'

export const paymentService = {
  record: (body) => client.post(PAYMENT_PATHS.ALL, body),
}
