import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { recruitApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { authStyles, GSHLogo } from '../auth/_shared'

const SKILLS = [
  'MATLAB', 'Simulink', 'Proteus', 'ANSYS', 'LabVIEW', 'Multisim',
  'PSCAD', 'ETAP', 'HFSS', 'CST Studio', 'LTspice', 'Cadence',
  'Quartus', 'VHDL/Verilog', 'PSpice',
]

export default function ExpertApplyPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [form, setForm] = useState({ bio: '', experience_years: '1', portfolio_url: '' })
  const [submitted, setSubmitted] = useState(false)

  const mutation = useMutation({
    mutationFn: () => recruitApi.apply({
      skills: selectedSkills,
      bio: form.bio,
      experience_years: Number(form.experience_years),
      portfolio_url: form.portfolio_url,
    }),
    onSuccess: () => setSubmitted(true),
    onError: (e: any) => {
      toast.error(e.response?.data?.error || e.response?.data?.detail || 'Application failed.')
    },
  })

  const toggleSkill = (s: string) => {
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  // Redirect back — client anarudi /client, expert anarudi /expert
  const goBack = () => {
    if (user?.role === 'expert') navigate('/expert')
    else navigate('/client')
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#0B1C3D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{authStyles}</style>
      <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px' }}>✅</div>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>Application Submitted!</h1>
        <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.7, margin: '0 0 28px' }}>
          Your application has been received. Go to your dashboard and click <strong style={{ color: '#F59E0B' }}>"Start Test"</strong> when you're ready for the 2-hour simulation test.
        </p>
        <button
          onClick={goBack}
          style={{ width: '100%', padding: '13px', borderRadius: 12, background: '#0EA5E9', color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}
        >
          Go to Dashboard →
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0B1C3D', padding: '0 0 48px', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{authStyles}</style>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Nav */}
      <div style={{ background: 'rgba(11,28,61,.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <GSHLogo size={30} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'Syne,sans-serif' }}>Global Simulation Hub</span>
        </div>
        <button
          onClick={goBack}
          style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,.7)', fontFamily: 'inherit' }}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ maxWidth: 620, margin: '48px auto 0', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Apply as Expert</h1>
          <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>
            Applying as <strong style={{ color: '#38BDF8' }}>{user?.first_name} {user?.last_name}</strong> · {user?.email}
          </p>
        </div>

        {/* Info box */}
        <div style={{ background: 'rgba(14,165,233,.06)', border: '1px solid rgba(14,165,233,.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#7DD3FC', margin: '0 0 6px' }}>📋 How the test works</p>
          <p style={{ fontSize: 12, color: '#7DD3FC', lineHeight: 1.6, margin: 0 }}>
            After submitting this form, you'll see a <strong>"Start Test"</strong> button on your dashboard.
            When you click it, you'll get a simulation task to complete in <strong>2 hours</strong>.
            Upload your work before time runs out — admin will review and notify you within 24 hours.
          </p>
        </div>

        {/* Form card */}
        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '28px 24px', backdropFilter: 'blur(12px)' }}>

          {/* Skills */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: selectedSkills.length === 0 ? '#EF4444' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Your Simulation Skills *
              {selectedSkills.length === 0 && <span style={{ color: '#EF4444', fontWeight: 700, textTransform: 'none', marginLeft: 6 }}>— Select at least one</span>}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SKILLS.map(s => (
                <button key={s} type="button" onClick={() => toggleSkill(s)}
                  style={{
                    padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
                    border: `1.5px solid ${selectedSkills.includes(s) ? '#0EA5E9' : 'rgba(255,255,255,.08)'}`,
                    background: selectedSkills.includes(s) ? 'rgba(14,165,233,.12)' : 'rgba(255,255,255,.03)',
                    color: selectedSkills.includes(s) ? '#38BDF8' : '#64748B',
                  }}
                >
                  {selectedSkills.includes(s) ? '✓ ' : ''}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Years of Experience *</label>
            <select
              value={form.experience_years}
              onChange={e => setForm(p => ({ ...p, experience_years: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n} style={{ background: '#0B1C3D' }}>{n} year{n > 1 ? 's' : ''}</option>
              ))}
              <option value={11} style={{ background: '#0B1C3D' }}>10+ years</option>
            </select>
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Professional Bio *</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              rows={4}
              placeholder="Describe your engineering background, simulation experience, and types of projects you've worked on..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', color: '#fff', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Portfolio */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Portfolio URL <span style={{ color: '#334155', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </label>
            <input
              type="url"
              value={form.portfolio_url}
              onChange={e => setForm(p => ({ ...p, portfolio_url: e.target.value }))}
              placeholder="https://github.com/yourprofile or LinkedIn URL"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={() => mutation.mutate()}
          disabled={selectedSkills.length === 0 || !form.bio || mutation.isPending}
          style={{
            width: '100%', marginTop: 16, padding: '14px', borderRadius: 12, border: 'none',
            cursor: selectedSkills.length === 0 || !form.bio || mutation.isPending ? 'not-allowed' : 'pointer',
            background: selectedSkills.length === 0 || !form.bio || mutation.isPending ? 'rgba(16,185,129,.4)' : '#10B981',
            color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {mutation.isPending
            ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Submitting...</>
            : '✓ Submit Application'
          }
        </button>
      </div>
    </div>
  )
}
