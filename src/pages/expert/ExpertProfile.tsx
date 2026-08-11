import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/client'
import toast from 'react-hot-toast'
import type { User } from '@/types'
import {
  User as UserIcon, Phone, MessageCircle, Globe, Camera, Save,
  Star, CheckCircle2, TrendingUp, DollarSign, Percent, Loader2,
  X, Plus, Award, ToggleLeft, ToggleRight
} from 'lucide-react'

const LEVEL_CFG: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner', color: '#64748B', bg: '#F1F5F9' },
  verified: { label: 'Verified', color: '#2563EB', bg: '#EFF6FF' },
  top:      { label: 'Top Expert', color: '#7C3AED', bg: '#F5F3FF' },
  elite:    { label: 'Elite Expert', color: '#D97706', bg: '#FFFBEB' },
}

type BasicForm = { first_name: string; last_name: string; phone: string; whatsapp: string; country: string }
type ExpertForm = { bio: string; skills: string[]; is_available: boolean }

export default function ExpertProfile() {
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [basicForm, setBasicForm] = useState<BasicForm>({ first_name: '', last_name: '', phone: '', whatsapp: '', country: '' })
  const [expertForm, setExpertForm] = useState<ExpertForm>({ bio: '', skills: [], is_available: true })
  const [skillInput, setSkillInput] = useState('')

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data as User),
  })

  useEffect(() => {
    if (me) {
      setBasicForm({
        first_name: me.first_name || '',
        last_name: me.last_name || '',
        phone: me.phone || '',
        whatsapp: (me as any).whatsapp || '',
        country: me.country || '',
      })
      const ep = (me as any).expert_profile
      if (ep) {
        setExpertForm({
          bio: ep.bio || '',
          skills: ep.skills || [],
          is_available: ep.is_available ?? true,
        })
      }
    }
  }, [me])

  const basicMutation = useMutation({
    mutationFn: (data: BasicForm) => authApi.updateMe(data),
    onSuccess: () => {
      toast.success('Profile details updated.')
      qc.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to update profile.'),
  })

  const avatarMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData()
      fd.append('avatar', file)
      return authApi.updateMe(fd)
    },
    onSuccess: () => {
      toast.success('Photo updated.')
      qc.invalidateQueries({ queryKey: ['me'] })
    },
    onError: () => toast.error('Failed to upload photo.'),
  })

  const expertMutation = useMutation({
    mutationFn: (data: ExpertForm) => authApi.updateExpertProfile(data),
    onSuccess: () => {
      toast.success('Expert profile updated.')
      qc.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to update expert profile.'),
  })

  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    avatarMutation.mutate(file)
  }

  const addSkill = () => {
    const s = skillInput.trim()
    if (!s) return
    if (expertForm.skills.some(x => x.toLowerCase() === s.toLowerCase())) {
      setSkillInput('')
      return
    }
    setExpertForm(p => ({ ...p, skills: [...p.skills, s] }))
    setSkillInput('')
  }

  const removeSkill = (skill: string) => {
    setExpertForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }))
  }

  const ep = (me as any)?.expert_profile
  const levelCfg = LEVEL_CFG[ep?.level] || LEVEL_CFG.beginner
  const initials = (me?.first_name?.[0] || me?.email?.[0] || '?').toUpperCase()
  const avatarSrc = avatarPreview ?? me?.avatar ?? undefined 

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 10,
    border: '1.5px solid #E2E8F0', fontSize: 13.5, outline: 'none',
    fontFamily: 'inherit', color: '#0F172A', boxSizing: 'border-box',
    transition: 'border-color .15s ease',
  }
  const label: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase',
    letterSpacing: '0.05em', display: 'block', marginBottom: 6,
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 64, gap: 12 }}>
        <Loader2 size={30} className="ep-spin" style={{ color: '#0EA5E9' }} />
        <p style={{ color: '#94A3B8', fontSize: 13 }}>Loading profile...</p>
        <style>{`@keyframes epspin{to{transform:rotate(360deg)}} .ep-spin{animation:epspin .8s linear infinite}`}</style>
      </div>
    )
  }

  return (
    <div className="ep-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes epspin { to { transform: rotate(360deg) } }
        @keyframes epFade { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .ep-spin { animation: epspin .8s linear infinite; }
        .ep-fu { animation: epFade .35s ease both; }

        .ep-page { font-family:'DM Sans',sans-serif; font-size:14px; }
        .ep-input:focus { border-color: #0EA5E9 !important; box-shadow: 0 0 0 3px rgba(14,165,233,.12); }
        .ep-save-btn { transition: transform .15s ease, opacity .15s ease; }
        .ep-save-btn:hover { transform: translateY(-1px); }
        .ep-save-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
        .ep-skill-chip { transition: background .15s ease; }
        .ep-avatar-btn { transition: transform .15s ease; }
        .ep-avatar-btn:hover { transform: scale(1.05); }
        .ep-toggle { transition: color .2s ease; cursor: pointer; }

        .ep-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: start; }
        .ep-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }

        @media (max-width: 900px) {
          .ep-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .ep-page { font-size: 13px; }
          .ep-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="ep-fu" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>My Profile</h1>
        <p style={{ color: '#94A3B8', fontSize: 13, margin: '4px 0 0' }}>Manage your public profile, skills, and availability.</p>
      </div>

      <div className="ep-grid">
        {/* Left column — avatar + summary */}
        <div className="ep-fu" style={{ background: '#fff', borderRadius: 18, border: '1px solid #F1F5F9', padding: 24, textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 16px' }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
              background: 'linear-gradient(135deg,#0B1C3D,#1A3A7A)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#fff',
              fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 32,
            }}>
              {avatarSrc
                  ? <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials
                }
            </div>
            <button
              className="ep-avatar-btn"
              onClick={handleAvatarClick}
              disabled={avatarMutation.isPending}
              style={{
                position: 'absolute', bottom: -2, right: -2, width: 30, height: 30, borderRadius: '50%',
                background: '#0EA5E9', border: '2.5px solid #fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#fff',
              }}
              title="Change photo"
            >
              {avatarMutation.isPending ? <Loader2 size={13} className="ep-spin" /> : <Camera size={13} />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>

          <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 17, color: '#0F172A', margin: '0 0 3px' }}>
            {me?.first_name || me?.last_name ? `${me?.first_name} ${me?.last_name}` : me?.email}
          </p>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 12px' }}>{me?.email}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 11px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, background: levelCfg.bg, color: levelCfg.color }}>
              <Award size={12} strokeWidth={2.4} /> {levelCfg.label}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 }}>
            <Star size={15} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15, color: '#0F172A' }}>
              {Number(ep?.rating || 0).toFixed(2)}
            </span>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>({ep?.total_reviews || 0} reviews)</span>
          </div>

          <button
            className="ep-toggle"
            onClick={() => {
              const next = { ...expertForm, is_available: !expertForm.is_available }
              setExpertForm(next)
              expertMutation.mutate(next)
            }}
            disabled={expertMutation.isPending}
            style={{
              marginTop: 16, width: '100%', padding: '10px', borderRadius: 10, border: 'none',
              background: expertForm.is_available ? '#F0FDF4' : '#FEF2F2',
              color: expertForm.is_available ? '#059669' : '#DC2626',
              fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {expertForm.is_available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {expertForm.is_available ? 'Available for projects' : 'Not available'}
          </button>
        </div>

        {/* Right column — forms + stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stats */}
          <div className="ep-fu" style={{ background: '#fff', borderRadius: 18, border: '1px solid #F1F5F9', padding: 22 }}>
            <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: '#0F172A', margin: '0 0 14px' }}>Performance</p>
            <div className="ep-stats-grid">
              {[
                { icon: CheckCircle2, label: 'Completed', value: ep?.completed_projects ?? 0, color: '#2563EB', bg: '#EFF6FF' },
                { icon: TrendingUp, label: 'Success Rate', value: `${Number(ep?.success_rate || 0).toFixed(0)}%`, color: '#059669', bg: '#F0FDF4' },
                { icon: DollarSign, label: 'Total Earned', value: `TSH ${Number(ep?.total_earned || 0).toLocaleString('en-US')}`, color: '#D97706', bg: '#FFFBEB' },
                { icon: Percent, label: 'Commission', value: `${Number(ep?.commission_rate || 0).toFixed(0)}%`, color: '#7C3AED', bg: '#F5F3FF' },
              ].map(s => (
                <div key={s.label} style={{ background: '#FAFAFA', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <s.icon size={15} strokeWidth={2.2} />
                  </div>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15, color: '#0F172A', margin: '0 0 2px', wordBreak: 'break-word' }}>{s.value}</p>
                  <p style={{ fontSize: 10.5, color: '#94A3B8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Basic info form */}
          <div className="ep-fu" style={{ background: '#fff', borderRadius: 18, border: '1px solid #F1F5F9', padding: 22 }}>
            <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: '#0F172A', margin: '0 0 16px' }}>Basic Information</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={label}><UserIcon size={11} style={{ verticalAlign: -1, marginRight: 3 }} />First Name</label>
                <input className="ep-input" style={inp} value={basicForm.first_name} onChange={e => setBasicForm(p => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div>
                <label style={label}>Last Name</label>
                <input className="ep-input" style={inp} value={basicForm.last_name} onChange={e => setBasicForm(p => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={label}><Phone size={11} style={{ verticalAlign: -1, marginRight: 3 }} />Phone</label>
                <input className="ep-input" style={inp} value={basicForm.phone} onChange={e => setBasicForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label style={label}><MessageCircle size={11} style={{ verticalAlign: -1, marginRight: 3 }} />WhatsApp</label>
                <input className="ep-input" style={inp} value={basicForm.whatsapp} onChange={e => setBasicForm(p => ({ ...p, whatsapp: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={label}><Globe size={11} style={{ verticalAlign: -1, marginRight: 3 }} />Country</label>
              <input className="ep-input" style={{ ...inp, maxWidth: 300 }} value={basicForm.country} onChange={e => setBasicForm(p => ({ ...p, country: e.target.value }))} />
            </div>
            <button
              className="ep-save-btn"
              onClick={() => basicMutation.mutate(basicForm)}
              disabled={basicMutation.isPending}
              style={{ padding: '10px 20px', borderRadius: 10, background: '#0B1C3D', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {basicMutation.isPending ? <Loader2 size={14} className="ep-spin" /> : <Save size={14} />} Save Changes
            </button>
          </div>

          {/* Expert profile form */}
          <div className="ep-fu" style={{ background: '#fff', borderRadius: 18, border: '1px solid #F1F5F9', padding: 22 }}>
            <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: '#0F172A', margin: '0 0 16px' }}>Expert Profile</p>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>Bio</label>
              <textarea
                className="ep-input"
                style={{ ...inp, minHeight: 90, resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="Tell clients about your expertise, experience, and what makes you a great fit..."
                value={expertForm.bio}
                onChange={e => setExpertForm(p => ({ ...p, bio: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={label}>Skills</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  className="ep-input"
                  style={inp}
                  placeholder="e.g. MATLAB, ANSYS, Proteus..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                />
                <button
                  onClick={addSkill}
                  style={{ padding: '0 16px', borderRadius: 10, background: '#EFF6FF', color: '#2563EB', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, flexShrink: 0 }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {expertForm.skills.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#CBD5E1', margin: 0, fontStyle: 'italic' }}>No skills added yet.</p>
                ) : expertForm.skills.map(s => (
                  <span key={s} className="ep-skill-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 6px 5px 12px', borderRadius: 999, background: '#F1F5F9', fontSize: 12, color: '#475569', fontWeight: 600 }}>
                    {s}
                    <button onClick={() => removeSkill(s)} style={{ background: '#E2E8F0', border: 'none', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
                      <X size={10} strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              className="ep-save-btn"
              onClick={() => expertMutation.mutate(expertForm)}
              disabled={expertMutation.isPending}
              style={{ padding: '10px 20px', borderRadius: 10, background: '#0B1C3D', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {expertMutation.isPending ? <Loader2 size={14} className="ep-spin" /> : <Save size={14} />} Save Expert Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}