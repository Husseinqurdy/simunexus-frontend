import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recruitApi } from '@/api/client'
import {
  PageHeader, LoadingSpinner, EmptyState, Table, Tr, Td, Btn, Card, SectionTitle
} from '@/components/shared'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending Test',     color: '#D97706', bg: '#FFFBEB' },
  testing:   { label: 'Taking Test',      color: '#2563EB', bg: '#EFF6FF' },
  submitted: { label: 'Test Submitted',   color: '#7C3AED', bg: '#F5F3FF' },
  passed:    { label: 'Passed ✓',         color: '#059669', bg: '#F0FDF4' },
  failed:    { label: 'Failed ✗',         color: '#E11D48', bg: '#FFF1F2' },
  retry:     { label: 'Retry Allowed',    color: '#64748B', bg: '#F8FAFC' },
}

export default function AdminRecruitment() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
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
        pass: '🎉 Applicant promoted to Expert!',
        fail: '❌ Application rejected.',
        retry: '🔄 Retry allowed.',
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
        <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>📋</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED', margin: 0, fontFamily: 'Syne,sans-serif' }}>
              {submitted.length} test submission{submitted.length > 1 ? 's' : ''} waiting for review
            </p>
            <p style={{ fontSize: 12, color: '#9333EA', margin: '2px 0 0' }}>Review applicants and decide who becomes an Expert.</p>
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
              background: statusFilter === f.value ? '#0B1C3D' : '#F1F5F9',
              color: statusFilter === f.value ? '#fff' : '#64748B',
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
          <EmptyState icon="🎓" title="No applications yet" body="Applications from the /apply-expert page will appear here." />
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
            <Table headers={['Applicant', 'Skills', 'Experience', 'Status', 'Applied', 'Action']}>
              {applications.map((a: any) => {
                const cfg = STATUS_CFG[a.status] || STATUS_CFG.pending
                return (
                  <Tr key={a.id} onClick={() => { setSelected(a); setAdminNotes(a.admin_notes || '') }}>
                    <Td>
                      <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: '#0F172A' }}>{a.applicant_email}</p>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(a.skills || []).slice(0, 3).map((s: string) => (
                          <span key={s} style={{ padding: '2px 7px', borderRadius: 999, background: '#F1F5F9', fontSize: 10, color: '#475569', fontWeight: 600 }}>{s}</span>
                        ))}
                        {(a.skills || []).length > 3 && <span style={{ fontSize: 10, color: '#94A3B8' }}>+{a.skills.length - 3}</span>}
                      </div>
                    </Td>
                    <Td><span style={{ fontSize: 13, color: '#64748B' }}>{a.experience_years}y exp</span></Td>
                    <Td>
                      <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}20` }}>
                        {cfg.label}
                      </span>
                    </Td>
                    <Td><span style={{ fontSize: 12, color: '#94A3B8' }}>{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span></Td>
                    <Td>
                      {a.status === 'submitted' && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED' }}>⚡ Review</span>
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
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 20, lineHeight: 1 }}>×</button>
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
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F8FAFC' }}>
                  <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{String(value)}</span>
                </div>
              ))}

              {selected.skills?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px' }}>Skills</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {selected.skills.map((s: string) => (
                      <span key={s} style={{ padding: '4px 10px', borderRadius: 999, background: '#EFF6FF', fontSize: 12, color: '#2563EB', fontWeight: 600, border: '1px solid #BFDBFE' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.bio && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 6px' }}>Bio</p>
                  <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, margin: 0 }}>{selected.bio}</p>
                </div>
              )}

              {selected.portfolio_url && (
                <div style={{ marginTop: 12 }}>
                  <a href={selected.portfolio_url} target="_blank" rel="noreferrer"
                    style={{ fontSize: 12, color: '#0EA5E9', fontWeight: 600, textDecoration: 'none' }}>
                    🔗 View Portfolio
                  </a>
                </div>
              )}

              {selected.test_submission && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', margin: '0 0 8px' }}>📎 Test Submission</p>
                  <a href={selected.test_submission.file} target="_blank" rel="noreferrer"
                    style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>
                    Download Test File →
                  </a>
                  {selected.test_submission.notes && (
                    <p style={{ fontSize: 11, color: '#6D28D9', margin: '6px 0 0', lineHeight: 1.5 }}>{selected.test_submission.notes}</p>
                  )}
                </div>
              )}
            </Card>

            {/* Review Actions — only for submitted applications */}
            {selected.status === 'submitted' && (
              <Card style={{ border: '1.5px solid #DDD6FE', background: '#F5F3FF' }}>
                <SectionTitle>Review Decision</SectionTitle>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: '#6D28D9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 5 }}>Admin Notes (optional)</label>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Feedback for this applicant..."
                    rows={3}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #DDD6FE', fontSize: 12, fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Btn
                    style={{ background: '#059669', color: '#fff', border: 'none', width: '100%' }}
                    onClick={() => reviewMutation.mutate({ id: selected.id, action: 'pass', notes: adminNotes })}
                    disabled={reviewMutation.isPending}
                  >
                    ✅ Pass — Promote to Expert
                  </Btn>
                  <Btn
                    variant="outline"
                    size="md"
                    style={{ width: '100%' }}
                    onClick={() => reviewMutation.mutate({ id: selected.id, action: 'retry', notes: adminNotes })}
                    disabled={reviewMutation.isPending}
                  >
                    🔄 Allow Retry
                  </Btn>
                  <Btn
                    variant="danger"
                    size="md"
                    style={{ width: '100%' }}
                    onClick={() => reviewMutation.mutate({ id: selected.id, action: 'fail', notes: adminNotes })}
                    disabled={reviewMutation.isPending}
                  >
                    ❌ Reject Application
                  </Btn>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
