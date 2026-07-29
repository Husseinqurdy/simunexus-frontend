import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi, authApi, chatApi } from '@/api/client'
import {
  StatusBadge, SoftwareLabel, DeliveryBadge,
  LoadingSpinner, Card, SectionTitle, Btn, ProgressBar, StarRating
} from '@/components/shared'
import { format, formatDistanceToNow, isValid } from 'date-fns'
import toast from 'react-hot-toast'
import type { Project, User, ProjectProgress, ProjectFile } from '@/types'
import {
  Lock,
  AlertTriangle,
  MessageCircle,
  CheckCircle2,
  Zap,
  Check,
  Paperclip,
  Undo2,
  Upload,
  ArrowLeft,
} from 'lucide-react'

// Safe date helpers — crash-proof
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

const formatTSH = (value: number | string | undefined | null) => {
  const n = Number(value || 0)
  return `TSH ${n.toLocaleString('en-US')}`
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F8FAFC' }}>
      <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

export default function AdminProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [priceInput, setPriceInput] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [revisionReason, setRevisionReason] = useState('')
  const [showRevisionBox, setShowRevisionBox] = useState(false)
  const [assignExpertId, setAssignExpertId] = useState('')

  // ✅ React Query v5 — hakuna onSuccess hapa
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['admin-project', id],
    queryFn: () => projectApi.detail(Number(id)).then(r => r.data as Project),
  })

  // ✅ useEffect badala ya onSuccess
  useEffect(() => {
    if (project) setAdminNotes(project.admin_notes || '')
  }, [project?.id])

  const { data: expertsData } = useQuery({
    queryKey: ['experts-list'],
    queryFn: () => authApi.adminUsers({ role: 'expert' }).then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-project', id] })

  const setPriceMutation = useMutation({
    mutationFn: () => projectApi.setPrice(Number(id), { client_price: priceInput }),
    onSuccess: () => { toast.success('Price set & client notified!'); invalidate(); setPriceInput('') },
    onError: () => toast.error('Failed to set price.'),
  })

  const approveMutation = useMutation({
    mutationFn: (payload: { action: string; reason?: string }) =>
      projectApi.approve(Number(id), payload),
    onSuccess: (_: unknown, { action }: { action: string; reason?: string }) => {
      toast.success(action === 'approve' ? 'Project approved & delivered to client!' : 'Revision requested.')
      invalidate()
      setShowRevisionBox(false)
    },
    onError: () => toast.error('Action failed.'),
  })

  const assignMutation = useMutation({
    mutationFn: (expertId: number) =>
      projectApi.update(Number(id), { expert: expertId, status: 'assigned' }),
    onSuccess: () => { toast.success('Expert assigned!'); invalidate(); setAssignExpertId('') },
    onError: () => toast.error('Failed to assign expert.'),
  })

  const saveNotesMutation = useMutation({
    mutationFn: () => projectApi.update(Number(id), { admin_notes: adminNotes }),
    onSuccess: () => { toast.success('Notes saved.'); invalidate() },
    onError: () => toast.error('Failed to save notes.'),
  })

  const openChatMutation = useMutation({
    mutationFn: (userId: number) => chatApi.createRoom({ user_id: userId, project_id: Number(id) }),
    onSuccess: () => { toast.success('Chat room ready.'); navigate('/admin/chat') },
    onError: () => toast.error('Could not open chat.'),
  })

  if (isLoading) return <LoadingSpinner label="Loading project..." />
  if (!project) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>
      <p style={{ fontSize: 16, fontWeight: 700 }}>Project not found.</p>
      <button onClick={() => navigate('/admin/projects')} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 10, background: '#0B1C3D', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
        Back to Projects
      </button>
    </div>
  )

  const experts: User[] = expertsData?.results || []
  const latestProgress = project.progress_updates?.[0]
  const clientUser = project.client as User
  const expertUser = project.expert as User | null

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .detail-card-anim {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .detail-card-anim:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.07);
        }
        .detail-btn {
          transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease;
        }
        .detail-btn:hover {
          transform: scale(1.04);
          opacity: 0.9;
        }
        .detail-btn:active {
          transform: scale(0.96);
        }
        .revision-box {
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .file-row {
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .file-row:hover {
          background: #F1F5F9;
          transform: translateX(2px);
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          className="detail-btn"
          onClick={() => navigate('/admin/projects')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F1F5F9', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#64748B', fontWeight: 600 }}
        >
          <ArrowLeft size={14} strokeWidth={2.2} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {project.title}
          </h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
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

      {/* QC Banner */}
      {project.status === 'qc' && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AlertTriangle size={18} strokeWidth={2} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#92400E', margin: 0 }}>Ready for Quality Check</p>
            <p style={{ fontSize: 12, color: '#B45309', margin: '3px 0 0' }}>Expert has submitted. Review and approve to deliver to client, or request revision.</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginTop: 8 }}>
        {/* ===== LEFT ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Project Info */}
          <Card>
            <SectionTitle>Project Details</SectionTitle>
            <InfoRow label="Client" value={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{clientUser?.first_name} {clientUser?.last_name}</span>
                <button
                  className="detail-btn"
                  onClick={() => clientUser && openChatMutation.mutate(clientUser.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 8, background: '#EFF6FF', color: '#2563EB', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                >
                  <MessageCircle size={12} strokeWidth={2.2} /> Chat
                </button>
              </div>
            } />
            <InfoRow label="Expert" value={
              expertUser
                ? <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{expertUser.first_name} {expertUser.last_name}</span>
                    <button
                      className="detail-btn"
                      onClick={() => openChatMutation.mutate(expertUser.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 8, background: '#F0FDF4', color: '#059669', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                    >
                      <MessageCircle size={12} strokeWidth={2.2} /> Chat
                    </button>
                  </div>
                : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#F59E0B', fontWeight: 700 }}>
                    <AlertTriangle size={13} strokeWidth={2.2} /> Not assigned
                  </span>
            } />
            <InfoRow label="Deadline" value={safeFormat(project.deadline, 'dd MMM yyyy, HH:mm')} />
            <InfoRow label="Submitted" value={safeDistance(project.created_at)} />
            <InfoRow label="Payment" value={
              project.is_fully_paid
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontWeight: 700 }}>
                    <CheckCircle2 size={14} strokeWidth={2.2} /> Fully Paid
                  </span>
                : project.advance_paid && project.advance_paid !== '0.00' && project.advance_paid !== '0'
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#D97706', fontWeight: 700 }}>
                    <Zap size={14} strokeWidth={2.2} /> Advance: {formatTSH(project.advance_paid)}
                  </span>
                : <span style={{ color: '#94A3B8' }}>Not paid</span>
            } />
            {project.include_explanation && (
              <InfoRow label="Explanation" value={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#7C3AED', fontWeight: 700 }}>
                  Included <Check size={13} strokeWidth={2.4} />
                </span>
              } />
            )}
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Description</p>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: 0 }}>{project.description}</p>
            </div>
          </Card>

          {/* Progress */}
          {project.progress_updates && project.progress_updates.length > 0 && (
            <Card>
              <SectionTitle>Progress Updates</SectionTitle>
              {latestProgress && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 700 }}>Overall Progress</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0EA5E9' }}>{latestProgress.percentage}%</span>
                  </div>
                  <ProgressBar percentage={latestProgress.percentage} />
                  <p style={{ fontSize: 12, color: '#94A3B8', margin: '6px 0 0' }}>Time remaining: {latestProgress.time_remaining}</p>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {project.progress_updates.map((u: ProjectProgress) => (
                  <div key={u.id} className="file-row" style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
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

          {/* Files */}
          {project.files && project.files.length > 0 && (
            <Card>
              <SectionTitle>Project Files</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {project.files.map((f: ProjectFile) => (
                  <div key={f.id} className="file-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Paperclip size={16} strokeWidth={2} color="#2563EB" />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#0F172A' }}>{f.original_name}</p>
                        <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
                          {f.file_type.replace(/_/g, ' ')} · {(f.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <a href={f.file} target="_blank" rel="noreferrer" className="detail-btn"
                      style={{ padding: '5px 12px', borderRadius: 8, background: '#EFF6FF', color: '#2563EB', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Review */}
          {project.review && (
            <Card>
              <SectionTitle>Client Review</SectionTitle>
              <StarRating rating={project.review.rating} size={18} />
              {project.review.comment && (
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginTop: 10 }}>"{project.review.comment}"</p>
              )}
              <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>
                {safeDistance(project.review.created_at)}
              </p>
            </Card>
          )}

          {/* Admin Notes */}
          <Card>
            <SectionTitle>Admin Notes</SectionTitle>
            <textarea
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              placeholder="Internal notes about this project..."
              rows={4}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: '#374151', transition: 'border-color 0.15s ease' }}
            />
            <div style={{ marginTop: 10, textAlign: 'right' }}>
              <Btn size="sm" onClick={() => saveNotesMutation.mutate()} disabled={saveNotesMutation.isPending}>
                {saveNotesMutation.isPending ? 'Saving…' : 'Save Notes'}
              </Btn>
            </div>
          </Card>
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Set Price */}
          {!project.client_price && (
            <Card className="detail-card-anim">
              <SectionTitle>Set Client Price</SectionTitle>
              <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 12px', lineHeight: 1.5 }}>
                Set the price for this project. Client will be notified.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontWeight: 700, fontSize: 12 }}>TSH</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceInput}
                    onChange={e => setPriceInput(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 42px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, fontWeight: 700, outline: 'none', boxSizing: 'border-box', fontFamily: 'Syne,sans-serif' }}
                  />
                </div>
                <Btn variant="accent" size="sm" className="detail-btn" onClick={() => setPriceMutation.mutate()} disabled={!priceInput || setPriceMutation.isPending}>
                  Set
                </Btn>
              </div>
            </Card>
          )}

          {project.client_price && (
            <Card style={{ border: '1.5px solid #BBF7D0', background: '#F0FDF4' }}>
              <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Client Price</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#059669', margin: 0, fontFamily: 'Syne,sans-serif' }}>{formatTSH(project.client_price)}</p>
              <p style={{ fontSize: 12, color: '#94A3B8', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                {project.is_fully_paid
                  ? <><CheckCircle2 size={13} strokeWidth={2.2} color="#059669" /> Fully paid</>
                  : project.advance_paid && project.advance_paid !== '0.00'
                  ? <><Zap size={13} strokeWidth={2.2} color="#D97706" /> Advance: {formatTSH(project.advance_paid)}</>
                  : 'Awaiting payment'}
              </p>
            </Card>
          )}

          {/* Assign Expert */}
          {!project.expert && (
            <Card>
              <SectionTitle>Assign Expert</SectionTitle>
              <select
                value={assignExpertId}
                onChange={e => setAssignExpertId(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, marginBottom: 10, outline: 'none', fontFamily: 'inherit', color: '#374151' }}
              >
                <option value="">Select expert...</option>
                {experts.map((e: User) => (
                  <option key={e.id} value={e.id}>
                    {e.first_name} {e.last_name} ({e.email})
                  </option>
                ))}
              </select>
              <Btn
                variant="accent"
                size="sm"
                className="detail-btn"
                style={{ width: '100%' }}
                onClick={() => assignExpertId && assignMutation.mutate(Number(assignExpertId))}
                disabled={!assignExpertId || assignMutation.isPending}
              >
                {assignMutation.isPending ? 'Assigning…' : 'Assign Expert'}
              </Btn>
            </Card>
          )}

          {/* QC Decision */}
          {project.status === 'qc' && (
            <Card style={{ border: '1.5px solid #FDE68A', background: '#FFFBEB' }}>
              <SectionTitle>QC Decision</SectionTitle>
              <p style={{ fontSize: 12, color: '#92400E', margin: '0 0 14px', lineHeight: 1.5 }}>
                Review the expert's submission and make a decision.
              </p>
              <Btn
                variant="primary"
                size="md"
                className="detail-btn"
                style={{ width: '100%', marginBottom: 8, background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => approveMutation.mutate({ action: 'approve' })}
                disabled={approveMutation.isPending}
              >
                <CheckCircle2 size={15} strokeWidth={2.2} /> Approve & Deliver to Client
              </Btn>
              {!showRevisionBox ? (
                <Btn variant="outline" size="md" className="detail-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={() => setShowRevisionBox(true)}>
                  <Undo2 size={15} strokeWidth={2.2} /> Request Revision
                </Btn>
              ) : (
                <div className="revision-box">
                  <textarea
                    value={revisionReason}
                    onChange={e => setRevisionReason(e.target.value)}
                    placeholder="Reason for revision..."
                    rows={3}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 12, fontFamily: 'inherit', resize: 'none', marginBottom: 8, outline: 'none', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn
                      variant="danger"
                      size="sm"
                      className="detail-btn"
                      style={{ flex: 1 }}
                      onClick={() => approveMutation.mutate({ action: 'reject', reason: revisionReason })}
                      disabled={!revisionReason || approveMutation.isPending}
                    >
                      Send Revision
                    </Btn>
                    <Btn variant="ghost" size="sm" className="detail-btn" onClick={() => setShowRevisionBox(false)}>Cancel</Btn>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Upload File */}
          <Card>
            <SectionTitle>Upload File</SectionTitle>
            <UploadFileBox projectId={Number(id)} onSuccess={invalidate} />
          </Card>

        </div>
      </div>
    </div>
  )
}

function UploadFileBox({ projectId, onSuccess }: { projectId: number; onSuccess: () => void }) {
  const [fileType, setFileType] = useState('admin_delivery')
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
    { value: 'admin_delivery', label: 'Delivery File' },
    { value: 'explanation', label: 'Explanation' },
    { value: 'expert_final', label: 'Expert Final' },
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
        className="detail-btn"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        onClick={() => uploadMutation.mutate()}
        disabled={!selectedFile || uploadMutation.isPending}
      >
        <Upload size={14} strokeWidth={2.2} /> {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
      </Btn>
    </div>
  )
}