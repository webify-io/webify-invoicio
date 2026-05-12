import { Router } from 'express'
import {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  sendInvoice,
  deleteInvoice,
} from '../controllers/invoicesController.js'

const invoicesRouter = Router()

invoicesRouter.get('/',         listInvoices)
invoicesRouter.get('/:id',      getInvoice)
invoicesRouter.post('/',        createInvoice)
invoicesRouter.patch('/:id',    updateInvoice)
invoicesRouter.post('/:id/send', sendInvoice)
invoicesRouter.delete('/:id',   deleteInvoice)

export default invoicesRouter
