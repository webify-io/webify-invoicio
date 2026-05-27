import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service.js'
import { useAuthStore } from '../store/auth'

interface LoginInput { email: string; password: string }
interface RegisterInput { email: string; password: string; name: string; businessName?: string }

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (res: any) => {
      // axiosClient unwraps response.data, so res is the full response body: { data: { token, user } }
      const { token, user } = res.data
      setAuth(token, user) // setAuth handles localStorage.setItem internally — no need to call it twice
      navigate('/')
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: (res: any) => {
      const { token, user } = res.data
      setAuth(token, user)
      navigate('/')
    },
  })
}
