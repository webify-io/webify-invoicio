// Auth controller — register and login handlers.
// Uses scrypt (Node built-in) for password hashing — no bcrypt dependency needed.
// JWT is signed with the typed env.JWT_EXPIRES_IN to avoid the string→StringValue TS error.

import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { db } from '../configs/db.js'
import { env } from '../configs/env.js'
import { users, invoiceCounters } from '../db/schema/index.js'
import { createError } from '../middleware/errorHandler.js'

// ── Private helpers ───────────────────────────────────────────────────────────

const scryptAsync = promisify(scrypt)

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const hash = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${hash.toString('hex')}`
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':')
  const hashBuffer   = Buffer.from(hash, 'hex')
  const derived      = (await scryptAsync(password, salt, 64)) as Buffer
  return timingSafeEqual(hashBuffer, derived)
}

// JWT_EXPIRES_IN is already typed as SignOptions['expiresIn'] in env.ts — no cast needed here
function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })
}

// ── Validation schemas ────────────────────────────────────────────────────────

const registerSchema = z.object({
  email:        z.string().email(),
  password:     z.string().min(8),
  name:         z.string().min(1),
  businessName: z.string().optional(),
})

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
})

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input    = registerSchema.parse(req.body)
    const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) })

    if (existing) throw createError('Email already in use', 409, 'EMAIL_EXISTS')

    const passwordHash = await hashPassword(input.password)
    const [user]       = await db
      .insert(users)
      .values({ email: input.email, name: input.name, passwordHash, businessName: input.businessName })
      .returning()

    // Initialise invoice counter for the new user
    await db.insert(invoiceCounters).values({ userId: user.id })

    const token = signToken(user.id)
    res.status(201).json({
      data: { token, user: { id: user.id, email: user.email, name: user.name } },
    })
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = loginSchema.parse(req.body)
    const user  = await db.query.users.findFirst({ where: eq(users.email, input.email) })

    // Deliberately vague message — don't reveal whether email exists
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
