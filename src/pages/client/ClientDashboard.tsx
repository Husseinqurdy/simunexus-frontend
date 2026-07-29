import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi, paymentApi, recruitApi } from '@/api/client'
import { LoadingSpinner } from '@/components/shared'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { formatDistanceToNow, isPast } from 'date-fns'
import toast from 'react-hot-toast'
import type { Project } from '@/types'

/* ---------------------------------- icons ---------------------------------- */

type IconName =
  | 'alert' | 'card' | 'search' | 'graduation' | 'clock' | 'file-text'
  | 'check-circle' | 'x-circle' | 'refresh' | 'rocket' | 'folder' | 'zap'
  | 'wallet' | 'corner-up-left' | 'arrow-right' | 'plus' | 'star' | 'check'

function Icon({ name, size = 16, color = 'currentColor', strokeWidth = 1.8 }:
  { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const, stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'alert': return <svg {...c}><path d="M12 3.5 21.5 20h-19L12 3.5Z" /><path d="M12 9.8v4.2M12 17v.2" /></svg>
    case 'card': return <svg {...c}><rect x="3" y="6" width="18" height="13" rx="2.2" /><path d="M3 10.2h18" /></svg>
    case 'search': return <svg {...c}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
    case 'graduation': return <svg {...c}><path d="M2.5 9.5 12 5l9.5 4.5-9.5 4.5-9.5-4.5Z" /><path d="M6.5 11.6v4.4c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.4" /><path d="M21.5 9.5v5.5" /></svg>
    case 'clock': return <svg {...c}><circle cx="12" cy="12" r="9" /><path d="M12 7.2v5l3.4 2" /></svg>
    case 'file-text': return <svg {...c}><path d="M6 3.5h8l4 4v13H6Z" /><path d="M14 3.5V7.5h4M9 12.5h6M9 16h6" /></svg>
    case 'check-circle': return <svg {...c}><circle cx="12" cy="12" r="9" /><path d="M8.4 12.4l2.4 2.4 4.6-5" /></svg>
    case 'x-circle': return <svg {...c}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5l5 5m0-5-5 5" /></svg>
    case 'refresh': return <svg {...c}><path d="M4 12a8 8 0 0 1 14-5.3L20 9" /><path d="M20 4v5h-5" /><path d="M20 12a8 8 0 0 1-14 5.3L4 15" /><path d="M4 20v-5h5" /></svg>
    case 'rocket': return <svg {...c}><path d="M14.5 3.5c2 0 4.5 1 6 2.5s2.5 4 2.5 6c-3 0-6-1-8-3s-3-5-3-8Z" transform="translate(-1,-1)" /><path d="M12 15c-3 3-4 6-4 6s3-1 6-4" /><path d="M9 12 4.5 16.5" /><circle cx="15" cy="9" r="1.6" /></svg>
    case 'folder': return <svg {...c}><path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5Z" /></svg>
    case 'zap': return <svg {...c}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" /></svg>
    case 'wallet': return <svg {...c}><path d="M3 7.5A2.5 2.5 0 015.5 5H18a1 1 0 011 1v2.2" /><path d="M3 7.5v10A2.5 2.5 0 005.5 20H19a1 1 0 001-1v-4.2" /><rect x="14.5" y="10" width="6.5" height="5.4" rx="1.4" /><circle cx="17.3" cy="12.7" r=".9" fill={color} /></svg>
    case 'corner-up-left': return <svg {...c}><path d="M9 14 4 9l5-5" /><path d="M4 9h9a6 6 0 0 1 6 6v3" /></svg>
    case 'arrow-right': return <svg {...c}><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
    case 'plus': return <svg {...c} strokeWidth={2.4}><path d="M12 5v14M5 12h14" /></svg>
    case 'star': return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2.2l3 6.3 6.8.9-5 4.7 1.2 6.9L12 17.6l-6 3.4 1.2-6.9-5-4.7 6.8-.9 3-6.3Z" /></svg>
    case 'check': return <svg {...c} strokeWidth={3}><path d="M4.5 12.75l6 6 9-13.5" /></svg>
  }
}

const fmtTZS = (n: number) => `TSh ${Math.round(n).toLocaleString('en-US')}`

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  received:    { label: 'Received',      color: '#64748B', bg: '#F8FAFC', dot: '#94A3B8' },
  assigned:    { label: 'Assigned',      color: '#2563EB', bg: '#EFF6FF', dot: '#3B82F6' },
  in_progress: { label: 'In Progress',   color: '#D97706', bg: '#FFFBEB', dot: '#F59E0B' },
  qc:          { label: 'Quality Check', color: '#7C3AED', bg: '#F5F3FF', dot: '#8B5CF6' },
  completed:   { label: 'Completed',     color: '#059669', bg: '#F0FDF4', dot: '#10B981' },
  revision:    { label: 'Revision',      color: '#E11D48', bg: '#FFF1F2', dot: '#F43F5E' },
  cancelled:   { label: 'Cancelled',     color: '#64748B', bg: '#F8FAFC', dot: '#94A3B8' },
}

function StatusPill({ status }: { status: string }) {
  const c = STATUS_CFG[status] || STATUS_CFG.received
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: c.bg, color: c.color, border: `1px solid ${c.dot}25` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  )
}

const STAGE_STEPS = ['received', 'assigned', 'in_progress', 'qc', 'completed']
const STAGE_LABELS = ['Received', 'Assigned', 'In Progress', 'QC', 'Completed']

function StageTracker({ status }: { status: string }) {
  const cur = STAGE_STEPS.indexOf(status)
  const isRevision = status === 'revision'
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
      {STAGE_STEPS.map((s, i) => {
        const done = i < cur || (status === 'completed' && i <= cur)
        const active = i === cur && !isRevision
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, transition: 'all .3s cubic-bezier(.22,.61,.36,1)', background: done ? '#10B981' : active ? '#0EA5E9' : '#F1F5F9', color: done || active ? '#fff' : '#94A3B8', border: `2px solid ${done ? '#10B981' : active ? '#0EA5E9' : '#E2E8F0'}` }}>
                {done ? <Icon name="check" size={12} color="#fff" strokeWidth={3} /> : i + 1}
              </div>
              <span style={{ fontSize: 10.5, marginTop: 5, whiteSpace: 'nowrap', color: done ? '#10B981' : active ? '#0EA5E9' : '#94A3B8', fontWeight: active ? 700 : 400 }}>
                {STAGE_LABELS[i]}
              </span>
            </div>
            {i < STAGE_STEPS.length - 1 && (
              <div style={{ width: 32, height: 2, background: i < cur ? '#10B981' : '#E2E8F0', margin: '0 4px', marginBottom: 18, flexShrink: 0, transition: 'background .3s' }} />
            )}
          </div>
        )
      })}
      {isRevision && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8, padding: '3px 10px', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 999 }}>
          <Icon name="corner-up-left" size={11} color="#E11D48" />
          <span style={{ fontSize: 11, color: '#E11D48', fontWeight: 700 }}>Revision</span>
        </div>
      )}
    </div>
  )
}

// ── Expert Application Status Card ──────────────────────────────────────────
function ExpertApplicationCard() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: app, isLoading } = useQuery({
    queryKey: ['my-application'],
    queryFn: () => recruitApi.myApplication().then(r => r.data),
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

  if (isLoading || !app) return null

  const STATUS_CFG_APP: Record<string, { label: string; icon: IconName; color: string; bg: string; border: string }> = {
    pending:   { label: 'Pending Test',     icon: 'clock',        color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
    testing:   { label: 'Test In Progress', icon: 'clock',        color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
    submitted: { label: 'Under Review',     icon: 'file-text',    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    passed:    { label: 'Passed!',          icon: 'check-circle', color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
    failed:    { label: 'Not Passed',       icon: 'x-circle',     color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3' },
    retry:     { label: 'Retry Allowed',    icon: 'refresh',      color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
  }

  const cfg = STATUS_CFG_APP[app.status] || STATUS_CFG_APP.pending

  return (
    <div className="fade-up" style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 16, padding: '18px 20px', marginBottom: 24, transition: 'all .3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <Icon name="graduation" size={16} color={cfg.color} />
          </div>
          <div>
            <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 13.5, color: '#0F172A', margin: '0 0 4px' }}>
              Expert Application
            </p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: cfg.color }}>
              <Icon name={cfg.icon} size={13} color={cfg.color} />
              {cfg.label}
            </span>
            {app.admin_notes && (
              <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>
                Admin: {app.admin_notes}
              </p>
            )}
          </div>
        </div>

        {(app.status === 'pending' || app.status === 'retry') && (
          <button
            onClick={() => startTestMutation.mutate(app.id)}
            disabled={startTestMutation.isPending}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: '#F59E0B', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', transition: 'all .2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'}
          >
            <Icon name="rocket" size={14} color="#fff" />
            {startTestMutation.isPending ? 'Starting…' : 'Start 2-Hour Test'}
          </button>
        )}
        {app.status === 'testing' && (
          <button
            onClick={() => navigate(`/expert/test/${app.id}`)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', animation: 'pulse 2s infinite' }}
          >
            <Icon name="clock" size={14} color="#fff" />
            Continue Test →
          </button>
        )}
        {app.status === 'passed' && (
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#059669', margin: 0 }}>
            <Icon name="star" size={15} color="#059669" />
            You're now a verified Expert!
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['client-projects'],
    queryFn: () => projectApi.list().then(r => r.data),
    refetchInterval: 30000,
  })
  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => paymentApi.wallet().then(r => r.data),
  })

  const projects: Project[] = projectsData?.results || []
  const active = projects.filter(p => !['completed', 'cancelled'].includes(p.status))
  const completed = projects.filter(p => p.status === 'completed')
  const pendingPayment = projects.filter(p => p.client_price && !p.is_fully_paid && !['completed', 'cancelled'].includes(p.status))
  const inQC = projects.filter(p => p.status === 'qc')

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #E2E8F0', borderTop: '3px solid #0EA5E9', animation: 'spin .8s linear infinite' }} />
      <p style={{ color: '#94A3B8', fontSize: 14 }}>Loading your dashboard...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
        .fade-up{animation:fadeUp .55s cubic-bezier(.22,.61,.36,1) both}
        .stat-card{transition:transform .25s cubic-bezier(.22,.61,.36,1), box-shadow .25s cubic-bezier(.22,.61,.36,1)}
        .stat-card:hover{transform:translateY(-3px); box-shadow:0 10px 28px rgba(15,23,42,.08)}
      `}</style>

      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!
          </h1>
          <p style={{ color: '#94A3B8', fontSize: 14, margin: '4px 0 0' }}>Here's what's happening with your simulation projects.</p>
        </div>
        <Link to="/client/projects/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(120deg,#0EA5E9,#7C3AED)', color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, padding: '11px 22px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 4px 14px rgba(14,165,233,.3)', transition: 'all .25s' }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'}
        >
          <Icon name="plus" size={15} color="#fff" />
          New Project
        </Link>
      </div>

      {/* Alerts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {!user?.is_profile_complete && (
          <div className="fade-up" style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="alert" size={16} color="#D97706" />
              </div>
              <div>
                <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13.5, color: '#D97706', margin: 0 }}>Complete your profile to download results</p>
                <p style={{ fontSize: 12, color: '#B45309', margin: '2px 0 0' }}>Required before downloading completed simulation files.</p>
              </div>
            </div>
            <Link to="/client/profile" style={{ background: '#D97706', color: '#fff', fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontFamily: 'Syne,sans-serif', flexShrink: 0 }}>Complete Now</Link>
          </div>
        )}
        {pendingPayment.length > 0 && (
          <div className="fade-up" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="card" size={16} color="#1D4ED8" />
              </div>
              <div>
                <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13.5, color: '#1D4ED8', margin: 0 }}>{pendingPayment.length} project{pendingPayment.length > 1 ? 's' : ''} awaiting payment</p>
                <p style={{ fontSize: 12, color: '#2563EB', margin: '2px 0 0' }}>Make your advance payment so experts can start working.</p>
              </div>
            </div>
            <Link to="/client/projects" style={{ background: '#1D4ED8', color: '#fff', fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontFamily: 'Syne,sans-serif', flexShrink: 0 }}>Pay Now</Link>
          </div>
        )}
        {inQC.length > 0 && (
          <div className="fade-up" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="search" size={16} color="#7C3AED" />
            </div>
            <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13.5, color: '#7C3AED', margin: 0 }}>
              {inQC.length} project{inQC.length > 1 ? 's' : ''} in Quality Check — almost done! We'll notify you when ready.
            </p>
          </div>
        )}
      </div>

      {/* Expert Application Status — only shows if the user has an application */}
      <ExpertApplicationCard />

      {/* Stats */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Projects', value: String(projects.length), color: '#0B1C3D', icon: 'folder' as IconName, tint: '#0B1C3D' },
          { label: 'Active', value: String(active.length), color: '#0EA5E9', icon: 'zap' as IconName, tint: '#0EA5E9' },
          { label: 'Completed', value: String(completed.length), color: '#10B981', icon: 'check-circle' as IconName, tint: '#10B981' },
          { label: 'Wallet', value: fmtTZS(parseFloat(walletData?.wallet?.balance || '0')), color: '#7C3AED', icon: 'wallet' as IconName, tint: '#7C3AED' },
        ].map(({ label, value, color, icon, tint }) => (
          <div key={label} className="stat-card" style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', margin: 0, letterSpacing: '.04em', textTransform: 'uppercase' }}>{label}</p>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${tint}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={icon} size={15} color={tint} />
              </div>
            </div>
            <p style={{ fontSize: label === 'Wallet' ? 22 : 28, fontWeight: 800, color, margin: 0, fontFamily: 'Syne,sans-serif', lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Projects list */}
      <div className="fade-up" style={{ background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F8FAFC' }}>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 700, color: '#0F172A', margin: 0 }}>My Projects</h2>
          <Link to="/client/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#0EA5E9', fontWeight: 600, textDecoration: 'none' }}>
            View all <Icon name="arrow-right" size={13} color="#0EA5E9" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <Icon name="rocket" size={28} color="#0EA5E9" />
            </div>
            <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>Submit your first project</p>
            <p style={{ fontSize: 14, color: '#94A3B8', margin: '0 0 24px', lineHeight: 1.6 }}>No account needed — describe your simulation and we'll connect you with a verified expert immediately.</p>
            <Link to="/client/projects/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(120deg,#0EA5E9,#7C3AED)', color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 4px 14px rgba(14,165,233,.3)' }}>
              Submit a Project <Icon name="arrow-right" size={15} color="#fff" />
            </Link>
          </div>
        ) : (
          <div>
            {projects.slice(0, 5).map((p, idx) => {
              const urgent = !['completed', 'cancelled'].includes(p.status) && isPast(new Date(new Date(p.deadline).getTime() - 24 * 60 * 60 * 1000))
              const latest = p.latest_progress
              const needsPay = p.client_price && !p.is_fully_paid && !['completed', 'cancelled'].includes(p.status)
              return (
                <div key={p.id} onClick={() => navigate(`/client/projects/${p.id}`)}
                  style={{ padding: '20px 24px', borderBottom: idx < Math.min(projects.length, 5) - 1 ? '1px solid #F8FAFC' : 'none', cursor: 'pointer', transition: 'background .2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#F8FAFC'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                        {urgent && <span style={{ fontSize: 10, background: '#FFF1F2', color: '#E11D48', padding: '2px 7px', borderRadius: 999, fontWeight: 700, flexShrink: 0 }}>URGENT</span>}
                        {needsPay && <span style={{ fontSize: 10, background: '#FFF7ED', color: '#C2410C', padding: '2px 7px', borderRadius: 999, fontWeight: 700, flexShrink: 0 }}>PAYMENT DUE</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11.5, color: '#94A3B8' }}>Deadline: {formatDistanceToNow(new Date(p.deadline), { addSuffix: true })}</span>
                        <span style={{ fontSize: 11.5, color: '#CBD5E1' }}>·</span>
                        <span style={{ fontSize: 11.5, color: '#94A3B8' }}>{p.software?.toUpperCase()}</span>
                        {p.client_price && (
                          <>
                            <span style={{ fontSize: 11.5, color: '#CBD5E1' }}>·</span>
                            <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 700 }}>{fmtTZS(parseFloat(p.client_price))}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <StatusPill status={p.status} />
                  </div>
                  <StageTracker status={p.status} />
                  {latest && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#94A3B8', marginBottom: 5 }}>
                        <span>Expert progress</span>
                        <span style={{ fontWeight: 600, color: latest.percentage >= 80 ? '#10B981' : latest.percentage >= 40 ? '#0EA5E9' : '#F59E0B' }}>{latest.percentage}% — {latest.time_remaining} remaining</span>
                      </div>
                      <div style={{ height: 5, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${latest.percentage}%`, borderRadius: 999, background: latest.percentage >= 80 ? '#10B981' : latest.percentage >= 40 ? '#0EA5E9' : '#F59E0B', transition: 'width .6s cubic-bezier(.22,.61,.36,1)' }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {projects.length > 5 && (
              <div style={{ padding: '14px 24px', textAlign: 'center', borderTop: '1px solid #F8FAFC' }}>
                <Link to="/client/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0EA5E9', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  View all {projects.length} projects <Icon name="arrow-right" size={13} color="#0EA5E9" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
