// Dashboard service — fetches aggregated stats
import client from '../lib/axiosClient'
import { DASHBOARD_PATHS } from './apiPaths/dashboard.paths'
import type { ApiResponse, DashboardStats } from '../types'

export const dashboardService = {
  getStats: () => client.get<ApiResponse<DashboardStats>>(DASHBOARD_PATHS.STATS),
}
