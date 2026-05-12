import { useAuthStore } from '@/store/auth'
import { Card, PageHeader, Input, Button, Select } from '@/components/ui'
import { useForm } from 'react-hook-form'
import { Building2, User, Palette, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthStore()

  return (
    <div className="p-8 max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="space-y-6">
        {/* Profile */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Profile</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full name" defaultValue={user?.name} />
            <Input label="Email" type="email" defaultValue={user?.email} disabled hint="Contact support to change email" />
          </div>
          <div className="mt-4">
            <Button size="sm">Save profile</Button>
          </div>
        </Card>

        {/* Business */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Business info</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Business name" defaultValue={user?.businessName} placeholder="Acme Studio" />
            <Input label="Tax / VAT number" placeholder="Optional" />
            <div className="col-span-2">
              <Input label="Business address" placeholder="123 Main St, City, Country" />
            </div>
            <Select
              label="Default currency"
              defaultValue="USD"
              options={['USD', 'EUR', 'GBP', 'ZAR', 'AUD', 'CAD'].map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div className="mt-4">
            <Button size="sm">Save business info</Button>
          </div>
        </Card>

        {/* Invoice defaults */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Palette size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Invoice defaults</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Default payment terms"
              defaultValue="net_30"
              options={[
                { value: 'due_on_receipt', label: 'Due on receipt' },
                { value: 'net_7', label: 'Net 7' },
                { value: 'net_15', label: 'Net 15' },
                { value: 'net_30', label: 'Net 30' },
                { value: 'net_60', label: 'Net 60' },
              ]}
            />
            <Input label="Invoice prefix" defaultValue="INV" placeholder="INV" />
            <div className="col-span-2">
              <Input label="Default notes" placeholder="Thank you for your business!" />
            </div>
          </div>
          <div className="mt-4">
            <Button size="sm">Save defaults</Button>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Security</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Current password" type="password" placeholder="••••••••" />
            <div />
            <Input label="New password" type="password" placeholder="Min. 8 characters" />
            <Input label="Confirm new password" type="password" placeholder="••••••••" />
          </div>
          <div className="mt-4">
            <Button size="sm">Change password</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
