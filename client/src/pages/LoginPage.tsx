import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useLogin } from '@/api/auth'
import { Button, Input } from '@/components/ui'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const login = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center">
              <Zap size={18} className="text-[#0f172a]" fill="currentColor" />
            </div>
            <span style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold text-white">
              Invoicio
            </span>
          </div>
        </div>
        <div className="relative z-10">
          <blockquote className="text-2xl text-white/90 leading-relaxed" style={{ fontFamily: 'Playfair Display, serif' }}>
            "Get paid faster with invoices that look as professional as the work behind them."
          </blockquote>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 text-sm font-bold">
              J
            </div>
            <div>
              <p className="text-white text-sm font-medium">James Okafor</p>
              <p className="text-slate-400 text-xs">Freelance Designer</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex gap-6">
          {['500+ users', '10k+ invoices', '$2M+ tracked'].map((s) => (
            <div key={s} className="text-slate-400 text-sm">{s}</div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f0f5fb]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center">
              <Zap size={14} className="text-amber-400" fill="currentColor" />
            </div>
            <span style={{ fontFamily: 'Playfair Display, serif' }} className="text-xl font-bold text-[#0f172a]">Invoicio</span>
          </div>

          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold text-[#0f172a] mb-2">
            Welcome back
          </h1>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-4">
            <Input label="Email" type="email" placeholder="you@company.com"
              error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="••••••••"
              error={errors.password?.message} {...register('password')} />

            {login.error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {(login.error as any)?.message ?? 'Login failed'}
              </p>
            )}

            <Button type="submit" loading={login.isPending} className="w-full mt-2" size="lg">
              Sign in
            </Button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0f172a] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
