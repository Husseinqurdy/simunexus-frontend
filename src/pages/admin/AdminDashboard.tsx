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
          from { opacity: 0; transform: translateY(0); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-card-anim {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card-anim:hover {
          transform: translateY(0);
          box-shadow: 0 8px 20px rgba(10,31,77, 0.08);
        }
        .admin-action-btn {
          transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease;
        }
        .admin-action-btn:hover {
          transform: scale(1);
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
                style={{ display: 'inline-flex', background: '#B85F00', color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8, textDecoration: 'none', fontFamily: 'inherit' }}
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
          <StatCard label="Total Experts" value={summary?.total_experts || 0} color="#1B9B63"
            icon={<GraduationCap size={18} strokeWidth={1.8} />}
          />
        </div>
        <div className="stat-card-anim">
          <StatCard label="Online Now" value={summary?.online_users || 0} color="#0D52CE"
            icon={<Radio size={16} strokeWidth={2} />}
          />
        </div>
        <div className="stat-card-anim">
          <StatCard label="Total Revenue" value={formatTSH(financial?.total_revenue)} color="#2E4DA7"
            icon={<Wallet size={18} strokeWidth={1.8} />}
          />
        </div>
      </div>

      {/* Stats row 2 — projects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <div className="stat-card-anim"><StatCard label="Pending Review" value={pending.length} color="#E5A00D" /></div>
        <div className="stat-card-anim"><StatCard label="In QC" value={inQC.length} color="#3F5FB8" /></div>
        <div className="stat-card-anim"><StatCard label="Active" value={active.length} color="#0D52CE" /></div>
        <div className="stat-card-anim"><StatCard label="Completed" value={completed.length} color="#1B9B63" /></div>
      </div>

      {/* Financial mini overview */}
      {financial && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Platform Profit', value: formatTSH(financial.total_platform_profit), color: '#137A4E', Icon: TrendingUp },
            { label: 'Paid to Experts', value: formatTSH(financial.total_expert_paid), color: '#0D52CE', Icon: GraduationCap },
            { label: 'Projects Delivered', value: financial.completed_projects || 0, color: '#2E4DA7', Icon: Rocket },
          ].map(({ label, value, color, Icon }) => (
            <div
              key={label}
              className="stat-card-anim"
              style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', border: '1px solid #EBEFF8', display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: 20, fontWeight: 700, color, margin: 0, fontFamily: 'inherit', lineHeight: 1.2 }}>{value}</p>
                <p style={{ fontSize: 12, color: '#667697', margin: '4px 0 0' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All projects table */}
      <Card style={{ padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #F5F7FC' }}>
          <SectionTitle>Recent Projects</SectionTitle>
          <Link to="/admin/projects" style={{ fontSize: 13, color: '#0D52CE', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
        </div>
        <Table headers={['Project', 'Client', 'Expert', 'Status', 'Price', 'Deadline', 'Actions']}>
          {projects.slice(0, 10).map(p => (
            <Tr key={p.id} onClick={() => navigate(`/admin/projects/${p.id}`)}>
              <Td>
                <p style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 13, margin: '0 0 2px', color: '#0A1F4D' }}>{p.title}</p>
                <span style={{ fontSize: 12, color: '#667697' }}>{p.software?.toUpperCase()}</span>
              </Td>
              <Td><span style={{ fontSize: 13, color: '#3A4A70' }}>{p.client_name || '—'}</span></Td>
              <Td>
                {p.expert_name
                  ? <span style={{ fontSize: 13, color: '#3A4A70' }}>{p.expert_name}</span>
                  : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9A5B00', fontWeight: 700 }}>
                      <AlertTriangle size={13} strokeWidth={2} /> Unassigned
                    </span>
                  )
                }
              </Td>
              <Td><StatusBadge status={p.status} /></Td>
              <Td>
                {p.client_price
                  ? <span style={{ fontFamily: 'inherit', fontWeight: 700, color: '#137A4E', fontSize: 13 }}>{formatTSH(p.client_price)}</span>
                  : <span style={{ fontSize: 12, color: '#C3CEE2' }}>Not set</span>
                }
              </Td>
              <Td><span style={{ fontSize: 12, color: '#667697' }}>{formatDistanceToNow(new Date(p.deadline), { addSuffix: true })}</span></Td>
              <Td>
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button className="admin-action-btn" onClick={() => navigate(`/admin/projects/${p.id}`)} style={{ padding: '5px 12px', borderRadius: 8, background: '#EAF1FD', color: '#0D52CE', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                    Manage
                  </button>
                  {p.status === 'qc' && (
                    <>
                      <button className="admin-action-btn" onClick={() => approveMutation.mutate({ id: p.id, action: 'approve' })} style={{ padding: '5px 10px', borderRadius: 8, background: '#EDF8F1', color: '#137A4E', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Check size={14} strokeWidth={2.5} />
                      </button>
                      <button className="admin-action-btn" onClick={() => { const r = prompt('Reason for revision?'); if (r) approveMutation.mutate({ id: p.id, action: 'reject', reason: r }) }} style={{ padding: '5px 10px', borderRadius: 8, background: '#FDEDED', color: '#B92D2D', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
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