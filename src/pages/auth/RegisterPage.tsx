import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import type { Role } from '@/types'
import { authStyles, GSHLogo, AuthCard } from './_shared'

const schema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
  referral_code: z.string().optional(),
})
type F = z.infer<typeof schema>

const ROLE_HOME: Record<Role, string> = {
  client: '/client', expert: '/expert', admin: '/admin', developer: '/developer'
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<F>({
    resolver: zodResolver(schema),
  })

  const pw = watch('password', '')
  const pwStrength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 8 ? 2 : /[A-Z]/.test(pw) && /[0-9]/.test(pw) ? 4 : 3
  const strengthColors = ['#E2E8F0', '#EF4444', '#F59E0B', '#0EA5E9', '#10B981']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  const mutation = useMutation({
    mutationFn: (d: F) => authApi.register(d),
    onSuccess: (res) => {
      const { access, refresh, user } = res.data
      setAuth(user, access, refresh)
      toast.success('Account created! Welcome to GSH 🎉')
      navigate(ROLE_HOME[user.role as Role])
    },
    onError: (e: any) => {
      const msg = e.response?.data?.email?.[0] || 'Registration failed. Try again.'
      toast.error(msg)
    },
  })

  return (
    <AuthCard>
      <style>{authStyles}</style>

      <div className="au" style={{
        background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 24, padding: '36px 36px', backdropFilter: 'blur(12px)',
      }}>
        {/* Logo */}
        <div className="au" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <GSHLogo size={36} />
          <div>
            <div className="dp" style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Global Simulation Hub</div>
            <div style={{ color: '#38BDF8', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Engineering · Simulation · Delivery</div>
          </div>
        </div>

        <h1 className="dp au1" style={{ color: '#fff', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Create your account</h1>
        <p className="au1" style={{ color: '#64748B', fontSize: 13, marginBottom: 28 }}>Join GSH — submit projects, track progress, get results.</p>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
          {/* Name row */}
          <div className="au2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div className="afield">
              <label>First Name</label>
              <input {...register('first_name')} placeholder="John" />
              {errors.first_name && <p className="err">{errors.first_name.message}</p>}
            </div>
            <div className="afield">
              <label>Last Name</label>
              <input {...register('last_name')} placeholder="Doe" />
              {errors.last_name && <p className="err">{errors.last_name.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="afield au2" style={{ marginBottom: 14 }}>
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              </span>
              <input {...register('email')} type="email" placeholder="you@example.com" style={{ paddingLeft: 38 }} />
            </div>
            {errors.email && <p className="err">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="afield au2" style={{ marginBottom: 6 }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              </span>
              <input {...register('password')} type="password" placeholder="Min. 8 characters" style={{ paddingLeft: 38 }} />
            </div>
            {errors.password && <p className="err">{errors.password.message}</p>}
          </div>

          {/* Password strength */}
          {pw.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= pwStrength ? strengthColors[pwStrength] : '#1E293B', transition: 'background .3s' }} />
                ))}
              </div>
              <p style={{ fontSize: 11, color: strengthColors[pwStrength], margin: 0, fontWeight: 600 }}>{strengthLabels[pwStrength]}</p>
            </div>
          )}

          {/* Referral */}
          <div className="afield au2" style={{ marginBottom: 24 }}>
            <label>Referral Code <span style={{ color: '#334155', textTransform: 'none', fontWeight: 400, letterSpacing: 0 }}>(optional)</span></label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
              </span>
              <input {...register('referral_code')} placeholder="Enter referral code" style={{ paddingLeft: 38 }} />
            </div>
          </div>

          <button type="submit" className="abtn au3" disabled={mutation.isPending}>
            {mutation.isPending
              ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Creating account...</>
              : <>Create Account <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>
            }
          </button>
        </form>

        <div className="divider au4"><span>already have an account?</span></div>

        <Link to="/login" className="abtn-outline au4">Sign In</Link>
      </div>

      <div className="au4" style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#334155' }}>
        <Link to="/" style={{ color: '#334155', textDecoration: 'none' }}>← Back to home</Link>
        <span style={{ margin: '0 10px' }}>·</span>
        <Link to="/submit" style={{ color: '#334155', textDecoration: 'none' }}>Submit without account</Link>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AuthCard>
  )
}
