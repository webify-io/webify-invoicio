// Auth service — login, register, and current-user fetch.
// Returns ApiResponse<AuthResponse> — the server wraps all payloads in { data: ... }.
import client from '../lib/axiosClient'
import { AUTH_PATHS } from './apiPaths/auth.paths'
import type { ApiResponse, LoginInput, RegisterInput, User } from '../types'

export interface AuthResponse { token: string; user: User }

export const authService = {
  login:    (body: LoginInput)    => client.post<ApiResponse<AuthResponse>>(AUTH_PATHS.LOGIN, body),
  register: (body: RegisterInput) => client.post<ApiResponse<AuthResponse>>(AUTH_PATHS.REGISTER, body),
  me:       ()                    => client.get<ApiResponse<User>>(AUTH_PATHS.ME),
}
