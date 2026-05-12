import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { db } from '../configs/db.js'
import { users, invoiceCounters } from '../db/schema/index.js'
import { createError } from '../middleware/errorHandler.js'

// ─── Private Helpers ──────────────────────────────────────────────────────────

const scryptAsync = promisify(scrypt)

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const hash = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${hash.toString('hex')}`
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':')
  const hashBuffer = Buffer.from(hash, 'hex')
  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  return timingSafeEqual(hashBuffer, derived)
}

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: '30d' })
}

// ─── Validation Schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  businessName: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = registerSchema.parse(req.body)
    const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) })
    if (existing) throw createError('Email already in use', 409, 'EMAIL_EXISTS')

    const passwordHash = await hashPassword(input.password)
    const [user] = await db
      .insert(users)
      .values({ email: input.email, name: input.name, passwordHash, businessName: input.businessName })
      .returning()

    await db.insert(invoiceCounters).values({ userId: user.id })

    const token = signToken(user.id)
    res.status(201).json({ data: { token, user: { id: user.id, email: user.email, name: user.name } } })
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = loginSchema.parse(req.body)
    const user = await db.query.users.findFirst({ where: eq(users.email, input.email) })
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    const token = signToken(user.id)
    res.json({
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, businessName: user.businessName },
      },
    })
  } catch (err) {
    next(err)
  }
}
