import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { authStyles, GSHLogo, AuthCard } from './_shared'

/* --------------------------------- icons ---------------------------------- */
/* Hand-built line icons — no emoji anywhere on this page */

type IconName = 'mail' | 'lock' | 'eye' | 'eye-off' | 'arrow-right' | 'arrow-left' | 'graduation-cap'

function Icon({ name, size = 15, color = 'currentColor', strokeWidth = 1.8 }:
  { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const, stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'mail': return <svg {...common}><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
    case 'lock': return <svg {...common}><path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
    case 'eye': return <svg {...common}><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    case 'eye-off': return <svg {...common}><path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
    case 'arrow-right': return <svg {...common} strokeWidth={strokeWidth || 2.5}><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
    case 'arrow-left': return <svg {...common}><path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
    case 'graduation-cap': return <svg {...common}><path d="M12 3 2 8l10 5 10-5-10-5Z" /><path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" /><path d="M22 8v6" /></svg>
  }
}

const schema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name:  z.string().min(1, 'Last name required'),
  email:      z.string().email('Invalid email address'),
  password:   z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type F = z.infer<typeof schema>

export default function RegisterExpertPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<F>({
    resolver: zodResolver(schema),
  })

  const pw = watch('password', '')
  const pwStrength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 8 ? 2 : /[A-Z]/.test(pw) && /[0-9]/.test(pw) ? 4 : 3
  const strengthColors = ['#E2E8F0', '#EF4444', '#F59E0B', '#0EA5E9', '#10B981']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  const mutation = useMutation({
    // confirmPassword is a client-side check only — it isn't sent to the API
    mutationFn: (d: F) => authApi.registerExpert({
      first_name: d.first_name,
      last_name: d.last_name,
      email: d.email,
      password: d.password,
    }),
    onSuccess: (res) => {
      const { access, refresh, user } = res.data
      setAuth(user, access, refresh)
      toast.success('Account created! Now complete your application.')
      // Peleka moja kwa moja kwenye expert apply form
      navigate('/expert/apply')
    },
    onError: (e: any) => {
      const msg = e.response?.data?.email?.[0] || 'Registration failed. Try again.'
      toast.error(msg)
    },
  })

  return (
    <AuthCard>
      <style>{authStyles}</style>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .rep-toggle-pw { transition: color .2s; }
        .rep-toggle-pw:hover { color: #94A3B8; }
        .rep-link { transition: color .2s, opacity .2s; }
      `}</style>

      <div className="au" style={{
        background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 24, padding: 'clamp(26px,6vw,36px)', backdropFilter: 'blur(12px)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <GSHLogo size={36} />
          <div style={{ minWidth: 0 }}>
            <div className="dp" style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Global Simulation Hub</div>
            <div style={{ color: '#38BDF8', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Engineering · Simulation · Delivery</div>
          </div>
        </div>

        {/* Expert badge */}
        <div style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(16,185,129,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="graduation-cap" size={16} color="#6EE7B7" />
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#6EE7B7', margin: '0 0 2px' }}>Expert Application — Step 1 of 2</p>
            <p style={{ fontSize: 11, color: '#4ADE80', margin: 0 }}>Create your account, then complete the application form.</p>
          </div>
        </div>

        <h1 className="dp" style={{ color: '#fff', fontSize: 'clamp(21px,5vw,24px)', fontWeight: 800, margin: '0 0 4px', lineHeight: 1.15 }}>Create Expert Account</h1>
        <p style={{ color: '#8291AC', fontSize: 13, margin: '0 0 24px' }}>Basic info only — skills &amp; bio are next.</p>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))}>

          {/* Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div className="afield">
              <label>First Name</label>
              <input {...register('first_name')} placeholder="Ahmed" />
              {errors.first_name && <p className="err">{errors.first_name.message}</p>}
            </div>
            <div className="afield">
              <label>Last Name</label>
              <input {...register('last_name')} placeholder="Khalid" />
              {errors.last_name && <p className="err">{errors.last_name.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="afield" style={{ marginBottom: 14 }}>
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#64748B', display: 'flex' }}>
                <Icon name="mail" size={15} />
              </span>
              <input {...register('email')} type="email" placeholder="you@example.com" autoComplete="email" style={{ paddingLeft: 38 }} />
            </div>
            {errors.email && <p className="err">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="afield" style={{ marginBottom: 6 }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#64748B', display: 'flex' }}>
                <Icon name="lock" size={15} />
              </span>
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                style={{ paddingLeft: 38, paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="rep-toggle-pw"
                aria-label={showPw ? 'Hide password' : 'Show password'}
                aria-pressed={showPw}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 2, display: 'flex' }}
              >
                <Icon name={showPw ? 'eye-off' : 'eye'} size={15} />
              </button>
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

          {/* Confirm Password */}
          <div className="afield" style={{ marginBottom: 20 }}>
            <label>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#64748B', display: 'flex' }}>
                <Icon name="lock" size={15} />
              </span>
              <input
                {...register('confirmPassword')}
                type={showConfirmPw ? 'text' : 'password'}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                style={{ paddingLeft: 38, paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="rep-toggle-pw"
                aria-label={showConfirmPw ? 'Hide confirm password' : 'Show confirm password'}
                aria-pressed={showConfirmPw}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 2, display: 'flex' }}
              >
                <Icon name={showConfirmPw ? 'eye-off' : 'eye'} size={15} />
              </button>
            </div>
            {errors.confirmPassword && <p className="err">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" className="abtn" disabled={mutation.isPending}>
            {mutation.isPending
              ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Creating account...</>
              : <>Continue to Application <Icon name="arrow-right" size={15} /></>
            }
          </button>
        </form>

        <div className="divider" style={{ margin: '20px 0' }}><span>already have an account?</span></div>

        <Link to="/login?from=expert" className="abtn-outline">Sign In</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20, fontSize: 12, color: '#334155', flexWrap: 'wrap' }}>
        <Link to="/apply-expert" className="rep-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#334155', textDecoration: 'none' }}>
          <Icon name="arrow-left" size={11} /> Back to Expert Info
        </Link>
        <span>·</span>
        <Link to="/" className="rep-link" style={{ color: '#334155', textDecoration: 'none' }}>Home</Link>
      </div>
    </AuthCard>
  )
}
