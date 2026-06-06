import { useQuery } from '@tanstack/react-query'
import { authApi, projectApi, paymentApi } from '@/api/client'
import { StatCard, StatusBadge, LoadingSpinner, Alert, PageHeader, Card, SectionTitle, Table, Tr, Td } from '@/components/shared'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import type { Project } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ['system-summary'],
    queryFn: () => authApi.systemSummary().then(r => r.data),
    refetchInterval: 30000,
  })
  const { data: projectsData, isLoading: projLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => projectApi.list({ ordering: '-created_at' }).then(r => r.data),
  })
  const { data: financial } = useQuery({
    queryKey: ['financial-dashboard'],
    queryFn: () => paymentApi.financialDashboard().then(r => r.data),
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: string; reason?: string }) =>
      projectApi.approve(id, { action, reason }),
    onSuccess: (_, { action }) => {
      toast.success(action === 'approve' ? '✅ Approved & delivered!' : '↩ Revision requested.')
      qc.invalidateQueries({ queryKey: ['admin-projects'] })
    },
    onError: () => toast.error('Action failed.'),
  })

  const projects: Project[] = projectsData?.results || []
  const pending = projects.filter(p => p.status === 'received')
  const inQC = projects.filter(p => p.status === 'qc')
  const active = projects.filter(p => ['assigned', 'in_progress'].includes(p.status))
  const completed = projects.filter(p => p.status === 'completed')

  if (sumLoading || projLoading) return <LoadingSpinner label="Loading command center..." />

  return (
    <div>
      <PageHeader
        title="Command Center"
        subtitle={`${summary?.online_users || 0} users online right now`}
      />

      {/* Urgent alerts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {inQC.length > 0 && (
          <Alert
            type="warning"
            title={`${inQC.length} project${inQC.length > 1 ? 's' : ''} waiting for QC review`}
            body="Expert has submitted — review and approve to deliver to client."
            action={<Link to="/admin/projects?status=qc" style={{ display: 'inline-flex', background: '#D97706', color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8, textDecoration: 'none', fontFamily: 'Syne,sans-serif' }}>Review Now</Link>}
          />
        )}
        {pending.length > 0 && (
          <Alert type="info" title={`${pending.length} new project${pending.length > 1 ? 's' : ''} awaiting review & pricing`} />
        )}
      </div>

      {/* Stats row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
        <StatCard label="Total Clients" value={summary?.total_clients || 0}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
        />
        <StatCard label="Total Experts" value={summary?.total_experts || 0} color="#10B981"
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>}
        />
        <StatCard label="Online Now" value={summary?.online_users || 0} color="#0EA5E9"
          icon={<span style={{ fontSize: 14 }}>🟢</span>}
        />
        <StatCard label="Total Revenue" value={`$${financial?.total_revenue || 0}`} color="#7C3AED"
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Stats row 2 — projects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Pending Review" value={pending.length} color="#F59E0B" />
        <StatCard label="In QC" value={inQC.length} color="#8B5CF6" />
        <StatCard label="Active" value={active.length} color="#0EA5E9" />
        <StatCard label="Completed" value={completed.length} color="#10B981" />
      </div>

      {/* Financial mini overview */}
      {financial && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Platform Profit', value: `$${financial.total_platform_profit || 0}`, color: '#10B981', emoji: '💰' },
            { label: 'Paid to Experts', value: `$${financial.total_expert_paid || 0}`, color: '#0EA5E9', emoji: '👨‍💻' },
            { label: 'Projects Delivered', value: financial.completed_projects || 0, color: '#7C3AED', emoji: '🚀' },
          ].map(({ label, value, color, emoji }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{emoji}</div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color, margin: 0, fontFamily: 'Syne,sans-serif', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All projects table */}
      <Card style={{ padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #F8FAFC' }}>
          <SectionTitle>Recent Projects</SectionTitle>
          <Link to="/admin/projects" style={{ fontSize: 13, color: '#0EA5E9', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
        </div>
        <Table headers={['Project', 'Client', 'Expert', 'Status', 'Price', 'Deadline', 'Actions']}>
          {projects.slice(0, 10).map(p => (
            <Tr key={p.id} onClick={() => navigate(`/admin/projects/${p.id}`)}>
              <Td>
                <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, margin: '0 0 2px', color: '#0F172A' }}>{p.title}</p>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>{p.software?.toUpperCase()}</span>
              </Td>
              <Td><span style={{ fontSize: 13, color: '#475569' }}>{p.client_name || '—'}</span></Td>
              <Td>
                {p.expert_name
                  ? <span style={{ fontSize: 13, color: '#475569' }}>{p.expert_name}</span>
                  : <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 700 }}>⚠ Unassigned</span>
                }
              </Td>
              <Td><StatusBadge status={p.status} /></Td>
              <Td>
                {p.client_price
                  ? <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#059669', fontSize: 14 }}>${p.client_price}</span>
                  : <span style={{ fontSize: 12, color: '#CBD5E1' }}>Not set</span>
                }
              </Td>
              <Td><span style={{ fontSize: 12, color: '#94A3B8' }}>{formatDistanceToNow(new Date(p.deadline), { addSuffix: true })}</span></Td>
              <Td>
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => navigate(`/admin/projects/${p.id}`)} style={{ padding: '5px 12px', borderRadius: 8, background: '#EFF6FF', color: '#2563EB', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                    Manage
                  </button>
                  {p.status === 'qc' && (
                    <>
                      <button onClick={() => approveMutation.mutate({ id: p.id, action: 'approve' })} style={{ padding: '5px 10px', borderRadius: 8, background: '#F0FDF4', color: '#059669', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✓</button>
                      <button onClick={() => { const r = prompt('Reason for revision?'); if (r) approveMutation.mutate({ id: p.id, action: 'reject', reason: r }) }} style={{ padding: '5px 10px', borderRadius: 8, background: '#FFF1F2', color: '#E11D48', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✗</button>
                    </>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
