import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi, paymentApi } from '@/api/client'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format, formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import {
  ArrowLeft,
  Lock,
  Check,
  CreditCard,
  Undo2,
  CheckCircle2,
  PartyPopper,
  BookOpen,
  FolderOpen,
  Download,
  Star,
} from 'lucide-react'

const formatTSH = (value: number | string | undefined | null) => {
  const n = Number(value || 0)
  return `TSH ${n.toLocaleString('en-US')}`
}

const STATUS_CFG: Record<string, {label:string;color:string;bg:string;dot:string}> = {
  received:    {label:'Received',      color:'#4E5E82', bg:'#F5F7FC', dot:'#667697'},
  assigned:    {label:'Assigned',      color:'#0D52CE', bg:'#EAF1FD', dot:'#3F7BE0'},
  in_progress: {label:'In Progress',   color:'#B85F00', bg:'#FFF8E6', dot:'#E5A00D'},
  qc:          {label:'Quality Check', color:'#2E4DA7', bg:'#EEF2FB', dot:'#3F5FB8'},
  completed:   {label:'Completed',     color:'#137A4E', bg:'#EDF8F1', dot:'#1B9B63'},
  revision:    {label:'Revision',      color:'#B92D2D', bg:'#FDEDED', dot:'#D03A3A'},
  cancelled:   {label:'Cancelled',     color:'#4E5E82', bg:'#F5F7FC', dot:'#667697'},
}

const STAGES = ['received','assigned','in_progress','qc','completed']
const STAGE_LABELS = ['Received','Assigned','In Progress','QC','Completed']

export default function ClientProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [showPay, setShowPay] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)

  const { data: project, isLoading } = useQuery({
    queryKey: ['client-project', id],
    queryFn: () => projectApi.detail(Number(id)).then(r => r.data),
    refetchInterval: 20000,
  })

  const { register, handleSubmit, reset } = useForm<{ comment: string }>()

  const payMutation = useMutation({
    mutationFn: (type: 'full' | 'partial') =>
      paymentApi.pay(Number(id), { method: 'wallet', type, coupon }),
    onSuccess: () => {
      toast.success('Payment successful!')
      setShowPay(false)
      qc.invalidateQueries({ queryKey: ['client-project', id] })
      qc.invalidateQueries({ queryKey: ['wallet'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Payment failed. Please top up your wallet.'),
  })

  const reviewMutation = useMutation({
    mutationFn: (data: { rating: number; comment: string }) =>
      projectApi.submitReview(Number(id), data),
    onSuccess: () => {
      toast.success('Review submitted! Thank you.')
      reset()
      qc.invalidateQueries({ queryKey: ['client-project', id] })
    },
    onError: () => toast.error('Review submission failed.'),
  })

  if (isLoading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, gap:12 }}>
      <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid #DCE3F0', borderTop:'3px solid #0D52CE', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!project) return (
    <div style={{ background:'#fff', borderRadius:12, padding:32, textAlign:'center' }}>
      <p style={{ color:'#667697' }}>Project not found.</p>
      <Link to="/client/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color:'#0D52CE', fontWeight:600 }}>
        <ArrowLeft size={14} strokeWidth={2.2} /> Back to projects
      </Link>
    </div>
  )

  const cfg = STATUS_CFG[project.status] || STATUS_CFG.received
  const curStage = STAGES.indexOf(project.status)
  const latest = project.progress_updates?.[0]
  const files = project.files || []
  const deliverableFiles = files.filter((f: any) => ['expert_final','admin_delivery','explanation'].includes(f.file_type))
  const clientFiles = files.filter((f: any) => f.file_type === 'client_upload')
  const needsPay = project.client_price && !project.is_fully_paid && !['completed','cancelled'].includes(project.status)

  return (
    <div style={{ fontFamily: 'inherit', maxWidth:860, margin:'0 auto' }}>
      <style>{`
        
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(0)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .5s ease both}
        .cpd-btn { transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease; }
        .cpd-btn:hover { transform: scale(1); opacity: 0.92; }
        .cpd-btn:active { transform: scale(0.97); }
        .cpd-card-anim { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .cpd-card-anim:hover { transform: translateY(0); box-shadow: 0 10px 24px rgba(10,31,77,.06); }
        .cpd-file-row { transition: background 0.15s ease, transform 0.15s ease; }
        .cpd-file-row:hover { background: #EBEFF8; transform: translateX(2px); }
        .cpd-star { transition: color 0.15s ease, transform 0.15s ease; }
        .cpd-pay-panel { animation: fadeUp .3s ease both; }
        .cpd-back-link { transition: color 0.15s ease, gap 0.15s ease; }
        .cpd-back-link:hover { color: #0D52CE; }
      `}</style>

      {/* Back */}
      <Link to="/client/projects" className="cpd-back-link" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#4E5E82', fontSize:13, textDecoration:'none', marginBottom:20 }}>
        <ArrowLeft size={14} strokeWidth={2.2} /> Back to projects
      </Link>

      {/* Header card */}
      <div className="fu cpd-card-anim" style={{ background:'#fff', borderRadius:16, border:'1px solid #EBEFF8', padding:'28px 28px', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:20 }}>
          <div>
            <h1 style={{ fontFamily: 'inherit', fontSize:24, fontWeight:700, color:'#0A1F4D', margin:'0 0 8px' }}>{project.title}</h1>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:12, background:'#EAF1FD', color:'#0D52CE', padding:'3px 10px', borderRadius:999, fontWeight:700 }}>{project.software?.toUpperCase()}</span>
              {project.software_version && <span style={{ fontSize:12, color:'#667697' }}>v{project.software_version}</span>}
              <span style={{ fontSize:12, color:'#667697' }}>· Submitted {formatDistanceToNow(new Date(project.created_at), {addSuffix:true})}</span>
              {project.is_nda && (
                <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, background:'#EEF2FB', color:'#2E4DA7', padding:'2px 8px', borderRadius:999, fontWeight:700 }}>
                  <Lock size={11} strokeWidth={2.4} /> NDA
                </span>
              )}
            </div>
          </div>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:700, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.dot}25`, flexShrink:0 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:cfg.dot }} />{cfg.label}
          </span>
        </div>

        {/* Key info grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'Deadline', value: format(new Date(project.deadline), 'MMM d, yyyy · HH:mm') },
            { label:'Delivery', value: project.delivery_type === 'express' ? 'Express 6-12h' : project.delivery_type === 'urgent' ? 'Urgent 24h' : 'Standard' },
            { label:'Price', value: project.client_price ? formatTSH(project.client_price) : 'Pending review', highlight: !!project.client_price },
            { label:'Payment', value: project.is_fully_paid ? 'Fully paid' : project.advance_paid !== '0.00' ? `Advance: ${formatTSH(project.advance_paid)}` : 'Not paid yet', warn: needsPay, done: project.is_fully_paid },
          ].map(({ label, value, highlight, warn, done }) => (
            <div key={label} style={{ background:'#F5F7FC', borderRadius:12, padding:'12px 14px' }}>
              <p style={{ fontSize:12, color:'#667697', margin:'0 0 4px', fontWeight:600,}}>{label}</p>
              <p style={{ fontSize:13, color: highlight ? '#137A4E' : warn ? '#B85F00' : '#0A1F4D', fontWeight:700, margin:0, fontFamily: 'inherit', display:'flex', alignItems:'center', gap:4 }}>
                {done && <CheckCircle2 size={13} strokeWidth={2.4} color="#137A4E" />}
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ background:'#F5F7FC', borderRadius:12, padding:'14px 16px' }}>
          <p style={{ fontSize:12, color:'#667697', margin:'0 0 6px', fontWeight:600,}}>Description</p>
          <p style={{ fontSize:13, color:'#2B3A60', lineHeight:1.65, margin:0 }}>{project.description}</p>
        </div>
      </div>

      {/* PAYMENT REQUIRED */}
      {needsPay && (
        <div className="fu" style={{ background:'#0D52CE', borderRadius:16, padding:'24px 28px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <p style={{ display:'flex', alignItems:'center', gap:8, fontFamily: 'inherit', fontWeight:700, fontSize:16, color:'#fff', margin:'0 0 4px' }}>
                <CreditCard size={18} strokeWidth={2.2} /> Payment Required to Start
              </p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.75)', margin:0 }}>
                Project price: <strong style={{ color:'#fff' }}>{formatTSH(project.client_price)}</strong>
                {project.advance_paid !== '0.00' && ` · Advance paid: ${formatTSH(project.advance_paid)}`}
              </p>
            </div>
            <button className="cpd-btn" onClick={() => setShowPay(!showPay)} style={{ background:'#fff', color:'#0D52CE', fontFamily: 'inherit', fontWeight:700, fontSize:14, padding:'11px 22px', borderRadius:12, border:'none', cursor:'pointer' }}>
              {showPay ? 'Hide' : 'Pay Now →'}
            </button>
          </div>
          {showPay && (
            <div className="cpd-pay-panel" style={{ marginTop:20, padding:'20px', background:'rgba(255,255,255,.1)', borderRadius:12, backdropFilter:'blur(8px)' }}>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,.7)', fontWeight:600, marginBottom:6 }}>Coupon Code (optional)</label>
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter coupon code" style={{ padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.1)', color:'#fff', fontSize:13, width:'100%', outline:'none', boxSizing:'border-box', transition:'border-color .15s ease' }} />
              </div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <button className="cpd-btn" onClick={() => payMutation.mutate('full')} disabled={payMutation.isPending} style={{ background:'#fff', color:'#0D52CE', fontFamily: 'inherit', fontWeight:700, fontSize:13, padding:'11px 20px', borderRadius:10, border:'none', cursor:'pointer', flex:1 }}>
                  {payMutation.isPending ? 'Processing...' : `Pay Full — ${formatTSH(project.client_price)}`}
                </button>
                <button className="cpd-btn" onClick={() => payMutation.mutate('partial')} disabled={payMutation.isPending} style={{ background:'rgba(255,255,255,.15)', color:'#fff', fontFamily: 'inherit', fontWeight:700, fontSize:13, padding:'11px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,.3)', cursor:'pointer', flex:1 }}>
                  50% Advance — {formatTSH((parseFloat(project.client_price)/2).toFixed(2))}
                </button>
              </div>
              <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginTop:10, textAlign:'center' }}>Payment deducted from your wallet balance.</p>
            </div>
          )}
        </div>
      )}

      {/* STAGE TRACKER */}
      <div className="fu cpd-card-anim" style={{ background:'#fff', borderRadius:16, border:'1px solid #EBEFF8', padding:'24px 28px', marginBottom:16 }}>
        <p style={{ fontFamily: 'inherit', fontWeight:700, fontSize:16, color:'#0A1F4D', margin:'0 0 20px' }}>Project Progress</p>
        <div style={{ display:'flex', alignItems:'flex-start', overflowX:'auto', paddingBottom:8 }}>
          {STAGES.map((s, i) => {
            const done   = i < curStage || project.status === 'completed'
            const active = i === curStage && project.status !== 'revision'
            return (
              <div key={s} style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, fontFamily: 'inherit', transition:'all .4s',
                    background: done ? '#1B9B63' : active ? '#0D52CE' : '#EBEFF8',
                    color: done||active ? '#fff' : '#667697',
                    boxShadow: active ? '0 0 0 4px rgba(13,82,206,.2)' : 'none',
                  }}>
                    {done ? <Check size={16} strokeWidth={3} /> : i+1}
                  </div>
                  <span style={{ fontSize:12, marginTop:6, whiteSpace:'nowrap', fontWeight: active ? 700 : 400, color: done ? '#1B9B63' : active ? '#0D52CE' : '#667697' }}>{STAGE_LABELS[i]}</span>
                </div>
                {i < STAGES.length-1 && (
                  <div style={{ width:48, height:2, margin:'0 6px', marginBottom:22, flexShrink:0, transition:'background .5s', background: i < curStage ? '#1B9B63' : '#DCE3F0' }} />
                )}
              </div>
            )
          })}
          {project.status === 'revision' && (
            <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:12, padding:'4px 12px', background:'#FDEDED', border:'1px solid #F3C7C7', borderRadius:999, marginBottom:22 }}>
              <Undo2 size={13} strokeWidth={2.4} color="#B92D2D" />
              <span style={{ fontSize:12, color:'#B92D2D', fontWeight:700 }}>Revision in Progress</span>
            </div>
          )}
        </div>

        {/* Revision reason */}
        {project.status === 'revision' && project.rejection_reason && (
          <div style={{ marginTop:16, padding:'14px 16px', background:'#FDEDED', border:'1px solid #F3C7C7', borderRadius:12, fontSize:13, color:'#B92D2D', lineHeight:1.5 }}>
            <strong>Revision reason:</strong> {project.rejection_reason}
          </div>
        )}

        {/* Expert progress bar */}
        {latest && (
          <div style={{ marginTop:20, padding:'16px', background:'#F5F7FC', borderRadius:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:13, fontWeight:600, color:'#2B3A60' }}>Expert Progress</span>
              <span style={{ fontSize:13, fontWeight:700, color: latest.percentage>=80?'#1B9B63':'#0D52CE' }}>{latest.percentage}% — {latest.time_remaining} remaining</span>
            </div>
            <div style={{ height:8, background:'#DCE3F0', borderRadius:999, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${latest.percentage}%`, borderRadius:999, background: latest.percentage>=80?'#1B9B63':'#0D52CE', transition:'width .6s ease' }} />
            </div>
            {latest.note && <p style={{ fontSize:12, color:'#4E5E82', margin:'8px 0 0' }}>Note: {latest.note}</p>}
          </div>
        )}
      </div>

      {/* DOWNLOAD SECTION */}
      {project.status === 'completed' && (
        <div className="fu cpd-card-anim" style={{ background:'#EDF8F1', border:'1px solid #BFE5CF', borderRadius:16, padding:'24px 28px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{ width:48, height:48, background:'#1B9B63', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <CheckCircle2 size={24} strokeWidth={2.2} color="#fff" />
            </div>
            <div>
              <p style={{ display:'flex', alignItems:'center', gap:8, fontFamily: 'inherit', fontWeight:700, fontSize:18, color:'#0E5C3A', margin:0 }}>
                Project Completed! <PartyPopper size={18} strokeWidth={2.2} color="#0E5C3A" />
              </p>
              <p style={{ fontSize:13, color:'#137A4E', margin:'2px 0 0' }}>Your simulation results are ready for download.</p>
            </div>
          </div>
          {deliverableFiles.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {deliverableFiles.map((f: any) => (
                <div key={f.id} className="cpd-file-row" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', borderRadius:12, padding:'12px 16px', border:'1px solid #BFE5CF' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    {f.file_type === 'explanation'
                      ? <BookOpen size={16} strokeWidth={2} color="#1B9B63" />
                      : <FolderOpen size={16} strokeWidth={2} color="#1B9B63" />}
                    <div>
                      <p style={{ fontFamily: 'inherit', fontWeight:700, fontSize:14, color:'#0A1F4D', margin:0 }}>{f.original_name}</p>
                      <p style={{ fontSize:12, color:'#667697', margin:'2px 0 0' }}>{f.file_type === 'explanation' ? 'Explanation file' : 'Simulation result'} · {Math.round(f.file_size/1024)}KB</p>
                    </div>
                  </div>
                  <a href={f.file} download className="cpd-btn" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#1B9B63', color:'#fff', fontFamily: 'inherit', fontWeight:700, fontSize:13, padding:'9px 18px', borderRadius:10, textDecoration:'none' }}>
                    <Download size={14} strokeWidth={2.2} /> Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize:13, color:'#137A4E', margin:0 }}>Files will appear here shortly.</p>
          )}
        </div>
      )}

      {/* RATING */}
      {project.status === 'completed' && !project.review && (
        <div className="fu cpd-card-anim" style={{ background:'#fff', borderRadius:16, border:'1px solid #EBEFF8', padding:'24px 28px', marginBottom:16 }}>
          <p style={{ display:'flex', alignItems:'center', gap:8, fontFamily: 'inherit', fontWeight:700, fontSize:16, color:'#0A1F4D', margin:'0 0 16px' }}>
            <Star size={17} strokeWidth={2.2} color="#E5A00D" /> Rate Your Expert
          </p>
          <div style={{ display:'flex', gap:6, marginBottom:16, alignItems:'center' }}>
            {[1,2,3,4,5].map(star => (
              <button key={star} type="button" className="cpd-star"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', transform: star <= (hoveredStar||rating) ? 'scale(1.15)' : 'scale(1)' }}>
                <Star size={30} strokeWidth={1.8} fill={star <= (hoveredStar||rating) ? '#E5A00D' : 'none'} color={star <= (hoveredStar||rating) ? '#E5A00D' : '#DCE3F0'} />
              </button>
            ))}
            {rating > 0 && <span style={{ alignSelf:'center', fontSize:13, color:'#667697', marginLeft:8 }}>{['','Poor','Fair','Good','Very Good','Excellent'][rating]}</span>}
          </div>
          <form onSubmit={handleSubmit(d => { if (!rating) { toast.error('Please select a rating'); return } reviewMutation.mutate({ rating, comment: d.comment }) })}>
            <textarea {...register('comment')} rows={3} placeholder="Share your experience with this expert (optional)..." style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #DCE3F0', borderRadius:12, fontSize:13, fontFamily: 'inherit', outline:'none', resize:'vertical', marginBottom:12, boxSizing:'border-box', transition:'border-color .15s ease' }} />
            <button type="submit" className="cpd-btn" disabled={reviewMutation.isPending || rating === 0} style={{ background: rating===0?'#DCE3F0':'#0D52CE', color: rating===0?'#667697':'#fff', fontFamily: 'inherit', fontWeight:700, fontSize:14, padding:'11px 24px', borderRadius:12, border:'none', cursor: rating===0?'not-allowed':'pointer' }}>
              {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Existing review */}
      {project.review && (
        <div className="fu cpd-card-anim" style={{ background:'#fff', borderRadius:16, border:'1px solid #EBEFF8', padding:'24px 28px', marginBottom:16 }}>
          <p style={{ fontFamily: 'inherit', fontWeight:700, fontSize:16, color:'#0A1F4D', margin:'0 0 12px' }}>Your Review</p>
          <div style={{ display:'flex', gap:3, marginBottom:8 }}>
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={20} strokeWidth={1.8} fill={s <= project.review.rating ? '#E5A00D' : 'none'} color={s <= project.review.rating ? '#E5A00D' : '#DCE3F0'} />
            ))}
          </div>
          {project.review.comment && <p style={{ fontSize:14, color:'#2B3A60', margin:0, lineHeight:1.6 }}>{project.review.comment}</p>}
        </div>
      )}

      {/* Progress history */}
      {project.progress_updates?.length > 0 && (
        <div className="fu cpd-card-anim" style={{ background:'#fff', borderRadius:16, border:'1px solid #EBEFF8', padding:'24px 28px', marginBottom:16 }}>
          <p style={{ fontFamily: 'inherit', fontWeight:700, fontSize:16, color:'#0A1F4D', margin:'0 0 16px' }}>Progress Updates</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {project.progress_updates.map((u: any, i: number) => (
              <div key={u.id} className="cpd-file-row" style={{ display:'flex', gap:14, padding:'12px 16px', background: i===0?'#EAF1FD':'#F5F7FC', borderRadius:12, border: i===0?'1px solid #C4DBF1':'1px solid #EBEFF8' }}>
                <div style={{ width:44, height:44, borderRadius:12, background: i===0?'#0D52CE':'#DCE3F0', display:'flex', alignItems:'center', justifyContent:'center', fontFamily: 'inherit', fontWeight:700, fontSize:13, color: i===0?'#fff':'#4E5E82', flexShrink:0 }}>
                  {u.percentage}%
                </div>
                <div>
                  <p style={{ fontFamily: 'inherit', fontWeight:700, fontSize:13, color:'#0A1F4D', margin:'0 0 2px' }}>{u.time_remaining} remaining</p>
                  {u.note && <p style={{ fontSize:12, color:'#4E5E82', margin:'0 0 3px' }}>{u.note}</p>}
                  <p style={{ fontSize:12, color:'#667697', margin:0 }}>{format(new Date(u.created_at), 'MMM d · HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client uploaded files */}
      {clientFiles.length > 0 && (
        <div className="fu cpd-card-anim" style={{ background:'#fff', borderRadius:16, border:'1px solid #EBEFF8', padding:'24px 28px' }}>
          <p style={{ fontFamily: 'inherit', fontWeight:700, fontSize:16, color:'#0A1F4D', margin:'0 0 12px' }}>Your Uploaded Files</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {clientFiles.map((f: any) => (
              <div key={f.id} className="cpd-file-row" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'#F5F7FC', borderRadius:10, border:'1px solid #EBEFF8' }}>
                <div>
                  <p style={{ fontFamily: 'inherit', fontWeight:600, fontSize:13, color:'#0A1F4D', margin:0 }}>{f.original_name}</p>
                  <p style={{ fontSize:12, color:'#667697', margin:'2px 0 0' }}>{Math.round(f.file_size/1024)}KB</p>
                </div>
                <a href={f.file} download style={{ color:'#0D52CE', fontSize:12, fontWeight:600, textDecoration:'none' }}>Download</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}