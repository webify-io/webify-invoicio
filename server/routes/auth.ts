import { Router } from 'express'
import { register, login, updateProfile, changePassword } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.patch('/profile', authMiddleware, updateProfile)
authRouter.patch('/password', authMiddleware, changePassword)

export default authRouter
