import { cn, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import type { InvoiceStatus } from '@/types'

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      STATUS_COLORS[status],
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status]}
    </span>
  )
}
