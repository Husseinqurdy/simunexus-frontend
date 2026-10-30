import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Briefcase, CalendarClock, ChevronLeft, ChevronRight, FileText, Loader2, Lock, Search, Sparkles, X } from 'lucide-react'
import { projectApi } from '@/api/client'
import { errorMessage } from '@/lib/format'
import type { JobBoardProject } from '@/types'

// Lazima ziwe sawa na SOFTWARE_CHOICES za backend (chaguo lisilo halali linatoa kosa 400)
const SOFTWARE = [
  ['matlab', 'MATLAB / Simulink'], ['proteus', 'Proteus'], ['ansys', 'ANSYS'], ['labview', 'LabVIEW'], ['multisim', 'Multisim'],
  ['pscad', 'PSCAD'], ['etap', 'ETAP'], ['hfss', 'HFSS'], ['cst', 'CST Studio'], ['other', 'Other'],
]
const SW_LABEL = Object.fromEntries(SOFTWARE)
const DELIVERY: Record<string, string> = { standard: 'Standard', urgent: 'Urgent (24h)', express: 'Express (6–12h)' }
const PAY: Record<string, [string, string, string]> = { paid: ['Client paid in full', '#EDF8F1', '#137A4E'], advance: ['Advance paid', '#FFF8E6', '#9A5B00'], unpaid: ['Not yet paid', '#EBEFF8', '#4E5E82'] }
const PAGE_SIZE = 9
const money = (v: string | null) => (v ? `TSh ${Number(v).toLocaleString()}` : '—')

const sel: React.CSSProperties = { height: 40, border: '1px solid #C3CEE2', borderRadius: 8, padding: '0 10px', fontSize: 14, background: '#fff', fontFamily: 'inherit', minWidth: 0 }
const btn = (primary = true): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: primary ? 'none' : '1px solid #C3CEE2', background: primary ? '#0D52CE' : '#fff', color: primary ? '#fff' : '#0A1F6B' })

function deadlineText(iso: string) {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'Overdue'
  const h = Math.floor(ms / 3600000)
  return h < 48 ? `${h}h left` : `${Math.floor(h / 24)} days left`
}

export default function ExpertJobBoard() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [software, setSoftware] = useState('')
  const [delivery, setDelivery] = useState('')
  const [matching, setMatching] = useState(false)
  const [ordering, setOrdering] = useState('deadline')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState<JobBoardProject | null>(null)

  const q = useQuery({
    queryKey: ['job-board', search, software, delivery, matching, ordering, page],
    queryFn: () => projectApi.jobBoard({
      search: search || undefined, software: software || undefined, delivery_type: delivery || undefined,
      matching: matching ? 1 : undefined, ordering, page, page_size: PAGE_SIZE,
    }).then(r => r.data),
    placeholderData: prev => prev, refetchInterval: 30000,
  })
  const jobs: JobBoardProject[] = q.data?.results || []
  const total: number = q.data?.count || 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const set = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(1) }

  const claim = useMutation({
    mutationFn: (id: number) => projectApi.claim(id),
    onSuccess: (r) => {
      toast.success('Project claimed! It is now in My Projects.')
      setOpen(null); qc.invalidateQueries({ queryKey: ['job-board'] }); qc.invalidateQueries({ queryKey: ['expert-projects'] })
      void r
    },
    onError: (e: any) => { toast.error(errorMessage(e, 'Could not claim this project.')); qc.invalidateQueries({ queryKey: ['job-board'] }); setOpen(null) },
  })

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A1F4D', margin: '0 0 4px' }}>Job board</h1>
        <p style={{ fontSize: 14, color: '#4E5E82', margin: 0 }}>Open projects you can claim. {total ? `${total} available.` : ''}</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #DCE3F0', borderRadius: 12, padding: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
          <Search size={16} color="#667697" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input style={{ ...sel, width: '100%', paddingLeft: 36, boxSizing: 'border-box' }} placeholder="Search projects…" value={search} onChange={e => set(setSearch)(e.target.value)} />
        </div>
        <select style={sel} value={software} onChange={e => set(setSoftware)(e.target.value)} aria-label="Software">
          <option value="">All software</option>{SOFTWARE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select style={sel} value={delivery} onChange={e => set(setDelivery)(e.target.value)} aria-label="Delivery">
          <option value="">Any delivery</option>{Object.entries(DELIVERY).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select style={sel} value={ordering} onChange={e => set(setOrdering)(e.target.value)} aria-label="Sort">
          <option value="deadline">Deadline: soonest</option><option value="-client_price">Price: high to low</option><option value="-created_at">Newest first</option>
        </select>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#0A1F6B', cursor: 'pointer' }}>
          <input type="checkbox" checked={matching} onChange={e => set(setMatching)(e.target.checked)} style={{ accentColor: '#0D52CE', width: 16, height: 16 }} /> Matching my skills
        </label>
      </div>

      {q.isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[0, 1, 2].map(i => <div key={i} style={{ height: 220, borderRadius: 12, background: '#EBEFF8' }} />)}
        </div>
      ) : q.isError ? (
        <div style={{ background: '#FDEDED', border: '1px solid #F3C7C7', color: '#B92D2D', borderRadius: 12, padding: 20, fontSize: 14 }}>
          Could not load jobs. {errorMessage(q.error, '')} <button style={{ ...btn(false), marginLeft: 8 }} onClick={() => q.refetch()}>Retry</button>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #DCE3F0', borderRadius: 12, padding: '48px 20px', textAlign: 'center' }}>
          <Briefcase size={34} color="#8D9BB8" />
          <p style={{ fontSize: 16, fontWeight: 600, color: '#0A1F4D', margin: '12px 0 4px' }}>No open jobs match your filters</p>
          <p style={{ fontSize: 14, color: '#4E5E82', margin: 0 }}>New projects appear here once the admin has priced them. This page refreshes automatically.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, opacity: q.isFetching ? .75 : 1, transition: 'opacity .15s' }}>
          {jobs.map(p => {
            const [payText, payBg, payFg] = PAY[p.payment_status]
            return (
              <article key={p.id} style={{ background: '#fff', border: '1px solid #DCE3F0', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, background: '#EAF1FD', color: '#0A42A8', borderRadius: 999, padding: '3px 10px' }}>{SW_LABEL[p.software] || p.software}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, background: '#EBEFF8', color: '#3A4A70', borderRadius: 999, padding: '3px 10px' }}>{DELIVERY[p.delivery_type] || p.delivery_type}</span>
                  {p.matches_skills && <span style={{ fontSize: 12, fontWeight: 600, background: '#EDF8F1', color: '#137A4E', borderRadius: 999, padding: '3px 10px', display: 'inline-flex', gap: 4, alignItems: 'center' }}><Sparkles size={12} /> Matches you</span>}
                  {p.is_nda && <span style={{ fontSize: 12, fontWeight: 600, background: '#FFF3E6', color: '#B85F00', borderRadius: 999, padding: '3px 10px', display: 'inline-flex', gap: 4, alignItems: 'center' }}><Lock size={12} /> NDA</span>}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0A1F4D', margin: 0, lineHeight: 1.35 }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: '#4E5E82', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, color: '#4E5E82' }}>
                  <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><CalendarClock size={14} /> {deadlineText(p.deadline)}</span>
                  {p.files_count > 0 && <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><FileText size={14} /> {p.files_count} file(s)</span>}
                  <span style={{ fontSize: 12, fontWeight: 600, background: payBg, color: payFg, borderRadius: 999, padding: '2px 9px' }}>{payText}</span>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, paddingTop: 8, borderTop: '1px solid #EBEFF8' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#667697' }}>Your earning</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#137A4E' }}>{money(p.expert_earning)}</div>
                  </div>
                  <button style={btn()} onClick={() => setOpen(p)}>View & claim</button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
          <button style={btn(false)} disabled={page <= 1} onClick={() => setPage(p => p - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
          <span style={{ fontSize: 14, color: '#4E5E82' }}>Page {page} of {pages}</span>
          <button style={btn(false)} disabled={page >= pages} onClick={() => setPage(p => p + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
        </div>
      )}

      {open && (
        <div role="dialog" aria-modal="true" onClick={() => !claim.isPending && setOpen(null)} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(7,22,80,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 'clamp(18px,4vw,28px)', width: 'min(620px, 100%)', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0A1F4D', margin: '0 0 12px' }}>{open.title}</h2>
              <button onClick={() => setOpen(null)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667697', display: 'flex', height: 28 }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: 14, color: '#2B3A60', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: '0 0 16px' }}>{open.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8, marginBottom: 16, fontSize: 13 }}>
              {[
                ['Software', `${SW_LABEL[open.software] || open.software}${open.software_version ? ` (${open.software_version})` : ''}`],
                ['Delivery', DELIVERY[open.delivery_type]], ['Deadline', new Date(open.deadline).toLocaleString()],
                ['Client price', money(open.client_price)], ['Your earning', money(open.expert_earning)],
                ['Explanation', open.include_explanation ? 'Required' : 'Not required'], ['Payment', PAY[open.payment_status][0]],
              ].map(([k, v]) => <div key={k} style={{ background: '#F5F7FC', borderRadius: 8, padding: '8px 12px' }}><div style={{ color: '#667697' }}>{k}</div><div style={{ fontWeight: 600, color: '#0A1F4D' }}>{v}</div></div>)}
            </div>
            <p style={{ fontSize: 13, color: '#4E5E82', margin: '0 0 16px' }}>
              By claiming, this project is assigned to you and you commit to delivering by the deadline. Input files appear in <Link to="/expert/projects" style={{ color: '#0D52CE', fontWeight: 600 }}>My Projects</Link> after you claim.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button style={btn(false)} disabled={claim.isPending} onClick={() => setOpen(null)}>Cancel</button>
              <button style={{ ...btn(), opacity: claim.isPending ? .7 : 1 }} disabled={claim.isPending} onClick={() => claim.mutate(open.id)}>
                {claim.isPending ? <><Loader2 size={15} className="spin" /> Claiming…</> : 'Claim this project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
