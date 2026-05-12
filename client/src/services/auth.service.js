import client from '../lib/axiosClient.js'
import { AUTH_PATHS } from './apiPaths/auth.paths.js'

export const authService = {
  login:    (body) => client.post(AUTH_PATHS.LOGIN, body),
  register: (body) => client.post(AUTH_PATHS.REGISTER, body),
  me:       ()     => client.get(AUTH_PATHS.ME),
}
