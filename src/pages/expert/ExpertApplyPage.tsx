import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { recruitApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { errorMessage } from '@/lib/format'
import { gxStyles, GSHLogo } from '../auth/_shared'
import type { ExpertApplication, TestTool } from '@/types'

// Hutumika tu kama admin bado hajaweka tools kwenye benki la maswali
const FALLBACK_TOOLS = ['MATLAB', 'Simulink', 'Proteus', 'ANSYS', 'LabVIEW', 'Multisim', 'PSCAD', 'ETAP', 'HFSS', 'CST Studio', 'LTspice']
const HOME: Record<string, string> = { client: '/client', expert: '/expert' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid #DCE3F0', borderRadius: 12, padding: 'clamp(20px,4vw,32px)' }

export default function ExpertApplyPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const home = HOME[user?.role || 'client'] || '/client'
  const [skills, setSkills] = useState<string[]>([])
  const [form, setForm] = useState({ bio: '', experience_years: '1', portfolio_url: '' })
  const [created, setCreated] = useState<ExpertApplication | null>(null)

  const toolsQ = useQuery<TestTool[]>({ queryKey: ['public-tools'], queryFn: () => recruitApi.tools().then(r => r.data) })
  const mine = useQuery<ExpertApplication | null>({
    queryKey: ['my-application'], retry: false,
    queryFn: () => recruitApi.myApplication().then(r => r.data).catch(() => null),
  })
  const tools = toolsQ.data?.length ? toolsQ.data.map(t => t.name) : FALLBACK_TOOLS

  const apply = useMutation({
    mutationFn: () => recruitApi.apply({ skills, bio: form.bio, experience_years: Number(form.experience_years), portfolio_url: form.portfolio_url }),
    onSuccess: r => setCreated(r.data),
    onError: (e: any) => toast.error(errorMessage(e, 'Application failed.')),
  })

  const Header = (
    <header style={{ background: '#fff', borderBottom: '1px solid #DCE3F0' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 10 }}>
        <GSHLogo size={28} /><strong style={{ fontSize: 14, color: '#0A1F6B', flex: 1 }}>Become an expert</strong>
        <Link to={home} className="gx-muted-link" style={{ fontSize: 14 }}>Back to dashboard</Link>
      </div>
    </header>
  )
  const Page = ({ children }: { children: React.ReactNode }) => (
    <div style={{ minHeight: '100vh', background: '#F5F7FC' }}><style>{gxStyles}</style>{Header}
      <main style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(20px,5vw,40px) 20px' }}>{children}</main></div>
  )

  /* Imetumwa sasa hivi */
  if (created) return (
    <Page><div style={{ ...card, textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EDF8F1', color: '#137A4E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}><CheckCircle2 size={34} /></div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A1F4D', margin: '0 0 8px' }}>Application received</h1>
      <p style={{ fontSize: 14, color: '#4E5E82', lineHeight: 1.7, margin: '0 0 22px' }}>The next step is a short skills test on the tools you chose. You can start it now or later from your dashboard.</p>
      <button className="gx-btn" style={{ marginBottom: 10 }} onClick={() => navigate(`/expert/test/${created.id}`)}>Start the test <ArrowRight size={16} /></button>
      <Link to={home} className="gx-btn gx-btn-outline">Go to dashboard</Link>
    </div></Page>
  )

  /* Ana maombi yanayoendelea */
  const existing = mine.data
  if (existing && ['pending', 'testing', 'submitted', 'retry'].includes(existing.status)) {
    const label = { pending: 'Test not started', testing: 'Test in progress', submitted: 'Under review', retry: 'Retake allowed' }[existing.status as 'pending']
    return (
      <Page><div style={{ ...card, maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0A1F4D', margin: '0 0 6px' }}>Your application</h1>
        <p style={{ fontSize: 14, color: '#4E5E82', margin: '0 0 16px' }}>Tools: <strong>{existing.skills.join(', ')}</strong></p>
        <span style={{ fontSize: 13, fontWeight: 600, background: '#EAF1FD', color: '#0A42A8', borderRadius: 999, padding: '4px 12px' }}>{label}</span>
        <div style={{ marginTop: 20 }}>
          <button className="gx-btn" onClick={() => navigate(`/expert/test/${existing.id}`)}>
            {existing.status === 'submitted' ? 'View status' : existing.status === 'testing' ? 'Continue test' : 'Open test'} <ArrowRight size={16} />
          </button>
        </div>
      </div></Page>
    )
  }

  const toggle = (s: string) => setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])
  const ok = skills.length > 0 && form.bio.trim().length >= 20

  return (
    <Page>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'clamp(22px,5vw,28px)', fontWeight: 700, color: '#0A1F4D', margin: '0 0 6px' }}>Apply as a simulation expert</h1>
        <p style={{ fontSize: 14, color: '#4E5E82', margin: 0 }}>Tell us what you work with. You will then take a short test on the tools you select.</p>
      </div>
      <form style={card} onSubmit={e => { e.preventDefault(); if (ok) apply.mutate() }}>
        <span className="gx-label">Tools you can work with *</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {toolsQ.isLoading && <Loader2 size={18} className="spin" color="#0D52CE" />}
          {tools.map(s => {
            const on = skills.includes(s)
            return (
              <button key={s} type="button" onClick={() => toggle(s)} aria-pressed={on}
                style={{ padding: '8px 14px', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1.5px solid ${on ? '#0D52CE' : '#DCE3F0'}`, background: on ? '#EAF1FD' : '#fff', color: on ? '#0A42A8' : '#2B3A60' }}>{s}</button>
            )
          })}
        </div>

        <div className="gx-field">
          <label className="gx-label">About your experience *</label>
          <textarea className="gx-input" rows={5} style={{ height: 'auto', padding: '10px 14px', resize: 'vertical' }} value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Projects you have done, your background, certifications…" />
          <p style={{ fontSize: 12, color: form.bio.trim().length >= 20 ? '#667697' : '#9A5B00', margin: '6px 0 0' }}>{form.bio.trim().length}/20 characters minimum</p>
        </div>
        <div className="gx-row">
          <div className="gx-field">
            <label className="gx-label">Years of experience</label>
            <select className="gx-input" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: e.target.value })}>
              {[0, 1, 2, 3, 4, 5, 7, 10, 15].map(n => <option key={n} value={n}>{n === 0 ? 'Less than 1 year' : n === 15 ? '15+ years' : `${n} year${n > 1 ? 's' : ''}`}</option>)}
            </select>
          </div>
          <div className="gx-field">
            <label className="gx-label">Portfolio / GitHub <span className="opt">(optional)</span></label>
            <input className="gx-input" type="url" placeholder="https://…" value={form.portfolio_url} onChange={e => setForm({ ...form, portfolio_url: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="gx-btn" disabled={!ok || apply.isPending}>
          {apply.isPending ? <><span className="gx-spin" /> Submitting…</> : <>Submit application <ArrowRight size={16} /></>}
        </button>
      </form>
    </Page>
  )
}
