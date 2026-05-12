import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service.js'
import type { DashboardStats } from '../types'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getStats().then((r: any) => r.data as DashboardStats),
  })
}
