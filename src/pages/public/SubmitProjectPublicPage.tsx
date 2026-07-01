import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { projectApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const SOFTWARE = [
  { value: 'matlab',   label: 'MATLAB / Simulink', icon: 'M' },
  { value: 'proteus',  label: 'Proteus',            icon: 'P' },
  { value: 'ansys',    label: 'ANSYS',              icon: 'A' },
  { value: 'labview',  label: 'LabVIEW',            icon: 'L' },
  { value: 'multisim', label: 'Multisim',           icon: 'Ms' },
  { value: 'pscad',    label: 'PSCAD',              icon: 'Ps' },
  { value: 'etap',     label: 'ETAP',               icon: 'E' },
  { value: 'hfss',     label: 'HFSS',               icon: 'H' },
  { value: 'cst',      label: 'CST Studio',         icon: 'C' },
  { value: 'other',    label: 'Other',              icon: '?' },
]

const DELIVERY = [
  { value: 'standard', label: 'Standard',  desc: 'Flexible deadline',   color: '#64748B', badge: 'Best price' },
  { value: 'urgent',   label: 'Urgent',    desc: '24 hours delivery',   color: '#F59E0B', badge: '2× price'  },
  { value: 'express',  label: 'Express',   desc: '6–12 hours delivery', color: '#EF4444', badge: '3× price'  },
]

type FormData = {
  title: string
  description: string
  software_version: string
  deadline: string
  is_nda: boolean
  include_explanation: boolean
  payment_type: string
}

export default function ClientSubmitProject() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [step, setStep] = useState(1)
  const [selectedSw, setSelectedSw] = useState('')
  const [selectedDel, setSelectedDel] = useState('standard')
  const [swError, setSwError] = useState(false)

  const {
    register, watch, setValue, trigger, getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { payment_type: 'full', is_nda: false, include_explanation: false },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      projectApi.create({
        title:               data.title,
        description:         data.description,
        software:            selectedSw,
        software_version:    data.software_version || '',
        deadline:            data.deadline,
        delivery_type:       selectedDel,
        payment_type:        data.payment_type,
        is_nda:              data.is_nda,
        include_explanation: data.include_explanation,
      }),
    onSuccess: () => {
      toast.success('✅ Project submitted! We\'ll review it and set a price shortly.')
      navigate('/client/projects')
    },
    onError: (e: any) => {
      const msg = e.response?.data?.error || e.response?.data?.detail || 'Submission failed. Try again.'
      toast.error(msg)
    },
  })

  const goStep2 = async () => {
    const ok = await trigger(['title', 'description'])
    if (!ok) return
    if (!selectedSw) { setSwError(true); return }
    setSwError(false)
    setStep(2)
  }

  const goStep3 = async () => {
    const ok = await trigger(['deadline'])
    if (!ok) return
    const deadline = getValues('deadline')
    if (deadline && new Date(deadline) <= new Date()) {
      toast.error('Deadline must be in the future.')
      return
    }
    setStep(3)
  }

  const handleSubmit = () => {
    if (!selectedSw) { toast.error('Please select a software.'); return }
    mutation.mutate(getValues())
  }

  // Step indicators
  const STEPS = ['Project Info', 'Technical Details', 'Delivery & Payment']

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", maxWidth: 700, margin: '0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fadeUp .3s ease both}`}</style>

      {/* Header */}
      <div className="fu" style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
          Submit New Project
        </h1>
        <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>
          Submitting as <strong style={{ color: '#0F172A' }}>{user?.first_name} {user?.last_name}</strong> · {user?.email}
        </p>
      </div>

      {/* Step indicators */}
      <div className="fu" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 28 }}>
        {STEPS.map((label, i) => {
          const n = i + 1
          const isActive = step === n
          const isDone = step > n
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 700, fontSize: 12, transition: 'all .3s',
                  background: isDone ? '#10B981' : isActive ? '#0EA5E9' : '#F1F5F9',
                  color: isDone || isActive ? '#fff' : '#94A3B8',
                }}>
                  {isDone ? '✓' : n}
                </div>
                <span style={{ fontSize: 11, marginTop: 5, whiteSpace: 'nowrap', fontWeight: isActive ? 700 : 400, color: isActive ? '#0EA5E9' : isDone ? '#10B981' : '#94A3B8' }}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div style={{ flex: 1, height: 1.5, background: step > n ? '#10B981' : '#E2E8F0', margin: '0 10px', marginBottom: 22 }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Form card */}
      <div className="fu" style={{ background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9', padding: '32px 28px', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>

        {/* ── STEP 1: Project Info ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 20px' }}>Project Information</h2>

            {/* User info — readonly, just for display */}
            <div style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{user?.first_name} {user?.last_name}</p>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{user?.email}</p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 11, background: '#F0FDF4', color: '#059669', padding: '3px 10px', borderRadius: 999, fontWeight: 700, border: '1px solid #BBF7D0' }}>
                ✓ Logged in
              </span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Project Title *</label>
              <input
                {...register('title', { required: 'Project title is required' })}
                placeholder="e.g. DC Motor Speed Control Simulation"
                style={inputStyle}
              />
              {errors.title && <p style={errStyle}>{String(errors.title.message)}</p>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Project Description *</label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 20, message: 'Please describe your project in more detail (min 20 chars)' }
                })}
                rows={5}
                placeholder="Describe exactly what simulation you need, specific requirements, expected outputs, reference documents, etc."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              {errors.description && <p style={errStyle}>{String(errors.description.message)}</p>}
            </div>

            {/* Software selection */}
            <div>
              <label style={{ ...labelStyle, color: swError ? '#EF4444' : '#64748B' }}>
                Simulation Software * {swError && <span style={{ color: '#EF4444', fontWeight: 700, textTransform: 'none' }}>— Please select one</span>}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                {SOFTWARE.map(sw => (
                  <button
                    key={sw.value}
                    type="button"
                    onClick={() => { setSelectedSw(sw.value); setSwError(false) }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '10px 6px', borderRadius: 12, cursor: 'pointer', transition: 'all .2s',
                      border: `1.5px solid ${selectedSw === sw.value ? '#0EA5E9' : swError ? '#FCA5A5' : '#E2E8F0'}`,
                      background: selectedSw === sw.value ? '#EFF6FF' : '#FAFAFA',
                    }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, fontFamily: 'Syne,sans-serif', background: selectedSw === sw.value ? '#0EA5E9' : '#F1F5F9', color: selectedSw === sw.value ? '#fff' : '#64748B' }}>
                      {sw.icon}
                    </div>
                    <span style={{ fontSize: 10, color: selectedSw === sw.value ? '#0EA5E9' : '#64748B', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                      {sw.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Technical Details ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 20px' }}>Technical Details</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Software Version</label>
                <input {...register('software_version')} placeholder="e.g. R2024a, v8.0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Project Deadline *</label>
                <input
                  {...register('deadline', { required: 'Deadline is required' })}
                  type="datetime-local"
                  min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                  style={inputStyle}
                />
                {errors.deadline && <p style={errStyle}>{String(errors.deadline.message)}</p>}
              </div>
            </div>

            {/* File upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Attach Files <span style={{ color: '#CBD5E1', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <label htmlFor="fileup" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1.5px dashed #E2E8F0', borderRadius: 12, cursor: 'pointer', transition: 'all .2s', background: '#FAFAFA' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#BAE6FD')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
                <div>
                  <p style={{ color: '#475569', fontSize: 13, margin: 0, fontWeight: 500 }}>Click to attach files</p>
                  <p style={{ color: '#94A3B8', fontSize: 11, margin: 0 }}>PDF, MATLAB files, schematics, specs...</p>
                </div>
                <input id="fileup" {...register('file' as any)} type="file" multiple style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#475569' }}>
                <input {...register('is_nda')} type="checkbox" style={{ accentColor: '#0EA5E9' }} />
                🔒 NDA / Confidential
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#475569' }}>
                <input {...register('include_explanation')} type="checkbox" style={{ accentColor: '#0EA5E9' }} />
                📖 Include explanation
              </label>
            </div>
          </div>
        )}

        {/* ── STEP 3: Delivery & Payment ── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>Delivery & Payment</h2>
            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#0369A1' }}>
              💡 <strong>Tip:</strong> Longer deadline = lower cost. Admin will set the final price after reviewing your project.
            </div>

            {/* Delivery */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Delivery Type *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DELIVERY.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setSelectedDel(d.value)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                      border: `1.5px solid ${selectedDel === d.value ? d.color : '#E2E8F0'}`,
                      background: selectedDel === d.value ? d.color + '08' : '#FAFAFA',
                      transition: 'all .2s',
                    }}
                  >
                    <div>
                      <p style={{ color: '#0F172A', fontWeight: 700, fontSize: 13, margin: 0, fontFamily: 'Syne,sans-serif' }}>{d.label}</p>
                      <p style={{ color: '#64748B', fontSize: 12, margin: 0 }}>{d.desc}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ padding: '3px 8px', borderRadius: 999, background: d.color + '18', color: d.color, fontSize: 11, fontWeight: 700 }}>{d.badge}</span>
                      {selectedDel === d.value && <span style={{ width: 18, height: 18, borderRadius: '50%', background: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Payment Preference *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'full', label: 'Full Payment', desc: 'Pay everything upfront' },
                  { value: 'partial', label: '50/50 Split', desc: '50% now, 50% on delivery' },
                ].map(p => {
                  const sel = watch('payment_type') === p.value
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setValue('payment_type', p.value)}
                      style={{
                        padding: '14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                        border: `1.5px solid ${sel ? '#0EA5E9' : '#E2E8F0'}`,
                        background: sel ? '#EFF6FF' : '#FAFAFA',
                        position: 'relative', transition: 'all .2s',
                      }}
                    >
                      {sel && <span style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: '50%', background: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
                      <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 3px', fontFamily: 'Syne,sans-serif', color: '#0F172A' }}>{p.label}</p>
                      <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{p.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 14, padding: '16px 18px' }}>
              <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', margin: '0 0 12px' }}>Order Summary</p>
              {[
                ['Client',   `${user?.first_name} ${user?.last_name} (${user?.email})`],
                ['Project',  getValues('title') || '—'],
                ['Software', selectedSw ? SOFTWARE.find(s => s.value === selectedSw)?.label : '—'],
                ['Delivery', DELIVERY.find(d => d.value === selectedDel)?.label || 'Standard'],
                ['Payment',  watch('payment_type') === 'partial' ? '50% advance + 50% on delivery' : 'Full upfront'],
                ['NDA',      watch('is_nda') ? 'Yes — confidential' : 'No'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #F1F5F9', fontSize: 12 }}>
                  <span style={{ color: '#94A3B8' }}>{k}</span>
                  <span style={{ color: '#374151', fontWeight: 600, textAlign: 'right', maxWidth: '65%' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="fu" style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            style={{ flex: 1, padding: '13px', borderRadius: 12, background: '#F8FAFC', border: '1.5px solid #E2E8F0', color: '#64748B', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            ← Back
          </button>
        )}
        {step === 1 && (
          <button type="button" onClick={goStep2} style={nextBtnStyle}>
            Continue →
          </button>
        )}
        {step === 2 && (
          <button type="button" onClick={goStep3} style={nextBtnStyle}>
            Continue →
          </button>
        )}
        {step === 3 && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            style={{ ...nextBtnStyle, background: mutation.isPending ? '#6EE7B7' : '#10B981', cursor: mutation.isPending ? 'not-allowed' : 'pointer' }}
          >
            {mutation.isPending
              ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite', marginRight: 8 }} />Submitting...</>
              : '✓ Submit Project'
            }
          </button>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: '1.5px solid #E2E8F0', fontSize: 13, outline: 'none',
  fontFamily: 'DM Sans, sans-serif', color: '#0F172A',
  boxSizing: 'border-box', background: '#fff',
}
const errStyle: React.CSSProperties = {
  fontSize: 11, color: '#EF4444', margin: '4px 0 0', fontWeight: 600,
}
const nextBtnStyle: React.CSSProperties = {
  flex: 2, padding: '13px', borderRadius: 12, background: '#0EA5E9',
  color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700,
  fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: 8,
}
