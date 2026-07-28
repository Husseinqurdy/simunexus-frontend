import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/client'
import toast from 'react-hot-toast'
import { authStyles, GSHLogo } from '../auth/_shared'

const SOFTWARE = [
  { value: 'matlab',   label: 'MATLAB / Simulink', icon: 'M'  },
  { value: 'proteus',  label: 'Proteus',            icon: 'P'  },
  { value: 'ansys',    label: 'ANSYS',              icon: 'A'  },
  { value: 'labview',  label: 'LabVIEW',            icon: 'L'  },
  { value: 'multisim', label: 'Multisim',           icon: 'Ms' },
  { value: 'pscad',    label: 'PSCAD',              icon: 'Ps' },
  { value: 'etap',     label: 'ETAP',               icon: 'E'  },
  { value: 'hfss',     label: 'HFSS',               icon: 'H'  },
  { value: 'cst',      label: 'CST Studio',         icon: 'C'  },
  { value: 'other',    label: 'Other',              icon: '?'  },
]

const DELIVERY = [
  { value: 'standard', label: 'Standard', desc: 'Flexible deadline',   color: '#64748B', badge: 'Best price' },
  { value: 'urgent',   label: 'Urgent',   desc: '24 hours delivery',   color: '#F59E0B', badge: '2× price'  },
  { value: 'express',  label: 'Express',  desc: '6–12 hours delivery', color: '#EF4444', badge: '3× price'  },
]

type FormData = {
  first_name: string
  last_name: string
  email: string
  phone: string
  title: string
  description: string
  software_version: string
  deadline: string
  is_nda: boolean
  include_explanation: boolean
  payment_type: string
}

export default function SubmitProjectPublicPage() {
  const [step, setStep]             = useState(1)
  const [done, setDone]             = useState(false)
  const [selectedSw, setSelectedSw] = useState('')
  const [selectedDel, setSelectedDel] = useState('standard')
  const [swError, setSwError]       = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, formState: { errors }, setValue, trigger } = useForm<FormData>({
    defaultValues: { payment_type: 'full', is_nda: false, include_explanation: false }
  })

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const fd = new FormData()
      // Contact info
      fd.append('email',      data.email)
      fd.append('first_name', data.first_name || '')
      fd.append('last_name',  data.last_name  || '')
      fd.append('phone',      data.phone      || '')
      // Project info
      fd.append('title',               data.title)
      fd.append('description',          data.description)
      fd.append('software',             selectedSw)
      fd.append('software_version',     data.software_version || '')
      fd.append('deadline',             data.deadline)
      fd.append('delivery_type',        selectedDel)
      fd.append('payment_type',         data.payment_type)
      fd.append('is_nda',               String(data.is_nda))
      fd.append('include_explanation',  String(data.include_explanation))
      // Files
      attachedFiles.forEach(f => fd.append('files', f))
      const res = await authApi.submitWithAccount(fd)
      return res.data
    },
    onSuccess: (res) => {
      setDone(true)
      toast.success(res.account_created
        ? 'Project submitted! Check your email to set your password.'
        : 'Project submitted! Login to track it.')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.error || e.response?.data?.detail || 'Submission failed. Please try again.')
    },
  })

  const goNext = async () => {
    let fields: (keyof FormData)[] = []
    if (step === 1) fields = ['first_name', 'email', 'phone', 'title', 'description']
    if (step === 2) {
      if (!selectedSw) { setSwError(true); return }
      setSwError(false)
      fields = ['deadline']
    }
    const valid = await trigger(fields)
    if (valid) setStep(s => s + 1)
  }

  // ── Success screen ──
  if (done) return (
    <div style={{ minHeight: '100vh', background: '#0B1C3D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} className="hgrid ap">
      <style>{authStyles}</style>
      <div className="au" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: '56px 40px', maxWidth: 480, width: '100%', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
        <div style={{ width: 80, height: 80, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
        </div>
        <h2 className="dp" style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: '0 0 12px' }}>Project Submitted!</h2>
        <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.7, margin: '0 0 32px' }}>
          We've received your project and are reviewing it now.<br />
          Check your email — we've sent you a link to set your password and access your dashboard.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0EA5E9', color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 12, textDecoration: 'none' }}>
            Go to Login →
          </Link>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.7)', fontSize: 14, padding: '12px 20px', borderRadius: 12, textDecoration: 'none', border: '1px solid rgba(255,255,255,.1)' }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0B1C3D', padding: '0 0 48px' }} className="hgrid ap">
      <style>{authStyles}</style>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Nav */}
      <div style={{ background: 'rgba(11,28,61,.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <GSHLogo size={30} />
          <span className="dp" style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Global Simulation Hub</span>
        </Link>
        <Link to="/login" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none' }}>
          Already have account? <span style={{ color: '#0EA5E9' }}>Login</span>
        </Link>
      </div>

      <div style={{ maxWidth: 680, margin: '48px auto 0', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 className="dp" style={{ color: '#fff', fontSize: 36, fontWeight: 800, margin: '0 0 10px' }}>Submit Your Project</h1>
          <p style={{ color: '#64748B', fontSize: 15 }}>No account needed — we'll set everything up for you automatically.</p>
        </div>

        {/* Progress steps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
          {['Your Info', 'Project Details', 'Delivery & Payment'].map((label, i) => {
            const n = i + 1
            const isActive = step === n
            const isDone = step > n
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, transition: 'all .3s', background: isDone ? '#10B981' : isActive ? '#0EA5E9' : 'rgba(255,255,255,.06)', border: `2px solid ${isDone ? '#10B981' : isActive ? '#0EA5E9' : 'rgba(255,255,255,.1)'}`, color: isDone || isActive ? '#fff' : '#64748B' }}>
                    {isDone ? '✓' : n}
                  </div>
                  <span style={{ fontSize: 11, color: isActive ? '#0EA5E9' : isDone ? '#10B981' : '#334155', marginTop: 6, whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 400 }}>{label}</span>
                </div>
                {i < 2 && <div style={{ width: 60, height: 1, background: step > n + 1 ? '#10B981' : step > n ? 'rgba(14,165,233,.4)' : 'rgba(255,255,255,.06)', margin: '0 8px', marginBottom: 20, flexShrink: 0 }} />}
              </div>
            )
          })}
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit(d => mutation.mutate({ ...d, software: selectedSw, delivery_type: selectedDel } as any))}>
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: '36px 32px', backdropFilter: 'blur(12px)' }}>

            {/* ── STEP 1: Your Info + Project basics ── */}
            {step === 1 && (
              <div>
                <h2 className="dp" style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Your Information</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div className="afield">
                    <label>First Name</label>
                    <input {...register('first_name')} placeholder="John" />
                  </div>
                  <div className="afield">
                    <label>Last Name</label>
                    <input {...register('last_name')} placeholder="Doe" />
                  </div>
                </div>

                <div className="afield" style={{ marginBottom: 14 }}>
                  <label>Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    </span>
                    <input {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })} type="email" placeholder="you@example.com" style={{ paddingLeft: 38 }} />
                  </div>
                  {errors.email && <p className="err">{String(errors.email.message)}</p>}
                </div>

                <div className="afield" style={{ marginBottom: 14 }}>
                  <label>Phone / WhatsApp *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                    </span>
                    <input {...register('phone', { required: 'Phone required' })} placeholder="+255 7XX XXX XXX" style={{ paddingLeft: 38 }} />
                  </div>
                  {errors.phone && <p className="err">{String(errors.phone.message)}</p>}
                </div>

                <div className="afield" style={{ marginBottom: 14 }}>
                  <label>Project Title *</label>
                  <input {...register('title', { required: 'Title required' })} placeholder="e.g. DC Motor Speed Control Simulation" />
                  {errors.title && <p className="err">{String(errors.title.message)}</p>}
                </div>

                <div className="afield" style={{ marginBottom: 0 }}>
                  <label>Project Description *</label>
                  <textarea {...register('description', { required: 'Description required', minLength: { value: 20, message: 'Min 20 characters' } })} rows={4} placeholder="Describe exactly what simulation you need, specific requirements, expected outputs, etc." style={{ resize: 'vertical' }} />
                  {errors.description && <p className="err">{String(errors.description.message)}</p>}
                </div>

                <div style={{ background: 'rgba(14,165,233,.06)', border: '1px solid rgba(14,165,233,.15)', borderRadius: 10, padding: '10px 14px', marginTop: 16, fontSize: 12, color: '#7DD3FC' }}>
                  🔒 We'll create your account automatically and send a <strong>set password link</strong> to your email.
                </div>
              </div>
            )}

            {/* ── STEP 2: Project Details ── */}
            {step === 2 && (
              <div>
                <h2 className="dp" style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Project Details</h2>

                {/* Software */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: swError ? '#EF4444' : '#64748B', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Simulation Software * {swError && <span style={{ textTransform: 'none', fontWeight: 700 }}>— Please select one</span>}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                    {SOFTWARE.map(sw => (
                      <button key={sw.value} type="button" onClick={() => { setSelectedSw(sw.value); setSwError(false) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', borderRadius: 12, border: `1.5px solid ${selectedSw === sw.value ? '#0EA5E9' : swError ? 'rgba(239,68,68,.4)' : 'rgba(255,255,255,.08)'}`, background: selectedSw === sw.value ? 'rgba(14,165,233,.08)' : 'rgba(255,255,255,.02)', cursor: 'pointer', transition: 'all .2s' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: selectedSw === sw.value ? '#0EA5E9' : 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedSw === sw.value ? '#fff' : '#64748B', fontWeight: 800, fontSize: 11, fontFamily: 'Syne,sans-serif' }}>{sw.icon}</div>
                        <span style={{ fontSize: 10, color: selectedSw === sw.value ? '#38BDF8' : '#64748B', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{sw.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div className="afield">
                    <label>Software Version</label>
                    <input {...register('software_version')} placeholder="e.g. R2024a, v8.0" />
                  </div>
                  <div className="afield">
                    <label>Deadline *</label>
                    <input {...register('deadline', { required: 'Deadline required' })} type="datetime-local" min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)} />
                    {errors.deadline && <p className="err">{String(errors.deadline.message)}</p>}
                  </div>
                </div>

                {/* File attachment */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Attach Files <span style={{ color: '#334155', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                  </label>
                  <label
                    htmlFor="fileup"
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1.5px dashed rgba(255,255,255,.1)', borderRadius: 12, cursor: 'pointer', transition: 'all .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(14,165,233,.4)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)')}
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#64748B" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#94A3B8', fontSize: 13, margin: 0, fontWeight: 500 }}>
                        {attachedFiles.length > 0 ? `${attachedFiles.length} file(s) selected` : 'Click to attach files'}
                      </p>
                      <p style={{ color: '#334155', fontSize: 11, margin: 0 }}>PDF, MATLAB files, schematics, specs...</p>
                    </div>
                    {attachedFiles.length > 0 && (
                      <button type="button" onClick={e => { e.preventDefault(); setAttachedFiles([]); if (fileInputRef.current) fileInputRef.current.value = '' }}
                        style={{ background: 'rgba(239,68,68,.1)', border: 'none', borderRadius: 6, color: '#EF4444', fontSize: 11, fontWeight: 700, padding: '3px 8px', cursor: 'pointer' }}>
                        Clear
                      </button>
                    )}
                    <input
                      id="fileup"
                      ref={fileInputRef}
                      type="file"
                      multiple
                      style={{ display: 'none' }}
                      onChange={e => setAttachedFiles(Array.from(e.target.files || []))}
                    />
                  </label>
                  {/* File list */}
                  {attachedFiles.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {attachedFiles.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,.06)' }}>
                          <span style={{ fontSize: 12, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>📎 {f.name}</span>
                          <span style={{ fontSize: 11, color: '#475569', flexShrink: 0, marginLeft: 8 }}>{(f.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#94A3B8' }}>
                    <input {...register('is_nda')} type="checkbox" style={{ accentColor: '#0EA5E9' }} />
                    🔒 NDA / Confidential
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#94A3B8' }}>
                    <input {...register('include_explanation')} type="checkbox" style={{ accentColor: '#0EA5E9' }} />
                    📖 Include explanation
                  </label>
                </div>
              </div>
            )}

            {/* ── STEP 3: Delivery & Payment ── */}
            {step === 3 && (
              <div>
                <h2 className="dp" style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Delivery & Payment</h2>
                <div style={{ background: 'rgba(14,165,233,.06)', border: '1px solid rgba(14,165,233,.15)', borderRadius: 12, padding: '10px 14px', marginBottom: 24, fontSize: 12, color: '#7DD3FC' }}>
                  💡 <strong>Tip:</strong> Longer deadline = lower cost. Express delivery = 3× standard price.
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 12 }}>Delivery Type</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {DELIVERY.map(d => (
                      <button key={d.value} type="button" onClick={() => setSelectedDel(d.value)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 14, border: `1.5px solid ${selectedDel === d.value ? d.color : 'rgba(255,255,255,.08)'}`, background: selectedDel === d.value ? d.color + '12' : 'rgba(255,255,255,.02)', cursor: 'pointer', transition: 'all .2s', textAlign: 'left' }}>
                        <div>
                          <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0, fontFamily: 'Syne,sans-serif' }}>{d.label}</p>
                          <p style={{ color: '#64748B', fontSize: 12, margin: 0 }}>{d.desc}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ padding: '4px 10px', borderRadius: 999, background: d.color + '20', color: d.color, fontSize: 11, fontWeight: 700, border: `1px solid ${d.color}30` }}>{d.badge}</span>
                          {selectedDel === d.value && <span style={{ width: 20, height: 20, borderRadius: '50%', background: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 12 }}>Payment Preference</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { value: 'full',    label: 'Full Payment', desc: 'Pay everything upfront'      },
                      { value: 'partial', label: '50/50 Split',  desc: '50% now, 50% on delivery'   },
                    ].map(p => {
                      const sel = watch('payment_type') === p.value
                      return (
                        <button key={p.value} type="button" onClick={() => setValue('payment_type', p.value)} style={{ padding: '14px', borderRadius: 14, border: `1.5px solid ${sel ? '#0EA5E9' : 'rgba(255,255,255,.08)'}`, background: sel ? 'rgba(14,165,233,.08)' : 'rgba(255,255,255,.02)', cursor: 'pointer', textAlign: 'left', transition: 'all .2s', position: 'relative' }}>
                          {sel && <span style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
                          <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: '0 0 3px', fontFamily: 'Syne,sans-serif' }}>{p.label}</p>
                          <p style={{ color: '#64748B', fontSize: 12, margin: 0 }}>{p.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Summary */}
                <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: '18px 20px' }}>
                  <p style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', margin: '0 0 12px' }}>Order Summary</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      ['Software', selectedSw ? SOFTWARE.find(s => s.value === selectedSw)?.label : '—'],
                      ['Delivery', DELIVERY.find(d => d.value === selectedDel)?.label || 'Standard'],
                      ['Payment',  watch('payment_type') === 'partial' ? '50% advance + 50% on delivery' : 'Full payment'],
                      ['NDA',      watch('is_nda') ? 'Yes — confidential' : 'No'],
                      ...(attachedFiles.length > 0 ? [['Files', `${attachedFiles.length} file(s) attached`]] : []),
                    ].map(([k, v]) => (
                      <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#64748B' }}>{k}</span>
                        <span style={{ color: '#fff', fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={goNext} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: '#0EA5E9', color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>
                Continue <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </button>
            ) : (
              <button type="submit" disabled={mutation.isPending || !selectedSw} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: mutation.isPending || !selectedSw ? 'rgba(16,185,129,.4)' : '#10B981', color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, border: 'none', cursor: mutation.isPending || !selectedSw ? 'not-allowed' : 'pointer' }}>
                {mutation.isPending
                  ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} /> Submitting...</>
                  : <>Submit Project ✓</>
                }
              </button>
            )}
          </div>
        </form>

        <p style={{ textAlign: 'center', color: '#1E293B', fontSize: 12, marginTop: 24 }}>
          Already have an account? <Link to="/login" style={{ color: '#0EA5E9', textDecoration: 'none', fontWeight: 600 }}>Login here</Link>
        </p>
      </div>
    </div>
  )
}
