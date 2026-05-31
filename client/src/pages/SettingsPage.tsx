import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { Card, PageHeader, Input, Button, Select } from '@/components/ui'
import { useForm } from 'react-hook-form'
import { Building2, User, Palette, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import {
  useUpdateProfile,
  useUpdateBusiness,
  useUpdateInvoiceDefaults,
  useUpdatePassword,
} from '@/api/settings'
import type { CurrencyCode, PaymentTerm } from '@/types'

// ── Inline feedback banner ────────────────────────────────────────────────────
function Feedback({ ok, msg }: { ok: boolean; msg: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs mt-3 ${ok ? 'text-emerald-600' : 'text-red-500'}`}>
      {ok ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
      {msg}
    </div>
  )
}

// ── Profile section ───────────────────────────────────────────────────────────
function ProfileSection() {
  const { user } = useAuthStore()
  const update   = useUpdateProfile()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name ?? '' },
  })

  async function onSubmit(values: { name: string }) {
    setFeedback(null)
    try {
      await update.mutateAsync({ name: values.name })
      setFeedback({ ok: true, msg: 'Profile updated successfully.' })
    } catch (e: unknown) {
      const err = e as { message?: string }
      setFeedback({ ok: false, msg: err?.message ?? 'Failed to save profile.' })
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <User size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-700">Profile</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full name" {...register('name', { required: true })} />
          <Input label="Email" type="email" defaultValue={user?.email} disabled hint="Contact support to change email" />
        </div>
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <Button size="sm" type="submit" loading={update.isPending}>Save profile</Button>
          {feedback && <Feedback {...feedback} />}
        </div>
      </form>
    </Card>
  )
}

// ── Business section ──────────────────────────────────────────────────────────
function BusinessSection() {
  const { user }   = useAuthStore()
  const update     = useUpdateBusiness()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      businessName: user?.businessName ?? '',
      taxNumber:    user?.taxNumber ?? '',
      address:      user?.address ?? '',
      currency:     (user?.currency ?? 'ZAR') as CurrencyCode,
    },
  })

  async function onSubmit(values: {
    businessName?: string
    taxNumber?: string
    address?: string
    currency: CurrencyCode
  }) {
    setFeedback(null)
    try {
      await update.mutateAsync(values)
      setFeedback({ ok: true, msg: 'Business info saved.' })
    } catch (e: unknown) {
      const err = e as { message?: string }
      setFeedback({ ok: false, msg: err?.message ?? 'Failed to save business info.' })
    }
  }

  const currencies: CurrencyCode[] = ['ZAR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD']

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <Building2 size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-700">Business info</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Business name" {...register('businessName')} placeholder="Acme Studio" />
          <Input label="Tax / VAT number" {...register('taxNumber')} placeholder="Optional" />
          <div className="col-span-1 sm:col-span-2">
            <Input label="Business address" {...register('address')} placeholder="123 Main St, City, Country" />
          </div>
          <Select
            label="Default currency"
            value={watch('currency')}
            onChange={(e) => setValue('currency', e.target.value as CurrencyCode)}
            options={currencies.map((c) => ({ value: c, label: c }))}
          />
        </div>
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <Button size="sm" type="submit" loading={update.isPending}>Save business info</Button>
          {feedback && <Feedback {...feedback} />}
        </div>
      </form>
    </Card>
  )
}

// ── Invoice defaults section ──────────────────────────────────────────────────
function InvoiceDefaultsSection() {
  const { user }   = useAuthStore()
  const update     = useUpdateInvoiceDefaults()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      defaultPaymentTerm: (user?.defaultPaymentTerm ?? 'net_30') as PaymentTerm,
      invoicePrefix:      user?.invoicePrefix ?? 'INV',
      defaultNotes:       user?.defaultNotes ?? '',
    },
  })

  async function onSubmit(values: {
    defaultPaymentTerm: PaymentTerm
    invoicePrefix: string
    defaultNotes: string
  }) {
    setFeedback(null)
    try {
      await update.mutateAsync(values)
      setFeedback({ ok: true, msg: 'Invoice defaults saved.' })
    } catch (e: unknown) {
      const err = e as { message?: string }
      setFeedback({ ok: false, msg: err?.message ?? 'Failed to save defaults.' })
    }
  }

  const termOptions = [
    { value: 'due_on_receipt', label: 'Due on receipt' },
    { value: 'net_7',  label: 'Net 7' },
    { value: 'net_15', label: 'Net 15' },
    { value: 'net_30', label: 'Net 30' },
    { value: 'net_60', label: 'Net 60' },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <Palette size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-700">Invoice defaults</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Default payment terms"
            value={watch('defaultPaymentTerm')}
            onChange={(e) => setValue('defaultPaymentTerm', e.target.value as PaymentTerm)}
            options={termOptions}
          />
          <Input label="Invoice prefix" {...register('invoicePrefix')} placeholder="INV" />
          <div className="col-span-1 sm:col-span-2">
            <Input label="Default notes" {...register('defaultNotes')} placeholder="Thank you for your business!" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <Button size="sm" type="submit" loading={update.isPending}>Save defaults</Button>
          {feedback && <Feedback {...feedback} />}
        </div>
      </form>
    </Card>
  )
}

// ── Security section ──────────────────────────────────────────────────────────
function SecuritySection() {
  const update  = useUpdatePassword()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(values: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) {
    setFeedback(null)
    if (values.newPassword !== values.confirmPassword) {
      setFeedback({ ok: false, msg: 'Passwords do not match.' })
      return
    }
    if (values.newPassword.length < 8) {
      setFeedback({ ok: false, msg: 'New password must be at least 8 characters.' })
      return
    }
    try {
      await update.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword:     values.newPassword,
      })
      setFeedback({ ok: true, msg: 'Password changed successfully.' })
      reset()
    } catch (e: unknown) {
      const err = e as { message?: string }
      setFeedback({ ok: false, msg: err?.message ?? 'Failed to change password.' })
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <Shield size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-700">Security</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Current password" type="password" placeholder="••••••••" {...register('currentPassword', { required: true })} />
          <div className="hidden sm:block" />
          <Input label="New password" type="password" placeholder="Min. 8 characters" {...register('newPassword', { required: true })} />
          <Input label="Confirm new password" type="password" placeholder="••••••••" {...register('confirmPassword', { required: true })} />
        </div>
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <Button size="sm" type="submit" loading={update.isPending}>Change password</Button>
          {feedback && <Feedback {...feedback} />}
        </div>
      </form>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />
      <div className="space-y-6">
        <ProfileSection />
        <BusinessSection />
        <InvoiceDefaultsSection />
        <SecuritySection />
      </div>
    </div>
  )
}
