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
import { ProjectFilesPanel } from '@/components/shared/Files'
import { errorMessage } from '@/lib/format'

const ADMIN_UPLOAD_TYPES = [
  { value: 'admin_delivery', label: 'Delivery file (shown to client when completed)' },
  { value: 'expert_final', label: 'Final deliverable' },
  { value: 'explanation', label: 'Explanation / report' },
  { value: 'client_upload', label: 'Client input file' },
  { value: 'expert_partial', label: 'Work in progress (internal)' },
]
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F5F7FC' }}>
      <span style={{ fontSize: 12, color: '#667697', fontWeight: 600,}}>{label}</span>
      <span style={{ fontSize: 13, color: '#0A1F4D', fontWeight: 600 }}>{value}</span>
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

  // React Query v5 — hakuna onSuccess hapa
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['admin-project', id],
    queryFn: () => projectApi.detail(Number(id)).then(r => r.data as Project),
  })

  // useEffect badala ya onSuccess
  useEffect(() => {
    if (project) setAdminNotes(project.admin_notes || '')
  }, [project?.id])

  const { data: expertsData } = useQuery({
  queryKey: ['experts-list', 'available'],
  queryFn: () => authApi.adminUsers({ role: 'expert', is_available: true }).then(r => r.data),
})
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-project', id] })

  const setPriceMutation = useMutation({
    mutationFn: () => projectApi.setPrice(Number(id), { client_price: priceInput }),
    onSuccess: () => { toast.success('Price set & client notified!'); invalidate(); setPriceInput('') },
    onError: () => toast.error('Failed to set price.'),
  })

  const approveMutation = useMutation({
    mutationFn: (payload: { action: string; reason?: string; force?: boolean }) =>
      projectApi.approve(Number(id), payload),
    onSuccess: (_: unknown, { action }: { action: string; reason?: string; force?: boolean }) => {
      toast.success(action === 'approve' ? 'Project approved & delivered to client!' : 'Revision requested.')
      invalidate()
      setShowRevisionBox(false)
    },
    onError: (e: any, vars) => {
      // Mteja hajalipa kikamilifu: msimamizi anaweza kuidhinisha kwa kulazimisha (force) baada ya uthibitisho
      if (e?.response?.data?.code === 'NOT_FULLY_PAID' && vars.action === 'approve' && !vars.force) {
        if (window.confirm('The client has NOT fully paid for this project.\n\nApproving now will still pay the expert\'s commission. Approve anyway?')) {
          approveMutation.mutate({ ...vars, force: true })
        }
        return
      }
      toast.error(errorMessage(e, 'Action failed.'))
    },
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
    <div style={{ textAlign: 'center', padding: 60, color: '#667697' }}>
      <p style={{ fontSize: 16, fontWeight: 700 }}>Project not found.</p>
      <button onClick={() => navigate('/admin/projects')} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 10, background: '#0D52CE', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
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
          from { opacity: 0; transform: translateY(0); }
          to { opacity: 1; transform: translateY(0); }
        }
        .detail-card-anim {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .detail-card-anim:hover {
          transform: translateY(0);
          box-shadow: 0 8px 20px rgba(10,31,77, 0.07);
        }
        .detail-btn {
          transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease;
        }
        .detail-btn:hover {
          transform: scale(1);
          opacity: 0.9;
        }
        .detail-btn:active {
          transform: scale(0.96);
        }
        .revision-box {
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(0); }
          to { opacity: 1; transform: translateY(0); }
        }
        .file-row {
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .file-row:hover {
          background: #EBEFF8;
          transform: translateX(2px);
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          className="detail-btn"
          onClick={() => navigate('/admin/projects')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EBEFF8', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#4E5E82', fontWeight: 600 }}
        >
          <ArrowLeft size={14} strokeWidth={2.2} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'inherit', fontSize: 20, fontWeight: 700, color: '#0A1F4D', margin: 0 }}>
            {project.title}
          </h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <StatusBadge status={project.status} />
            <SoftwareLabel software={project.software} />
            <DeliveryBadge type={project.delivery_type} />
            {project.is_nda && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#2E4DA7', background: '#EEF2FB', padding: '3px 10px', borderRadius: 999, border: '1px solid #C9D4F0' }}>
                <Lock size={11} strokeWidth={2.4} /> NDA
              </span>
            )}
          </div>
        </div>
      </div>

      {/* QC Banner */}
      {project.status === 'qc' && (
        <div style={{ background: '#FFF8E6', border: '1px solid #F8DC8A', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AlertTriangle size={18} strokeWidth={2} color="#B85F00" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7A4A00', margin: 0 }}>Ready for Quality Check</p>
            <p style={{ fontSize: 12, color: '#9A5B00', margin: '3px 0 0' }}>Expert has submitted. Review and approve to deliver to client, or request revision.</p>
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
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 8, background: '#EAF1FD', color: '#0D52CE', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
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
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 8, background: '#EDF8F1', color: '#137A4E', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                    >
                      <MessageCircle size={12} strokeWidth={2.2} /> Chat
                    </button>
                  </div>
                : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#9A5B00', fontWeight: 700 }}>
                    <AlertTriangle size={13} strokeWidth={2.2} /> Not assigned
                  </span>
            } />
            <InfoRow label="Deadline" value={safeFormat(project.deadline, 'dd MMM yyyy, HH:mm')} />
            <InfoRow label="Submitted" value={safeDistance(project.created_at)} />
            <InfoRow label="Payment" value={
              project.is_fully_paid
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#137A4E', fontWeight: 700 }}>
                    <CheckCircle2 size={14} strokeWidth={2.2} /> Fully Paid
                  </span>
                : project.advance_paid && project.advance_paid !== '0.00' && project.advance_paid !== '0'
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#B85F00', fontWeight: 700 }}>
                    <Zap size={14} strokeWidth={2.2} /> Advance: {formatTSH(project.advance_paid)}
                  </span>
                : <span style={{ color: '#667697' }}>Not paid</span>
            } />
            {project.include_explanation && (
              <InfoRow label="Explanation" value={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#2E4DA7', fontWeight: 700 }}>
                  Included <Check size={13} strokeWidth={2.4} />
                </span>
              } />
            )}
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 12, color: '#667697', fontWeight: 600, marginBottom: 8 }}>Description</p>
              <p style={{ fontSize: 13, color: '#2B3A60', lineHeight: 1.7, margin: 0 }}>{project.description}</p>
            </div>
          </Card>

          {/* Progress */}
          {project.progress_updates && project.progress_updates.length > 0 && (
            <Card>
              <SectionTitle>Progress Updates</SectionTitle>
              {latestProgress && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#2B3A60', fontWeight: 700 }}>Overall Progress</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0D52CE' }}>{latestProgress.percentage}%</span>
                  </div>
                  <ProgressBar percentage={latestProgress.percentage} />
                  <p style={{ fontSize: 12, color: '#667697', margin: '6px 0 0' }}>Time remaining: {latestProgress.time_remaining}</p>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {project.progress_updates.map((u: ProjectProgress) => (
                  <div key={u.id} className="file-row" style={{ padding: '10px 14px', background: '#F5F7FC', borderRadius: 10, border: '1px solid #EBEFF8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0A1F4D' }}>{u.percentage}% — {u.time_remaining} remaining</span>
                      <span style={{ fontSize: 12, color: '#667697' }}>{safeDistance(u.created_at)}</span>
                    </div>
                    {u.note && <p style={{ fontSize: 12, color: '#4E5E82', margin: 0, lineHeight: 1.5 }}>{u.note}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Files */}
          <ProjectFilesPanel
            projectId={Number(id)}
            files={project.files || []}
            title="Project files"
            emptyText="No files uploaded yet."
            uploadTypes={ADMIN_UPLOAD_TYPES}
            canDelete={() => true}
            onChanged={invalidate}
          />

          {/* Review */}
          {project.review && (
            <Card>
              <SectionTitle>Client Review</SectionTitle>
              <StarRating rating={project.review.rating} size={18} />
              {project.review.comment && (
                <p style={{ fontSize: 13, color: '#2B3A60', lineHeight: 1.6, marginTop: 10 }}>"{project.review.comment}"</p>
              )}
              <p style={{ fontSize: 12, color: '#667697', marginTop: 8 }}>
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
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #DCE3F0', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: '#2B3A60', transition: 'border-color 0.15s ease' }}
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
              <p style={{ fontSize: 12, color: '#667697', margin: '0 0 12px', lineHeight: 1.5 }}>
                Set the price for this project. Client will be notified.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#667697', fontWeight: 700, fontSize: 12 }}>TSH</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceInput}
                    onChange={e => setPriceInput(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 42px', borderRadius: 10, border: '1.5px solid #DCE3F0', fontSize: 14, fontWeight: 700, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
                <Btn variant="accent" size="sm" className="detail-btn" onClick={() => setPriceMutation.mutate()} disabled={!priceInput || setPriceMutation.isPending}>
                  Set
                </Btn>
              </div>
            </Card>
          )}

          {project.client_price && (
            <Card style={{ border: '1.5px solid #BFE5CF', background: '#EDF8F1' }}>
              <p style={{ fontSize: 12, color: '#4E5E82', margin: '0 0 4px', fontWeight: 600 }}>Client Price</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#137A4E', margin: 0, fontFamily: 'inherit' }}>{formatTSH(project.client_price)}</p>
              <p style={{ fontSize: 12, color: '#667697', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                {project.is_fully_paid
                  ? <><CheckCircle2 size={13} strokeWidth={2.2} color="#137A4E" /> Fully paid</>
                  : project.advance_paid && project.advance_paid !== '0.00'
                  ? <><Zap size={13} strokeWidth={2.2} color="#B85F00" /> Advance: {formatTSH(project.advance_paid)}</>
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
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #DCE3F0', fontSize: 13, marginBottom: 10, outline: 'none', fontFamily: 'inherit', color: '#2B3A60' }}
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
            <Card style={{ border: '1.5px solid #F8DC8A', background: '#FFF8E6' }}>
              <SectionTitle>QC Decision</SectionTitle>
              <p style={{ fontSize: 12, color: '#7A4A00', margin: '0 0 14px', lineHeight: 1.5 }}>
                Review the expert's submission and make a decision.
              </p>
              <Btn
                variant="primary"
                size="md"
                className="detail-btn"
                style={{ width: '100%', marginBottom: 8, background: '#137A4E', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
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
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #DCE3F0', fontSize: 12, fontFamily: 'inherit', resize: 'none', marginBottom: 8, outline: 'none', boxSizing: 'border-box' }}
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

        </div>
      </div>
    </div>
  )
}
