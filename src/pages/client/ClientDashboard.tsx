import { useQuery } from '@tanstack/react-query'
import { projectApi, paymentApi } from '@/api/client'
import { LoadingSpinner, ProgressBar, Alert } from '@/components/shared'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { formatDistanceToNow, isPast, format } from 'date-fns'
import type { Project } from '@/types'

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
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, background:c.bg, color:c.color, border:`1px solid ${c.dot}25` }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:c.dot, flexShrink:0 }} />
      {c.label}
    </span>
  )
}

const STAGE_STEPS = ['received','assigned','in_progress','qc','completed']
const STAGE_LABELS = ['Received','Assigned','In Progress','QC','Completed']

function StageTracker({ status }: { status: string }) {
  const cur = STAGE_STEPS.indexOf(status)
  const isRevision = status === 'revision'
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:0, overflowX:'auto', paddingBottom:4 }}>
      {STAGE_STEPS.map((s, i) => {
        const done    = i < cur || (status === 'completed' && i <= cur)
        const active  = i === cur && !isRevision
        return (
          <div key={s} style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{
                width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:11, fontWeight:700, transition:'all .3s',
                background: done ? '#10B981' : active ? '#0EA5E9' : '#F1F5F9',
                color: done || active ? '#fff' : '#94A3B8',
                border: `2px solid ${done ? '#10B981' : active ? '#0EA5E9' : '#E2E8F0'}`,
              }}>
                {done ? '✓' : i+1}
              </div>
              <span style={{ fontSize:10, marginTop:5, whiteSpace:'nowrap', color: done ? '#10B981' : active ? '#0EA5E9' : '#94A3B8', fontWeight: active ? 700 : 400 }}>
                {STAGE_LABELS[i]}
              </span>
            </div>
            {i < STAGE_STEPS.length - 1 && (
              <div style={{ width:32, height:2, background: i < cur ? '#10B981' : '#E2E8F0', margin:'0 4px', marginBottom:18, flexShrink:0, transition:'background .5s' }} />
            )}
          </div>
        )
      })}
      {isRevision && (
        <div style={{ display:'flex', alignItems:'center', marginLeft:8, padding:'3px 10px', background:'#FFF1F2', border:'1px solid #FECDD3', borderRadius:999 }}>
          <span style={{ fontSize:11, color:'#E11D48', fontWeight:700 }}>↩ Revision</span>
        </div>
      )}
    </div>
  )
}

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
  const active        = projects.filter(p => !['completed','cancelled'].includes(p.status))
  const completed     = projects.filter(p => p.status === 'completed')
  const pendingPayment = projects.filter(p => p.client_price && !p.is_fully_paid && !['completed','cancelled'].includes(p.status))
  const inQC          = projects.filter(p => p.status === 'qc')

  if (isLoading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, gap:16 }}>
      <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid #E2E8F0', borderTop:'3px solid #0EA5E9', animation:'spin .8s linear infinite' }} />
      <p style={{ color:'#94A3B8', fontSize:14 }}>Loading your dashboard...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); @keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} .fade-up{animation:fadeUp .5s ease both}`}</style>

      {/* Header */}
      <div className="fade-up" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:28 }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'#0F172A', margin:0 }}>
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}! 👋
          </h1>
          <p style={{ color:'#94A3B8', fontSize:14, margin:'4px 0 0' }}>Here's what's happening with your simulation projects.</p>
        </div>
        <Link to="/submit" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#0EA5E9', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, padding:'11px 22px', borderRadius:12, textDecoration:'none', boxShadow:'0 4px 14px rgba(14,165,233,.3)' }}>
          + New Project
        </Link>
      </div>

      {/* Alerts */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
        {!user?.is_profile_complete && (
          <div className="fade-up" style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18 }}>⚠️</span>
              <div>
                <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#D97706', margin:0 }}>Complete your profile to download results</p>
                <p style={{ fontSize:12, color:'#B45309', margin:'2px 0 0' }}>Required before downloading completed simulation files.</p>
              </div>
            </div>
            <Link to="/client/profile" style={{ background:'#D97706', color:'#fff', fontSize:12, fontWeight:700, padding:'7px 14px', borderRadius:8, textDecoration:'none', fontFamily:'Syne,sans-serif', flexShrink:0 }}>Complete Now</Link>
          </div>
        )}
        {pendingPayment.length > 0 && (
          <div className="fade-up" style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18 }}>💳</span>
              <div>
                <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#1D4ED8', margin:0 }}>{pendingPayment.length} project{pendingPayment.length>1?'s':''} awaiting payment</p>
                <p style={{ fontSize:12, color:'#2563EB', margin:'2px 0 0' }}>Make your advance payment so experts can start working.</p>
              </div>
            </div>
            <Link to="/client/projects" style={{ background:'#1D4ED8', color:'#fff', fontSize:12, fontWeight:700, padding:'7px 14px', borderRadius:8, textDecoration:'none', fontFamily:'Syne,sans-serif', flexShrink:0 }}>Pay Now</Link>
          </div>
        )}
        {inQC.length > 0 && (
          <div className="fade-up" style={{ background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:18 }}>🔍</span>
            <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#7C3AED', margin:0 }}>
              {inQC.length} project{inQC.length>1?'s':''} in Quality Check — almost done! We'll notify you when ready.
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:28 }}>
        {[
          { label:'Total Projects', value:projects.length, color:'#0B1C3D', emoji:'📁' },
          { label:'Active',         value:active.length,   color:'#0EA5E9', emoji:'⚡' },
          { label:'Completed',      value:completed.length, color:'#10B981', emoji:'✅' },
          { label:'Wallet',         value:`$${walletData?.wallet?.balance||'0.00'}`, color:'#7C3AED', emoji:'💰' },
        ].map(({ label, value, color, emoji }) => (
          <div key={label} style={{ background:'#fff', borderRadius:16, padding:'20px 22px', border:'1px solid #F1F5F9', boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <p style={{ fontSize:11, fontWeight:600, color:'#94A3B8', margin:0, letterSpacing:'.04em', textTransform:'uppercase' }}>{label}</p>
              <span style={{ fontSize:18 }}>{emoji}</span>
            </div>
            <p style={{ fontSize:28, fontWeight:800, color, margin:0, fontFamily:'Syne,sans-serif', lineHeight:1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Projects list */}
      <div className="fade-up" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', boxShadow:'0 1px 3px rgba(0,0,0,.04)', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid #F8FAFC' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:700, color:'#0F172A', margin:0 }}>My Projects</h2>
          <Link to="/client/projects" style={{ fontSize:13, color:'#0EA5E9', fontWeight:600, textDecoration:'none' }}>View all →</Link>
        </div>

        {projects.length === 0 ? (
          <div style={{ textAlign:'center', padding:'64px 24px' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🚀</div>
            <p style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:'#0F172A', margin:'0 0 8px' }}>Submit your first project</p>
            <p style={{ fontSize:14, color:'#94A3B8', margin:'0 0 24px', lineHeight:1.6 }}>No account needed — describe your simulation and we'll connect you with a verified expert immediately.</p>
            <Link to="/submit" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#0EA5E9', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, padding:'12px 24px', borderRadius:12, textDecoration:'none', boxShadow:'0 4px 14px rgba(14,165,233,.3)' }}>
              Submit a Project →
            </Link>
          </div>
        ) : (
          <div>
            {projects.slice(0,5).map((p, idx) => {
              const urgent = !['completed','cancelled'].includes(p.status) && isPast(new Date(new Date(p.deadline).getTime() - 24*60*60*1000))
              const latest = p.latest_progress
              const needsPay = p.client_price && !p.is_fully_paid && !['completed','cancelled'].includes(p.status)
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/client/projects/${p.id}`)}
                  style={{ padding:'20px 24px', borderBottom: idx < Math.min(projects.length,5)-1 ? '1px solid #F8FAFC' : 'none', cursor:'pointer', transition:'background .15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background='#F8FAFC'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background='transparent'}
                >
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                        <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'#0F172A', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</p>
                        {urgent && <span style={{ fontSize:10, background:'#FFF1F2', color:'#E11D48', padding:'2px 7px', borderRadius:999, fontWeight:700, flexShrink:0 }}>URGENT</span>}
                        {needsPay && <span style={{ fontSize:10, background:'#FFF7ED', color:'#C2410C', padding:'2px 7px', borderRadius:999, fontWeight:700, flexShrink:0 }}>PAYMENT DUE</span>}
                      </div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <span style={{ fontSize:11, color:'#94A3B8' }}>Deadline: {formatDistanceToNow(new Date(p.deadline), {addSuffix:true})}</span>
                        <span style={{ fontSize:11, color:'#CBD5E1' }}>·</span>
                        <span style={{ fontSize:11, color:'#94A3B8' }}>{p.software?.toUpperCase()}</span>
                        {p.client_price && (
                          <>
                            <span style={{ fontSize:11, color:'#CBD5E1' }}>·</span>
                            <span style={{ fontSize:11, color:'#059669', fontWeight:700 }}>${p.client_price}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <StatusPill status={p.status} />
                  </div>

                  {/* Stage tracker */}
                  <StageTracker status={p.status} />

                  {/* Progress bar */}
                  {latest && (
                    <div style={{ marginTop:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#94A3B8', marginBottom:5 }}>
                        <span>Expert progress</span>
                        <span style={{ fontWeight:600, color: latest.percentage>=80?'#10B981':latest.percentage>=40?'#0EA5E9':'#F59E0B' }}>{latest.percentage}% — {latest.time_remaining} remaining</span>
                      </div>
                      <div style={{ height:5, background:'#F1F5F9', borderRadius:999, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${latest.percentage}%`, borderRadius:999, background: latest.percentage>=80?'#10B981':latest.percentage>=40?'#0EA5E9':'#F59E0B', transition:'width .5s ease' }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {projects.length > 5 && (
              <div style={{ padding:'14px 24px', textAlign:'center', borderTop:'1px solid #F8FAFC' }}>
                <Link to="/client/projects" style={{ color:'#0EA5E9', fontSize:13, fontWeight:600, textDecoration:'none' }}>View all {projects.length} projects →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
