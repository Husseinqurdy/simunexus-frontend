import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '@/api/client'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import type { Project } from '@/types'
import {
  Search, Inbox, Lock, Zap, Clock3, CheckCircle2,
  ArrowUpDown, X, Info, Loader2, ChevronDown
} from 'lucide-react'

const formatTSH = (value: number | string | undefined | null) => {
  const n = Number(value || 0)
  return `TSH ${n.toLocaleString('en-US')}`
}

const DELIVERY_CFG: Record<string, { label: string; color: string; bg: string }> = {
  standard: { label: 'Standard', color: '#4E5E82', bg: '#F5F7FC' },
  urgent:   { label: 'Urgent 24h', color: '#B85F00', bg: '#FFF8E6' },
  express:  { label: 'Express 6-12h', color: '#B92D2D', bg: '#FDEDED' },
}

const SOFTWARE_OPTIONS = ['', 'matlab', 'ansys', 'abaqus', 'comsol', 'solidworks', 'other']
const DELIVERY_OPTIONS = ['', 'standard', 'urgent', 'express']

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest first' },
  { value: '-client_price', label: 'Highest paying' },
  { value: 'client_price', label: 'Lowest paying' },
  { value: 'deadline', label: 'Deadline: soonest' },
  { value: '-deadline', label: 'Deadline: furthest' },
]

const PAGE_SIZE = 10

export default function ExpertJobBoard() {
  const [search, setSearch] = useState('')
  const [software, setSoftware] = useState('')
  const [delivery, setDelivery] = useState('')
  const [ordering, setOrdering] = useState('-created_at')
  const [page, setPage] = useState(1)
  const [confirmProject, setConfirmProject] = useState<Project | null>(null)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['job-board', software, delivery, search, ordering, page],
    queryFn: () => projectApi.jobBoard({
      ...(software && { software }),
      ...(delivery && { delivery_type: delivery }),
      ...(search && { search }),
      ordering,
      page,
      page_size: PAGE_SIZE,
    }).then(r => r.data),
    refetchInterval: 15000,
  })

  const claimMutation = useMutation({
    mutationFn: (id: number) => projectApi.claim(id),
    onSuccess: (_, id) => {
      toast.success('Project claimed! It\'s now in My Projects.')
      qc.invalidateQueries({ queryKey: ['job-board'] })
      setConfirmProject(null)
      navigate(`/expert/projects/${id}`)
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.error || 'Could not claim this project — it may already be taken.')
      // Refresh immediately so the list reflects reality (avoids stale race-condition state).
      qc.invalidateQueries({ queryKey: ['job-board'] })
      setConfirmProject(null)
    },
  })

  const jobs: Project[] = data?.results || []
  const hasNext = !!data?.next
  const hasPrev = !!data?.previous
  const totalCount = data?.count ?? jobs.length

  const resetFilters = (fn: () => void) => {
    fn()
    setPage(1)
  }

  return (
    <div style={{ fontFamily: 'inherit' }} className="jb-page">
      <style>{`
        
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(0)}to{opacity:1;transform:translateY(0)}}
        @keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(0)}to{opacity:1;transform:scale(1) translateY(0)}}
        .fu{animation:fadeUp .4s ease both}
        .spin{animation:spin .8s linear infinite}
        .jb-search-input { transition: border-color .15s ease, box-shadow .15s ease; }
        .jb-search-input:focus { border-color: #0D52CE; box-shadow: 0 0 0 3px rgba(13,82,206,.12); }
        .jb-select { transition: border-color .15s ease; }
        .jb-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
        .jb-claim-btn { transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.2s ease; }
        .jb-claim-btn:hover { transform: translateY(0); opacity: 0.94; box-shadow: 0 6px 16px rgba(13,82,206,.25); }
        .jb-claim-btn:active { transform: translateY(0); }
        .jb-claim-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
        .jb-page-btn { transition: background .15s ease, color .15s ease, opacity .15s ease; }
        .jb-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .jb-nda-tip { position: relative; display: inline-flex; }
        .jb-nda-tip .jb-tip-bubble {
          position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
          background: #0A1F4D; color: #fff; font-size: 12px; padding: 6px 10px; border-radius: 8px;
          white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .15s ease;
          z-index: 5;
        }
        .jb-nda-tip:hover .jb-tip-bubble { opacity: 1; }
        .jb-modal-overlay { position: fixed; inset: 0; background: rgba(10,31,107,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
        .jb-modal { background: #fff; border-radius: 18px; width: 100%; max-width: 420px; padding: 24px; animation: modalIn .18s ease-out; }

        .jb-filters { display: flex; gap: 10px; flex-wrap: wrap; }
        .jb-cardbody { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .jb-priceblock { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }

        @media (max-width: 640px) {
          .jb-page { font-size: 13px; }
          .jb-cardbody { flex-direction: column; }
          .jb-priceblock { align-items: stretch; width: 100%; flex-direction: row; justify-content: space-between; }
          .jb-claim-btn { flex: 1; }
          .jb-select { flex: 1; min-width: 130px; }
        }
      `}</style>

      {/* Header */}
      <div className="fu" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'inherit', fontSize: 24, fontWeight: 700, color: '#0A1F4D', margin: 0 }}>Job Board</h1>
        <p style={{ color: '#667697', fontSize: 13, margin: '4px 0 0' }}>{totalCount} open projects waiting to be claimed</p>
      </div>

      {/* Filters */}
      <div className="fu jb-filters" style={{ marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} strokeWidth={2} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#667697' }} />
          <input
            className="jb-search-input"
            value={search}
            onChange={e => resetFilters(() => setSearch(e.target.value))}
            placeholder="Search open projects..."
            style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1.5px solid #DCE3F0', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
        <select className="jb-select" value={software} onChange={e => resetFilters(() => setSoftware(e.target.value))} style={{ padding: '10px 14px', border: '1.5px solid #DCE3F0', borderRadius: 10, fontSize: 13, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
          <option value="">All Software</option>
          {SOFTWARE_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>
        <select className="jb-select" value={delivery} onChange={e => resetFilters(() => setDelivery(e.target.value))} style={{ padding: '10px 14px', border: '1.5px solid #DCE3F0', borderRadius: 10, fontSize: 13, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
          <option value="">All Delivery Types</option>
          {DELIVERY_OPTIONS.filter(Boolean).map(d => <option key={d} value={d}>{DELIVERY_CFG[d]?.label || d}</option>)}
        </select>
      </div>

      {/* Sort row */}
      <div className="fu" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <ArrowUpDown size={14} style={{ color: '#667697', flexShrink: 0 }} />
        <select
          className="jb-select"
          value={ordering}
          onChange={e => resetFilters(() => setOrdering(e.target.value))}
          style={{ padding: '7px 12px', border: '1.5px solid #DCE3F0', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', outline: 'none', color: '#3A4A70' }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {isFetching && !isLoading && <Loader2 size={13} className="spin" style={{ color: '#C3CEE2' }} />}
      </div>

      {/* Jobs */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 64, gap: 12 }}>
          <Loader2 size={30} className="spin" style={{ color: '#0D52CE' }} />
          <p style={{ color: '#667697', fontSize: 13 }}>Loading open projects...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="fu" style={{ background: '#fff', borderRadius: 16, border: '1px solid #EBEFF8', padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 12, background: '#EBEFF8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#667697' }}>
            <Inbox size={30} strokeWidth={1.8} />
          </div>
          <p style={{ fontFamily: 'inherit', fontSize: 18, fontWeight: 700, color: '#0A1F4D', margin: '0 0 8px' }}>
            {search || software || delivery ? 'No matching projects' : 'No open projects right now'}
          </p>
          <p style={{ fontSize: 13, color: '#667697', margin: 0 }}>
            {search || software || delivery ? 'Try a different filter.' : 'Check back soon — new projects appear here as clients submit them.'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {jobs.map((p, i) => {
              const dcfg = DELIVERY_CFG[p.delivery_type] || DELIVERY_CFG.standard
              return (
                <div key={p.id} className="fu jb-card"
                  style={{ background: '#fff', borderRadius: 12, border: '1px solid #EBEFF8', padding: '20px 24px', animationDelay: `${i * 0.04}s` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(10,31,107,.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(10,31,107,.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
                >
                  <div className="jb-cardbody">
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 16, color: '#0A1F4D' }}>{p.title}</span>
                        {p.is_nda && (
                          <span className="jb-nda-tip">
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, background: '#EEF2FB', color: '#2E4DA7', padding: '2px 8px', borderRadius: 999, fontWeight: 700, cursor: 'help' }}>
                              <Lock size={11} strokeWidth={2.4} /> NDA
                              <Info size={11} strokeWidth={2.4} />
                            </span>
                            <span className="jb-tip-bubble">Confidentiality agreement required to view full details</span>
                          </span>
                        )}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, background: dcfg.bg, color: dcfg.color, padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                          {p.delivery_type !== 'standard' && <Zap size={11} strokeWidth={2.6} />}
                          {dcfg.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#4E5E82', lineHeight: 1.6, margin: '0 0 12px', maxWidth: 640 }}>
                        {p.description?.length > 160 ? p.description.slice(0, 160) + '…' : p.description}
                      </p>
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, background: '#EAF1FD', color: '#0D52CE', padding: '3px 10px', borderRadius: 999, fontWeight: 700 }}>{p.software?.toUpperCase()}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#667697' }}>
                          <Clock3 size={12} strokeWidth={2.2} /> Deadline {formatDistanceToNow(new Date(p.deadline), { addSuffix: true })}
                        </span>
                        {p.include_explanation && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2E4DA7', fontWeight: 600 }}>
                            <CheckCircle2 size={12} strokeWidth={2.4} /> Explanation required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="jb-priceblock">
                      <p style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 20, color: '#137A4E', margin: 0 }}>{formatTSH(p.client_price)}</p>
                      <button
                        className="jb-claim-btn"
                        onClick={() => setConfirmProject(p)}
                        style={{ background: '#0D52CE', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Claim Project
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {(hasNext || hasPrev) && (
            <div className="fu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
              <button
                className="jb-page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!hasPrev || isFetching}
                style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #DCE3F0', background: '#fff', color: '#3A4A70', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Previous
              </button>
              <span style={{ fontSize: 13, color: '#667697', fontWeight: 600 }}>Page {page}</span>
              <button
                className="jb-page-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={!hasNext || isFetching}
                style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #DCE3F0', background: '#fff', color: '#3A4A70', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Next <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Claim confirmation modal */}
      {confirmProject && (
        <div className="jb-modal-overlay" onClick={() => !claimMutation.isPending && setConfirmProject(null)}>
          <div className="jb-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <p style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 16, color: '#0A1F4D', margin: 0 }}>Claim this project?</p>
              <button onClick={() => setConfirmProject(null)} disabled={claimMutation.isPending}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667697', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: 14, color: '#4E5E82', lineHeight: 1.6, margin: '0 0 16px' }}>
              You're about to claim <strong style={{ color: '#0A1F4D' }}>{confirmProject.title}</strong> for{' '}
              <strong style={{ color: '#137A4E' }}>{formatTSH(confirmProject.client_price)}</strong>. Once claimed, it's locked to you and removed from the job board for other experts.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => claimMutation.mutate(confirmProject.id)}
                disabled={claimMutation.isPending}
                style={{ padding: '10px 20px', borderRadius: 10, background: '#0D52CE', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {claimMutation.isPending ? <><Loader2 size={14} className="spin" /> Claiming…</> : 'Yes, Claim It'}
              </button>
              <button
                onClick={() => setConfirmProject(null)}
                disabled={claimMutation.isPending}
                style={{ padding: '10px 18px', borderRadius: 10, background: '#EBEFF8', color: '#4E5E82', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
