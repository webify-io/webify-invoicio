import { Router } from 'express'
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientsController.js'

const clientsRouter = Router()

clientsRouter.get('/',    listClients)
clientsRouter.get('/:id', getClient)
clientsRouter.post('/',   createClient)
clientsRouter.patch('/:id', updateClient)
clientsRouter.delete('/:id', deleteClient)

export default clientsRouter
