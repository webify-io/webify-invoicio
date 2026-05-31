// Centralised, typed environment config.
//
// All process.env access lives here — no inline casting scattered across the codebase.
// Required variables use the non-null assertion (!); the startup check below surfaces
// missing vars immediately rather than mid-request.

import type jwt from 'jsonwebtoken'

function require(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export const env = {
  PORT:       process.env.PORT    ?? '4000',
  NODE_ENV:   process.env.NODE_ENV ?? 'development',

  // Database
  DATABASE_URL: require('DATABASE_URL'),

  // Auth
  JWT_SECRET:     require('JWT_SECRET'),
  // Cast once here — jsonwebtoken expects StringValue, not the wider `string` type
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN ?? '30d') as jwt.SignOptions['expiresIn'],

  // CORS
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
} as const
