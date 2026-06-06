import { useQuery } from '@tanstack/react-query'
import { paymentApi } from '@/api/client'
import { formatDistanceToNow, format } from 'date-fns'

export default function ClientWallet() {
  const { data, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => paymentApi.wallet().then(r => r.data),
    refetchInterval: 30000,
  })

  const wallet = data?.wallet
  const transactions: any[] = data?.transactions || []
  const totalCredit = transactions.filter(t => t.type==='credit').reduce((s,t) => s+parseFloat(t.amount), 0)
  const totalDebit  = transactions.filter(t => t.type==='debit' ).reduce((s,t) => s+parseFloat(t.amount), 0)

  if (isLoading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, gap:12 }}>
      <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #E2E8F0', borderTop:'3px solid #0EA5E9', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", maxWidth:680, margin:'0 auto' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fadeUp .5s ease both}`}</style>

      <div className="fu" style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'#0F172A', margin:0 }}>My Wallet</h1>
        <p style={{ color:'#94A3B8', fontSize:13, margin:'4px 0 0' }}>Manage your balance and view transaction history.</p>
      </div>

      {/* Balance hero card */}
      <div className="fu" style={{ background:'linear-gradient(135deg,#0B1C3D,#1A3A7A)', borderRadius:24, padding:'32px 28px', marginBottom:16, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,.04)' }} />
        <div style={{ position:'absolute', bottom:-60, left:-20, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,.03)' }} />
        <div style={{ position:'relative' }}>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', margin:'0 0 8px' }}>Available Balance</p>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:44, color:'#fff', margin:'0 0 20px', lineHeight:1 }}>
            ${wallet?.balance || '0.00'}
            <span style={{ fontSize:14, color:'rgba(255,255,255,.4)', marginLeft:8, fontWeight:500 }}>{wallet?.currency || 'USD'}</span>
          </p>
          <div style={{ display:'flex', gap:20 }}>
            <div>
              <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'.06em' }}>Total Credited</p>
              <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#4ADE80', margin:0 }}>+${totalCredit.toFixed(2)}</p>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,.1)' }} />
            <div>
              <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'.06em' }}>Total Spent</p>
              <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#F87171', margin:0 }}>-${totalDebit.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top up info */}
      <div className="fu" style={{ background:'#F0F9FF', border:'1px solid #BAE6FD', borderRadius:16, padding:'16px 20px', marginBottom:20 }}>
        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
          <span style={{ fontSize:20 }}>💡</span>
          <div>
            <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'#0369A1', margin:'0 0 4px' }}>How to Top Up Your Wallet</p>
            <p style={{ fontSize:13, color:'#0284C7', margin:'0 0 8px', lineHeight:1.6 }}>
              Contact our team to add funds to your wallet. We accept bank transfers, mobile money (M-Pesa, Airtel Money), and other payment methods.
            </p>
            <a href="mailto:support@simunexus.com" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#0EA5E9', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:12, padding:'8px 16px', borderRadius:8, textDecoration:'none' }}>
              Contact Support →
            </a>
          </div>
        </div>
      </div>

      {/* Payment tips */}
      <div className="fu" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
        {[
          { icon:'💳', title:'Pay 50% Advance', desc:'Start your project with just 50% upfront. Pay the rest on delivery.' },
          { icon:'💰', title:'Full Payment Discount', desc:'Pay in full upfront and get the best pricing from our experts.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ background:'#fff', borderRadius:16, padding:'16px', border:'1px solid #F1F5F9' }}>
            <span style={{ fontSize:22 }}>{icon}</span>
            <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#0F172A', margin:'8px 0 4px' }}>{title}</p>
            <p style={{ fontSize:12, color:'#94A3B8', margin:0, lineHeight:1.5 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="fu" style={{ background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', overflow:'hidden' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid #F8FAFC', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#0F172A', margin:0 }}>Transaction History</h2>
          <span style={{ fontSize:12, color:'#94A3B8' }}>{transactions.length} transactions</span>
        </div>
        {transactions.length === 0 ? (
          <div style={{ textAlign:'center', padding:'52px 24px' }}>
            <div style={{ fontSize:44, marginBottom:12 }}>💰</div>
            <p style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#0F172A', margin:'0 0 6px' }}>No transactions yet</p>
            <p style={{ fontSize:13, color:'#94A3B8', margin:0 }}>Your payment history will appear here.</p>
          </div>
        ) : (
          <div>
            {transactions.map((t: any, i: number) => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 22px', borderBottom: i<transactions.length-1?'1px solid #F8FAFC':'none', transition:'background .15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background='#F8FAFC'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background='transparent'}>
                <div style={{ width:40, height:40, borderRadius:12, background: t.type==='credit'?'#F0FDF4':'#FFF1F2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                  {t.type === 'credit' ? '↑' : '↓'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'#0F172A', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {t.description || (t.type==='credit'?'Wallet credit':'Payment')}
                  </p>
                  <p style={{ fontSize:11, color:'#94A3B8', margin:'2px 0 0' }}>
                    {formatDistanceToNow(new Date(t.created_at), {addSuffix:true})}
                  </p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, color: t.type==='credit'?'#10B981':'#EF4444', margin:0 }}>
                    {t.type==='credit'?'+':'-'}${parseFloat(t.amount).toFixed(2)}
                  </p>
                  <p style={{ fontSize:11, color:'#94A3B8', margin:'2px 0 0' }}>
                    {format(new Date(t.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
