import client from '../lib/axiosClient.js'
import { CLIENT_PATHS } from './apiPaths/clients.paths.js'

export const clientService = {
  getAll:  ()           => client.get(CLIENT_PATHS.ALL),
  getById: (id)         => client.get(CLIENT_PATHS.BY_ID(id)),
  create:  (body)       => client.post(CLIENT_PATHS.ALL, body),
  update:  (id, body)   => client.patch(CLIENT_PATHS.BY_ID(id), body),
  delete:  (id)         => client.delete(CLIENT_PATHS.BY_ID(id)),
}
