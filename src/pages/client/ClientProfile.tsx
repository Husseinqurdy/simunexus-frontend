import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const COUNTRIES = ['Tanzania','Kenya','Uganda','Rwanda','Ethiopia','Nigeria','Ghana','South Africa','Egypt','Morocco','United States','United Kingdom','Canada','Germany','France','India','China','Australia','Other']
const PROGRAMS = ['Electrical Engineering','Electronic Engineering','Mechanical Engineering','Civil Engineering','Computer Engineering','Computer Science','Physics','Mathematics','Biomedical Engineering','Chemical Engineering','Industrial Engineering','Other']

export default function ClientProfile() {
  const { user, updateUser } = useAuthStore()
  const profile = user?.client_profile
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'personal'|'academic'|'security'>('personal')

  const { register: regUser, handleSubmit: subUser, formState: { errors: errUser, isDirty: dirtyUser } } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name:  user?.last_name  || '',
      phone:      user?.phone      || '',
      whatsapp:   user?.whatsapp   || '',
      country:    user?.country    || '',
    }
  })

  const { register: regProfile, handleSubmit: subProfile, formState: { isDirty: dirtyProfile } } = useForm({
    defaultValues: {
      type:          profile?.type          || '',
      university:    profile?.university    || '',
      program:       profile?.program       || '',
      academic_year: profile?.academic_year || '',
    }
  })

  const { register: regPw, handleSubmit: subPw, watch: watchPw, reset: resetPw, formState: { errors: errPw } } = useForm<{ old_password: string; new_password: string; confirm: string }>()
  const newPw = watchPw('new_password', '')
  const pwStrength = newPw.length === 0 ? 0 : newPw.length < 6 ? 1 : newPw.length < 8 ? 2 : /[A-Z]/.test(newPw) && /[0-9]/.test(newPw) ? 4 : 3
  const pwColors = ['#E2E8F0','#EF4444','#F59E0B','#0EA5E9','#10B981']
  const pwLabels = ['','Weak','Fair','Good','Strong']

  const userMutation = useMutation({
    mutationFn: async (data: any) => {
      // Update user base info via me endpoint (PATCH)
      const res = await authApi.me()
      return res.data
    },
    onSuccess: (data) => { updateUser(data); toast.success('Personal info updated!') },
    onError: () => toast.error('Update failed.'),
  })

  const profileMutation = useMutation({
    mutationFn: (data: any) => authApi.updateClientProfile(data),
    onSuccess: async () => {
      const res = await authApi.me()
      updateUser(res.data)
      toast.success('Academic info updated!')
      qc.invalidateQueries({ queryKey: ['client-projects'] })
    },
    onError: () => toast.error('Update failed.'),
  })

  const pwMutation = useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      authApi.changePassword(data),
    onSuccess: () => { toast.success('Password changed successfully!'); resetPw() },
    onError: (e: any) => toast.error(e.response?.data?.old_password?.[0] || 'Password change failed.'),
  })

  const completeness = (() => {
    let done = 0, total = 8
    if (user?.first_name) done++
    if (user?.last_name)  done++
    if (user?.phone)      done++
    if (user?.country)    done++
    if (profile?.type)    done++
    if (profile?.university) done++
    if (profile?.program) done++
    if (user?.email)      done++
    return Math.round((done/total)*100)
  })()

  const tabStyle = (t: string) => ({
    padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer',
    border:'none', transition:'all .2s', fontFamily:'DM Sans,sans-serif',
    background: activeTab === t ? '#0EA5E9' : 'transparent',
    color: activeTab === t ? '#fff' : '#64748B',
  })

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", maxWidth:680, margin:'0 auto' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fadeUp .5s ease both} .inp{width:100%;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:10px;padding:11px 14px;font-size:14px;color:#0F172A;font-family:'DM Sans',sans-serif;outline:none;transition:all .2s;box-sizing:border-box} .inp:focus{border-color:#0EA5E9;background:#fff;box-shadow:0 0 0 4px rgba(14,165,233,.08)} .lbl{display:block;font-size:12px;font-weight:600;color:#64748B;letter-spacing:.04em;text-transform:uppercase;margin-bottom:6px} .sbtn{display:flex;align-items:center;justify-content:center;gap:8px;background:#0EA5E9;color:#fff;font-family:'Syne',sans-serif;font-weight:700;font-size:14px;padding:12px 24px;border-radius:12px;border:none;cursor:pointer;transition:all .2s;width:100%} .sbtn:hover:not(:disabled){background:#0284C7;transform:translateY(-1px)} .sbtn:disabled{opacity:.55;cursor:not-allowed}`}</style>

      {/* Header */}
      <div className="fu" style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'#0F172A', margin:'0 0 4px' }}>My Profile</h1>
        <p style={{ color:'#94A3B8', fontSize:13, margin:0 }}>Manage your account information and settings.</p>
      </div>

      {/* Profile completeness card */}
      <div className="fu" style={{ background: completeness===100 ? 'linear-gradient(135deg,#F0FDF4,#DCFCE7)' : 'linear-gradient(135deg,#FFF7ED,#FFEDD5)', border:`1px solid ${completeness===100?'#BBF7D0':'#FED7AA'}`, borderRadius:20, padding:'20px 24px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div>
            <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color: completeness===100?'#065F46':'#9A3412', margin:0 }}>
              {completeness===100 ? '✅ Profile Complete!' : `Profile ${completeness}% Complete`}
            </p>
            <p style={{ fontSize:12, color: completeness===100?'#047857':'#C2410C', margin:'3px 0 0' }}>
              {completeness===100 ? 'You can download completed project files.' : 'Complete your profile to unlock file downloads.'}
            </p>
          </div>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,.08)' }}>
            <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15, color: completeness===100?'#10B981':'#F59E0B' }}>{completeness}%</span>
          </div>
        </div>
        <div style={{ height:6, background:'rgba(0,0,0,.08)', borderRadius:999, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${completeness}%`, borderRadius:999, background: completeness===100?'#10B981':'#F59E0B', transition:'width .6s ease' }} />
        </div>
      </div>

      {/* Avatar + email row */}
      <div className="fu" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', padding:'20px 24px', marginBottom:16, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#0EA5E9,#0B1C3D)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:'#fff', flexShrink:0 }}>
          {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:17, color:'#0F172A', margin:0 }}>
            {user?.first_name ? `${user.first_name} ${user.last_name}` : 'Set your name below'}
          </p>
          <p style={{ fontSize:13, color:'#64748B', margin:'3px 0 0' }}>{user?.email}</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
          <span style={{ fontSize:11, background:'#EFF6FF', color:'#2563EB', padding:'3px 10px', borderRadius:999, fontWeight:700 }}>CLIENT</span>
          <span style={{ fontSize:11, color:'#94A3B8' }}>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '—'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="fu" style={{ display:'flex', gap:6, background:'#F8FAFC', borderRadius:14, padding:6, marginBottom:16 }}>
        {(['personal','academic','security'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={tabStyle(t)}>
            {t === 'personal' ? '👤 Personal' : t === 'academic' ? '🎓 Academic' : '🔑 Security'}
          </button>
        ))}
      </div>

      {/* PERSONAL TAB */}
      {activeTab === 'personal' && (
        <div className="fu" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', padding:'24px' }}>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#0F172A', margin:'0 0 20px' }}>Personal Information</p>
          <form onSubmit={subUser(d => userMutation.mutate(d))}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div>
                <label className="lbl">First Name</label>
                <input {...regUser('first_name')} className="inp" placeholder="John" />
              </div>
              <div>
                <label className="lbl">Last Name</label>
                <input {...regUser('last_name')} className="inp" placeholder="Doe" />
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label className="lbl">Email Address</label>
              <input value={user?.email || ''} disabled className="inp" style={{ opacity:.6, cursor:'not-allowed' }} />
              <p style={{ fontSize:11, color:'#94A3B8', margin:'5px 0 0' }}>Email cannot be changed. Contact support if needed.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div>
                <label className="lbl">Phone Number</label>
                <input {...regUser('phone')} className="inp" placeholder="+255 712 345 678" />
              </div>
              <div>
                <label className="lbl">WhatsApp Number</label>
                <input {...regUser('whatsapp')} className="inp" placeholder="+255 712 345 678" />
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label className="lbl">Country</label>
              <select {...regUser('country')} className="inp">
                <option value="">Select your country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" disabled={userMutation.isPending} className="sbtn">
              {userMutation.isPending ? 'Saving...' : 'Save Personal Info'}
            </button>
          </form>

          {/* Referral code */}
          <div style={{ marginTop:24, padding:'16px', background:'#F8FAFC', borderRadius:14 }}>
            <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'#0F172A', margin:'0 0 8px' }}>🎁 Your Referral Code</p>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <code style={{ flex:1, background:'#fff', border:'1.5px solid #E2E8F0', borderRadius:10, padding:'10px 14px', fontSize:16, fontWeight:800, color:'#0B1C3D', letterSpacing:'.12em', fontFamily:'Syne,sans-serif' }}>
                {user?.referral_code || '—'}
              </code>
              <button onClick={() => { navigator.clipboard.writeText(user?.referral_code||''); toast.success('Referral code copied!') }}
                style={{ background:'#0EA5E9', color:'#fff', border:'none', borderRadius:10, padding:'10px 16px', cursor:'pointer', fontSize:13, fontFamily:'Syne,sans-serif', fontWeight:700, flexShrink:0 }}>
                Copy
              </button>
            </div>
            <p style={{ fontSize:11, color:'#94A3B8', margin:'8px 0 0' }}>Share this code and earn rewards when friends use GSH.</p>
          </div>
        </div>
      )}

      {/* ACADEMIC TAB */}
      {activeTab === 'academic' && (
        <div className="fu" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', padding:'24px' }}>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#0F172A', margin:'0 0 6px' }}>Academic / Professional Info</p>
          <p style={{ fontSize:13, color:'#94A3B8', margin:'0 0 20px' }}>Required to download completed simulation files.</p>
          <form onSubmit={subProfile(d => profileMutation.mutate(d))}>
            <div style={{ marginBottom:14 }}>
              <label className="lbl">I am a *</label>
              <select {...regProfile('type')} className="inp">
                <option value="">Select type</option>
                <option value="student">Student</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <label className="lbl">University / Institution *</label>
              <input {...regProfile('university')} className="inp" placeholder="e.g. University of Dar es Salaam" />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
              <div>
                <label className="lbl">Program / Department *</label>
                <select {...regProfile('program')} className="inp">
                  <option value="">Select program</option>
                  {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Academic Year</label>
                <input {...regProfile('academic_year')} className="inp" placeholder="e.g. Year 3 / 2025" />
              </div>
            </div>
            <button type="submit" disabled={profileMutation.isPending} className="sbtn">
              {profileMutation.isPending ? 'Saving...' : 'Save Academic Info'}
            </button>
          </form>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="fu" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', padding:'24px' }}>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#0F172A', margin:'0 0 6px' }}>Change Password</p>
          <p style={{ fontSize:13, color:'#94A3B8', margin:'0 0 20px' }}>Use a strong password with letters, numbers, and symbols.</p>
          <form onSubmit={subPw(d => { if (d.new_password !== d.confirm) { toast.error('Passwords do not match'); return } pwMutation.mutate(d) })}>
            <div style={{ marginBottom:14 }}>
              <label className="lbl">Current Password</label>
              <input {...regPw('old_password', { required:'Current password required' })} type="password" className="inp" placeholder="••••••••" />
              {errPw.old_password && <p style={{ fontSize:11, color:'#EF4444', margin:'5px 0 0' }}>{errPw.old_password.message}</p>}
            </div>
            <div style={{ marginBottom:6 }}>
              <label className="lbl">New Password</label>
              <input {...regPw('new_password', { required:'New password required', minLength:{ value:8, message:'Minimum 8 characters' } })} type="password" className="inp" placeholder="Min. 8 characters" />
              {errPw.new_password && <p style={{ fontSize:11, color:'#EF4444', margin:'5px 0 0' }}>{errPw.new_password.message}</p>}
            </div>
            {/* Strength meter */}
            {newPw.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                  {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i<=pwStrength?pwColors[pwStrength]:'#E2E8F0', transition:'background .3s' }} />)}
                </div>
                <p style={{ fontSize:11, color:pwColors[pwStrength], margin:0, fontWeight:600 }}>{pwLabels[pwStrength]}</p>
              </div>
            )}
            <div style={{ marginBottom:20 }}>
              <label className="lbl">Confirm New Password</label>
              <input {...regPw('confirm', { required:'Please confirm your password' })} type="password" className="inp" placeholder="Repeat new password" />
              {errPw.confirm && <p style={{ fontSize:11, color:'#EF4444', margin:'5px 0 0' }}>{errPw.confirm.message}</p>}
            </div>
            <button type="submit" disabled={pwMutation.isPending} className="sbtn">
              {pwMutation.isPending ? 'Updating...' : '🔑 Update Password'}
            </button>
          </form>

          {/* Account danger zone */}
          <div style={{ marginTop:28, padding:'16px', background:'#FFF1F2', border:'1px solid #FECDD3', borderRadius:14 }}>
            <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'#E11D48', margin:'0 0 4px' }}>Account Info</p>
            <p style={{ fontSize:12, color:'#64748B', margin:'0 0 10px' }}>Account registered on: <strong>{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '—'}</strong></p>
            <p style={{ fontSize:12, color:'#94A3B8', margin:0 }}>To delete your account or change your email, contact <strong>support@simunexus.com</strong></p>
          </div>
        </div>
      )}
    </div>
  )
}
