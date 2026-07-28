import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { recruitApi, projectApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner, StatCard, Card, SectionTitle, StatusBadge } from '@/components/shared'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function ExpertDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ['my-application'],
    queryFn: () => recruitApi.myApplication().then(r => r.data),
  })

  const { data: projectsData, isLoading: projLoading } = useQuery({
    queryKey: ['expert-projects-summary'],
    queryFn: () => projectApi.list({ status: 'in_progress' }).then(r => r.data),
  })

  const startTestMutation = useMutation({
    mutationFn: (appId: number) => recruitApi.startTest(appId),
    onSuccess: (_, appId) => {
      toast.success('Test started! You have 2 hours.')
      qc.invalidateQueries({ queryKey: ['my-application'] })
      navigate(`/expert/test/${appId}`)
    },
    onError: () => toast.error('Failed to start test.'),
  })

  const profile = user?.expert_profile
  const projects = projectsData?.results || []
  const app = application

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p style={{ color: '#94A3B8', fontSize: 13, margin: '4px 0 0' }}>Here's your expert dashboard overview.</p>
      </div>

      {/* Stats */}
      {profile && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Completed Projects" value={profile.completed_projects || 0} color="#0EA5E9" icon={<span>✅</span>} />
          <StatCard label="Success Rate"        value={`${Number(profile.success_rate || 0).toFixed(0)}%`} color="#10B981" icon={<span>📈</span>} />
          <StatCard label="Total Earned"        value={`$${Number(profile.total_earned || 0).toFixed(2)}`} color="#7C3AED" icon={<span>💰</span>} />
          <StatCard label="Rating"              value={`${Number(profile.rating || 0).toFixed(1)} ⭐`} color="#F59E0B" icon={<span>⭐</span>} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Active Projects */}
        <Card>
          <SectionTitle>Active Projects</SectionTitle>
          {projLoading ? <LoadingSpinner label="Loading..." /> :
            projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#64748B', margin: '0 0 8px' }}>No active projects</p>
                <button onClick={() => navigate('/expert/job-board')}
                  style={{ padding: '8px 16px', borderRadius: 10, background: '#0EA5E9', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                  Browse Job Board →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projects.slice(0, 5).map((p: any) => (
                  <div key={p.id} onClick={() => navigate(`/expert/projects/${p.id}`)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 12, border: '1px solid #F1F5F9', cursor: 'pointer', transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: '#0F172A' }}>{p.title}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
                        Due {formatDistanceToNow(new Date(p.deadline), { addSuffix: true })}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            )
          }
        </Card>

        {/* Application / Test Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {appLoading ? <LoadingSpinner label="Loading..." /> : !app ? (
            <Card style={{ border: '1.5px solid #BAE6FD', background: '#F0F9FF' }}>
              <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15, color: '#0369A1', margin: '0 0 8px' }}>
                🎓 Not applied yet
              </p>
              <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, margin: '0 0 14px' }}>
                Apply as an expert to unlock the job board and start earning commissions.
              </p>
              <button onClick={() => navigate('/expert/apply')}
                style={{ width: '100%', padding: '10px', borderRadius: 10, background: '#0EA5E9', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                Apply Now →
              </button>
            </Card>
          ) : (
            <Card style={{
              border: `1.5px solid ${app.status === 'passed' ? '#BBF7D0' : app.status === 'failed' ? '#FECDD3' : '#FDE68A'}`,
              background: app.status === 'passed' ? '#F0FDF4' : app.status === 'failed' ? '#FFF1F2' : '#FFFBEB',
            }}>
              <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15, margin: '0 0 4px', color: '#0F172A' }}>
                Application Status
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: app.status === 'passed' ? '#D1FAE5' : app.status === 'failed' ? '#FFE4E6' : '#FEF3C7',
                  color: app.status === 'passed' ? '#059669' : app.status === 'failed' ? '#E11D48' : '#D97706',
                }}>
                  {app.status === 'pending'   && '⏳ Pending Test'}
                  {app.status === 'testing'   && '⏱ In Progress'}
                  {app.status === 'submitted' && '📋 Under Review'}
                  {app.status === 'passed'    && '✅ Passed!'}
                  {app.status === 'failed'    && '❌ Not Passed'}
                  {app.status === 'retry'     && '🔄 Retry Allowed'}
                </span>
              </div>

              {app.admin_notes && (
                <div style={{ background: 'rgba(0,0,0,.03)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                  <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 4px' }}>Admin Feedback</p>
                  <p style={{ fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.5 }}>{app.admin_notes}</p>
                </div>
              )}

              {(app.status === 'pending' || app.status === 'retry') && (
                <button
                  onClick={() => startTestMutation.mutate(app.id)}
                  disabled={startTestMutation.isPending}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, background: '#F59E0B', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                >
                  {startTestMutation.isPending ? 'Starting…' : '🚀 Start 2-Hour Test'}
                </button>
              )}
              {app.status === 'testing' && (
                <button onClick={() => navigate(`/expert/test/${app.id}`)}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                  ⏱ Continue Test →
                </button>
              )}
              {app.status === 'passed' && (
                <p style={{ fontSize: 13, color: '#059669', fontWeight: 700, margin: 0, textAlign: 'center' }}>
                  🎉 You're a verified GSH Expert!
                </p>
              )}
            </Card>
          )}

          {/* Quick links */}
          <Card>
            <SectionTitle>Quick Actions</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: '📋 Browse Job Board',  path: '/expert/job-board' },
                { label: '🗂 My Projects',       path: '/expert/projects' },
                { label: '💬 Messages',           path: '/expert/chat' },
                { label: '👤 My Profile',         path: '/expert/profile' },
              ].map(item => (
                <button key={item.path} onClick={() => navigate(item.path)}
                  style={{ padding: '10px 14px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #F1F5F9', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#EFF6FF')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
