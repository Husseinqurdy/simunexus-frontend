import { useState, forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Check, ArrowLeft } from 'lucide-react'

export const authStyles = `

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.ap { font-family: inherit; }
.dp { font-family: inherit; }
@keyframes fadeUp { from { opacity:0; transform:translateY(0); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes drift { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(18px,-14px) scale(1); } }
.au  { animation: fadeUp .6s cubic-bezier(.22,.61,.36,1) both; }
.au1 { animation: fadeUp .6s .08s cubic-bezier(.22,.61,.36,1) both; }
.au2 { animation: fadeUp .6s .16s cubic-bezier(.22,.61,.36,1) both; }
.au3 { animation: fadeUp .6s .24s cubic-bezier(.22,.61,.36,1) both; }
.au4 { animation: fadeUp .6s .32s cubic-bezier(.22,.61,.36,1) both; }
.hgrid { background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px); background-size:48px 48px; }
.ablob { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; animation: drift 9s ease-in-out infinite; }
.afield label { display:block; font-size:12px; font-weight:600; color:#4E5E82;   margin-bottom:6px; }
.afield input, .afield select, .afield textarea { width:100%; background:#F5F7FC; border:1.5px solid #DCE3F0; border-radius:10px; padding:11px 14px; font-size:14px; color:#0A1F4D; font-family: inherit; transition:border-color .2s, background .2s, box-shadow .2s; outline:none; }
.afield input:focus, .afield select:focus, .afield textarea:focus { border-color:#0D52CE; background:#fff; box-shadow:0 0 0 4px rgba(13,82,206,.08); }
.afield input::placeholder { color:#C3CEE2; }
.afield .err { font-size:12px; color:#D03A3A; margin-top:5px; font-weight:500; }
.abtn { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; background:#0D52CE; background-size:170% 170%; background-position:0% 50%; color:#fff; font-family: inherit; font-weight:700; font-size:15px; padding:14px; border-radius:12px; border:none; cursor:pointer; transition:background-position .4s cubic-bezier(.22,.61,.36,1), box-shadow .25s cubic-bezier(.22,.61,.36,1), transform .25s cubic-bezier(.22,.61,.36,1);  }
.abtn:hover:not(:disabled) { background:#0A42A8; }
.abtn:active:not(:disabled) { transform:scale(.98); }
.abtn:disabled { opacity:.6; cursor:not-allowed; }
.abtn-outline { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; background:#fff; color:#0A1F6B; font-family: inherit; font-weight:600; font-size:14px; padding:12px; border-radius:12px; border:1.5px solid #DCE3F0; cursor:pointer; transition:border-color .2s, color .2s, background .2s; }
.abtn-outline:hover { border-color:#0D52CE; color:#0D52CE; background:#EAF1FD; }
.divider { display:flex; align-items:center; gap:12px; margin:20px 0; }
.divider::before,.divider::after { content:''; flex:1; height:1px; background:#EBEFF8; }
.divider span { font-size:12px; color:#C3CEE2; font-weight:600;   }
@media (prefers-reduced-motion: reduce) {
  .au, .au1, .au2, .au3, .au4, .ablob { animation: none !important; }
  .afield input, .afield select, .afield textarea, .abtn, .abtn-outline { transition: none !important; }
}
`

/* Real brand icon (extracted from the SimuNexus logo artwork), with a smooth
   fade + scale-in on load instead of popping in abruptly. Falls back
   gracefully — layout never breaks if the image is briefly unavailable. */
export function GSHLogo({ size = 36 }: { size?: number }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      src="/gsh-icon.png"
      alt="Global Simulation Hub"
      onLoad={() => setLoaded(true)}
      style={{
        height: size,
        width: 'auto',
        maxWidth: 'none',
        maxHeight: 'none',
        display: 'block',
        flexShrink: 0,
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'scale(1)' : 'scale(0.9)',
        transition: 'opacity .5s cubic-bezier(.22,.61,.36,1), transform .5s cubic-bezier(.22,.61,.36,1)',
      }}
    />
  )
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0A1F6B', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }} className="hgrid ap">

      <div style={{ position: 'relative', width: '100%', maxWidth: 460 }}>
        {children}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   AUTH LAYOUT — muundo mmoja kwa Login, Register, Expert Register, Set Password
   Kushoto: paneli ya brand (navy). Kulia: fomu. Animation moja tu: fade-in.
   ════════════════════════════════════════════════════════════════════════ */
export const gxStyles = `
.gx-shell { min-height: 100vh; display: grid; grid-template-columns: minmax(380px, 5fr) 6fr; background: #F5F7FC; font-family: inherit; }
.gx-side { position: relative; background: #0A1F6B; color: #fff; padding: 48px 56px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
.gx-side::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; }
.gx-side::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #E37914; }
.gx-side > * { position: relative; }
.gx-brand { display: flex; align-items: center; gap: 12px; color: #fff; text-decoration: none; }
.gx-brand-tile { width: 44px; height: 44px; border-radius: 10px; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.gx-brand-name { font-size: 16px; font-weight: 700; line-height: 1.2; }
.gx-brand-tag { font-size: 12px; color: #A9C8F0; }
.gx-side h2 { color: #fff; font-size: 28px; font-weight: 700; line-height: 1.25; max-width: 420px; margin: 0 0 24px; }
.gx-points { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; max-width: 420px; }
.gx-points li { display: flex; gap: 12px; align-items: flex-start; font-size: 14px; line-height: 1.5; color: #D6E3F8; }
.gx-points .tick { width: 20px; height: 20px; border-radius: 50%; background: rgba(227,121,20,.18); color: #F0A04B; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.gx-side-foot { font-size: 12px; color: #8DA6D6; }
.gx-main { display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
.gx-panel { width: 100%; max-width: 420px; animation: gxFade .3s ease both; }
.gx-mobile-brand { display: none; align-items: center; gap: 10px; margin-bottom: 28px; color: #0A1F6B; font-weight: 700; font-size: 15px; text-decoration: none; }
.gx-title { font-size: 24px; font-weight: 700; color: #0A1F4D; margin: 0 0 6px; line-height: 1.25; }
.gx-sub { font-size: 14px; color: #4E5E82; margin: 0 0 28px; line-height: 1.5; }
.gx-field { margin-bottom: 16px; }
.gx-label { display: block; font-size: 13px; font-weight: 600; color: #2B3A60; margin-bottom: 6px; }
.gx-label .opt { font-weight: 400; color: #667697; }
.gx-inputwrap { position: relative; }
.gx-input { width: 100%; height: 44px; background: #fff; border: 1px solid #C3CEE2; border-radius: 8px; padding: 0 14px; font-size: 14px; color: #0A1F4D; font-family: inherit; outline: none; transition: border-color .15s, box-shadow .15s; }
.gx-input::placeholder { color: #8D9BB8; }
.gx-input:hover { border-color: #8D9BB8; }
.gx-input:focus { border-color: #0D52CE; box-shadow: 0 0 0 3px rgba(13,82,206,.15); }
.gx-input.has-icon { padding-left: 40px; }
.gx-input.has-right { padding-right: 44px; }
.gx-input.invalid { border-color: #B92D2D; }
.gx-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #667697; display: flex; pointer-events: none; }
.gx-eye { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: none; border: none; border-radius: 6px; color: #667697; cursor: pointer; }
.gx-eye:hover { color: #0D52CE; background: #EAF1FD; }
.gx-err { font-size: 12px; color: #B92D2D; margin: 6px 0 0; }
.gx-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.gx-btn { width: 100%; height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #0D52CE; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; text-decoration: none; transition: background .15s; }
.gx-btn:hover:not(:disabled) { background: #0A42A8; }
.gx-btn:disabled { opacity: .6; cursor: not-allowed; }
.gx-btn-outline { background: #fff; color: #0A1F6B; border: 1px solid #C3CEE2; }
.gx-btn-outline:hover:not(:disabled) { background: #EAF1FD; border-color: #0D52CE; }
.gx-spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: gxSpin .7s linear infinite; }
.gx-divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; font-size: 12px; color: #667697; }
.gx-divider::before, .gx-divider::after { content: ''; flex: 1; height: 1px; background: #DCE3F0; }
.gx-links { text-align: center; font-size: 13px; color: #4E5E82; margin-top: 20px; line-height: 1.8; }
.gx-link { color: #0D52CE; font-weight: 600; text-decoration: none; }
.gx-link:hover { text-decoration: underline; }
.gx-muted-link { color: #4E5E82; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
.gx-muted-link:hover { color: #0D52CE; }
.gx-notice { display: flex; gap: 10px; align-items: flex-start; background: #EAF1FD; border: 1px solid #C4DBF1; color: #0A42A8; border-radius: 8px; padding: 10px 12px; margin-bottom: 20px; font-size: 13px; line-height: 1.5; }
.gx-strength { display: flex; gap: 4px; margin: 8px 0 4px; }
.gx-strength i { flex: 1; height: 4px; border-radius: 99px; background: #DCE3F0; transition: background .2s; }
@keyframes gxFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes gxSpin { to { transform: rotate(360deg); } }
@media (max-width: 960px) {
  .gx-shell { grid-template-columns: 1fr; }
  .gx-side { display: none; }
  .gx-mobile-brand { display: flex; }
  .gx-main { align-items: flex-start; padding: 32px 20px; }
}
@media (max-width: 480px) { .gx-row { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .gx-panel { animation: none; } .gx-spin { animation-duration: 1.6s; } }
`

const POINTS = [
  'Submit a project and receive a clear quote before work starts',
  'Matched with verified MATLAB, Simulink, ANSYS and Proteus experts',
  'Secure payments with tracked delivery from start to finish',
]

export function AuthLayout({ title, subtitle, children, footer }: {
  title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode
}) {
  return (
    <div className="gx-shell">
      <style>{gxStyles}</style>
      <aside className="gx-side">
        <Link to="/" className="gx-brand">
          <span className="gx-brand-tile"><GSHLogo size={30} /></span>
          <span>
            <div className="gx-brand-name">Global Simulation Hub</div>
            <div className="gx-brand-tag">Engineering · Simulation · Delivery</div>
          </span>
        </Link>
        <div>
          <h2>Simulation work, delivered by verified engineers.</h2>
          <ul className="gx-points">
            {POINTS.map(p => (
              <li key={p}><span className="tick"><Check size={12} strokeWidth={3} /></span>{p}</li>
            ))}
          </ul>
        </div>
        <div className="gx-side-foot">© {new Date().getFullYear()} Global Simulation Hub</div>
      </aside>
      <main className="gx-main">
        <div className="gx-panel">
          <Link to="/" className="gx-mobile-brand"><GSHLogo size={30} />Global Simulation Hub</Link>
          <h1 className="gx-title">{title}</h1>
          {subtitle && <p className="gx-sub">{subtitle}</p>}
          {children}
          {footer && <div className="gx-links">{footer}</div>}
        </div>
      </main>
    </div>
  )
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: React.ReactNode; error?: string; icon?: React.ReactNode
}
export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField({ label, error, icon, className, ...rest }, ref) {
  return (
    <div className="gx-field">
      <label className="gx-label">{label}</label>
      <div className="gx-inputwrap">
        {icon && <span className="gx-icon">{icon}</span>}
        <input ref={ref} {...rest} className={`gx-input${icon ? ' has-icon' : ''}${error ? ' invalid' : ''}`} />
      </div>
      {error && <p className="gx-err">{error}</p>}
    </div>
  )
})

export const PasswordField = forwardRef<HTMLInputElement, FieldProps>(function PasswordField({ label, error, icon, ...rest }, ref) {
  const [show, setShow] = useState(false)
  return (
    <div className="gx-field">
      <label className="gx-label">{label}</label>
      <div className="gx-inputwrap">
        {icon && <span className="gx-icon">{icon}</span>}
        <input ref={ref} {...rest} type={show ? 'text' : 'password'} className={`gx-input has-right${icon ? ' has-icon' : ''}${error ? ' invalid' : ''}`} />
        <button type="button" className="gx-eye" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="gx-err">{error}</p>}
    </div>
  )
})

export function SubmitButton({ loading, loadingText, children }: { loading?: boolean; loadingText: string; children: React.ReactNode }) {
  return (
    <button type="submit" className="gx-btn" disabled={loading}>
      {loading ? <><span className="gx-spin" />{loadingText}</> : children}
    </button>
  )
}

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null
  const s = value.length < 6 ? 1 : value.length < 8 ? 2 : /[A-Z]/.test(value) && /[0-9]/.test(value) ? 4 : 3
  const colors = ['', '#B92D2D', '#E5A00D', '#0D52CE', '#137A4E']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return (
    <div style={{ marginTop: -8, marginBottom: 16 }}>
      <div className="gx-strength">{[1, 2, 3, 4].map(i => <i key={i} style={{ background: i <= s ? colors[s] : undefined }} />)}</div>
      <span style={{ fontSize: 12, fontWeight: 600, color: colors[s] }}>{labels[s]}</span>
    </div>
  )
}

export function AuthNotice({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="gx-notice"><span style={{ marginTop: 1, display: 'flex' }}>{icon}</span><div>{children}</div></div>
}

export function BackHome() {
  return <Link to="/" className="gx-muted-link"><ArrowLeft size={13} /> Back to home</Link>
}
