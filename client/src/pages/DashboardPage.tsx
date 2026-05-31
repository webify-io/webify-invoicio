import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp, Clock, AlertTriangle, FileText } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useDashboard } from '@/api/dashboard'
import { useInvoices } from '@/api/invoices'
import { Button, Card, StatCard, PageHeader } from '@/components/ui'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'

import type { CurrencyCode } from '@/types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: stats, isLoading } = useDashboard()
  const { data: invoices } = useInvoices()

  const recentInvoices = invoices?.slice(0, 5) ?? []
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const userCurrency = (user?.currency ?? 'ZAR') as CurrencyCode

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold text-brand-900">
            {greeting}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening with your invoices</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => navigate('/invoices/new')}>
          New Invoice
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={isLoading ? '—' : formatCurrency(stats?.totalRevenue ?? 0, userCurrency)}
          sub={`${stats?.paidCount ?? 0} paid invoices`}
          accent
        />
        <StatCard
          label="Outstanding"
          value={isLoading ? '—' : formatCurrency(stats?.outstandingAmount ?? 0, userCurrency)}
          sub="Awaiting payment"
        />
        <StatCard
          label="Overdue"
          value={isLoading ? '—' : formatCurrency(stats?.overdueAmount ?? 0, userCurrency)}
          sub={`${stats?.overdueCount ?? 0} invoices`}
        />
        <StatCard
          label="Drafts"
          value={isLoading ? '—' : String(stats?.draftCount ?? 0)}
          sub="Not yet sent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-amber-500" />
            Revenue over time
          </h2>
          {stats?.revenueByMonth && stats.revenueByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.revenueByMonth} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v, userCurrency)}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2}
                  fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm text-slate-400">No revenue data yet. Send your first invoice!</p>
            </div>
          )}
        </Card>

        {/* Quick actions */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Quick actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Create invoice', icon: <FileText size={15} />, to: '/invoices/new', accent: true },
              { label: 'Add client', icon: <Plus size={15} />, to: '/clients' },
              { label: 'View overdue', icon: <AlertTriangle size={15} />, to: '/invoices?status=overdue' },
              { label: 'Pending invoices', icon: <Clock size={15} />, to: '/invoices?status=sent' },
            ].map(({ label, icon, to, accent }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  accent
                    ? 'bg-brand-900 text-white hover:bg-brand-800'
                    : 'text-slate-600 hover:bg-slate-50 border border-gray-100'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent invoices */}
      {recentInvoices.length > 0 && (
        <Card className="mt-6">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Recent Invoices</h2>
            <button onClick={() => navigate('/invoices')} className="text-xs text-slate-400 hover:text-brand-900 transition-colors">
              View all →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentInvoices.map((inv) => (
              <button
                key={inv.id}
                onClick={() => navigate(`/invoices/${inv.id}`)}
                className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                  {inv.number?.slice(-2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-900 truncate">
                    {inv.client?.name ?? 'Unknown client'}
                  </p>
                  <p className="text-xs text-slate-400">{inv.number} · Due {formatDate(inv.dueDate)}</p>
                </div>
                <StatusBadge status={inv.status} />
                <span className="text-sm font-semibold text-brand-900 ml-2">
                  {formatCurrency(inv.total, inv.currency)}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
