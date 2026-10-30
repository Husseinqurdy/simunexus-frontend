import { FilePreviewModal } from '@/components/shared/Files'
import { formatBytes } from '@/lib/format'
import { ClipboardList, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recruitApi } from '@/api/client'
import {
  PageHeader, LoadingSpinner, EmptyState, Table, Tr, Td, Btn, Card, SectionTitle
} from '@/components/shared'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending Test',     color: '#B85F00', bg: '#FFF8E6' },
  testing:   { label: 'Taking Test',      color: '#0D52CE', bg: '#EAF1FD' },
  submitted: { label: 'Test Submitted',   color: '#2E4DA7', bg: '#EEF2FB' },
  passed:    { label: 'Passed ',         color: '#137A4E', bg: '#EDF8F1' },
  failed:    { label: 'Failed ',         color: '#B92D2D', bg: '#FDEDED' },
  retry:     { label: 'Retry Allowed',    color: '#4E5E82', bg: '#F5F7FC' },
}

export default function AdminRecruitment() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
  const [previewFile, setPreviewFile] = useState<any | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', statusFilter],
    queryFn: () => recruitApi.adminList({ ...(statusFilter && { status: statusFilter }) }).then(r => r.data),
    refetchInterval: 30000,
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: number; action: string; notes?: string }) =>
      recruitApi.adminReview(id, { action, notes }),
    onSuccess: (_, { action }) => {
      const msgs: Record<string, string> = {
        pass: 'Applicant promoted to Expert!',
        fail: 'Application rejected.',
        retry: 'Retry allowed.',
      }
      toast.success(msgs[action] || 'Done.')
      qc.invalidateQueries({ queryKey: ['admin-applications'] })
      setSelected(null)
      setAdminNotes('')
    },
    onError: () => toast.error('Action failed.'),
  })

  const applications = data?.results || []
  const submitted = applications.filter((a: any) => a.status === 'submitted')

  const FILTERS = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'testing', label: 'Testing' },
    { value: 'submitted', label: 'To Review' },
    { value: 'passed', label: 'Passed' },
    { value: 'failed', label: 'Failed' },
  ]

  return (
    <div>
      <PageHeader
        title="Expert Recruitment"
        subtitle={`${data?.count || 0} total applications`}
      />

      {/* Alert for pending reviews */}
      {submitted.length > 0 && (
        <div style={{ background: '#EEF2FB', border: '1px solid #C9D4F0', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ClipboardList size={18} color="#0D52CE" />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#2E4DA7', margin: 0, fontFamily: 'inherit' }}>
              {submitted.length} test submission{submitted.length > 1 ? 's' : ''} waiting for review
            </p>
            <p style={{ fontSize: 12, color: '#2E4DA7', margin: '2px 0 0' }}>Review applicants and decide who becomes an Expert.</p>
          </div>
        </div>
      )}

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', border: 'none', transition: 'all .2s',
              background: statusFilter === f.value ? '#0A1F6B' : '#EBEFF8',
              color: statusFilter === f.value ? '#fff' : '#4E5E82',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20 }}>
        {/* Table */}
        {isLoading ? (
          <LoadingSpinner label="Loading applications..." />
        ) : applications.length === 0 ? (
          <EmptyState icon={<GraduationCap size={26} strokeWidth={1.8} />} title="No applications yet" body="Applications from the /apply-expert page will appear here." />
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EBEFF8', overflow: 'hidden' }}>
            <Table headers={['Applicant', 'Skills', 'Experience', 'Status', 'Applied', 'Action']}>
              {applications.map((a: any) => {
                const cfg = STATUS_CFG[a.status] || STATUS_CFG.pending
                return (
                  <Tr key={a.id} onClick={() => { setSelected(a); setAdminNotes(a.admin_notes || '') }}>
                    <Td>
                      <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: '#0A1F4D' }}>{a.applicant_email}</p>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(a.skills || []).slice(0, 3).map((s: string) => (
                          <span key={s} style={{ padding: '2px 7px', borderRadius: 999, background: '#EBEFF8', fontSize: 12, color: '#3A4A70', fontWeight: 600 }}>{s}</span>
                        ))}
                        {(a.skills || []).length > 3 && <span style={{ fontSize: 12, color: '#667697' }}>+{a.skills.length - 3}</span>}
                      </div>
                    </Td>
                    <Td><span style={{ fontSize: 13, color: '#4E5E82' }}>{a.experience_years}y exp</span></Td>
                    <Td>
                      <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}20` }}>
                        {cfg.label}
                      </span>
                    </Td>
                    <Td><span style={{ fontSize: 12, color: '#667697' }}>{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span></Td>
                    <Td>
                      {a.status === 'submitted' && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#2E4DA7' }}>Review</span>
                      )}
                    </Td>
                  </Tr>
                )
              })}
            </Table>
          </div>
        )}

        {/* Sidebar detail */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <SectionTitle>Application Details</SectionTitle>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667697', fontSize: 20, lineHeight: 1 }}>×</button>
              </div>

              {[
                { label: 'Email', value: selected.applicant_email },
                { label: 'Experience', value: `${selected.experience_years} years` },
                { label: 'Status', value: STATUS_CFG[selected.status]?.label || selected.status },
                { label: 'Retry Count', value: selected.retry_count },
                { label: 'Applied', value: format(new Date(selected.created_at), 'dd MMM yyyy') },
                ...(selected.test_started_at ? [{ label: 'Test Started', value: format(new Date(selected.test_started_at), 'dd MMM HH:mm') }] : []),
                ...(selected.test_submitted_at ? [{ label: 'Test Submitted', value: format(new Date(selected.test_submitted_at), 'dd MMM HH:mm') }] : []),
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F5F7FC' }}>
                  <span style={{ fontSize: 12, color: '#667697', fontWeight: 600,}}>{label}</span>
                  <span style={{ fontSize: 12, color: '#2B3A60', fontWeight: 600 }}>{String(value)}</span>
                </div>
              ))}

              {selected.skills?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 12, color: '#667697', fontWeight: 700, margin: '0 0 8px' }}>Skills</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {selected.skills.map((s: string) => (
                      <span key={s} style={{ padding: '4px 10px', borderRadius: 999, background: '#EAF1FD', fontSize: 12, color: '#0D52CE', fontWeight: 600, border: '1px solid #C4DBF1' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.bio && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 12, color: '#667697', fontWeight: 700, margin: '0 0 6px' }}>Bio</p>
                  <p style={{ fontSize: 12, color: '#2B3A60', lineHeight: 1.6, margin: 0 }}>{selected.bio}</p>
                </div>
              )}

              {selected.portfolio_url && (
                <div style={{ marginTop: 12 }}>
                  <a href={selected.portfolio_url} target="_blank" rel="noreferrer"
                    style={{ fontSize: 12, color: '#0D52CE', fontWeight: 600, textDecoration: 'none' }}>
                    View Portfolio
                  </a>
                </div>
              )}

              {selected.test_questions?.length > 0 && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: '#F5F7FC', border: '1px solid #DCE3F0', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0A1F4D', margin: '0 0 8px' }}>Question given to the applicant</p>
                  {selected.test_questions.map((q: any) => (
                    <div key={q.id} style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, background: '#EAF1FD', color: '#0A42A8', borderRadius: 999, padding: '2px 9px' }}>{q.tool_name}</span>
                      <p style={{ fontSize: 13, color: '#2B3A60', lineHeight: 1.6, margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{q.question_text}</p>
                    </div>
                  ))}
                </div>
              )}

              {selected.test_submission ? (
                <div style={{ marginTop: 14, padding: '12px 14px', background: '#EAF1FD', border: '1px solid #C4DBF1', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0A42A8', margin: '0 0 8px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    Test submission
                    {selected.test_submission.is_late && <span style={{ fontSize: 12, background: '#FDEDED', color: '#B92D2D', borderRadius: 999, padding: '2px 9px' }}>Submitted late</span>}
                  </p>
                  <div style={{ fontSize: 13, color: '#0A1F4D', wordBreak: 'break-word' }}>{selected.test_submission.file_name} <span style={{ color: '#667697' }}>· {formatBytes(selected.test_submission.file_size)}</span></div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {selected.test_submission.preview !== 'other' && (
                      <button onClick={() => setPreviewFile(selected.test_submission)} style={{ height: 34, padding: '0 12px', borderRadius: 8, border: '1px solid #C3CEE2', background: '#fff', color: '#0A1F6B', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Preview</button>
                    )}
                    <a href={selected.test_submission.url} target="_blank" rel="noopener noreferrer" style={{ height: 34, display: 'inline-flex', alignItems: 'center', padding: '0 12px', borderRadius: 8, background: '#0D52CE', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Download</a>
                  </div>
                  {selected.test_submission.notes && <p style={{ fontSize: 13, color: '#2B3A60', margin: '10px 0 0', lineHeight: 1.6 }}><strong>Notes:</strong> {selected.test_submission.notes}</p>}
                </div>
              ) : selected.status === 'submitted' && (
                <p style={{ fontSize: 13, color: '#B92D2D', marginTop: 12 }}>No file was attached to this submission.</p>
              )}
            </Card>

            {/* Review Actions — only for submitted applications */}
            {selected.status === 'submitted' && (
              <Card style={{ border: '1.5px solid #C9D4F0', background: '#EEF2FB' }}>
                <SectionTitle>Review Decision</SectionTitle>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: '#2E4DA7', fontWeight: 700, display: 'block', marginBottom: 5 }}>Admin Notes (optional)</label>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Feedback for this applicant..."
                    rows={3}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #C9D4F0', fontSize: 12, fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Btn
                    style={{ background: '#137A4E', color: '#fff', border: 'none', width: '100%' }}
                    onClick={() => reviewMutation.mutate({ id: selected.id, action: 'pass', notes: adminNotes })}
                    disabled={reviewMutation.isPending}
                  >
                    Pass — Promote to Expert
                  </Btn>
                  <Btn
                    variant="outline"
                    size="md"
                    style={{ width: '100%' }}
                    onClick={() => reviewMutation.mutate({ id: selected.id, action: 'retry', notes: adminNotes })}
                    disabled={reviewMutation.isPending}
                  >
                    Allow Retry
                  </Btn>
                  <Btn
                    variant="danger"
                    size="md"
                    style={{ width: '100%' }}
                    onClick={() => reviewMutation.mutate({ id: selected.id, action: 'fail', notes: adminNotes })}
                    disabled={reviewMutation.isPending}
                  >
                    Reject Application
                  </Btn>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
      {previewFile && <FilePreviewModal name={previewFile.file_name} url={previewFile.url} kind={previewFile.preview} onClose={() => setPreviewFile(null)} />}
    </div>
  )
}
