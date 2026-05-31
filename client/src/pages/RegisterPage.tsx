import type { ApiError } from '../types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useRegister } from '@/api/auth'
import { Button, Input } from '@/components/ui'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  businessName: z.string().optional(),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const register_ = useRegister()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#f0f5fb]">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center">
            <Zap size={14} className="text-amber-400" fill="currentColor" />
          </div>
          <span style={{ fontFamily: 'Playfair Display, serif' }} className="text-xl font-bold text-[#0f172a]">Invoicio</span>
        </div>

        <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold text-[#0f172a] mb-2">
          Create account
        </h1>
        <p className="text-slate-500 text-sm mb-8">Start sending professional invoices today</p>

        <form onSubmit={handleSubmit((d) => register_.mutate(d))} className="space-y-4">
          <Input label="Your name" placeholder="Jane Smith"
            error={errors.name?.message} {...register('name')} />
          <Input label="Business name (optional)" placeholder="Acme Studio"
            error={errors.businessName?.message} {...register('businessName')} />
          <Input label="Email" type="email" placeholder="you@company.com"
            error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" placeholder="Min. 8 characters"
            error={errors.password?.message} hint="Minimum 8 characters"
            {...register('password')} />

          {register_.error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {(register_.error as ApiError)?.message ?? 'Registration failed'}
            </p>
          )}

          <Button type="submit" loading={register_.isPending} className="w-full mt-2" size="lg">
            Create account
          </Button>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0f172a] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
