import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '@/api/client'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import type { Project } from '@/types'
import { Search, Inbox, Lock, Zap, Clock3, CheckCircle2 } from 'lucide-react'

const formatTSH = (value: number | string | undefined | null) => {
  const n = Number(value || 0)
  return `TSH ${n.toLocaleString('en-US')}`
}

const DELIVERY_CFG: Record<string, { label: string; color: string; bg: string }> = {
  standard: { label: 'Standard', color: '#64748B', bg: '#F8FAFC' },
  urgent:   { label: 'Urgent 24h', color: '#D97706', bg: '#FFFBEB' },
  express:  { label: 'Express 6-12h', color: '#E11D48', bg: '#FFF1F2' },
}

const SOFTWARE_OPTIONS = ['', 'matlab', 'ansys', 'abaqus', 'comsol', 'solidworks', 'other']
const DELIVERY_OPTIONS = ['', 'standard', 'urgent', 'express']

export default function ExpertJobBoard() {
  const [search, setSearch] = useState('')
  const [software, setSoftware] = useState('')
  const [delivery, setDelivery] = useState('')
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['job-board', software, delivery, search],
    queryFn: () => projectApi.jobBoard({
      ...(software && { software }),
      ...(delivery && { delivery_type: delivery }),
      ...(search && { search }),
    }).then(r => r.data),
    refetchInterval: 15000,
  })

  const claimMutation = useMutation({
    mutationFn: (id: number) => projectApi.claim(id),
    onSuccess: (_, id) => {
      toast.success('Project claimed! It\'s now in My Projects.')
      qc.invalidateQueries({ queryKey: ['job-board'] })
      navigate(`/expert/projects/${id}`)
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Could not claim this project — it may already be taken.'),
  })

  const jobs: Project[] = data?.results || []

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .4s ease both}
        .jb-search-input { transition: border-color .15s ease, box-shadow .15s ease; }
        .jb-search-input:focus { border-color: #0EA5E9; box-shadow: 0 0 0 3px rgba(14,165,233,.12); }
        .jb-select { transition: border-color .15s ease; }
        .jb-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
        .jb-claim-btn { transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.2s ease; }
        .jb-claim-btn:hover { transform: translateY(-1px); opacity: 0.94; box-shadow: 0 6px 16px rgba(14,165,233,.25); }
        .jb-claim-btn:active { transform: translateY(0); }
        .jb-claim-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
      `}</style>

      {/* Header */}
      <div className="fu" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'#0F172A', margin:0 }}>Job Board</h1>
        <p style={{ color:'#94A3B8', fontSize:13, margin:'4px 0 0' }}>{data?.count ?? jobs.length} open projects waiting to be claimed</p>
      </div>

      {/* Filters */}
      <div className="fu" style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={15} strokeWidth={2} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94A3B8' }} />
          <input
            className="jb-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search open projects..."
            style={{ width:'100%', padding:'10px 14px 10px 36px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:13, outline:'none', background:'#fff', fontFamily:'DM Sans,sans-serif', boxSizing:'border-box' }}
          />
        </div>
        <select className="jb-select" value={software} onChange={e => setSoftware(e.target.value)} style={{ padding:'10px 14px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:13, background:'#fff', cursor:'pointer', fontFamily:'DM Sans,sans-serif', outline:'none' }}>
          <option value="">All Software</option>
          {SOFTWARE_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>
        <select className="jb-select" value={delivery} onChange={e => setDelivery(e.target.value)} style={{ padding:'10px 14px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:13, background:'#fff', cursor:'pointer', fontFamily:'DM Sans,sans-serif', outline:'none' }}>
          <option value="">All Delivery Types</option>
          {DELIVERY_OPTIONS.filter(Boolean).map(d => <option key={d} value={d}>{DELIVERY_CFG[d]?.label || d}</option>)}
        </select>
      </div>

      {/* Jobs */}
      {isLoading ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:64, gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #E2E8F0', borderTop:'3px solid #0EA5E9', animation:'spin .8s linear infinite' }} />
          <p style={{ color:'#94A3B8', fontSize:13 }}>Loading open projects...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="fu" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', padding:'64px 24px', textAlign:'center' }}>
          <div style={{ width:64, height:64, borderRadius:18, background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#94A3B8' }}>
            <Inbox size={30} strokeWidth={1.8} />
          </div>
          <p style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'#0F172A', margin:'0 0 8px' }}>
            {search || software || delivery ? 'No matching projects' : 'No open projects right now'}
          </p>
          <p style={{ fontSize:13, color:'#94A3B8', margin:0 }}>
            {search || software || delivery ? 'Try a different filter.' : 'Check back soon — new projects appear here as clients submit them.'}
          </p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {jobs.map((p, i) => {
            const dcfg = DELIVERY_CFG[p.delivery_type] || DELIVERY_CFG.standard
            return (
              <div key={p.id} className="fu jb-card"
                style={{ background:'#fff', borderRadius:18, border:'1px solid #F1F5F9', padding:'20px 24px', animationDelay:`${i*0.04}s` }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 8px 24px rgba(0,0,0,.06)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='none'; (e.currentTarget as HTMLDivElement).style.transform='translateY(0)' }}
              >
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                  <div style={{ flex:1, minWidth:220 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                      <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#0F172A' }}>{p.title}</span>
                      {p.is_nda && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, background:'#F5F3FF', color:'#7C3AED', padding:'2px 8px', borderRadius:999, fontWeight:700 }}>
                          <Lock size={11} strokeWidth={2.4} /> NDA
                        </span>
                      )}
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, background:dcfg.bg, color:dcfg.color, padding:'2px 8px', borderRadius:999, fontWeight:700 }}>
                        {p.delivery_type !== 'standard' && <Zap size={11} strokeWidth={2.6} />}
                        {dcfg.label}
                      </span>
                    </div>
                    <p style={{ fontSize:13, color:'#64748B', lineHeight:1.6, margin:'0 0 12px', maxWidth:640 }}>
                      {p.description?.length > 160 ? p.description.slice(0, 160) + '…' : p.description}
                    </p>
                    <div style={{ display:'flex', gap:14, flexWrap:'wrap', alignItems:'center' }}>
                      <span style={{ fontSize:12, background:'#EFF6FF', color:'#2563EB', padding:'3px 10px', borderRadius:999, fontWeight:700 }}>{p.software?.toUpperCase()}</span>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, color:'#94A3B8' }}>
                        <Clock3 size={12} strokeWidth={2.2} /> Deadline {formatDistanceToNow(new Date(p.deadline), {addSuffix:true})}
                      </span>
                      {p.include_explanation && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, color:'#7C3AED', fontWeight:600 }}>
                          <CheckCircle2 size={12} strokeWidth={2.4} /> Explanation required
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10, flexShrink:0 }}>
                    <p style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, color:'#059669', margin:0 }}>{formatTSH(p.client_price)}</p>
                    <button
                      className="jb-claim-btn"
                      onClick={() => claimMutation.mutate(p.id)}
                      disabled={claimMutation.isPending}
                      style={{ background:'#0EA5E9', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, padding:'10px 22px', borderRadius:10, border:'none', cursor:'pointer', whiteSpace:'nowrap' }}
                    >
                      {claimMutation.isPending ? 'Claiming…' : 'Claim Project'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
