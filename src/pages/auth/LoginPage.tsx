import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import type { Role } from '@/types'
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

/* Layered, softly animated waves used behind the card. Two SVG bands drift
   at different speeds in opposite directions for a gentle, sky/water feel —
   purely decorative, so it's hidden from screen readers. */
function SkyWaves() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      <div className="wave-layer wave-back">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '200%', height: '46%', position: 'absolute', bottom: 0, left: 0 }}>
          <path fill="#BFE0FB" fillOpacity="0.55" d="M0,160 C240,220 480,100 720,150 C960,200 1200,240 1440,140 L1440,320 L0,320 Z" />
        </svg>
      </div>
      <div className="wave-layer wave-mid">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '200%', height: '38%', position: 'absolute', bottom: 0, left: 0 }}>
          <path fill="#9FD0F5" fillOpacity="0.55" d="M0,180 C300,120 600,240 900,170 C1150,110 1300,190 1440,160 L1440,320 L0,320 Z" />
        </svg>
      </div>
      <div className="wave-layer wave-front">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '200%', height: '30%', position: 'absolute', bottom: 0, left: 0 }}>
          <path fill="#0EA5E9" fillOpacity="0.16" d="M0,200 C260,150 520,250 780,190 C1040,130 1250,210 1440,180 L1440,320 L0,320 Z" />
        </svg>
      </div>
    </div>
  )
}

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
  const [searchParams] = useSearchParams()
  const fromExpert = searchParams.get('from') === 'expert'
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
      toast.success('Welcome back!')

      // Kama alikuja kutoka apply-expert → peleka moja kwa moja kwenye application form
      if (fromExpert && (user.role === 'client' || user.role === 'expert')) {
        navigate('/expert/apply')
      } else {
        navigate(ROLE_HOME[user.role as Role])
      }
    },
    onError: () => toast.error('Invalid email or password.'),
  })

  return (
    <AuthCard>
      <style>{authStyles}</style>
      {/* Sky-blue theme override — sits after authStyles so it wins on equal
          specificity, and is scoped to .gsh-sky so it never leaks elsewhere. */}
      <style>{`
        .gsh-sky-bg { position: fixed; inset: 0; z-index: -1; background: linear-gradient(180deg,#F5FAFF 0%,#DCEEFF 55%,#BFE0FB 100%); overflow: hidden; }
        @keyframes waveDriftBack { from { transform: translateX(0); } to { transform: translateX(-25%); } }
        @keyframes waveDriftMid { from { transform: translateX(-10%); } to { transform: translateX(-35%); } }
        @keyframes waveDriftFront { from { transform: translateX(-25%); } to { transform: translateX(0); } }
        .wave-layer { position: absolute; inset: 0; }
        .wave-back { animation: waveDriftBack 22s ease-in-out infinite alternate; }
        .wave-mid { animation: waveDriftMid 16s ease-in-out infinite alternate; }
        .wave-front { animation: waveDriftFront 11s ease-in-out infinite alternate; }
        @media (prefers-reduced-motion: reduce) {
          .wave-back, .wave-mid, .wave-front { animation: none !important; }
        }

        .gsh-sky .afield label { color: #3B506E; }
        .gsh-sky .afield input {
          background: #F5FAFF !important;
          border: 1px solid #DCEEFF !important;
          color: #0B1C3D !important;
        }
        .gsh-sky .afield input::placeholder { color: #94A3B8; }
        .gsh-sky .afield input:focus {
          border-color: #0EA5E9 !important;
          box-shadow: 0 0 0 3px rgba(14,165,233,.14) !important;
        }
        .gsh-sky .err { color: #DC2626; }
        .gsh-sky .abtn {
          background: linear-gradient(120deg,#0EA5E9,#2563EB) !important;
          color: #fff !important;
          box-shadow: 0 10px 24px rgba(14,165,233,.25);
        }
        .gsh-sky .divider { color: #94A3B8; }
        .gsh-sky .divider::before, .gsh-sky .divider::after { background: #DCEEFF !important; }
        .lp-toggle-pw { transition: color .2s; }
        .lp-toggle-pw:hover { color: #0EA5E9; }
        .lp-link { transition: color .2s, opacity .2s; }
      `}</style>

      {/* Full-viewport sky background with drifting wave bands, sitting behind the card */}
      <div className="gsh-sky-bg">
        <SkyWaves />
      </div>

      {/* Card */}
      <div className="gsh-sky au" style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,.86)', border: '1px solid #DCEEFF',
        borderRadius: 24, padding: 'clamp(28px,6vw,40px) clamp(20px,5vw,36px)', backdropFilter: 'blur(14px)',
        boxShadow: '0 24px 60px rgba(14,116,233,.14)',
      }}>
        {/* Logo */}
        <div className="au" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
          <GSHLogo size={38} />
          <div style={{ minWidth: 0 }}>
            <div className="dp" style={{ color: '#0B1C3D', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Global Simulation Hub</div>
            <div style={{ color: '#0EA5E9', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Engineering · Simulation · Delivery</div>
          </div>
        </div>

        {/* Header — tofauti kama alikuja kutoka apply-expert */}
        {fromExpert ? (
          <>
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 26, height: 26, borderRadius: 8, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="graduation-cap" size={14} color="#059669" />
              </span>
              <p style={{ fontSize: 12, color: '#047857', margin: 0, lineHeight: 1.5 }}>
                <strong>Expert Application</strong> — Sign in, then you'll be taken to the application form.
              </p>
            </div>
            <h1 className="dp au1" style={{ color: '#0B1C3D', fontSize: 'clamp(24px,6vw,28px)', fontWeight: 800, marginBottom: 6, lineHeight: 1.15 }}>Sign in to apply</h1>
            <p className="au1" style={{ color: '#64748B', fontSize: 14, marginBottom: 30 }}>Sign in to your GSH account to continue.</p>
          </>
        ) : (
          <>
            <h1 className="dp au1" style={{ color: '#0B1C3D', fontSize: 'clamp(24px,6vw,28px)', fontWeight: 800, marginBottom: 6, lineHeight: 1.15 }}>Welcome back</h1>
            <p className="au1" style={{ color: '#64748B', fontSize: 14, marginBottom: 30 }}>Sign in to your GSH account</p>
          </>
        )}

        <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
          {/* Email */}
          <div className="afield au2" style={{ marginBottom: 16 }}>
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex' }}>
                <Icon name="mail" size={15} />
              </span>
              <input {...register('email')} type="email" placeholder="you@example.com" autoComplete="email" style={{ paddingLeft: 38 }} />
            </div>
            {errors.email && <p className="err">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="afield au2" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ margin: 0 }}>Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex' }}>
                <Icon name="lock" size={15} />
              </span>
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ paddingLeft: 38, paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="lp-toggle-pw"
                aria-label={showPw ? 'Hide password' : 'Show password'}
                aria-pressed={showPw}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 2, display: 'flex' }}
              >
                <Icon name={showPw ? 'eye-off' : 'eye'} size={15} />
              </button>
            </div>
            {errors.password && <p className="err">{errors.password.message}</p>}
          </div>

          <button type="submit" className="abtn au3" disabled={mutation.isPending}>
            {mutation.isPending
              ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Signing in...</>
              : <>Sign In <Icon name="arrow-right" size={15} /></>
            }
          </button>
        </form>

        <div className="divider au3"><span>or</span></div>

        <div className="au4" style={{ textAlign: 'center', fontSize: 13, color: '#64748B' }}>
          Don't have an account?{' '}
          <Link
            to={fromExpert ? '/register?from=expert' : '/register'}
            className="lp-link"
            style={{ color: '#0EA5E9', fontWeight: 600, textDecoration: 'none' }}
          >
            Create one
          </Link>
        </div>

        {!fromExpert && (
          <div className="au4" style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 10 }}>
            Want to submit without account?{' '}
            <Link to="/submit" className="lp-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0EA5E9', fontWeight: 600, textDecoration: 'none' }}>
              Submit here <Icon name="arrow-right" size={12} />
            </Link>
          </div>
        )}
      </div>

      {/* Bottom links */}
      <div className="au4" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20, fontSize: 12, color: '#3B506E', flexWrap: 'wrap' }}>
        <Link to="/" className="lp-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#3B506E', textDecoration: 'none' }}>
          <Icon name="arrow-left" size={11} /> Back to home
        </Link>
        <span>·</span>
        <Link to="/apply-expert" className="lp-link" style={{ color: '#3B506E', textDecoration: 'none' }}>Become an Expert</Link>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AuthCard>
  )
}
