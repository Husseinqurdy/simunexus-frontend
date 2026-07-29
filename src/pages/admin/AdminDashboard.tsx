import { useQuery } from '@tanstack/react-query'
import { authApi, projectApi, paymentApi } from '@/api/client'
import { StatCard, StatusBadge, LoadingSpinner, Alert, PageHeader, Card, SectionTitle, Table, Tr, Td } from '@/components/shared'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import type { Project } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Users,
  GraduationCap,
  Radio,
  Wallet,
  TrendingUp,
  Rocket,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react'

const formatTSH = (value: number | string | undefined) => {
  const n = Number(value || 0)
  return `TSH ${n.toLocaleString('en-US')}`
}

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
      toast.success(action === 'approve' ? 'Approved & delivered!' : 'Revision requested.')
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
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-card-anim {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card-anim:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
        }
        .admin-action-btn {
          transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease;
        }
        .admin-action-btn:hover {
          transform: scale(1.06);
          opacity: 0.9;
        }
        .admin-action-btn:active {
          transform: scale(0.96);
        }
      `}</style>

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
            action={
              <Link
                to="/admin/projects?status=qc"
                className="admin-action-btn"
                style={{ display: 'inline-flex', background: '#D97706', color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8, textDecoration: 'none', fontFamily: 'Syne,sans-serif' }}
              >
                Review Now
              </Link>
            }
          />
        )}
        {pending.length > 0 && (
          <Alert type="info" title={`${pending.length} new project${pending.length > 1 ? 's' : ''} awaiting review & pricing`} />
        )}
      </div>

      {/* Stats row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
        <div className="stat-card-anim">
          <StatCard label="Total Clients" value={summary?.total_clients || 0}
            icon={<Users size={18} strokeWidth={1.8} />}
          />
        </div>
        <div className="stat-card-anim">
          <StatCard label="Total Experts" value={summary?.total_experts || 0} color="#10B981"
            icon={<GraduationCap size={18} strokeWidth={1.8} />}
          />
        </div>
        <div className="stat-card-anim">
          <StatCard label="Online Now" value={summary?.online_users || 0} color="#0EA5E9"
            icon={<Radio size={16} strokeWidth={2} />}
          />
        </div>
        <div className="stat-card-anim">
          <StatCard label="Total Revenue" value={formatTSH(financial?.total_revenue)} color="#7C3AED"
            icon={<Wallet size={18} strokeWidth={1.8} />}
          />
        </div>
      </div>

      {/* Stats row 2 — projects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <div className="stat-card-anim"><StatCard label="Pending Review" value={pending.length} color="#F59E0B" /></div>
        <div className="stat-card-anim"><StatCard label="In QC" value={inQC.length} color="#8B5CF6" /></div>
        <div className="stat-card-anim"><StatCard label="Active" value={active.length} color="#0EA5E9" /></div>
        <div className="stat-card-anim"><StatCard label="Completed" value={completed.length} color="#10B981" /></div>
      </div>

      {/* Financial mini overview */}
      {financial && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Platform Profit', value: formatTSH(financial.total_platform_profit), color: '#10B981', Icon: TrendingUp },
            { label: 'Paid to Experts', value: formatTSH(financial.total_expert_paid), color: '#0EA5E9', Icon: GraduationCap },
            { label: 'Projects Delivered', value: financial.completed_projects || 0, color: '#7C3AED', Icon: Rocket },
          ].map(({ label, value, color, Icon }) => (
            <div
              key={label}
              className="stat-card-anim"
              style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: 20, fontWeight: 800, color, margin: 0, fontFamily: 'Syne,sans-serif', lineHeight: 1.2 }}>{value}</p>
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
                  : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#F59E0B', fontWeight: 700 }}>
                      <AlertTriangle size={13} strokeWidth={2} /> Unassigned
                    </span>
                  )
                }
              </Td>
              <Td><StatusBadge status={p.status} /></Td>
              <Td>
                {p.client_price
                  ? <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#059669', fontSize: 13 }}>{formatTSH(p.client_price)}</span>
                  : <span style={{ fontSize: 12, color: '#CBD5E1' }}>Not set</span>
                }
              </Td>
              <Td><span style={{ fontSize: 12, color: '#94A3B8' }}>{formatDistanceToNow(new Date(p.deadline), { addSuffix: true })}</span></Td>
              <Td>
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button className="admin-action-btn" onClick={() => navigate(`/admin/projects/${p.id}`)} style={{ padding: '5px 12px', borderRadius: 8, background: '#EFF6FF', color: '#2563EB', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                    Manage
                  </button>
                  {p.status === 'qc' && (
                    <>
                      <button className="admin-action-btn" onClick={() => approveMutation.mutate({ id: p.id, action: 'approve' })} style={{ padding: '5px 10px', borderRadius: 8, background: '#F0FDF4', color: '#059669', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Check size={14} strokeWidth={2.5} />
                      </button>
                      <button className="admin-action-btn" onClick={() => { const r = prompt('Reason for revision?'); if (r) approveMutation.mutate({ id: p.id, action: 'reject', reason: r }) }} style={{ padding: '5px 10px', borderRadius: 8, background: '#FFF1F2', color: '#E11D48', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <X size={14} strokeWidth={2.5} />
                      </button>
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