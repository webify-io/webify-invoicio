// React Query hook for dashboard stats
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => dashboardService.getStats().then((r) => r.data),
  })
}
