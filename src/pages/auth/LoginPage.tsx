import { useState } from 'react'
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
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
type F = z.infer<typeof schema>

const ROLE_HOME: Record<Role, string> = {
  client: '/client', expert: '/expert', admin: '/admin', developer: '/developer'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<F>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (d: F) => authApi.login(d.email, d.password),
    onSuccess: (res) => {
      const { access, refresh, user } = res.data
      setAuth(user, access, refresh)
      toast.success(`Welcome back! 👋`)
      navigate(ROLE_HOME[user.role as Role])
    },
    onError: () => toast.error('Invalid email or password.'),
  })

  return (
    <AuthCard>
      <style>{authStyles}</style>

      {/* Card */}
      <div className="au" style={{
        background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 24, padding: '40px 36px', backdropFilter: 'blur(12px)',
      }}>
        {/* Logo */}
        <div className="au" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <GSHLogo size={38} />
          <div>
            <div className="dp" style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Global Simulation Hub</div>
            <div style={{ color: '#38BDF8', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Engineering · Simulation · Delivery</div>
          </div>
        </div>

        <h1 className="dp au1" style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
        <p className="au1" style={{ color: '#64748B', fontSize: 14, marginBottom: 32 }}>Sign in to your GSH account</p>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
          {/* Email */}
          <div className="afield au2" style={{ marginBottom: 16 }}>
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
          <div className="afield au2" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ margin: 0 }}>Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              </span>
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                style={{ paddingLeft: 38, paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 2 }}
              >
                {showPw
                  ? <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  : <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                }
              </button>
            </div>
            {errors.password && <p className="err">{errors.password.message}</p>}
          </div>

          <button type="submit" className="abtn au3" disabled={mutation.isPending}>
            {mutation.isPending
              ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Signing in...</>
              : <>Sign In <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>
            }
          </button>
        </form>

        <div className="divider au3"><span>or</span></div>

        <div className="au4" style={{ textAlign: 'center', fontSize: 13, color: '#64748B' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#0EA5E9', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
        </div>

        <div className="au4" style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 10 }}>
          Want to submit without account?{' '}
          <Link to="/submit" style={{ color: '#38BDF8', fontWeight: 600, textDecoration: 'none' }}>Submit here →</Link>
        </div>
      </div>

      {/* Bottom links */}
      <div className="au4" style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#334155' }}>
        <Link to="/" style={{ color: '#334155', textDecoration: 'none' }}>← Back to home</Link>
        <span style={{ margin: '0 10px' }}>·</span>
        <Link to="/apply-expert" style={{ color: '#334155', textDecoration: 'none' }}>Become an Expert</Link>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AuthCard>
  )
}
