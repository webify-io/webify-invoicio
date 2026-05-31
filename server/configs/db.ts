// Database connection — Neon serverless + Drizzle ORM.
// DATABASE_URL is validated at startup via env.ts; this file will throw before
// any request if the variable is missing.

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../db/schema/index.js'
import { env } from './env.js'

const sql = neon(env.DATABASE_URL)
export const db = drizzle(sql, { schema })

export type DB = typeof db
