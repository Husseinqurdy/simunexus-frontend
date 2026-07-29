import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { projectApi } from '@/api/client'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import type { Project } from '@/types'
import { Search, Plus, Inbox, CreditCard, Download, Undo2 } from 'lucide-react'

const formatTSH = (value: number | string | undefined | null) => {
  const n = Number(value || 0)
  return `TSH ${n.toLocaleString('en-US')}`
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  received:    { label:'Received',      color:'#64748B', bg:'#F8FAFC', dot:'#94A3B8' },
  assigned:    { label:'Assigned',      color:'#2563EB', bg:'#EFF6FF', dot:'#3B82F6' },
  in_progress: { label:'In Progress',   color:'#D97706', bg:'#FFFBEB', dot:'#F59E0B' },
  qc:          { label:'Quality Check', color:'#7C3AED', bg:'#F5F3FF', dot:'#8B5CF6' },
  completed:   { label:'Completed',     color:'#059669', bg:'#F0FDF4', dot:'#10B981' },
  revision:    { label:'Revision',      color:'#E11D48', bg:'#FFF1F2', dot:'#F43F5E' },
  cancelled:   { label:'Cancelled',     color:'#64748B', bg:'#F8FAFC', dot:'#94A3B8' },
}

function StatusPill({ status }: { status: string }) {
  const c = STATUS_CFG[status] || STATUS_CFG.received
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, background:c.bg, color:c.color, border:`1px solid ${c.dot}25`, flexShrink:0 }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:c.dot }} />{c.label}
    </span>
  )
}

const STATUSES = ['','received','assigned','in_progress','qc','completed','revision','cancelled']

export default function ClientProjects() {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['client-projects-list', statusFilter],
    queryFn: () => projectApi.list(statusFilter ? { status: statusFilter } : undefined).then(r => r.data),
    refetchInterval: 30000,
  })

  const allProjects: Project[] = data?.results || []
  const projects = search
    ? allProjects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.software.toLowerCase().includes(search.toLowerCase()))
    : allProjects

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .4s ease both}
        .cp-new-btn { transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.2s ease; }
        .cp-new-btn:hover { transform: translateY(-2px); opacity: 0.95; box-shadow: 0 8px 18px rgba(14,165,233,.25); }
        .cp-new-btn:active { transform: translateY(0); }
        .cp-search-input { transition: border-color .15s ease, box-shadow .15s ease; }
        .cp-search-input:focus { border-color: #0EA5E9; box-shadow: 0 0 0 3px rgba(14,165,233,.12); }
        .cp-select { transition: border-color .15s ease; }
        .cp-project-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
      `}</style>

      {/* Header */}
      <div className="fu" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'#0F172A', margin:0 }}>My Projects</h1>
          <p style={{ color:'#94A3B8', fontSize:13, margin:'4px 0 0' }}>{data?.count || 0} total projects</p>
        </div>
        <Link to="/client/projects/new" className="cp-new-btn" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#0EA5E9', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, padding:'10px 20px', borderRadius:12, textDecoration:'none' }}>
          <Plus size={15} strokeWidth={2.4} /> New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="fu" style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={15} strokeWidth={2} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94A3B8' }} />
          <input
            className="cp-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            style={{ width:'100%', padding:'10px 14px 10px 36px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:13, outline:'none', background:'#fff', fontFamily:'DM Sans,sans-serif', boxSizing:'border-box' }}
          />
        </div>
        <select className="cp-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding:'10px 14px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:13, background:'#fff', cursor:'pointer', fontFamily:'DM Sans,sans-serif', outline:'none' }}>
          {STATUSES.map(s => <option key={s} value={s}>{s ? STATUS_CFG[s]?.label : 'All Status'}</option>)}
        </select>
      </div>

      {/* Project cards */}
      {isLoading ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:64, gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #E2E8F0', borderTop:'3px solid #0EA5E9', animation:'spin .8s linear infinite' }} />
          <p style={{ color:'#94A3B8', fontSize:13 }}>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="fu" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', padding:'64px 24px', textAlign:'center' }}>
          <div style={{ width:64, height:64, borderRadius:18, background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#94A3B8' }}>
            <Inbox size={30} strokeWidth={1.8} />
          </div>
          <p style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'#0F172A', margin:'0 0 8px' }}>{search || statusFilter ? 'No matching projects' : 'No projects yet'}</p>
          <p style={{ fontSize:13, color:'#94A3B8', margin:'0 0 20px' }}>{search || statusFilter ? 'Try a different filter.' : 'Submit your first simulation project to get started.'}</p>
          {!search && !statusFilter && (
            <Link to="/client/projects/new" className="cp-new-btn" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#0EA5E9', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, padding:'11px 22px', borderRadius:12, textDecoration:'none' }}>Submit a Project →</Link>
          )}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {projects.map((p, i) => {
            const latest = p.latest_progress
            const needsPay = p.client_price && !p.is_fully_paid && !['completed','cancelled'].includes(p.status)
            const isNew = p.status === 'received' && !p.expert
            return (
              <div key={p.id} className="fu cp-project-card" onClick={() => navigate(`/client/projects/${p.id}`)}
                style={{ background:'#fff', borderRadius:18, border:'1px solid #F1F5F9', padding:'20px 24px', cursor:'pointer', animationDelay:`${i*0.04}s` }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 8px 24px rgba(0,0,0,.06)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='none'; (e.currentTarget as HTMLDivElement).style.transform='translateY(0)' }}
              >
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:14 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                      <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#0F172A' }}>{p.title}</span>
                      {isNew && <span style={{ fontSize:10, background:'#F0FDF4', color:'#059669', padding:'2px 8px', borderRadius:999, fontWeight:700 }}>NEW</span>}
                      {needsPay && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, background:'#FFF7ED', color:'#C2410C', padding:'2px 8px', borderRadius:999, fontWeight:700 }}>
                          <CreditCard size={10} strokeWidth={2.6} /> PAYMENT DUE
                        </span>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
                      <span style={{ fontSize:12, background:'#EFF6FF', color:'#2563EB', padding:'3px 10px', borderRadius:999, fontWeight:700 }}>{p.software?.toUpperCase()}</span>
                      <span style={{ fontSize:12, color:'#94A3B8' }}>Deadline: {formatDistanceToNow(new Date(p.deadline), {addSuffix:true})}</span>
                      {p.client_price && (
                        <span style={{ fontSize:12, color:'#059669', fontWeight:700 }}>Price: {formatTSH(p.client_price)}</span>
                      )}
                      {p.expert_name && (
                        <span style={{ fontSize:12, color:'#64748B' }}>Expert: {p.expert_name}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                    <StatusPill status={p.status} />
                    {p.status === 'completed' && (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'#10B981', fontWeight:700 }}>
                        <Download size={11} strokeWidth={2.6} /> Ready to download
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress */}
                {latest && (
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#94A3B8', marginBottom:5 }}>
                      <span>Expert progress</span>
                      <span style={{ fontWeight:600, color: latest.percentage>=80?'#10B981':'#0EA5E9' }}>{latest.percentage}% · {latest.time_remaining} remaining</span>
                    </div>
                    <div style={{ height:5, background:'#F1F5F9', borderRadius:999, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${latest.percentage}%`, borderRadius:999, background: latest.percentage>=80?'#10B981':latest.percentage>=40?'#0EA5E9':'#F59E0B', transition:'width .5s' }} />
                    </div>
                  </div>
                )}

                {/* Rejection notice */}
                {p.status === 'revision' && p.rejection_reason && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:6, marginTop:10, padding:'10px 14px', background:'#FFF1F2', border:'1px solid #FECDD3', borderRadius:10, fontSize:12, color:'#E11D48' }}>
                    <Undo2 size={13} strokeWidth={2.4} style={{ flexShrink:0, marginTop:1 }} />
                    <span><strong>Revision:</strong> {p.rejection_reason}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}