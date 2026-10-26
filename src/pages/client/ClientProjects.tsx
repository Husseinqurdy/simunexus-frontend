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
  received:    { label:'Received',      color:'#4E5E82', bg:'#F5F7FC', dot:'#667697' },
  assigned:    { label:'Assigned',      color:'#0D52CE', bg:'#EAF1FD', dot:'#3F7BE0' },
  in_progress: { label:'In Progress',   color:'#B85F00', bg:'#FFF8E6', dot:'#E5A00D' },
  qc:          { label:'Quality Check', color:'#2E4DA7', bg:'#EEF2FB', dot:'#3F5FB8' },
  completed:   { label:'Completed',     color:'#137A4E', bg:'#EDF8F1', dot:'#1B9B63' },
  revision:    { label:'Revision',      color:'#B92D2D', bg:'#FDEDED', dot:'#D03A3A' },
  cancelled:   { label:'Cancelled',     color:'#4E5E82', bg:'#F5F7FC', dot:'#667697' },
}

function StatusPill({ status }: { status: string }) {
  const c = STATUS_CFG[status] || STATUS_CFG.received
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:999, fontSize:12, fontWeight:700, background:c.bg, color:c.color, border:`1px solid ${c.dot}25`, flexShrink:0 }}>
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
    <div style={{ fontFamily: 'inherit' }}>
      <style>{`
        
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(0)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .4s ease both}
        .cp-new-btn { transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.2s ease; }
        .cp-new-btn:hover { transform: translateY(0); opacity: 0.95; box-shadow: 0 8px 18px rgba(13,82,206,.25); }
        .cp-new-btn:active { transform: translateY(0); }
        .cp-search-input { transition: border-color .15s ease, box-shadow .15s ease; }
        .cp-search-input:focus { border-color: #0D52CE; box-shadow: 0 0 0 3px rgba(13,82,206,.12); }
        .cp-select { transition: border-color .15s ease; }
        .cp-project-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
      `}</style>

      {/* Header */}
      <div className="fu" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily: 'inherit', fontSize:24, fontWeight:700, color:'#0A1F4D', margin:0 }}>My Projects</h1>
          <p style={{ color:'#667697', fontSize:13, margin:'4px 0 0' }}>{data?.count || 0} total projects</p>
        </div>
        <Link to="/client/projects/new" className="cp-new-btn" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#0D52CE', color:'#fff', fontFamily: 'inherit', fontWeight:700, fontSize:13, padding:'10px 20px', borderRadius:12, textDecoration:'none' }}>
          <Plus size={15} strokeWidth={2.4} /> New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="fu" style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={15} strokeWidth={2} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#667697' }} />
          <input
            className="cp-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            style={{ width:'100%', padding:'10px 14px 10px 36px', border:'1.5px solid #DCE3F0', borderRadius:10, fontSize:13, outline:'none', background:'#fff', fontFamily: 'inherit', boxSizing:'border-box' }}
          />
        </div>
        <select className="cp-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding:'10px 14px', border:'1.5px solid #DCE3F0', borderRadius:10, fontSize:13, background:'#fff', cursor:'pointer', fontFamily: 'inherit', outline:'none' }}>
          {STATUSES.map(s => <option key={s} value={s}>{s ? STATUS_CFG[s]?.label : 'All Status'}</option>)}
        </select>
      </div>

      {/* Project cards */}
      {isLoading ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:64, gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #DCE3F0', borderTop:'3px solid #0D52CE', animation:'spin .8s linear infinite' }} />
          <p style={{ color:'#667697', fontSize:13 }}>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="fu" style={{ background:'#fff', borderRadius:16, border:'1px solid #EBEFF8', padding:'64px 24px', textAlign:'center' }}>
          <div style={{ width:64, height:64, borderRadius:12, background:'#EBEFF8', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#667697' }}>
            <Inbox size={30} strokeWidth={1.8} />
          </div>
          <p style={{ fontFamily: 'inherit', fontSize:18, fontWeight:700, color:'#0A1F4D', margin:'0 0 8px' }}>{search || statusFilter ? 'No matching projects' : 'No projects yet'}</p>
          <p style={{ fontSize:13, color:'#667697', margin:'0 0 20px' }}>{search || statusFilter ? 'Try a different filter.' : 'Submit your first simulation project to get started.'}</p>
          {!search && !statusFilter && (
            <Link to="/client/projects/new" className="cp-new-btn" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#0D52CE', color:'#fff', fontFamily: 'inherit', fontWeight:700, fontSize:13, padding:'11px 22px', borderRadius:12, textDecoration:'none' }}>Submit a Project →</Link>
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
                style={{ background:'#fff', borderRadius:12, border:'1px solid #EBEFF8', padding:'20px 24px', cursor:'pointer', animationDelay:`${i*0.04}s` }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 3px rgba(10,31,107,.08)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(0)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 3px rgba(10,31,107,.08)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(0)' }}
              >
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:14 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                      <span style={{ fontFamily: 'inherit', fontWeight:700, fontSize:16, color:'#0A1F4D' }}>{p.title}</span>
                      {isNew && <span style={{ fontSize:12, background:'#EDF8F1', color:'#137A4E', padding:'2px 8px', borderRadius:999, fontWeight:700 }}>NEW</span>}
                      {needsPay && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, background:'#FFF3E6', color:'#B85F00', padding:'2px 8px', borderRadius:999, fontWeight:700 }}>
                          <CreditCard size={10} strokeWidth={2.6} /> PAYMENT DUE
                        </span>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
                      <span style={{ fontSize:12, background:'#EAF1FD', color:'#0D52CE', padding:'3px 10px', borderRadius:999, fontWeight:700 }}>{p.software?.toUpperCase()}</span>
                      <span style={{ fontSize:12, color:'#667697' }}>Deadline: {formatDistanceToNow(new Date(p.deadline), {addSuffix:true})}</span>
                      {p.client_price && (
                        <span style={{ fontSize:12, color:'#137A4E', fontWeight:700 }}>Price: {formatTSH(p.client_price)}</span>
                      )}
                      {p.expert_name && (
                        <span style={{ fontSize:12, color:'#4E5E82' }}>Expert: {p.expert_name}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                    <StatusPill status={p.status} />
                    {p.status === 'completed' && (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, color:'#137A4E', fontWeight:700 }}>
                        <Download size={11} strokeWidth={2.6} /> Ready to download
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress */}
                {latest && (
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#667697', marginBottom:5 }}>
                      <span>Expert progress</span>
                      <span style={{ fontWeight:600, color: latest.percentage>=80?'#1B9B63':'#0D52CE' }}>{latest.percentage}% · {latest.time_remaining} remaining</span>
                    </div>
                    <div style={{ height:5, background:'#EBEFF8', borderRadius:999, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${latest.percentage}%`, borderRadius:999, background: latest.percentage>=80?'#1B9B63':latest.percentage>=40?'#0D52CE':'#E5A00D', transition:'width .5s' }} />
                    </div>
                  </div>
                )}

                {/* Rejection notice */}
                {p.status === 'revision' && p.rejection_reason && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:6, marginTop:10, padding:'10px 14px', background:'#FDEDED', border:'1px solid #F3C7C7', borderRadius:10, fontSize:12, color:'#B92D2D' }}>
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