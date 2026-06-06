import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authStyles, GSHLogo } from '../auth/_shared'

const SKILLS = ['MATLAB', 'Simulink', 'Proteus', 'ANSYS', 'LabVIEW', 'Multisim', 'PSCAD', 'ETAP', 'HFSS', 'CST Studio', 'LTspice', 'Cadence', 'Quartus', 'VHDL/Verilog', 'PSpice']

const PERKS = [
  { icon: '💰', title: 'Earn Commission', body: 'Get paid 60%+ per project delivered. Commission grows with your level.' },
  { icon: '🌍', title: 'Work Globally', body: 'Accept projects from clients around the world, on your schedule.' },
  { icon: '📈', title: 'Grow Your Level', body: 'Progress from Beginner → Verified → Top Expert → Elite Expert.' },
  { icon: '🔒', title: 'Secure Payments', body: 'Payments are held in escrow and released after QC approval.' },
]

export default function ApplyExpertPage() {
  const [selected, setSelected] = useState<string[]>([])

  const toggleSkill = (s: string) => {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B1C3D', fontFamily: "'DM Sans', sans-serif" }} className="hgrid">
      <style>{authStyles}</style>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Nav */}
      <div style={{ background: 'rgba(11,28,61,.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <GSHLogo size={30} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'Syne, sans-serif' }}>Global Simulation Hub</span>
        </Link>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none', padding: '8px 14px' }}>Login</Link>
          <Link to="/submit" style={{ background: '#0EA5E9', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontFamily: 'Syne,sans-serif' }}>Submit Project</Link>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '60px auto 0', padding: '0 24px 60px' }}>

        {/* Hero */}
        <div className="au" style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,.1)', border: '1px solid rgba(14,165,233,.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, background: '#38BDF8', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ color: '#7DD3FC', fontSize: 11, fontWeight: 600, letterSpacing: '.05em' }}>Now accepting expert applications</span>
          </div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', color: '#fff', fontSize: 44, fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1 }}>
            Become a Simulation<br />
            <span style={{ background: 'linear-gradient(135deg,#38BDF8,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Expert on GSH</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: 16, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            Join our global network of verified simulation engineers. Pass a 2-hour test and start earning commissions on every project.
          </p>
        </div>

        {/* Perks */}
        <div className="au1" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 48 }}>
          {PERKS.map(p => (
            <div key={p.title} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '22px 20px', transition: 'all .3s' }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{p.icon}</div>
              <p style={{ fontFamily: 'Syne,sans-serif', color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 6px' }}>{p.title}</p>
              <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{p.body}</p>
            </div>
          ))}
        </div>

        {/* Process */}
        <div className="au2" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 20, padding: '28px 28px', marginBottom: 48 }}>
          <p style={{ fontFamily: 'Syne,sans-serif', color: '#fff', fontWeight: 700, fontSize: 17, margin: '0 0 20px' }}>How the application works</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { n: 1, title: 'Create your account', desc: 'Register with your email and basic info.' },
              { n: 2, title: 'Apply as Expert', desc: 'Select your skills and submit your application from your dashboard.' },
              { n: 3, title: '2-hour simulation test', desc: 'Complete a timed task in your chosen software. Auto-submitted when time ends.' },
              { n: 4, title: 'Admin review', desc: 'Our team reviews your submission within 24 hours.' },
              { n: 5, title: 'Start earning', desc: 'Pass and you unlock the Expert Dashboard — start claiming projects immediately.' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < 4 ? 20 : 0, position: 'relative' }}>
                {i < 4 && <div style={{ position: 'absolute', left: 14, top: 32, width: 1, height: 'calc(100% - 12px)', background: 'rgba(255,255,255,.06)' }} />}
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, flexShrink: 0, fontFamily: 'Syne,sans-serif', zIndex: 1 }}>{s.n}</div>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: '4px 0 4px', fontFamily: 'Syne,sans-serif' }}>{s.title}</p>
                  <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills preview */}
        <div className="au3" style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: 'Syne,sans-serif', color: '#fff', fontWeight: 700, fontSize: 17, margin: '0 0 16px' }}>Which software do you specialize in?</p>
          <p style={{ color: '#64748B', fontSize: 13, margin: '0 0 16px' }}>Select your skills to see what projects you could claim (preview only — actual selection is in your dashboard).</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SKILLS.map(s => (
              <button key={s} type="button" onClick={() => toggleSkill(s)} style={{
                padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
                background: selected.includes(s) ? 'rgba(14,165,233,.15)' : 'rgba(255,255,255,.03)',
                border: `1.5px solid ${selected.includes(s) ? '#0EA5E9' : 'rgba(255,255,255,.08)'}`,
                color: selected.includes(s) ? '#38BDF8' : '#64748B',
              }}>
                {selected.includes(s) ? '✓ ' : ''}{s}
              </button>
            ))}
          </div>
          {selected.length > 0 && (
            <p style={{ color: '#10B981', fontSize: 13, margin: '12px 0 0', fontWeight: 600 }}>
              ✓ You selected {selected.length} skill{selected.length > 1 ? 's' : ''} — great! You can find matching projects on the job board.
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="au4" style={{ background: 'linear-gradient(135deg,rgba(14,165,233,.08),rgba(129,140,248,.08))', border: '1px solid rgba(14,165,233,.15)', borderRadius: 20, padding: '32px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Syne,sans-serif', color: '#fff', fontWeight: 800, fontSize: 22, margin: '0 0 8px' }}>Ready to start?</p>
          <p style={{ color: '#64748B', fontSize: 14, margin: '0 0 24px' }}>Create your account first, then apply as an expert from your dashboard.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0EA5E9', color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, padding: '14px 28px', borderRadius: 12, textDecoration: 'none' }}>
              Create Account & Apply →
            </Link>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.7)', fontSize: 14, padding: '14px 24px', borderRadius: 12, textDecoration: 'none', border: '1px solid rgba(255,255,255,.1)' }}>
              Already have account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
