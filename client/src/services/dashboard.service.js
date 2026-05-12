import client from '../lib/axiosClient.js'
import { DASHBOARD_PATHS } from './apiPaths/dashboard.paths.js'

export const dashboardService = {
  getStats: () => client.get(DASHBOARD_PATHS.STATS),
}
