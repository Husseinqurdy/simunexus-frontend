import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi, chatApi } from '@/api/client'
import {
  StatusBadge, SoftwareLabel, DeliveryBadge,
  LoadingSpinner, Card, SectionTitle, Btn, ProgressBar, StarRating
} from '@/components/shared'
import { format, formatDistanceToNow, isValid } from 'date-fns'
import toast from 'react-hot-toast'
import type { Project, User, ProjectFile } from '@/types'
import {
  ArrowLeft,
  Lock,
  MessageCircle,
  Undo2,
  Upload,
  Paperclip,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

function safeFormat(dateStr: string | null | undefined, fmt: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return isValid(d) ? format(d, fmt) : '—'
}
function safeDistance(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—'
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F8FAFC' }}>
      <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

// Statuses where the expert is expected to actively be working / can submit
const ACTIONABLE_STATUSES = ['assigned', 'in_progress', 'revision']

export default function ExpertProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['expert-project', id],
    queryFn: () => projectApi.detail(Number(id)).then(r => r.data as Project),
    refetchInterval: 20000,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['expert-project', id] })

  const openChatMutation = useMutation({
    mutationFn: (userId: number) => chatApi.createRoom({ user_id: userId, project_id: Number(id) }),
    onSuccess: () => { toast.success('Chat room ready.'); navigate('/expert/chat') },
    onError: () => toast.error('Could not open chat.'),
  })

  const submitForQCMutation = useMutation({
    mutationFn: () => projectApi.update(Number(id), { status: 'qc' }),
    onSuccess: () => { toast.success('Submitted for quality check!'); invalidate() },
    onError: () => toast.error('Could not submit for QC.'),
  })

  if (isLoading) return <LoadingSpinner label="Loading project..." />
  if (!project) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>
      <p style={{ fontSize: 16, fontWeight: 700 }}>Project not found.</p>
      <button onClick={() => navigate('/expert/projects')} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 10, background: '#0B1C3D', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
        Back to Projects
      </button>
    </div>
  )

  const clientUser = project.client as User
  const files = project.files || []
  const clientFiles = files.filter((f: ProjectFile) => f.file_type === 'client_upload')
  const myFiles = files.filter((f: ProjectFile) => ['expert_final', 'explanation'].includes(f.file_type))
  const latestProgress = project.progress_updates?.[0]
  const canWork = ACTIONABLE_STATUSES.includes(project.status)
  const canSubmitForQC = project.status === 'in_progress' || project.status === 'revision'

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: 1080, margin: '0 auto' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .epd-card-anim { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .epd-card-anim:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15, 23, 42, 0.07); }
        .epd-btn { transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease; }
        .epd-btn:hover { transform: scale(1.04); opacity: 0.9; }
        .epd-btn:active { transform: scale(0.96); }
        .epd-file-row { transition: background 0.15s ease, transform 0.15s ease; }
        .epd-file-row:hover { background: #F1F5F9; transform: translateX(2px); }
        .epd-slide { animation: slideDown 0.2s ease; }
        .epd-back-link { transition: color 0.15s ease; }
        .epd-back-link:hover { color: #0EA5E9; }
      `}</style>

      {/* Back */}
      <Link to="/expert/projects" className="epd-back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 13, textDecoration: 'none', marginBottom: 20 }}>
        <ArrowLeft size={14} strokeWidth={2.2} /> Back to projects
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
            {project.title}
          </h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <StatusBadge status={project.status} />
            <SoftwareLabel software={project.software} />
            <DeliveryBadge type={project.delivery_type} />
            {project.is_nda && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#7C3AED', background: '#F5F3FF', padding: '3px 10px', borderRadius: 999, border: '1px solid #DDD6FE' }}>
                <Lock size={11} strokeWidth={2.4} /> NDA
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Revision banner */}
      {project.status === 'revision' && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Undo2 size={18} strokeWidth={2} color="#E11D48" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#9F1239', margin: 0 }}>Revision Requested</p>
            {project.rejection_reason && (
              <p style={{ fontSize: 12, color: '#BE123C', margin: '3px 0 0', lineHeight: 1.5 }}>{project.rejection_reason}</p>
            )}
          </div>
        </div>
      )}

      {/* QC banner */}
      {project.status === 'qc' && (
        <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Clock size={18} strokeWidth={2} color="#7C3AED" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#5B21B6', margin: 0 }}>Awaiting Quality Check</p>
            <p style={{ fontSize: 12, color: '#6D28D9', margin: '3px 0 0' }}>Your submission is being reviewed by the admin team.</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* ===== LEFT ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Project Info */}
          <Card className="epd-card-anim">
            <SectionTitle>Project Details</SectionTitle>
            <InfoRow label="Client" value={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{clientUser?.first_name} {clientUser?.last_name}</span>
                <button
                  className="epd-btn"
                  onClick={() => clientUser && openChatMutation.mutate(clientUser.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 8, background: '#EFF6FF', color: '#2563EB', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                >
                  <MessageCircle size={12} strokeWidth={2.2} /> Chat
                </button>
              </div>
            } />
            <InfoRow label="Deadline" value={safeFormat(project.deadline, 'dd MMM yyyy, HH:mm')} />
            <InfoRow label="Time Left" value={safeDistance(project.deadline)} />
            <InfoRow label="Assigned" value={safeDistance(project.created_at)} />
            {project.include_explanation && (
              <InfoRow label="Explanation" value={
                <span style={{ color: '#7C3AED', fontWeight: 700 }}>Required</span>
              } />
            )}
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Description</p>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: 0 }}>{project.description}</p>
            </div>
          </Card>

          {/* Post progress update */}
          {canWork && (
            <Card className="epd-card-anim">
              <SectionTitle>Post a Progress Update</SectionTitle>
              <ProgressUpdateForm projectId={Number(id)} onSuccess={invalidate} />
            </Card>
          )}

          {/* Progress history */}
          {project.progress_updates && project.progress_updates.length > 0 && (
            <Card className="epd-card-anim">
              <SectionTitle>Progress History</SectionTitle>
              {latestProgress && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 700 }}>Overall Progress</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0EA5E9' }}>{latestProgress.percentage}%</span>
                  </div>
                  <ProgressBar percentage={latestProgress.percentage} />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {project.progress_updates.map(u => (
                  <div key={u.id} className="epd-file-row" style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{u.percentage}% — {u.time_remaining} remaining</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{safeDistance(u.created_at)}</span>
                    </div>
                    {u.note && <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.5 }}>{u.note}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Client uploaded files */}
          {clientFiles.length > 0 && (
            <Card className="epd-card-anim">
              <SectionTitle>Client Files</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {clientFiles.map(f => (
                  <div key={f.id} className="epd-file-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Paperclip size={16} strokeWidth={2} color="#2563EB" />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#0F172A' }}>{f.original_name}</p>
                        <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{(f.file_size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <a href={f.file} target="_blank" rel="noreferrer" className="epd-btn"
                      style={{ padding: '5px 12px', borderRadius: 8, background: '#EFF6FF', color: '#2563EB', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Review (read-only, once completed) */}
          {project.review && (
            <Card className="epd-card-anim">
              <SectionTitle>Client Review</SectionTitle>
              <StarRating rating={project.review.rating} size={18} />
              {project.review.comment && (
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginTop: 10 }}>"{project.review.comment}"</p>
              )}
              <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>{safeDistance(project.review.created_at)}</p>
            </Card>
          )}
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* My deliverables */}
          <Card className="epd-card-anim">
            <SectionTitle>Upload Deliverable</SectionTitle>
            <UploadFileBox projectId={Number(id)} onSuccess={invalidate} />
          </Card>

          {myFiles.length > 0 && (
            <Card className="epd-card-anim">
              <SectionTitle>My Uploaded Files</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myFiles.map(f => (
                  <div key={f.id} className="epd-file-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                    <div>
                      <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 13, color: '#0F172A', margin: 0 }}>{f.original_name}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{f.file_type === 'explanation' ? 'Explanation' : 'Final deliverable'} · {(f.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                    <a href={f.file} target="_blank" rel="noreferrer" style={{ color: '#0EA5E9', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>View</a>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Submit for QC */}
          {canSubmitForQC && (
            <Card style={{ border: '1.5px solid #BAE6FD', background: '#F0F9FF' }}>
              <SectionTitle>Ready to Submit?</SectionTitle>
              <p style={{ fontSize: 12, color: '#0369A1', margin: '0 0 14px', lineHeight: 1.5 }}>
                Once you submit, the admin team will run a quality check before delivering to the client.
              </p>
              {myFiles.length === 0 && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 12, padding: '8px 10px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8 }}>
                  <AlertTriangle size={13} strokeWidth={2.2} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 11, color: '#92400E', margin: 0, lineHeight: 1.4 }}>Upload at least one deliverable file before submitting.</p>
                </div>
              )}
              <Btn
                variant="accent"
                size="md"
                className="epd-btn"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => submitForQCMutation.mutate()}
                disabled={myFiles.length === 0 || submitForQCMutation.isPending}
              >
                <Send size={14} strokeWidth={2.2} /> {submitForQCMutation.isPending ? 'Submitting…' : 'Submit for QC'}
              </Btn>
            </Card>
          )}

          {project.status === 'completed' && (
            <Card style={{ border: '1.5px solid #BBF7D0', background: '#F0FDF4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={18} strokeWidth={2.2} color="#059669" />
                <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 14, color: '#065F46', margin: 0 }}>Project Completed</p>
              </div>
              <p style={{ fontSize: 12, color: '#047857', margin: '6px 0 0' }}>This project has been delivered to the client.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ProgressUpdateForm({ projectId, onSuccess }: { projectId: number; onSuccess: () => void }) {
  const [percentage, setPercentage] = useState(10)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [note, setNote] = useState('')

  const addProgressMutation = useMutation({
    // NOTE: verify this matches your actual projectApi method name/endpoint —
    // e.g. POST /api/projects/:id/progress/ with { percentage, time_remaining, note }
    mutationFn: () => projectApi.addProgress(projectId, { percentage, time_remaining: timeRemaining, note }),
    onSuccess: () => {
      toast.success('Progress update posted!')
      setNote('')
      onSuccess()
    },
    onError: () => toast.error('Could not post progress update.'),
  })

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Progress</label>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#0EA5E9', fontFamily: 'Syne,sans-serif' }}>{percentage}%</span>
        </div>
        <input
          type="range" min={0} max={100} step={5}
          value={percentage}
          onChange={e => setPercentage(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 6 }}>Time Remaining</label>
        <input
          value={timeRemaining}
          onChange={e => setTimeRemaining(e.target.value)}
          placeholder="e.g. 2 hours, 1 day"
          style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 6 }}>Note (optional)</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder="What have you completed so far?"
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <Btn
        variant="accent"
        size="sm"
        className="epd-btn"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        onClick={() => addProgressMutation.mutate()}
        disabled={!timeRemaining || addProgressMutation.isPending}
      >
        <Send size={13} strokeWidth={2.2} /> {addProgressMutation.isPending ? 'Posting…' : 'Post Update'}
      </Btn>
    </div>
  )
}

function UploadFileBox({ projectId, onSuccess }: { projectId: number; onSuccess: () => void }) {
  const [fileType, setFileType] = useState('expert_final')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) throw new Error('No file selected')
      const fd = new FormData()
      fd.append('file', selectedFile)
      fd.append('file_type', fileType)
      return projectApi.uploadFile(projectId, fd)
    },
    onSuccess: () => {
      toast.success('File uploaded!')
      setSelectedFile(null)
      onSuccess()
    },
    onError: () => toast.error('Upload failed.'),
  })

  const FILE_TYPES = [
    { value: 'expert_final', label: 'Final Deliverable' },
    { value: 'explanation', label: 'Explanation' },
  ]

  return (
    <div>
      <select
        value={fileType}
        onChange={e => setFileType(e.target.value)}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 12, marginBottom: 8, outline: 'none', fontFamily: 'inherit', color: '#374151' }}
      >
        {FILE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <input
        type="file"
        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
        style={{ fontSize: 12, width: '100%', marginBottom: 8 }}
      />
      <Btn
        variant="accent"
        size="sm"
        className="epd-btn"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        onClick={() => uploadMutation.mutate()}
        disabled={!selectedFile || uploadMutation.isPending}
      >
        <Upload size={14} strokeWidth={2.2} /> {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
      </Btn>
    </div>
  )
}
