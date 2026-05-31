// Settings mutation hooks — profile, business info, invoice defaults, password.
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth'
import client from '../lib/axiosClient'
import { AUTH_PATHS } from '../services/apiPaths/auth.paths'
import type { ApiResponse, AuthUser, CurrencyCode, PaymentTerm } from '../types'

export interface UpdateProfileInput {
  name: string
}

export interface UpdateBusinessInput {
  businessName?: string
  address?: string
  taxNumber?: string
  currency: CurrencyCode
}

export interface UpdateInvoiceDefaultsInput {
  defaultPaymentTerm?: PaymentTerm
  invoicePrefix?: string
  defaultNotes?: string
}

export interface UpdatePasswordInput {
  currentPassword: string
  newPassword: string
}

export function useUpdateProfile() {
  const setAuth  = useAuthStore((s) => s.setAuth)
  const token    = useAuthStore((s) => s.token)
  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      client.patch<ApiResponse<AuthUser>>(AUTH_PATHS.UPDATE_PROFILE, data),
    onSuccess: (res) => {
      if (token) setAuth(token, res.data)
    },
  })
}

export function useUpdateBusiness() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const token   = useAuthStore((s) => s.token)
  return useMutation({
    mutationFn: (data: UpdateBusinessInput) =>
      client.patch<ApiResponse<AuthUser>>(AUTH_PATHS.UPDATE_PROFILE, data),
    onSuccess: (res) => {
      if (token) setAuth(token, res.data)
    },
  })
}

export function useUpdateInvoiceDefaults() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const token   = useAuthStore((s) => s.token)
  return useMutation({
    mutationFn: (data: UpdateInvoiceDefaultsInput) =>
      client.patch<ApiResponse<AuthUser>>(AUTH_PATHS.UPDATE_PROFILE, data),
    onSuccess: (res) => {
      if (token) setAuth(token, res.data)
    },
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordInput) =>
      client.patch<ApiResponse<{ message: string }>>(AUTH_PATHS.UPDATE_PASSWORD, data),
  })
}
