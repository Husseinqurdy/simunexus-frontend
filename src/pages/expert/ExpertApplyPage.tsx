import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { recruitApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const SKILLS = [
  'MATLAB', 'Simulink', 'Proteus', 'ANSYS', 'LabVIEW',
  'Multisim', 'PSCAD', 'ETAP', 'HFSS', 'CST Studio',
  'LTspice', 'Cadence', 'Quartus', 'VHDL/Verilog', 'PSpice',
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

  if (submitted) return (
    <div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center', padding: '0 20px' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 24px' }}>✅</div>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 12px' }}>Application Submitted!</h1>
      <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.7, margin: '0 0 28px' }}>
        Your application has been received. When you're ready, go to your dashboard to start the 2-hour simulation test.
      </p>
      <button onClick={() => navigate('/expert')}
        style={{ padding: '12px 28px', borderRadius: 12, background: '#0EA5E9', color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>
        Go to Dashboard →
      </button>
    </div>
  )

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 10,
    border: '1.5px solid #E2E8F0', fontSize: 13, outline: 'none',
    fontFamily: 'DM Sans, sans-serif', color: '#0F172A', boxSizing: 'border-box', background: '#fff',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '32px 20px', fontFamily: "'DM Sans',sans-serif" }}>
      <button onClick={() => navigate('/expert')}
        style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontSize: 13, color: '#64748B', fontWeight: 600, marginBottom: 24 }}>
        ← Back to Dashboard
      </button>

      <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>Apply as Expert</h1>
      <p style={{ color: '#94A3B8', fontSize: 13, margin: '0 0 28px' }}>
        Applying as <strong style={{ color: '#0F172A' }}>{user?.first_name} {user?.last_name}</strong> · {user?.email}
      </p>

      {/* Info box */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 12, padding: '14px 18px', marginBottom: 28 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', margin: '0 0 6px' }}>📋 How the test works</p>
        <p style={{ fontSize: 12, color: '#0369A1', lineHeight: 1.6, margin: 0 }}>
          After submitting this form, you'll see a <strong>"Start Test"</strong> button on your dashboard.
          When you click it, you'll get a simulation task to complete in <strong>2 hours</strong>.
          Upload your work before time runs out — admin will review and notify you within 24 hours.
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9', padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>

        {/* Skills */}
        <div style={{ marginBottom: 22 }}>
          <label style={lbl}>
            Your Simulation Skills * {selectedSkills.length === 0 && <span style={{ color: '#EF4444', fontWeight: 700, textTransform: 'none' }}>— Select at least one</span>}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SKILLS.map(s => (
              <button key={s} type="button" onClick={() => toggleSkill(s)}
                style={{ padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', border: `1.5px solid ${selectedSkills.includes(s) ? '#0EA5E9' : '#E2E8F0'}`, background: selectedSkills.includes(s) ? '#EFF6FF' : '#FAFAFA', color: selectedSkills.includes(s) ? '#0EA5E9' : '#64748B' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Years of Experience *</label>
          <select value={form.experience_years} onChange={e => setForm(p => ({ ...p, experience_years: e.target.value }))}
            style={{ ...inp, cursor: 'pointer' }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <option key={n} value={n}>{n} year{n > 1 ? 's' : ''}</option>
            ))}
            <option value={11}>10+ years</option>
          </select>
        </div>

        {/* Bio */}
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Professional Bio *</label>
          <textarea
            value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            rows={4}
            placeholder="Describe your engineering background, simulation experience, and types of projects you've worked on..."
            style={{ ...inp, resize: 'vertical' }}
          />
        </div>

        {/* Portfolio */}
        <div>
          <label style={lbl}>Portfolio URL <span style={{ color: '#CBD5E1', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
          <input
            type="url"
            value={form.portfolio_url}
            onChange={e => setForm(p => ({ ...p, portfolio_url: e.target.value }))}
            placeholder="https://github.com/yourprofile or LinkedIn URL"
            style={inp}
          />
        </div>
      </div>

      <button
        onClick={() => mutation.mutate()}
        disabled={selectedSkills.length === 0 || !form.bio || mutation.isPending}
        style={{
          width: '100%', marginTop: 16, padding: '14px', borderRadius: 12, border: 'none', cursor: selectedSkills.length === 0 || !form.bio || mutation.isPending ? 'not-allowed' : 'pointer',
          background: selectedSkills.length === 0 || !form.bio || mutation.isPending ? '#6EE7B7' : '#10B981',
          color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15,
        }}
      >
        {mutation.isPending ? 'Submitting…' : '✓ Submit Application'}
      </button>
    </div>
  )
}
