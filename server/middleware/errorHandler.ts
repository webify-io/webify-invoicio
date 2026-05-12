import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export interface AppError extends Error {
  statusCode?: number
  code?: string
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
    return
  }

  const statusCode = err.statusCode ?? 500
  const message = statusCode === 500 ? 'Internal server error' : err.message

  if (statusCode === 500) {
    console.error('[Error]', err)
  }

  res.status(statusCode).json({ message, code: err.code })
}

// Helper to create typed errors
export function createError(message: string, statusCode = 500, code?: string): AppError {
  const err: AppError = new Error(message)
  err.statusCode = statusCode
  err.code = code
  return err
}
