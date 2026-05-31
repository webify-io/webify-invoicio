// Auth mutation hooks.
// setAuth() in the store handles localStorage.setItem internally —
// no need to call it separately here (was a bug: it was being set twice).
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/auth'
import type { LoginInput, RegisterInput } from '../types'

export function useLogin() {
  const setAuth  = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (res) => {
      // res is ApiResponse<AuthResponse> — server wraps payload in { data: ... }
      setAuth(res.data.token, res.data.user)
      navigate('/')
    },
  })
}

export function useRegister() {
  const setAuth  = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: (res) => {
      setAuth(res.data.token, res.data.user)
      navigate('/')
    },
  })
}
