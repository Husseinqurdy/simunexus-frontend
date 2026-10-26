import { Check, Paperclip } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { projectApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

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
  { value: 'standard', label: 'Standard', desc: 'Flexible deadline',   color: '#4E5E82', badge: 'Best price' },
  { value: 'urgent',   label: 'Urgent',   desc: '24 hours delivery',   color: '#9A5B00', badge: '2× price'  },
  { value: 'express',  label: 'Express',  desc: '6–12 hours delivery', color: '#B92D2D', badge: '3× price'  },
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

const label: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700, color: '#4E5E82',
 marginBottom: 8,
}
const input: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: '1.5px solid #DCE3F0', fontSize: 13, outline: 'none',
  fontFamily: 'inherit', color: '#0A1F4D', boxSizing: 'border-box',
}
const err: React.CSSProperties = { fontSize: 12, color: '#B92D2D', margin: '4px 0 0', fontWeight: 600 }
const nextBtn: React.CSSProperties = {
  flex: 2, padding: '13px', borderRadius: 12, background: '#0D52CE',
  color: '#fff', fontFamily: 'inherit', fontWeight: 700,
  fontSize: 15, border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
}

export default function ClientSubmitProject() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [step, setStep]           = useState(1)
  const [selectedSw, setSelectedSw]   = useState('')
  const [selectedDel, setSelectedDel] = useState('standard')
  const [swError, setSwError]         = useState(false)

  const { register, watch, setValue, trigger, getValues, formState: { errors } } = useForm<FormData>({
    defaultValues: { payment_type: 'full', is_nda: false, include_explanation: false },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => projectApi.create({
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
      toast.success("Project submitted! We'll review it and set a price shortly.")
      navigate('/client/projects')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.error || e.response?.data?.detail || 'Submission failed.')
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
    if (new Date(getValues('deadline')) <= new Date()) {
      toast.error('Deadline must be in the future.')
      return
    }
    setStep(3)
  }

  const handleSubmit = () => {
    if (!selectedSw) { toast.error('Please select a software.'); return }
    mutation.mutate(getValues())
  }

  const STEPS = ['Project Info', 'Technical Details', 'Delivery & Payment']

  return (
    <div style={{ fontFamily: 'inherit', maxWidth: 700, margin: '0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'inherit', fontSize: 24, fontWeight: 700, color: '#0A1F4D', margin: '0 0 4px' }}>
          Submit New Project
        </h1>
        <p style={{ color: '#667697', fontSize: 13, margin: 0 }}>
          Submitting as <strong style={{ color: '#0A1F4D' }}>{user?.first_name} {user?.last_name}</strong> · {user?.email}
        </p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 28 }}>
        {STEPS.map((lbl, i) => {
          const n = i + 1
          const isActive = step === n
          const isDone   = step > n
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 700, fontSize: 12,
                  background: isDone ? '#1B9B63' : isActive ? '#0D52CE' : '#EBEFF8',
                  color: isDone || isActive ? '#fff' : '#667697',
                }}>
                  {isDone ? <Check size={14} strokeWidth={3} /> : n}
                </div>
                <span style={{ fontSize: 12, marginTop: 5, whiteSpace: 'nowrap', fontWeight: isActive ? 700 : 400, color: isActive ? '#0D52CE' : isDone ? '#1B9B63' : '#667697' }}>
                  {lbl}
                </span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1.5, background: step > n ? '#1B9B63' : '#DCE3F0', margin: '0 10px', marginBottom: 22 }} />}
            </div>
          )
        })}
      </div>

      {/* Card */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEFF8', padding: '32px 28px', boxShadow: '0 1px 3px rgba(10,31,107,.08)' }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'inherit', fontSize: 16, fontWeight: 700, color: '#0A1F4D', margin: '0 0 20px' }}>Project Information</h2>

            {/* User info badge */}
            <div style={{ background: '#F5F7FC', border: '1px solid #EBEFF8', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EAF1FD', color: '#0D52CE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0A1F4D', margin: 0 }}>{user?.first_name} {user?.last_name}</p>
                <p style={{ fontSize: 12, color: '#667697', margin: 0 }}>{user?.email}</p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 12, background: '#EDF8F1', color: '#137A4E', padding: '3px 10px', borderRadius: 999, fontWeight: 700, border: '1px solid #BFE5CF' }}>
                Logged in
              </span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>Project Title *</label>
              <input {...register('title', { required: 'Project title is required' })} placeholder="e.g. DC Motor Speed Control Simulation" style={input} />
              {errors.title && <p style={err}>{String(errors.title.message)}</p>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={label}>Project Description *</label>
              <textarea
                {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Min 20 characters' } })}
                rows={5} placeholder="Describe exactly what simulation you need..."
                style={{ ...input, resize: 'vertical' }}
              />
              {errors.description && <p style={err}>{String(errors.description.message)}</p>}
            </div>

            {/* Software */}
            <div>
              <label style={{ ...label, color: swError ? '#D03A3A' : '#4E5E82' }}>
                Simulation Software * {swError && <span style={{ color: '#B92D2D', fontWeight: 700, textTransform: 'none' }}>— Please select one</span>}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                {SOFTWARE.map(sw => (
                  <button key={sw.value} type="button" onClick={() => { setSelectedSw(sw.value); setSwError(false) }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 6px', borderRadius: 12, cursor: 'pointer', transition: 'all .2s', border: `1.5px solid ${selectedSw === sw.value ? '#0D52CE' : swError ? '#F0B3B3' : '#DCE3F0'}`, background: selectedSw === sw.value ? '#EAF1FD' : '#F8FAFD' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, fontFamily: 'inherit', background: selectedSw === sw.value ? '#0D52CE' : '#EBEFF8', color: selectedSw === sw.value ? '#fff' : '#4E5E82' }}>
                      {sw.icon}
                    </div>
                    <span style={{ fontSize: 12, color: selectedSw === sw.value ? '#0D52CE' : '#4E5E82', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{sw.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: 'inherit', fontSize: 16, fontWeight: 700, color: '#0A1F4D', margin: '0 0 20px' }}>Technical Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={label}>Software Version</label>
                <input {...register('software_version')} placeholder="e.g. R2024a, v8.0" style={input} />
              </div>
              <div>
                <label style={label}>Project Deadline *</label>
                <input {...register('deadline', { required: 'Deadline is required' })} type="datetime-local" min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)} style={input} />
                {errors.deadline && <p style={err}>{String(errors.deadline.message)}</p>}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>Attach Files <span style={{ color: '#667697', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <label htmlFor="fileup" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1.5px dashed #DCE3F0', borderRadius: 12, cursor: 'pointer', background: '#F8FAFD' }}>
                <Paperclip size={20} color="#667697" />
                <div>
                  <p style={{ color: '#3A4A70', fontSize: 13, margin: 0, fontWeight: 500 }}>Click to attach files</p>
                  <p style={{ color: '#667697', fontSize: 12, margin: 0 }}>PDF, MATLAB files, schematics...</p>
                </div>
                <input id="fileup" type="file" multiple style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#3A4A70' }}>
                <input {...register('is_nda')} type="checkbox" style={{ accentColor: '#0D52CE' }} />
                NDA / Confidential
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#3A4A70' }}>
                <input {...register('include_explanation')} type="checkbox" style={{ accentColor: '#0D52CE' }} />
                Include explanation
              </label>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: 'inherit', fontSize: 16, fontWeight: 700, color: '#0A1F4D', margin: '0 0 8px' }}>Delivery & Payment</h2>
            <div style={{ background: '#EAF1FD', border: '1px solid #C4DBF1', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#0A42A8' }}>
              Admin will review your project and set the final price.
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={label}>Delivery Type *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DELIVERY.map(d => (
                  <button key={d.value} type="button" onClick={() => setSelectedDel(d.value)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', border: `1.5px solid ${selectedDel === d.value ? d.color : '#DCE3F0'}`, background: selectedDel === d.value ? d.color + '08' : '#F8FAFD', transition: 'all .2s' }}>
                    <div>
                      <p style={{ color: '#0A1F4D', fontWeight: 700, fontSize: 13, margin: 0, fontFamily: 'inherit' }}>{d.label}</p>
                      <p style={{ color: '#4E5E82', fontSize: 12, margin: 0 }}>{d.desc}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ padding: '3px 8px', borderRadius: 999, background: d.color + '18', color: d.color, fontSize: 12, fontWeight: 700 }}>{d.badge}</span>
                      {selectedDel === d.value && <span style={{ width: 18, height: 18, borderRadius: '50%', background: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}><Check size={11} strokeWidth={3} /></span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={label}>Payment Preference *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'full',    label: 'Full Payment', desc: 'Pay everything upfront' },
                  { value: 'partial', label: '50/50 Split',  desc: '50% now, 50% on delivery' },
                ].map(p => {
                  const sel = watch('payment_type') === p.value
                  return (
                    <button key={p.value} type="button" onClick={() => setValue('payment_type', p.value)}
                      style={{ padding: '14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', border: `1.5px solid ${sel ? '#0D52CE' : '#DCE3F0'}`, background: sel ? '#EAF1FD' : '#F8FAFD', position: 'relative', transition: 'all .2s' }}>
                      {sel && <span style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: '50%', background: '#0D52CE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}><Check size={11} strokeWidth={3} /></span>}
                      <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 3px', fontFamily: 'inherit', color: '#0A1F4D' }}>{p.label}</p>
                      <p style={{ fontSize: 12, color: '#4E5E82', margin: 0 }}>{p.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: '#F5F7FC', border: '1px solid #EBEFF8', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 12, color: '#667697', fontWeight: 700, margin: '0 0 12px' }}>Order Summary</p>
              {[
                ['Client',   `${user?.first_name} ${user?.last_name} (${user?.email})`],
                ['Project',  getValues('title') || '—'],
                ['Software', selectedSw ? SOFTWARE.find(s => s.value === selectedSw)?.label : '—'],
                ['Delivery', DELIVERY.find(d => d.value === selectedDel)?.label || 'Standard'],
                ['Payment',  watch('payment_type') === 'partial' ? '50% advance + 50% on delivery' : 'Full upfront'],
                ['NDA',      watch('is_nda') ? 'Yes — confidential' : 'No'],
              ].map(([k, v]) => (
                <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #EBEFF8', fontSize: 12 }}>
                  <span style={{ color: '#667697' }}>{k}</span>
                  <span style={{ color: '#2B3A60', fontWeight: 600, textAlign: 'right', maxWidth: '65%' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        {step > 1 && (
          <button type="button" onClick={() => setStep(s => s - 1)}
            style={{ flex: 1, padding: '13px', borderRadius: 12, background: '#F5F7FC', border: '1.5px solid #DCE3F0', color: '#4E5E82', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            ← Back
          </button>
        )}
        {step === 1 && <button type="button" onClick={goStep2} style={nextBtn}>Continue →</button>}
        {step === 2 && <button type="button" onClick={goStep3} style={nextBtn}>Continue →</button>}
        {step === 3 && (
          <button type="button" onClick={handleSubmit} disabled={mutation.isPending}
            style={{ ...nextBtn, background: mutation.isPending ? '#7CCBA2' : '#1B9B63', cursor: mutation.isPending ? 'not-allowed' : 'pointer' }}>
            {mutation.isPending
              ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite', marginRight: 8 }} />Submitting...</>
              : 'Submit Project'
            }
          </button>
        )}
      </div>
    </div>
  )
}
