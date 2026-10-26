import { CheckCircle2, Paperclip } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { recruitApi } from '@/api/client'
import { LoadingSpinner } from '@/components/shared'
import toast from 'react-hot-toast'

function pad(n: number) { return String(n).padStart(2, '0') }

export default function ExpertTestPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<any>(null)

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => recruitApi.getApplication(Number(id)).then(r => r.data),
  })

  // Calculate time left from test_started_at
  useEffect(() => {
    if (!app?.test_started_at) return
    const deadline = new Date(app.test_started_at).getTime() + 2 * 60 * 60 * 1000
    const calc = () => {
      const left = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
      setTimeLeft(left)
      if (left === 0) {
        clearInterval(timerRef.current)
        toast.error('Time is up! Your test has been auto-submitted.')
        handleAutoSubmit()
      }
    }
    calc()
    timerRef.current = setInterval(calc, 1000)
    return () => clearInterval(timerRef.current)
  }, [app?.test_started_at])

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file')
      const fd = new FormData()
      fd.append('file', file)
      fd.append('notes', notes)
      return recruitApi.submitTest(Number(id), fd)
    },
    onSuccess: () => {
      setSubmitted(true)
      clearInterval(timerRef.current)
      toast.success('Test submitted successfully!')
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Submission failed.'),
  })

  const autoSubmitMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('notes', 'Auto-submitted: time expired')
      if (file) fd.append('file', file)
      return recruitApi.submitTest(Number(id), fd)
    },
    onSuccess: () => setSubmitted(true),
  })

  const handleAutoSubmit = () => { autoSubmitMutation.mutate() }

  if (isLoading) return <LoadingSpinner label="Loading test..." />
  if (!app) return <div style={{ padding: 40, textAlign: 'center', color: '#667697' }}>Test not found.</div>

  // Time display
  const hours   = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60
  const pct     = ((7200 - timeLeft) / 7200) * 100
  const isUrgent = timeLeft < 900 // last 15 min

  if (submitted) return (
    <div style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#EDF8F1', border: '1px solid #BFE5CF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><CheckCircle2 size={40} color="#137A4E" /></div>
      <h1 style={{ fontFamily: 'inherit', fontSize: 24, fontWeight: 700, color: '#0A1F4D', margin: '0 0 12px' }}>Test Submitted!</h1>
      <p style={{ color: '#4E5E82', fontSize: 14, lineHeight: 1.7, margin: '0 0 28px' }}>
        Great work! Our team will review your submission within 24 hours and notify you of the result.
      </p>
      <button onClick={() => navigate('/expert')}
        style={{ padding: '12px 28px', borderRadius: 12, background: '#0D52CE', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>
        Back to Dashboard →
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px', fontFamily: 'inherit' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      {/* Timer */}
      <div style={{ background: isUrgent ? '#FDEDED' : '#0A1F6B', borderRadius: 16, padding: '24px 28px', marginBottom: 24, textAlign: 'center', border: isUrgent ? '1.5px solid #F3C7C7' : 'none' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: isUrgent ? '#B92D2D' : '#4E5E82', margin: '0 0 8px' }}>
          {isUrgent ? 'TIME RUNNING OUT' : 'TIME REMAINING'}
        </p>
        <div style={{ fontSize: 40, fontWeight: 700, fontFamily: 'inherit', color: isUrgent ? '#B92D2D' : '#fff', animation: isUrgent ? 'pulse 1s infinite' : 'none' }}>
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 16, height: 6, background: 'rgba(255,255,255,.1)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: isUrgent ? '#D03A3A' : '#0D52CE', borderRadius: 999, transition: 'width 1s linear' }} />
        </div>
        <p style={{ fontSize: 12, color: isUrgent ? '#B92D2D' : '#3A4A70', margin: '8px 0 0' }}>
          Test started: {app.test_started_at ? new Date(app.test_started_at).toLocaleTimeString() : '—'}
        </p>
      </div>

      {/* Task instructions */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEFF8', padding: '24px 28px', marginBottom: 20, boxShadow: '0 1px 3px rgba(10,31,107,.08)' }}>
        <h2 style={{ fontFamily: 'inherit', fontSize: 16, fontWeight: 700, color: '#0A1F4D', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          Test Task
        </h2>

        <div style={{ background: '#F5F7FC', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0A1F4D', margin: '0 0 8px' }}>
            Your skills: {app.skills?.join(', ') || 'Not specified'}
          </p>
          <p style={{ fontSize: 13, color: '#2B3A60', lineHeight: 1.7, margin: 0 }}>
            Design and simulate a system using your primary simulation software. Your submission should demonstrate:
          </p>
          <ul style={{ fontSize: 13, color: '#2B3A60', lineHeight: 1.8, margin: '10px 0 0', paddingLeft: 20 }}>
            <li>A working simulation model (e.g., control system, circuit, or signal processing)</li>
            <li>Simulation results with proper graphs/plots/outputs</li>
            <li>Brief explanation of your approach (can be in notes below)</li>
          </ul>
        </div>

        <div style={{ background: '#FFF8E6', border: '1px solid #F8DC8A', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#7A4A00' }}>
          ⏰ <strong>Tip:</strong> Save your work frequently. The test auto-submits when time expires.
          Submit as early as possible if you're done — don't wait for the timer.
        </div>
      </div>

      {/* Submission */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEFF8', padding: '24px 28px', boxShadow: '0 1px 3px rgba(10,31,107,.08)' }}>
        <h2 style={{ fontFamily: 'inherit', fontSize: 16, fontWeight: 700, color: '#0A1F4D', margin: '0 0 20px' }}>
          Submit Your Work
        </h2>

        {/* File upload */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4E5E82', marginBottom: 8 }}>
            Upload File * <span style={{ color: '#C3CEE2', fontWeight: 400, textTransform: 'none' }}>(simulation file, PDF report, or ZIP)</span>
          </label>
          <label
            htmlFor="testfile"
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', border: `1.5px dashed ${file ? '#1B9B63' : '#DCE3F0'}`, borderRadius: 12, cursor: 'pointer', background: file ? '#EDF8F1' : '#F8FAFD', transition: 'all .2s' }}
            onMouseEnter={e => !file && ((e.currentTarget as HTMLLabelElement).style.borderColor = '#0D52CE')}
            onMouseLeave={e => !file && ((e.currentTarget as HTMLLabelElement).style.borderColor = '#DCE3F0')}
          >
            {file ? <CheckCircle2 size={28} color="#137A4E" /> : <Paperclip size={28} color="#667697" />}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: file ? '#137A4E' : '#3A4A70', margin: 0 }}>
                {file ? file.name : 'Click to choose file'}
              </p>
              {file
                ? <p style={{ fontSize: 12, color: '#4E5E82', margin: '2px 0 0' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                : <p style={{ fontSize: 12, color: '#667697', margin: '2px 0 0' }}>MATLAB, Proteus, ZIP, PDF accepted</p>
              }
            </div>
            {file && (
              <button type="button" onClick={e => { e.preventDefault(); setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                style={{ background: '#FDEDED', border: 'none', borderRadius: 6, color: '#B92D2D', fontSize: 12, fontWeight: 700, padding: '4px 8px', cursor: 'pointer' }}>
                Remove
              </button>
            )}
            <input id="testfile" ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4E5E82', marginBottom: 8 }}>
            Notes / Explanation <span style={{ color: '#C3CEE2', fontWeight: 400, textTransform: 'none' }}>(optional but recommended)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Explain your approach, assumptions made, software version used, any issues encountered..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #DCE3F0', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: '#2B3A60' }}
          />
        </div>

        <button
          onClick={() => submitMutation.mutate()}
          disabled={!file || submitMutation.isPending}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
            cursor: !file || submitMutation.isPending ? 'not-allowed' : 'pointer',
            background: !file || submitMutation.isPending ? '#7CCBA2' : '#1B9B63',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {submitMutation.isPending
            ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Submitting...</>
            : 'Submit Test'
          }
        </button>
      </div>
    </div>
  )
}
