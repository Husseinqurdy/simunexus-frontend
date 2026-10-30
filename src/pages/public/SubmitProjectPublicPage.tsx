import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Lock, Mail, Phone, User as UserIcon, X } from 'lucide-react'
import PublicTopbar from '@/components/layout/PublicTopbar'
import { FileDropzone, KindIcon, guessKind } from '@/components/shared/Files'
import { authApi } from '@/api/client'
import { errorMessage, formatBytes } from '@/lib/format'
import { gxStyles, PasswordField, PasswordStrength, TextField } from '../auth/_shared'

const SOFTWARE = [
  { value: 'matlab', label: 'MATLAB / Simulink' }, { value: 'proteus', label: 'Proteus' },
  { value: 'ansys', label: 'ANSYS' }, { value: 'labview', label: 'LabVIEW' },
  { value: 'multisim', label: 'Multisim' }, { value: 'pscad', label: 'PSCAD' },
  { value: 'etap', label: 'ETAP' }, { value: 'hfss', label: 'HFSS' },
  { value: 'cst', label: 'CST Studio' }, { value: 'other', label: 'Other' },
]

const DELIVERY = [
  { value: 'standard', label: 'Standard', desc: 'Flexible deadline', badge: 'Best price' },
  { value: 'urgent', label: 'Urgent', desc: '24 hours delivery', badge: '2× price' },
  { value: 'express', label: 'Express', desc: '6–12 hours delivery', badge: '3× price' },
]

type Form = {
  first_name: string; last_name: string; username: string; email: string; phone: string
  password: string; confirm_password: string
  title: string; description: string; software_version: string; deadline: string
  is_nda: boolean; include_explanation: boolean; payment_type: 'full' | 'partial'
}

const STEP_FIELDS: Record<number, (keyof Form)[]> = {
  1: ['first_name', 'username', 'email', 'phone', 'password', 'confirm_password'],
  2: ['title', 'description', 'deadline'],
}
const ACCOUNT_FIELDS = ['username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'phone']
const PROJECT_FIELDS = ['title', 'description', 'deadline', 'software', 'software_version']

const card: React.CSSProperties = { background: '#fff', border: '1px solid #DCE3F0', borderRadius: 12, padding: 'clamp(20px,4vw,32px)' }
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#2B3A60', marginBottom: 8 }

export default function SubmitProjectPublicPage() {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState<null | { username: string; project_title: string; files_saved: number; files_failed: number }>(null)
  const [sw, setSw] = useState('')
  const [swError, setSwError] = useState(false)
  const [delivery, setDelivery] = useState('standard')
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState(0)

  const { register, handleSubmit, watch, setValue, setError, trigger, formState: { errors } } = useForm<Form>({
    defaultValues: { payment_type: 'full', is_nda: false, include_explanation: false },
  })
  const pw = watch('password', '')
  const payment = watch('payment_type')

  const mutation = useMutation({
    mutationFn: async (d: Form) => {
      const fd = new FormData()
      ;(['first_name', 'last_name', 'username', 'email', 'phone', 'password', 'confirm_password', 'title', 'description',
        'software_version', 'deadline', 'payment_type'] as (keyof Form)[]).forEach(k => fd.append(k, String(d[k] ?? '')))
      fd.append('software', sw)
      fd.append('delivery_type', delivery)
      fd.append('is_nda', String(!!d.is_nda))
      fd.append('include_explanation', String(!!d.include_explanation))
      files.forEach(f => fd.append('files', f))
      setProgress(0)
      return (await authApi.submitWithAccount(fd, setProgress)).data
    },
    onSuccess: (res) => setDone({ username: res.username, project_title: res.project_title, files_saved: res.files_saved || 0, files_failed: res.files_failed || 0 }),
    onError: (e: any) => {
      const data = e?.response?.data
      if (data && typeof data === 'object' && !data.error && !data.detail) {
        let toStep = 0
        Object.entries(data).forEach(([field, msgs]) => {
          const msg = Array.isArray(msgs) ? String(msgs[0]) : String(msgs)
          if (ACCOUNT_FIELDS.includes(field)) { setError(field as keyof Form, { message: msg }); toStep = 1 }
          else if (PROJECT_FIELDS.includes(field)) { setError(field as keyof Form, { message: msg }); if (!toStep) toStep = 2 }
        })
        if (toStep) setStep(toStep)
        toast.error('Please fix the highlighted fields.')
      } else toast.error(errorMessage(e, 'Submission failed. Please try again.'))
    },
  })

  const next = async () => {
    if (step === 2 && !sw) { setSwError(true); return }
    setSwError(false)
    if (await trigger(STEP_FIELDS[step])) { setStep(s => s + 1); window.scrollTo({ top: 0 }) }
  }

  /* ───────────── Mafanikio ───────────── */
  if (done) return (
    <div style={{ minHeight: '100vh', background: '#F5F7FC' }}>
      <style>{gxStyles}</style>
      <PublicTopbar />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: 'clamp(28px,8vw,64px) 20px' }}>
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EDF8F1', color: '#137A4E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={34} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A1F4D', margin: '0 0 8px' }}>Project submitted</h1>
          <p style={{ fontSize: 14, color: '#4E5E82', lineHeight: 1.7, margin: '0 0 6px' }}>
            “{done.project_title}” has been received and our team is reviewing it.
          </p>
          <p style={{ fontSize: 14, color: '#4E5E82', lineHeight: 1.7, margin: '0 0 20px' }}>
            Your account <strong style={{ color: '#0A1F4D' }}>{done.username}</strong> is ready. Sign in to track progress, chat and download your results.
          </p>
          {done.files_saved > 0 && <p style={{ fontSize: 13, color: '#137A4E', margin: '0 0 12px' }}>{done.files_saved} file(s) attached.</p>}
          {done.files_failed > 0 && <p style={{ fontSize: 13, color: '#B92D2D', margin: '0 0 12px' }}>{done.files_failed} file(s) could not be saved. Add them again after signing in.</p>}
          <Link to="/login" className="gx-btn" style={{ marginBottom: 10 }}>Go to sign in <ArrowRight size={16} /></Link>
          <Link to="/" className="gx-btn gx-btn-outline">Back to home</Link>
        </div>
      </div>
    </div>
  )

  const field = (name: keyof Form) => errors[name]?.message as string | undefined

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FC', paddingBottom: 48 }}>
      <style>{gxStyles}</style>
      <PublicTopbar />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(24px,5vw,44px) clamp(16px,4vw,24px) 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 'clamp(24px,6vw,32px)', fontWeight: 700, color: '#0A1F4D', margin: '0 0 8px' }}>Submit your project</h1>
          <p style={{ fontSize: 15, color: '#4E5E82', margin: 0 }}>Create your account and describe your project in one go.</p>
        </div>

        {/* Hatua */}
        <ol style={{ listStyle: 'none', display: 'flex', justifyContent: 'center', gap: 'clamp(6px,3vw,24px)', margin: '0 0 24px', padding: 0 }}>
          {['Account', 'Project', 'Files & delivery'].map((l, i) => {
            const n = i + 1, active = step === n, past = step > n
            return (
              <li key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: past ? '#137A4E' : active ? '#0D52CE' : '#EBEFF8', color: past || active ? '#fff' : '#4E5E82' }}>
                  {past ? <Check size={14} strokeWidth={3} /> : n}
                </span>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? '#0D52CE' : '#4E5E82' }} className="sp-step-label">{l}</span>
              </li>
            )
          })}
        </ol>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} noValidate>
          <div style={card}>
            {/* ── Hatua 1: Akaunti ── */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0A1F4D', margin: '0 0 4px' }}>Your account</h2>
                <p style={{ fontSize: 14, color: '#4E5E82', margin: '0 0 20px' }}>You will use these details to sign in and follow your project.</p>
                <div className="gx-row">
                  <TextField label="First name" placeholder="John" error={field('first_name')} {...register('first_name', { required: 'First name is required' })} />
                  <TextField label="Last name" placeholder="Doe" {...register('last_name')} />
                </div>
                <TextField label="Username" placeholder="e.g. john_doe" autoComplete="username" icon={<UserIcon size={16} />} error={field('username')}
                  {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'At least 3 characters' }, pattern: { value: /^[A-Za-z0-9_.-]+$/, message: 'Letters, numbers, dot, dash and underscore only' } })} />
                <TextField label="Email address" type="email" placeholder="you@example.com" autoComplete="email" icon={<Mail size={16} />} error={field('email')}
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
                <TextField label="Phone / WhatsApp" placeholder="+255 7XX XXX XXX" autoComplete="tel" icon={<Phone size={16} />} error={field('phone')}
                  {...register('phone', { required: 'Phone number is required' })} />
                <PasswordField label="Password" placeholder="At least 8 characters" autoComplete="new-password" icon={<Lock size={16} />} error={field('password')}
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })} />
                <PasswordStrength value={pw} />
                <PasswordField label="Confirm password" placeholder="Re-enter your password" autoComplete="new-password" icon={<Lock size={16} />} error={field('confirm_password')}
                  {...register('confirm_password', { required: 'Please confirm your password', validate: v => v === pw || 'Passwords do not match' })} />
                <p style={{ fontSize: 13, color: '#667697', margin: '4px 0 0' }}>
                  Already have an account? <Link to="/login" className="gx-link">Sign in</Link> and submit from your dashboard.
                </p>
              </div>
            )}

            {/* ── Hatua 2: Mradi ── */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0A1F4D', margin: '0 0 20px' }}>Project details</h2>
                <TextField label="Project title" placeholder="e.g. DC motor speed control simulation" error={field('title')}
                  {...register('title', { required: 'Title is required' })} />
                <div className="gx-field">
                  <label className="gx-label">Description</label>
                  <textarea className={`gx-input${errors.description ? ' invalid' : ''}`} rows={4} style={{ height: 'auto', padding: '10px 14px', resize: 'vertical' }}
                    placeholder="Describe what you need: inputs, expected outputs, standards, parameters…"
                    {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Please write at least 20 characters' } })} />
                  {errors.description && <p className="gx-err">{field('description')}</p>}
                </div>

                <span style={label}>Simulation software {swError && <span style={{ color: '#B92D2D', fontWeight: 600 }}>— please choose one</span>}</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, marginBottom: 18 }}>
                  {SOFTWARE.map(s => (
                    <button key={s.value} type="button" onClick={() => { setSw(s.value); setSwError(false) }}
                      style={{ padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                        border: `1.5px solid ${sw === s.value ? '#0D52CE' : '#DCE3F0'}`, background: sw === s.value ? '#EAF1FD' : '#fff', color: sw === s.value ? '#0A42A8' : '#2B3A60' }}>
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="gx-row">
                  <TextField label={<>Software version <span className="opt">(optional)</span></>} placeholder="e.g. R2024a" {...register('software_version')} />
                  <TextField label="Deadline" type="datetime-local" error={field('deadline')} min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                    {...register('deadline', { required: 'Deadline is required' })} />
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#2B3A60', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ accentColor: '#0D52CE', width: 16, height: 16 }} {...register('is_nda')} /> NDA / confidential
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#2B3A60', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ accentColor: '#0D52CE', width: 16, height: 16 }} {...register('include_explanation')} /> Include explanation
                  </label>
                </div>
              </div>
            )}

            {/* ── Hatua 3: Faili, delivery, malipo ── */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0A1F4D', margin: '0 0 20px' }}>Files & delivery</h2>

                <span style={label}>Attach files <span style={{ fontWeight: 400, color: '#667697' }}>(optional)</span></span>
                <FileDropzone onFiles={f => setFiles(prev => [...prev, ...f])} disabled={mutation.isPending} />
                {files.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {files.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #DCE3F0', borderRadius: 8, padding: '8px 10px' }}>
                        <span style={{ color: '#0D52CE', display: 'flex' }}><KindIcon kind={guessKind(f.name, f.type)} size={16} /></span>
                        <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: '#0A1F4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                        <span style={{ fontSize: 12, color: '#667697' }}>{formatBytes(f.size)}</span>
                        {!mutation.isPending && (
                          <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667697', display: 'flex' }}><X size={15} /></button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                <span style={{ ...label, marginTop: 22 }}>Delivery type</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {DELIVERY.map(d => (
                    <button key={d.value} type="button" onClick={() => setDelivery(d.value)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        border: `1.5px solid ${delivery === d.value ? '#0D52CE' : '#DCE3F0'}`, background: delivery === d.value ? '#EAF1FD' : '#fff' }}>
                      <span>
                        <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0A1F4D' }}>{d.label}</span>
                        <span style={{ display: 'block', fontSize: 13, color: '#4E5E82' }}>{d.desc}</span>
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#0A42A8', background: '#EAF1FD', borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>{d.badge}</span>
                    </button>
                  ))}
                </div>

                <span style={label}>Payment preference</span>
                <div className="gx-row" style={{ marginBottom: 20 }}>
                  {([['full', 'Full payment', 'Pay everything upfront'], ['partial', '50 / 50 split', '50% now, 50% on delivery']] as const).map(([v, t, desc]) => (
                    <button key={v} type="button" onClick={() => setValue('payment_type', v)}
                      style={{ padding: '12px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        border: `1.5px solid ${payment === v ? '#0D52CE' : '#DCE3F0'}`, background: payment === v ? '#EAF1FD' : '#fff' }}>
                      <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0A1F4D' }}>{t}</span>
                      <span style={{ display: 'block', fontSize: 13, color: '#4E5E82' }}>{desc}</span>
                    </button>
                  ))}
                </div>

                <div style={{ background: '#F5F7FC', border: '1px solid #DCE3F0', borderRadius: 8, padding: '14px 16px', fontSize: 13 }}>
                  {[
                    ['Account', watch('username')],
                    ['Software', SOFTWARE.find(s => s.value === sw)?.label || '—'],
                    ['Delivery', DELIVERY.find(d => d.value === delivery)?.label],
                    ['Files', files.length ? `${files.length} file(s), ${formatBytes(files.reduce((a, f) => a + f.size, 0))}` : 'None'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '3px 0' }}>
                      <span style={{ color: '#4E5E82' }}>{k}</span><span style={{ color: '#0A1F4D', fontWeight: 500, textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
                </div>

                {mutation.isPending && files.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4E5E82', marginBottom: 6 }}>
                      <span>{progress < 100 ? 'Uploading files…' : 'Finishing…'}</span><span>{progress}%</span>
                    </div>
                    <div style={{ height: 6, background: '#DCE3F0', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: '#0D52CE', transition: 'width .2s' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            {step > 1 && (
              <button type="button" className="gx-btn gx-btn-outline" style={{ flex: 1 }} disabled={mutation.isPending} onClick={() => setStep(s => s - 1)}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" className="gx-btn" style={{ flex: 2 }} onClick={next}>Continue <ArrowRight size={16} /></button>
            ) : (
              <button type="submit" className="gx-btn" style={{ flex: 2 }} disabled={mutation.isPending || !sw}>
                {mutation.isPending ? <><Loader2 size={16} className="spin" /> Submitting…</> : <>Create account & submit</>}
              </button>
            )}
          </div>
        </form>
      </div>
      <style>{`@media (max-width: 480px) { .sp-step-label { display: none } }`}</style>
    </div>
  )
}
