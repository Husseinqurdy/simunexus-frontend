import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowRight, CheckCircle2, Clock, FileText, Loader2, Paperclip, X, XCircle } from 'lucide-react'
import { authApi, recruitApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { FileDropzone } from '@/components/shared/Files'
import { errorMessage, formatBytes } from '@/lib/format'
import { gxStyles, GSHLogo } from '../auth/_shared'
import type { ExpertApplication } from '@/types'

const HOME: Record<string, string> = { client: '/client', expert: '/expert', admin: '/admin', developer: '/developer' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid #DCE3F0', borderRadius: 12, padding: 'clamp(20px,4vw,32px)' }

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FC' }}>
      <style>{gxStyles}</style>
      <header style={{ background: '#fff', borderBottom: '1px solid #DCE3F0' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 10 }}>
          <GSHLogo size={28} /><strong style={{ fontSize: 14, color: '#0A1F6B' }}>Global Simulation Hub · Expert test</strong>
        </div>
      </header>
      <main style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(20px,5vw,40px) 20px' }}>{children}</main>
    </div>
  )
}

function Result({ icon, tone, title, children, actions }: { icon: React.ReactNode; tone: 'ok' | 'bad' | 'info'; title: string; children?: React.ReactNode; actions: React.ReactNode }) {
  const c = { ok: ['#EDF8F1', '#137A4E'], bad: ['#FDEDED', '#B92D2D'], info: ['#EAF1FD', '#0D52CE'] }[tone]
  return (
    <div style={{ ...card, textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: c[0], color: c[1], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>{icon}</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A1F4D', margin: '0 0 8px' }}>{title}</h1>
      <div style={{ fontSize: 14, color: '#4E5E82', lineHeight: 1.7, margin: '0 0 22px' }}>{children}</div>
      {actions}
    </div>
  )
}

export default function ExpertTestPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user, updateUser } = useAuthStore()
  const home = HOME[user?.role || 'client']
  const key = ['expert-application', id]

  const { data: app, isLoading, isError } = useQuery<ExpertApplication>({
    queryKey: key, queryFn: () => recruitApi.getApplication(Number(id)).then(r => r.data), refetchInterval: q => (q.state.data?.status === 'submitted' ? 15000 : false),
  })

  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [progress, setProgress] = useState(0)
  const [now, setNow] = useState(Date.now())
  const refreshed = useRef(false)

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])

  // Akipitishwa: sasisha taarifa za mtumiaji (role imekuwa expert) ili dashboard ya expert ifunguke
  useEffect(() => {
    if (app?.status === 'passed' && !refreshed.current) {
      refreshed.current = true
      authApi.me().then(r => updateUser(r.data)).catch(() => {})
    }
  }, [app?.status, updateUser])

  const start = useMutation({
    mutationFn: () => recruitApi.startTest(Number(id)),
    onSuccess: r => { qc.setQueryData(key, r.data); if (r.data.no_questions) toast('No questions are set up yet — an admin will review your work from the task description.', { icon: 'ℹ️' }) },
    onError: (e: any) => toast.error(errorMessage(e, 'Could not start the test')),
  })

  const submit = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('file', file!)
      fd.append('notes', notes)
      setProgress(0)
      return recruitApi.submitTest(Number(id), fd, setProgress)
    },
    // Baada ya kutuma: onyesha mafanikio papa hapa (si kuruka kwenda ukurasa uliozuiwa)
    onSuccess: r => { qc.setQueryData(key, r.data); setFile(null); window.scrollTo({ top: 0 }) },
    onError: (e: any) => toast.error(errorMessage(e, 'Submission failed. Your file was not sent — please try again.')),
  })

  if (isLoading) return <Shell><div style={{ textAlign: 'center', padding: 60 }}><Loader2 className="spin" color="#0D52CE" /></div></Shell>
  if (isError || !app) return (
    <Shell><Result icon={<XCircle size={32} />} tone="bad" title="Application not found" actions={<Link to="/expert/apply" className="gx-btn">Go to application</Link>}>
      We could not find this application.
    </Result></Shell>
  )

  const backBtn = <Link to={home} className="gx-btn">Back to dashboard <ArrowRight size={16} /></Link>

  /* ── Imetumwa: inakaguliwa ── */
  if (app.status === 'submitted') return (
    <Shell>
      <Result icon={<CheckCircle2 size={34} />} tone="ok" title="Successfully submitted" actions={backBtn}>
        Your test is <strong>under review</strong>. We will notify you as soon as an admin has checked it.
        {app.test_submission && <div style={{ marginTop: 12, fontSize: 13, color: '#667697' }}>{app.test_submission.file_name} · {formatBytes(app.test_submission.file_size)}{app.test_submission.is_late ? ' · submitted after the time limit' : ''}</div>}
      </Result>
    </Shell>
  )
  if (app.status === 'passed') return (
    <Shell>
      <Result icon={<CheckCircle2 size={34} />} tone="ok" title="You are approved!" actions={<button className="gx-btn" onClick={() => navigate('/expert', { replace: true })}>Open expert dashboard <ArrowRight size={16} /></button>}>
        Congratulations, you are now an approved GSH expert.{app.admin_notes ? <><br /><em>“{app.admin_notes}”</em></> : null}
      </Result>
    </Shell>
  )
  if (app.status === 'failed') return (
    <Shell>
      <Result icon={<XCircle size={34} />} tone="bad" title="Not approved this time" actions={backBtn}>
        Thank you for your effort.{app.admin_notes ? <><br />Feedback: <em>“{app.admin_notes}”</em></> : null}
      </Result>
    </Shell>
  )

  /* ── Haijaanza (au inaruhusiwa kurudia) ── */
  if (app.status === 'pending' || app.status === 'retry') return (
    <Shell>
      <div style={{ ...card, maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A1F4D', margin: '0 0 8px' }}>{app.status === 'retry' ? 'Retake the expert test' : 'Ready for your test?'}</h1>
        {app.status === 'retry' && app.admin_notes && <p style={{ fontSize: 14, color: '#4E5E82', margin: '0 0 12px' }}>Feedback: <em>“{app.admin_notes}”</em></p>}
        <ul style={{ fontSize: 14, color: '#2B3A60', lineHeight: 1.9, paddingLeft: 20, margin: '0 0 20px' }}>
          <li>You will get a task picked at random from your tools: <strong>{app.skills.join(', ')}</strong>.</li>
          <li>You have <strong>{app.test_duration_minutes} minutes</strong> from the moment you start.</li>
          <li>Upload your solution as one file (any format; zip several files together).</li>
        </ul>
        <button className="gx-btn" disabled={start.isPending} onClick={() => start.mutate()}>
          {start.isPending ? <><span className="gx-spin" /> Starting…</> : <>Start test <ArrowRight size={16} /></>}
        </button>
        <Link to={home} className="gx-btn gx-btn-outline" style={{ marginTop: 10 }}>Not now</Link>
      </div>
    </Shell>
  )

  /* ── Test inaendelea ── */
  const deadline = app.test_deadline ? new Date(app.test_deadline).getTime() : null
  const left = deadline ? Math.max(0, Math.floor((deadline - now) / 1000)) : null
  const over = left === 0
  const mm = left !== null ? String(Math.floor(left / 60)).padStart(2, '0') : '--'
  const ss = left !== null ? String(left % 60).padStart(2, '0') : '--'
  const low = left !== null && left < 600

  return (
    <Shell>
      <div style={{ position: 'sticky', top: 0, zIndex: 5, marginBottom: 16 }}>
        <div style={{ ...card, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0A1F4D' }}>Test in progress</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: over || low ? '#B92D2D' : '#0A1F4D' }}>
            <Clock size={18} /> {mm}:{ss}
          </span>
        </div>
        {over && <div style={{ background: '#FDEDED', border: '1px solid #F3C7C7', color: '#B92D2D', borderRadius: 8, padding: '10px 14px', fontSize: 14, marginTop: 8 }}>Time is up. You can still submit now; your submission will be marked as late.</div>}
      </div>

      <section style={{ ...card, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0A1F4D', margin: '0 0 12px' }}>Your task</h2>
        {app.test_questions.length === 0 ? (
          <p style={{ fontSize: 14, color: '#4E5E82', lineHeight: 1.7, margin: 0 }}>
            No question has been configured for your tools yet. Upload a short sample of your best simulation work in {app.skills.join(', ')} and describe it in the notes; an admin will review it.
          </p>
        ) : app.test_questions.map((q, i) => (
          <div key={q.id} style={{ borderTop: i ? '1px solid #EBEFF8' : 'none', paddingTop: i ? 14 : 0, marginTop: i ? 14 : 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600, background: '#EAF1FD', color: '#0A42A8', borderRadius: 999, padding: '3px 10px' }}>{q.tool_name}</span>
            <p style={{ fontSize: 15, color: '#0A1F4D', lineHeight: 1.75, margin: '10px 0 0', whiteSpace: 'pre-wrap' }}>{q.question_text}</p>
          </div>
        ))}
      </section>

      <section style={card}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0A1F4D', margin: '0 0 12px' }}>Submit your solution</h2>
        {!file ? (
          <FileDropzone onFiles={f => setFile(f[0])} label="Drop your solution file or click to browse" hint="Any file type, any size. Zip multiple files together." disabled={submit.isPending} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #C3CEE2', borderRadius: 10, padding: '12px 14px' }}>
            <Paperclip size={18} color="#0D52CE" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0A1F4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
              <div style={{ fontSize: 12, color: '#667697' }}>{formatBytes(file.size)}</div>
            </div>
            {!submit.isPending && <button onClick={() => setFile(null)} aria-label="Remove file" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667697', display: 'flex' }}><X size={16} /></button>}
          </div>
        )}
        <label className="gx-label" style={{ marginTop: 16 }}>Notes for the reviewer <span className="opt">(optional)</span></label>
        <textarea className="gx-input" rows={4} style={{ height: 'auto', padding: '10px 14px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Explain your approach, assumptions, how to run your files…" />

        {submit.isPending && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4E5E82', marginBottom: 6 }}><span>{progress < 100 ? 'Uploading…' : 'Finishing…'}</span><span>{progress}%</span></div>
            <div style={{ height: 6, background: '#DCE3F0', borderRadius: 6, overflow: 'hidden' }}><div style={{ width: `${progress}%`, height: '100%', background: '#0D52CE', transition: 'width .2s' }} /></div>
          </div>
        )}
        <button className="gx-btn" style={{ marginTop: 16 }} disabled={!file || submit.isPending} onClick={() => submit.mutate()}>
          {submit.isPending ? <><span className="gx-spin" /> Submitting…</> : <><FileText size={16} /> Submit test</>}
        </button>
      </section>
    </Shell>
  )
}
