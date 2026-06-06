import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi, paymentApi } from '@/api/client'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format, formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

const STATUS_CFG: Record<string, {label:string;color:string;bg:string;dot:string}> = {
  received:    {label:'Received',      color:'#64748B', bg:'#F8FAFC', dot:'#94A3B8'},
  assigned:    {label:'Assigned',      color:'#2563EB', bg:'#EFF6FF', dot:'#3B82F6'},
  in_progress: {label:'In Progress',   color:'#D97706', bg:'#FFFBEB', dot:'#F59E0B'},
  qc:          {label:'Quality Check', color:'#7C3AED', bg:'#F5F3FF', dot:'#8B5CF6'},
  completed:   {label:'Completed',     color:'#059669', bg:'#F0FDF4', dot:'#10B981'},
  revision:    {label:'Revision',      color:'#E11D48', bg:'#FFF1F2', dot:'#F43F5E'},
  cancelled:   {label:'Cancelled',     color:'#64748B', bg:'#F8FAFC', dot:'#94A3B8'},
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
      toast.success('✅ Payment successful!')
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
      toast.success('⭐ Review submitted! Thank you.')
      reset()
      qc.invalidateQueries({ queryKey: ['client-project', id] })
    },
    onError: () => toast.error('Review submission failed.'),
  })

  if (isLoading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, gap:12 }}>
      <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid #E2E8F0', borderTop:'3px solid #0EA5E9', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!project) return (
    <div style={{ background:'#fff', borderRadius:16, padding:32, textAlign:'center' }}>
      <p style={{ color:'#94A3B8' }}>Project not found.</p>
      <Link to="/client/projects" style={{ color:'#0EA5E9', fontWeight:600 }}>← Back to projects</Link>
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
    <div style={{ fontFamily:"'DM Sans',sans-serif", maxWidth:860, margin:'0 auto' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); @keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fadeUp .5s ease both}`}</style>

      {/* Back */}
      <Link to="/client/projects" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#64748B', fontSize:13, textDecoration:'none', marginBottom:20 }}>
        ← Back to projects
      </Link>

      {/* Header card */}
      <div className="fu" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', padding:'28px 28px', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:20 }}>
          <div>
            <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'#0F172A', margin:'0 0 8px' }}>{project.title}</h1>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:12, background:'#EFF6FF', color:'#2563EB', padding:'3px 10px', borderRadius:999, fontWeight:700 }}>{project.software?.toUpperCase()}</span>
              {project.software_version && <span style={{ fontSize:12, color:'#94A3B8' }}>v{project.software_version}</span>}
              <span style={{ fontSize:12, color:'#94A3B8' }}>· Submitted {formatDistanceToNow(new Date(project.created_at), {addSuffix:true})}</span>
              {project.is_nda && <span style={{ fontSize:11, background:'#F5F3FF', color:'#7C3AED', padding:'2px 8px', borderRadius:999, fontWeight:700 }}>🔒 NDA</span>}
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
            { label:'Price', value: project.client_price ? `$${project.client_price}` : 'Pending review', highlight: !!project.client_price },
            { label:'Payment', value: project.is_fully_paid ? 'Fully paid ✅' : project.advance_paid !== '0.00' ? `Advance paid: $${project.advance_paid}` : 'Not paid yet', warn: needsPay },
          ].map(({ label, value, highlight, warn }) => (
            <div key={label} style={{ background:'#F8FAFC', borderRadius:12, padding:'12px 14px' }}>
              <p style={{ fontSize:11, color:'#94A3B8', margin:'0 0 4px', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{label}</p>
              <p style={{ fontSize:13, color: highlight ? '#059669' : warn ? '#D97706' : '#0F172A', fontWeight:700, margin:0, fontFamily:'Syne,sans-serif' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ background:'#F8FAFC', borderRadius:12, padding:'14px 16px' }}>
          <p style={{ fontSize:11, color:'#94A3B8', margin:'0 0 6px', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>Description</p>
          <p style={{ fontSize:13, color:'#374151', lineHeight:1.65, margin:0 }}>{project.description}</p>
        </div>
      </div>

      {/* PAYMENT REQUIRED */}
      {needsPay && (
        <div className="fu" style={{ background:'linear-gradient(135deg,#0EA5E9,#0284C7)', borderRadius:20, padding:'24px 28px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <p style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17, color:'#fff', margin:'0 0 4px' }}>💳 Payment Required to Start</p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.75)', margin:0 }}>
                Project price: <strong style={{ color:'#fff' }}>${project.client_price}</strong>
                {project.advance_paid !== '0.00' && ` · Advance paid: $${project.advance_paid}`}
              </p>
            </div>
            <button onClick={() => setShowPay(!showPay)} style={{ background:'#fff', color:'#0EA5E9', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, padding:'11px 22px', borderRadius:12, border:'none', cursor:'pointer' }}>
              {showPay ? 'Hide' : 'Pay Now →'}
            </button>
          </div>
          {showPay && (
            <div style={{ marginTop:20, padding:'20px', background:'rgba(255,255,255,.1)', borderRadius:14, backdropFilter:'blur(8px)' }}>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,.7)', fontWeight:600, marginBottom:6 }}>Coupon Code (optional)</label>
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter coupon code" style={{ padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.1)', color:'#fff', fontSize:13, width:'100%', outline:'none' }} />
              </div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <button onClick={() => payMutation.mutate('full')} disabled={payMutation.isPending} style={{ background:'#fff', color:'#0EA5E9', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, padding:'11px 20px', borderRadius:10, border:'none', cursor:'pointer', flex:1 }}>
                  {payMutation.isPending ? 'Processing...' : `Pay Full — $${project.client_price}`}
                </button>
                <button onClick={() => payMutation.mutate('partial')} disabled={payMutation.isPending} style={{ background:'rgba(255,255,255,.15)', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, padding:'11px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,.3)', cursor:'pointer', flex:1 }}>
                  50% Advance — ${(parseFloat(project.client_price)/2).toFixed(2)}
                </button>
              </div>
              <p style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginTop:10, textAlign:'center' }}>Payment deducted from your wallet balance.</p>
            </div>
          )}
        </div>
      )}

      {/* STAGE TRACKER */}
      <div className="fu" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', padding:'24px 28px', marginBottom:16 }}>
        <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#0F172A', margin:'0 0 20px' }}>Project Progress</p>
        <div style={{ display:'flex', alignItems:'flex-start', overflowX:'auto', paddingBottom:8 }}>
          {STAGES.map((s, i) => {
            const done   = i < curStage || project.status === 'completed'
            const active = i === curStage && project.status !== 'revision'
            return (
              <div key={s} style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, fontFamily:'Syne,sans-serif', transition:'all .4s',
                    background: done ? '#10B981' : active ? '#0EA5E9' : '#F1F5F9',
                    color: done||active ? '#fff' : '#94A3B8',
                    boxShadow: active ? '0 0 0 4px rgba(14,165,233,.2)' : 'none',
                  }}>
                    {done ? '✓' : i+1}
                  </div>
                  <span style={{ fontSize:11, marginTop:6, whiteSpace:'nowrap', fontWeight: active ? 700 : 400, color: done ? '#10B981' : active ? '#0EA5E9' : '#94A3B8' }}>{STAGE_LABELS[i]}</span>
                </div>
                {i < STAGES.length-1 && (
                  <div style={{ width:48, height:2, margin:'0 6px', marginBottom:22, flexShrink:0, transition:'background .5s', background: i < curStage ? '#10B981' : '#E2E8F0' }} />
                )}
              </div>
            )
          })}
          {project.status === 'revision' && (
            <div style={{ display:'flex', alignItems:'center', marginLeft:12, padding:'4px 12px', background:'#FFF1F2', border:'1px solid #FECDD3', borderRadius:999, marginBottom:22 }}>
              <span style={{ fontSize:12, color:'#E11D48', fontWeight:700 }}>↩ Revision in Progress</span>
            </div>
          )}
        </div>

        {/* Revision reason */}
        {project.status === 'revision' && project.rejection_reason && (
          <div style={{ marginTop:16, padding:'14px 16px', background:'#FFF1F2', border:'1px solid #FECDD3', borderRadius:12, fontSize:13, color:'#E11D48', lineHeight:1.5 }}>
            <strong>Revision reason:</strong> {project.rejection_reason}
          </div>
        )}

        {/* Expert progress bar */}
        {latest && (
          <div style={{ marginTop:20, padding:'16px', background:'#F8FAFC', borderRadius:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>Expert Progress</span>
              <span style={{ fontSize:13, fontWeight:700, color: latest.percentage>=80?'#10B981':'#0EA5E9' }}>{latest.percentage}% — {latest.time_remaining} remaining</span>
            </div>
            <div style={{ height:8, background:'#E2E8F0', borderRadius:999, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${latest.percentage}%`, borderRadius:999, background: latest.percentage>=80?'linear-gradient(90deg,#10B981,#059669)':'linear-gradient(90deg,#0EA5E9,#0284C7)', transition:'width .6s ease' }} />
            </div>
            {latest.note && <p style={{ fontSize:12, color:'#64748B', margin:'8px 0 0' }}>Note: {latest.note}</p>}
          </div>
        )}
      </div>

      {/* DOWNLOAD SECTION */}
      {project.status === 'completed' && (
        <div className="fu" style={{ background:'linear-gradient(135deg,#F0FDF4,#DCFCE7)', border:'1px solid #BBF7D0', borderRadius:20, padding:'24px 28px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{ width:48, height:48, background:'#10B981', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>✅</div>
            <div>
              <p style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:'#065F46', margin:0 }}>Project Completed! 🎉</p>
              <p style={{ fontSize:13, color:'#047857', margin:'2px 0 0' }}>Your simulation results are ready for download.</p>
            </div>
          </div>
          {deliverableFiles.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {deliverableFiles.map((f: any) => (
                <div key={f.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', borderRadius:12, padding:'12px 16px', border:'1px solid #BBF7D0' }}>
                  <div>
                    <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'#0F172A', margin:0 }}>{f.original_name}</p>
                    <p style={{ fontSize:11, color:'#94A3B8', margin:'2px 0 0' }}>{f.file_type === 'explanation' ? '📖 Explanation file' : '📁 Simulation result'} · {Math.round(f.file_size/1024)}KB</p>
                  </div>
                  <a href={f.file} download style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#10B981', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, padding:'9px 18px', borderRadius:10, textDecoration:'none' }}>
                    ⬇ Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize:13, color:'#047857', margin:0 }}>Files will appear here shortly.</p>
          )}
        </div>
      )}

      {/* RATING */}
      {project.status === 'completed' && !project.review && (
        <div className="fu" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', padding:'24px 28px', marginBottom:16 }}>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#0F172A', margin:'0 0 16px' }}>⭐ Rate Your Expert</p>
          <div style={{ display:'flex', gap:6, marginBottom:16 }}>
            {[1,2,3,4,5].map(star => (
              <button key={star} type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                style={{ background:'none', border:'none', cursor:'pointer', fontSize:32, color: star <= (hoveredStar||rating) ? '#F59E0B' : '#E2E8F0', transition:'all .15s', transform: star <= (hoveredStar||rating) ? 'scale(1.1)' : 'scale(1)' }}>
                ★
              </button>
            ))}
            {rating > 0 && <span style={{ alignSelf:'center', fontSize:13, color:'#94A3B8', marginLeft:8 }}>{['','Poor','Fair','Good','Very Good','Excellent'][rating]}</span>}
          </div>
          <form onSubmit={handleSubmit(d => { if (!rating) { toast.error('Please select a rating'); return } reviewMutation.mutate({ rating, comment: d.comment }) })}>
            <textarea {...register('comment')} rows={3} placeholder="Share your experience with this expert (optional)..." style={{ width:'100%', padding:'12px 14px', border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:13, fontFamily:'DM Sans,sans-serif', outline:'none', resize:'vertical', marginBottom:12, boxSizing:'border-box' }} />
            <button type="submit" disabled={reviewMutation.isPending || rating === 0} style={{ background: rating===0?'#E2E8F0':'#0EA5E9', color: rating===0?'#94A3B8':'#fff', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, padding:'11px 24px', borderRadius:12, border:'none', cursor: rating===0?'not-allowed':'pointer' }}>
              {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Existing review */}
      {project.review && (
        <div className="fu" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', padding:'24px 28px', marginBottom:16 }}>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#0F172A', margin:'0 0 12px' }}>Your Review</p>
          <div style={{ display:'flex', gap:3, marginBottom:8 }}>
            {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:20, color: s <= project.review.rating ? '#F59E0B' : '#E2E8F0' }}>★</span>)}
          </div>
          {project.review.comment && <p style={{ fontSize:14, color:'#374151', margin:0, lineHeight:1.6 }}>{project.review.comment}</p>}
        </div>
      )}

      {/* Progress history */}
      {project.progress_updates?.length > 0 && (
        <div className="fu" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', padding:'24px 28px', marginBottom:16 }}>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#0F172A', margin:'0 0 16px' }}>Progress Updates</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {project.progress_updates.map((u: any, i: number) => (
              <div key={u.id} style={{ display:'flex', gap:14, padding:'12px 16px', background: i===0?'#F0F9FF':'#F8FAFC', borderRadius:12, border: i===0?'1px solid #BAE6FD':'1px solid #F1F5F9' }}>
                <div style={{ width:44, height:44, borderRadius:12, background: i===0?'#0EA5E9':'#E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, color: i===0?'#fff':'#64748B', flexShrink:0 }}>
                  {u.percentage}%
                </div>
                <div>
                  <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#0F172A', margin:'0 0 2px' }}>{u.time_remaining} remaining</p>
                  {u.note && <p style={{ fontSize:12, color:'#64748B', margin:'0 0 3px' }}>{u.note}</p>}
                  <p style={{ fontSize:11, color:'#94A3B8', margin:0 }}>{format(new Date(u.created_at), 'MMM d · HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client uploaded files */}
      {clientFiles.length > 0 && (
        <div className="fu" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', padding:'24px 28px' }}>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#0F172A', margin:'0 0 12px' }}>Your Uploaded Files</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {clientFiles.map((f: any) => (
              <div key={f.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'#F8FAFC', borderRadius:10, border:'1px solid #F1F5F9' }}>
                <div>
                  <p style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:13, color:'#0F172A', margin:0 }}>{f.original_name}</p>
                  <p style={{ fontSize:11, color:'#94A3B8', margin:'2px 0 0' }}>{Math.round(f.file_size/1024)}KB</p>
                </div>
                <a href={f.file} download style={{ color:'#0EA5E9', fontSize:12, fontWeight:600, textDecoration:'none' }}>Download</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
