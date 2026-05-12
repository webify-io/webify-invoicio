import { Router } from 'express'
import { recordPayment } from '../controllers/paymentsController.js'

const paymentsRouter = Router()

paymentsRouter.post('/', recordPayment)

export default paymentsRouter
