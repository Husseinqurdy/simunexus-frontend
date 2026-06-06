import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import type { Role } from '@/types'
import { authStyles, GSHLogo, AuthCard } from './_shared'

const ROLE_HOME: Record<Role, string> = {
  client: '/client', expert: '/expert', admin: '/admin', developer: '/developer'
}

export default function SetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, watch } = useForm<{ password: string; confirm: string }>()
  const pw = watch('password', '')

  const mutation = useMutation({
    mutationFn: (d: { password: string }) =>
      authApi.setPassword({ uid: params.get('uid'), token: params.get('token'), password: d.password }),
    onSuccess: (res) => {
      const { access, refresh, user } = res.data
      setAuth(user, access, refresh)
      toast.success('Password set! Welcome to GSH 🎉')
      navigate(ROLE_HOME[user.role as Role])
    },
    onError: () => toast.error('This link has expired or is invalid.'),
  })

  return (
    <AuthCard>
      <style>{authStyles}</style>

      <div className="au" style={{
        background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 24, padding: '40px 36px', backdropFilter: 'blur(12px)', textAlign: 'center',
      }}>
        <div className="au" style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <GSHLogo size={48} />
        </div>

        {/* Icon */}
        <div className="au1" style={{ width: 64, height: 64, background: 'rgba(14,165,233,.1)', border: '1px solid rgba(14,165,233,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#38BDF8" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <h1 className="dp au1" style={{ color: '#fff', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Set Your Password</h1>
        <p className="au2" style={{ color: '#64748B', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
          Your GSH account was created automatically.<br />Set a password to access your dashboard.
        </p>

        <form onSubmit={handleSubmit(d => { if (d.password !== d.confirm) { toast.error('Passwords do not match'); return; } mutation.mutate(d) })} style={{ textAlign: 'left' }}>
          <div className="afield au2" style={{ marginBottom: 14 }}>
            <label>New Password</label>
            <input {...register('password', { required: true, minLength: 8 })} type="password" placeholder="Min. 8 characters" />
            {pw.length > 0 && pw.length < 8 && <p className="err">Too short — minimum 8 characters</p>}
          </div>

          <div className="afield au3" style={{ marginBottom: 28 }}>
            <label>Confirm Password</label>
            <input {...register('confirm', { required: true })} type="password" placeholder="Repeat your password" />
          </div>

          <button type="submit" className="abtn au3" disabled={mutation.isPending}>
            {mutation.isPending
              ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Setting password...</>
              : <>Set Password & Login <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>
            }
          </button>
        </form>
      </div>

      <div className="au4" style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#334155' }}>
        Already have a password?{' '}
        <Link to="/login" style={{ color: '#38BDF8', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AuthCard>
  )
}
