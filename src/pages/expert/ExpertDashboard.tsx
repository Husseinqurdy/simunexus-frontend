import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { recruitApi, projectApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner, StatCard, Card, SectionTitle, StatusBadge } from '@/components/shared'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import {
  CheckCircle2,
  TrendingUp,
  Wallet,
  Star,
  GraduationCap,
  ClipboardList,
  FolderKanban,
  MessageSquare,
  User,
  Rocket,
  Timer,
  PartyPopper,
  ArrowRight,
} from 'lucide-react'

// Consistent type scale used throughout this page.
// eyebrow 11 · caption 12 · body 13 · label 14 · title 15 · heading 24
const TYPE = {
  eyebrow: 11,
  caption: 12,
  body: 13,
  label: 14,
  title: 15,
  heading: 24,
}

function formatTsh(value: number) {
  return `Tsh ${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

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
    <div style={{ fontFamily: "'DM Sans',sans-serif", animation: 'gsh-fade-in .4s ease' }}>
      <style>{`
        @keyframes gsh-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gsh-pop-in {
          from { opacity: 0; transform: scale(.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .gsh-stat {
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .gsh-stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
        }
        .gsh-project-row {
          transition: background-color .15s ease, transform .15s ease;
        }
        .gsh-project-row:hover {
          transform: translateX(2px);
        }
        .gsh-quick-action {
          transition: background-color .15s ease, transform .15s ease, border-color .15s ease;
        }
        .gsh-quick-action:hover {
          transform: translateX(2px);
        }
        .gsh-btn {
          transition: filter .15s ease, transform .1s ease;
        }
        .gsh-btn:hover { filter: brightness(1.06); }
        .gsh-btn:active { transform: scale(.98); }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: TYPE.heading, fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Welcome back, {user?.first_name}!
        </h1>
        <p style={{ color: '#94A3B8', fontSize: TYPE.body, margin: '4px 0 0' }}>Here's your expert dashboard overview.</p>
      </div>

      {/* Stats */}
      {profile && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="gsh-stat" style={{ animation: 'gsh-pop-in .35s ease .02s backwards' }}>
            <StatCard label="Completed Projects" value={profile.completed_projects || 0} color="#0EA5E9" icon={<CheckCircle2 size={18} strokeWidth={2.25} />} />
          </div>
          <div className="gsh-stat" style={{ animation: 'gsh-pop-in .35s ease .08s backwards' }}>
            <StatCard label="Success Rate" value={`${Number(profile.success_rate || 0).toFixed(0)}%`} color="#10B981" icon={<TrendingUp size={18} strokeWidth={2.25} />} />
          </div>
          <div className="gsh-stat" style={{ animation: 'gsh-pop-in .35s ease .14s backwards' }}>
            <StatCard label="Total Earned" value={formatTsh(profile.total_earned)} color="#7C3AED" icon={<Wallet size={18} strokeWidth={2.25} />} />
          </div>
          <div className="gsh-stat" style={{ animation: 'gsh-pop-in .35s ease .2s backwards' }}>
            <StatCard label="Rating" value={`${Number(profile.rating || 0).toFixed(1)}`} color="#F59E0B" icon={<Star size={18} strokeWidth={2.25} fill="#F59E0B" />} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Active Projects */}
        <Card>
          <SectionTitle>Active Projects</SectionTitle>
          {projLoading ? <LoadingSpinner label="Loading..." /> :
            projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>
                <FolderKanban size={32} strokeWidth={1.75} style={{ marginBottom: 10, color: '#CBD5E1' }} />
                <p style={{ fontSize: TYPE.body, fontWeight: 600, color: '#64748B', margin: '0 0 8px' }}>No active projects</p>
                <button
                  className="gsh-btn"
                  onClick={() => navigate('/expert/job-board')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#0EA5E9', color: '#fff', border: 'none', cursor: 'pointer', fontSize: TYPE.body, fontWeight: 700 }}
                >
                  Browse Job Board <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projects.slice(0, 5).map((p: any) => (
                  <div
                    key={p.id}
                    className="gsh-project-row"
                    onClick={() => navigate(`/expert/projects/${p.id}`)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 12, border: '1px solid #F1F5F9', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <p style={{ fontSize: TYPE.body, fontWeight: 700, margin: 0, color: '#0F172A' }}>{p.title}</p>
                      <p style={{ fontSize: TYPE.caption, color: '#94A3B8', margin: '2px 0 0' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 8px' }}>
                <GraduationCap size={18} strokeWidth={2.25} color="#0369A1" />
                <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: TYPE.title, color: '#0369A1', margin: 0 }}>
                  Not applied yet
                </p>
              </div>
              <p style={{ fontSize: TYPE.caption, color: '#64748B', lineHeight: 1.6, margin: '0 0 14px' }}>
                Apply as an expert to unlock the job board and start earning commissions.
              </p>
              <button
                className="gsh-btn"
                onClick={() => navigate('/expert/apply')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '10px', borderRadius: 10, background: '#0EA5E9', color: '#fff', border: 'none', cursor: 'pointer', fontSize: TYPE.body, fontWeight: 700 }}
              >
                Apply Now <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </Card>
          ) : (
            <Card style={{
              border: `1.5px solid ${app.status === 'passed' ? '#BBF7D0' : app.status === 'failed' ? '#FECDD3' : '#FDE68A'}`,
              background: app.status === 'passed' ? '#F0FDF4' : app.status === 'failed' ? '#FFF1F2' : '#FFFBEB',
            }}>
              <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: TYPE.title, margin: '0 0 4px', color: '#0F172A' }}>
                Application Status
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 999, fontSize: TYPE.caption, fontWeight: 700,
                  background: app.status === 'passed' ? '#D1FAE5' : app.status === 'failed' ? '#FFE4E6' : '#FEF3C7',
                  color: app.status === 'passed' ? '#059669' : app.status === 'failed' ? '#E11D48' : '#D97706',
                }}>
                  {app.status === 'pending'   && <><Timer size={13} strokeWidth={2.5} /> Pending Test</>}
                  {app.status === 'testing'   && <><Timer size={13} strokeWidth={2.5} /> In Progress</>}
                  {app.status === 'submitted' && <><ClipboardList size={13} strokeWidth={2.5} /> Under Review</>}
                  {app.status === 'passed'    && <><CheckCircle2 size={13} strokeWidth={2.5} /> Passed!</>}
                  {app.status === 'failed'    && <><Timer size={13} strokeWidth={2.5} /> Not Passed</>}
                  {app.status === 'retry'     && <><Rocket size={13} strokeWidth={2.5} /> Retry Allowed</>}
                </span>
              </div>

              {app.admin_notes && (
                <div style={{ background: 'rgba(0,0,0,.03)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                  <p style={{ fontSize: TYPE.eyebrow, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 4px' }}>Admin Feedback</p>
                  <p style={{ fontSize: TYPE.caption, color: '#374151', margin: 0, lineHeight: 1.5 }}>{app.admin_notes}</p>
                </div>
              )}

              {(app.status === 'pending' || app.status === 'retry') && (
                <button
                  className="gsh-btn"
                  onClick={() => startTestMutation.mutate(app.id)}
                  disabled={startTestMutation.isPending}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '10px', borderRadius: 10, background: '#F59E0B', color: '#fff', border: 'none', cursor: 'pointer', fontSize: TYPE.body, fontWeight: 700 }}
                >
                  <Rocket size={15} strokeWidth={2.5} /> {startTestMutation.isPending ? 'Starting…' : 'Start 2-Hour Test'}
                </button>
              )}
              {app.status === 'testing' && (
                <button
                  className="gsh-btn"
                  onClick={() => navigate(`/expert/test/${app.id}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '10px', borderRadius: 10, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: TYPE.body, fontWeight: 700 }}
                >
                  <Timer size={15} strokeWidth={2.5} /> Continue Test <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              )}
              {app.status === 'passed' && (
                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: TYPE.body, color: '#059669', fontWeight: 700, margin: 0, textAlign: 'center' }}>
                  <PartyPopper size={16} strokeWidth={2.25} /> You're a verified GSH Expert!
                </p>
              )}
            </Card>
          )}

          {/* Quick links */}
          <Card>
            <SectionTitle>Quick Actions</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Browse Job Board', path: '/expert/job-board', Icon: ClipboardList },
                { label: 'My Projects',      path: '/expert/projects',  Icon: FolderKanban },
                { label: 'Messages',         path: '/expert/chat',      Icon: MessageSquare },
                { label: 'My Profile',       path: '/expert/profile',   Icon: User },
              ].map(item => (
                <button
                  key={item.path}
                  className="gsh-quick-action"
                  onClick={() => navigate(item.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #F1F5F9', color: '#374151', fontSize: TYPE.body, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#EFF6FF')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
                >
                  <item.Icon size={16} strokeWidth={2.1} />
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
