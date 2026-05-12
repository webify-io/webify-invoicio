import { Router } from 'express'
import { getDashboard } from '../controllers/dashboardController.js'

const dashboardRouter = Router()

dashboardRouter.get('/', getDashboard)

export default dashboardRouter
