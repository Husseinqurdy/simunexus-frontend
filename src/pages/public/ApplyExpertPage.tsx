import { useState } from 'react'
import PublicTopbar from '@/components/layout/PublicTopbar'
import { Link } from 'react-router-dom'
import { authStyles, GSHLogo } from '../auth/_shared'

/* --------------------------------- icons ---------------------------------- */
/* Hand-built line icons — no emoji anywhere on this page */

type IconName = 'credit-card' | 'globe' | 'bar-chart' | 'lock' | 'check' | 'check-circle' | 'arrow-right'

function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.8 }:
  { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const, stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'credit-card': return <svg {...common}><rect x="3" y="6" width="18" height="13" rx="2.2" /><path d="M3 10.2h18" /></svg>
    case 'globe': return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.4 2.6 3.7 6 3.7 9s-1.3 6.4-3.7 9c-2.4-2.6-3.7-6-3.7-9S9.6 5.6 12 3Z" /></svg>
    case 'bar-chart': return <svg {...common}><path d="M4.5 20V11M12 20V4M19.5 20v-6.5" /></svg>
    case 'lock': return <svg {...common}><rect x="5" y="11" width="14" height="9" rx="2.2" /><path d="M8 11V7.5a4 4 0 1 1 8 0V11" /></svg>
    case 'check': return <svg {...common} strokeWidth={strokeWidth || 3}><path d="M4.5 12.75l6 6 9-13.5" /></svg>
    case 'check-circle': return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M8.4 12.4l2.4 2.4 4.6-5" /></svg>
    case 'arrow-right': return <svg {...common}><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
  }
}

const SKILLS = ['MATLAB', 'Simulink', 'Proteus', 'ANSYS', 'LabVIEW', 'Multisim', 'PSCAD', 'ETAP', 'HFSS', 'CST Studio', 'LTspice', 'Cadence', 'Quartus', 'VHDL/Verilog', 'PSpice']

const PERKS: { icon: IconName; title: string; body: string; tint: string }[] = [
  { icon: 'credit-card', title: 'Earn Commission', body: 'Get paid 60%+ per project delivered. Commission grows with your level.', tint: '#8DB8F7' },
  { icon: 'globe', title: 'Work Globally', body: 'Accept projects from clients around the world, on your schedule.', tint: '#EE9340' },
  { icon: 'bar-chart', title: 'Grow Your Level', body: 'Progress from Beginner → Verified → Top Expert → Elite Expert.', tint: '#8DB8F7' },
  { icon: 'lock', title: 'Secure Payments', body: 'Payments are held in escrow and released after QC approval.', tint: '#EE9340' },
]

export default function ApplyExpertPage() {
  const [selected, setSelected] = useState<string[]>([])

  const toggleSkill = (s: string) => {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FC', fontFamily: 'inherit' }}>
      <style>{authStyles}</style>
      <style>{``}</style>
      <style>{`
        .aep-btn-primary { display:inline-flex; align-items:center; gap:8px; background:#0D52CE; color:#fff; font-family: inherit; font-weight:700; border:none; border-radius:12px; cursor:pointer; text-decoration:none; background-size:170% 170%; background-position:0% 50%; transition:background-position .4s cubic-bezier(.22,.61,.36,1), transform .25s cubic-bezier(.22,.61,.36,1), box-shadow .25s cubic-bezier(.22,.61,.36,1); }
        .aep-btn-primary:hover { background:#0A42A8; }
        .aep-btn-ghost { display:inline-flex; align-items:center; background:#FFFFFF; color:#4E5E82; border:1px solid #DCE3F0; border-radius:12px; text-decoration:none; transition:background .2s, border-color .2s, color .2s; }
        .aep-btn-ghost:hover { background:#FFFFFF; border-color:rgba(141,184,247,.4); color:#fff; }
        .aep-navbtn-outline { display:inline-flex; align-items:center; background:#fff; color:#0A1F6B; font-weight:500; border:1px solid rgba(13,82,206,.3); border-radius:8px; text-decoration:none; transition:background .2s, border-color .2s; }
        .aep-navbtn-outline:hover { background:rgba(13,82,206,.08); border-color:rgba(13,82,206,.55); }
        .aep-skillchip { transition:background .2s cubic-bezier(.22,.61,.36,1), border-color .2s cubic-bezier(.22,.61,.36,1), color .2s cubic-bezier(.22,.61,.36,1), transform .2s cubic-bezier(.22,.61,.36,1); }
        .aep-skillchip:hover { transform:none; }
        .aep-perkcard { transition:background .3s cubic-bezier(.22,.61,.36,1), border-color .3s cubic-bezier(.22,.61,.36,1), transform .3s cubic-bezier(.22,.61,.36,1); }
        .aep-perkcard:hover { background:#FFFFFF; border-color:rgba(148,190,255,.3); transform:none; }
        @media (max-width: 560px) {
          .aep-perks-grid { grid-template-columns:1fr !important; }
          .aep-nav-brand-text { display:none !important; }
        }
        @media (max-width: 420px) {
          .aep-cta-row { flex-direction:column !important; align-items:stretch !important; }
          .aep-cta-row a { justify-content:center !important; }
        }
      `}</style>

      <PublicTopbar />

      <div style={{ maxWidth: 800, margin: '52px auto 0', padding: '0 clamp(16px,4vw,24px) 60px' }}>

        {/* Hero */}
        <div  style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EAF1FD', border: '1px solid rgba(13,82,206,.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 22 }}>
            <span style={{ width: 7, height: 7, background: '#8DB8F7', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ color: '#0A42A8', fontSize: 12, fontWeight: 600,}}>Now accepting expert applications</span>
          </div>
          <h1 style={{ fontFamily: 'inherit', color: '#0A1F4D', fontSize: 'clamp(28px,5.5vw,40px)', fontWeight: 700, margin: '0 0 16px', lineHeight: 1.15 }}>
            Become a Simulation<br />
            <span style={{ color: '#0D52CE' }}>Expert on GSH</span>
          </h1>
          <p style={{ color: '#4E5E82', fontSize: 16, lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
            Join our global network of verified simulation engineers. Pass a 2-hour test and start earning commissions on every project.
          </p>
        </div>

        {/* Perks */}
        <div  className="aep-perks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 44 }}>
          {PERKS.map(p => (
            <div key={p.title} className="aep-perkcard" style={{ background: '#FFFFFF', border: '1px solid #DCE3F0', borderRadius: 12, padding: '22px 20px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${p.tint}1A`, border: `1px solid ${p.tint}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon name={p.icon} size={19} color={p.tint} />
              </div>
              <p style={{ fontFamily: 'inherit', color: '#0A1F4D', fontWeight: 700, fontSize: 15, margin: '0 0 6px' }}>{p.title}</p>
              <p style={{ color: '#4E5E82', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{p.body}</p>
            </div>
          ))}
        </div>

        {/* Process */}
        <div  style={{ background: '#FFFFFF', border: '1px solid #DCE3F0', borderRadius: 16, padding: 'clamp(22px,4vw,28px)', marginBottom: 44 }}>
          <p style={{ fontFamily: 'inherit', color: '#0A1F4D', fontWeight: 700, fontSize: 16, margin: '0 0 20px' }}>How the application works</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { n: 1, title: 'Create your account', desc: 'Register with your email and basic info.' },
              { n: 2, title: 'Apply as Expert', desc: 'Select your skills and submit your application from your dashboard.' },
              { n: 3, title: '2-hour simulation test', desc: 'Complete a timed task in your chosen software. Auto-submitted when time ends.' },
              { n: 4, title: 'Admin review', desc: 'Our team reviews your submission within 24 hours.' },
              { n: 5, title: 'Start earning', desc: 'Pass and you unlock the Expert Dashboard — start claiming projects immediately.' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < 4 ? 20 : 0, position: 'relative' }}>
                {i < 4 && <div style={{ position: 'absolute', left: 14, top: 32, width: 1, height: 'calc(100% - 12px)', background: '#DCE3F0' }} />}
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#0D52CE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0, fontFamily: 'inherit', zIndex: 1 }}>{s.n}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: '#0A1F4D', fontWeight: 600, fontSize: 14, margin: '4px 0 4px', fontFamily: 'inherit' }}>{s.title}</p>
                  <p style={{ color: '#4E5E82', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills preview */}
        <div  style={{ marginBottom: 44 }}>
          <p style={{ fontFamily: 'inherit', color: '#0A1F4D', fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>Which software do you specialize in?</p>
          <p style={{ color: '#4E5E82', fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 }}>Select your skills to see what projects you could claim (preview only — actual selection is in your dashboard).</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SKILLS.map(s => {
              const isSelected = selected.includes(s)
              return (
                <button key={s} type="button" onClick={() => toggleSkill(s)} className="aep-skillchip" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: isSelected ? '#EAF1FD' : '#FFFFFF',
                  border: `1.5px solid ${isSelected ? '#0D52CE' : '#DCE3F0'}`,
                  color: isSelected ? '#8DB8F7' : '#667697',
                }}>
                  {isSelected && <Icon name="check" size={13} color="#0D52CE" strokeWidth={3} />}
                  {s}
                </button>
              )
            })}
          </div>
          {selected.length > 0 && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1B9B63', fontSize: 13, margin: '14px 0 0', fontWeight: 600 }}>
              <Icon name="check-circle" size={15} color="#1B9B63" />
              You selected {selected.length} skill{selected.length > 1 ? 's' : ''} — great match for projects on the job board!
            </p>
          )}
        </div>

        {/* CTA */}
        <div  style={{ background: '#EAF1FD', border: '1px solid #C4DBF1', borderRadius: 16, padding: 'clamp(26px,5vw,32px)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'inherit', color: '#0A1F4D', fontWeight: 700, fontSize: 'clamp(19px,3vw,22px)', margin: '0 0 8px' }}>Ready to start?</p>
          <p style={{ color: '#4E5E82', fontSize: 14, margin: '0 0 24px' }}>Create your account first, then complete the expert application form.</p>
          <div className="aep-cta-row" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>

            <Link
              to="/register-expert"
              className="aep-btn-primary"
              style={{ fontSize: 15, padding: '14px 28px' }}
            >
              Create Account &amp; Apply
              <Icon name="arrow-right" size={16} />
            </Link>

            {/* Already have account → login then redirect to /expert/apply */}
            <Link
              to="/login?from=expert"
              className="aep-btn-ghost"
              style={{ fontSize: 14, padding: '14px 24px' }}
            >
              Already have account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
