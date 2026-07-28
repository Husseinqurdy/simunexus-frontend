import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentApi } from '@/api/client'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'

/* ---------------------------------- icons ---------------------------------- */

type IconName = 'info' | 'card' | 'cash' | 'arrow-up' | 'arrow-down' | 'wallet' | 'phone' | 'check' | 'alert'

function Icon({ name, size = 18, color = 'currentColor' }: { name: IconName; size?: number; color?: string }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const, stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'info': return <svg {...c}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.8v.2" /></svg>
    case 'card': return <svg {...c}><rect x="3" y="6" width="18" height="13" rx="2.2" /><path d="M3 10.2h18" /></svg>
    case 'cash': return <svg {...c}><rect x="2.5" y="6.5" width="19" height="11" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6 8.5v0M18 15.5v0" /></svg>
    case 'arrow-up': return <svg {...c}><path d="M12 19V6M6 11l6-6 6 6" /></svg>
    case 'arrow-down': return <svg {...c}><path d="M12 5v13M6 13l6 6 6-6" /></svg>
    case 'wallet': return <svg {...c}><path d="M3 7.5A2.5 2.5 0 015.5 5H18a1 1 0 011 1v2.2" /><path d="M3 7.5v10A2.5 2.5 0 005.5 20H19a1 1 0 001-1v-4.2" /><rect x="14.5" y="10" width="6.5" height="5.4" rx="1.4" /><circle cx="17.3" cy="12.7" r=".9" fill={color} /></svg>
    case 'phone': return <svg {...c}><rect x="6.5" y="2.5" width="11" height="19" rx="2.2" /><path d="M10.5 18.5h3" /></svg>
    case 'check': return <svg {...c} strokeWidth={3}><path d="M4.5 12.75l6 6 9-13.5" /></svg>
    case 'alert': return <svg {...c}><path d="M12 3.5 21.5 20h-19L12 3.5Z" /><path d="M12 9.8v4.2M12 17v.2" /></svg>
  }
}

/* --------------------------------- helpers --------------------------------- */

const PROVIDERS: { value: string; label: string }[] = [
  { value: 'Mpesa', label: 'M-Pesa' },
  { value: 'Tigo', label: 'Mixx by Yas (Tigo Pesa)' },
  { value: 'Airtel', label: 'Airtel Money' },
  { value: 'Halopesa', label: 'HaloPesa' },
  { value: 'Azampesa', label: 'AzamPesa' },
]

const fmtTZS = (n: number) => `TSh ${Math.round(n).toLocaleString('en-US')}`

/* ---------------------------------- page ------------------------------------ */

type TopUpState = 'idle' | 'submitting' | 'pending' | 'success' | 'failed' | 'timeout'

export default function ClientWallet() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => paymentApi.wallet().then(r => r.data),
    refetchInterval: 30000,
  })

  const wallet = data?.wallet
  const transactions: any[] = data?.transactions || []
  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + parseFloat(t.amount), 0)
  const totalDebit = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + parseFloat(t.amount), 0)

  // Top-up form state
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [provider, setProvider] = useState('Mpesa')
  const [topUpState, setTopUpState] = useState<TopUpState>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const attemptsRef = useRef(0)

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = null
  }

  useEffect(() => stopPolling, [])

  const startTopUp = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) {
      toast.error('Enter a valid top-up amount.')
      return
    }
    if (phone.replace(/\D/g, '').length < 9) {
      toast.error('Enter a valid phone number.')
      return
    }

    setTopUpState('submitting')
    try {
      const { data: res } = await paymentApi.initiateTopUp(amt, phone, provider)
      setStatusMessage(res.message || 'Check your phone and confirm with your PIN.')
      setTopUpState('pending')
      attemptsRef.current = 0

      pollRef.current = setInterval(async () => {
        attemptsRef.current += 1
        try {
          const { data: statusRes } = await paymentApi.topUpStatus(res.reference)
          if (statusRes.status === 'success') {
            stopPolling()
            setTopUpState('success')
            toast.success('Payment successful! Your wallet has been credited.')
            queryClient.invalidateQueries({ queryKey: ['wallet'] })
          } else if (statusRes.status === 'failed') {
            stopPolling()
            setTopUpState('failed')
            toast.error('Payment failed. Please try again.')
          } else if (attemptsRef.current >= 40) {
            // ~2 minutes at 3s intervals
            stopPolling()
            setTopUpState('timeout')
          }
        } catch {
          // transient network hiccup while polling — keep trying until attempts run out
        }
      }, 3000)
    } catch (err: any) {
      setTopUpState('idle')
      toast.error(err?.response?.data?.error || 'Could not start the payment. Please try again.')
    }
  }

  const resetTopUp = () => {
    stopPolling()
    setTopUpState('idle')
    setAmount('')
    setPhone('')
  }

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E2E8F0', borderTop: '3px solid #0EA5E9', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", maxWidth: 680, margin: '0 auto' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fu{animation:fadeUp .5s cubic-bezier(.22,.61,.36,1) both}
        .tuinput{width:100%;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:10px;padding:11px 14px;font-size:14px;color:#0F172A;font-family:'DM Sans',sans-serif;transition:all .2s;outline:none}
        .tuinput:focus{border-color:#0EA5E9;background:#fff;box-shadow:0 0 0 4px rgba(14,165,233,.08)}
        .tulabel{display:block;font-size:11.5px;font-weight:600;color:#64748B;letter-spacing:.04em;text-transform:uppercase;margin-bottom:6px}
        .tubtn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(120deg,#0EA5E9,#7C3AED);color:#fff;font-family:'Syne',sans-serif;font-weight:700;font-size:14.5px;padding:13px;border-radius:12px;border:none;cursor:pointer;transition:all .2s}
        .tubtn:hover:not(:disabled){box-shadow:0 8px 22px rgba(124,58,237,.3);transform:translateY(-1px)}
        .tubtn:disabled{opacity:.6;cursor:not-allowed}
      `}</style>

      <div className="fu" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>My Wallet</h1>
        <p style={{ color: '#94A3B8', fontSize: 13, margin: '4px 0 0' }}>Manage your balance and view transaction history.</p>
      </div>

      {/* Balance hero card */}
      <div className="fu" style={{ background: 'linear-gradient(135deg,#0B1C3D,#1A3A7A)', borderRadius: 24, padding: '32px 28px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(124,58,237,.10)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(14,165,233,.06)' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>Available Balance</p>
          <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 40, color: '#fff', margin: '0 0 20px', lineHeight: 1 }}>
            {fmtTZS(parseFloat(wallet?.balance || '0'))}
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Total Credited</p>
              <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: '#4ADE80', margin: 0 }}>+{fmtTZS(totalCredit)}</p>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,.1)' }} />
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Total Spent</p>
              <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: '#F87171', margin: 0 }}>-{fmtTZS(totalDebit)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile money top-up */}
      <div className="fu" style={{ background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9', padding: '22px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="phone" size={18} color="#0EA5E9" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15.5, fontWeight: 700, color: '#0F172A', margin: 0 }}>Top Up via Mobile Money</h2>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>Instant — confirm on your phone with your PIN.</p>
          </div>
        </div>

        {topUpState === 'pending' || topUpState === 'submitting' ? (
          <div style={{ textAlign: 'center', padding: '20px 12px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #E2E8F0', borderTop: '3px solid #0EA5E9', margin: '0 auto 16px', animation: 'spin .8s linear infinite' }} />
            <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14.5, color: '#0F172A', margin: '0 0 6px' }}>
              {topUpState === 'submitting' ? 'Sending request...' : 'Check your phone'}
            </p>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>{statusMessage || 'Enter your PIN to confirm payment.'}</p>
          </div>
        ) : topUpState === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="check" size={22} color="#10B981" />
            </div>
            <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14.5, color: '#0F172A', margin: '0 0 14px' }}>Payment successful!</p>
            <button className="tubtn" style={{ maxWidth: 200, margin: '0 auto' }} onClick={resetTopUp}>Top Up Again</button>
          </div>
        ) : topUpState === 'failed' || topUpState === 'timeout' ? (
          <div style={{ textAlign: 'center', padding: '20px 12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="alert" size={20} color="#EF4444" />
            </div>
            <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14.5, color: '#0F172A', margin: '0 0 4px' }}>
              {topUpState === 'timeout' ? 'Still awaiting confirmation' : 'Payment failed'}
            </p>
            <p style={{ fontSize: 12.5, color: '#94A3B8', margin: '0 0 14px' }}>
              {topUpState === 'timeout' ? 'Once you confirm on your phone, your wallet will update shortly.' : 'Please try again or use a different number.'}
            </p>
            <button className="tubtn" style={{ maxWidth: 200, margin: '0 auto' }} onClick={resetTopUp}>Try Again</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label className="tulabel">Amount (TZS)</label>
              <input className="tuinput" type="number" min="1" placeholder="5000" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="tulabel">Phone Number</label>
              <input className="tuinput" type="tel" placeholder="0712345678" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="tulabel">Network</label>
              <select className="tuinput" value={provider} onChange={e => setProvider(e.target.value)}>
                {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <button className="tubtn" onClick={startTopUp}>
              <Icon name="phone" size={15} color="#fff" />
              Send Payment Request
            </button>
          </div>
        )}
      </div>

      {/* Manual top-up info (bank transfer, etc.) */}
      <div className="fu" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Icon name="info" size={20} color="#0369A1" />
          <div>
            <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: '#0369A1', margin: '0 0 4px' }}>Prefer a Bank Transfer?</p>
            <p style={{ fontSize: 13, color: '#0284C7', margin: '0 0 8px', lineHeight: 1.6 }}>
              Contact our team to top up via bank transfer or another method not listed above.
            </p>
            <a href="mailto:support@simunexus.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0EA5E9', color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 12, padding: '8px 16px', borderRadius: 8, textDecoration: 'none' }}>
              Contact Support →
            </a>
          </div>
        </div>
      </div>

      {/* Payment tips */}
      <div className="fu" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { icon: 'card' as IconName, title: 'Pay 50% Advance', desc: 'Start your project with just 50% upfront. Pay the rest on delivery.' },
          { icon: 'cash' as IconName, title: 'Full Payment Discount', desc: 'Pay in full upfront and get the best pricing from our experts.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #F1F5F9' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icon} size={17} color="#0EA5E9" />
            </div>
            <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, color: '#0F172A', margin: '8px 0 4px' }}>{title}</p>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="fu" style={{ background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Transaction History</h2>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>{transactions.length} transactions</span>
        </div>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '52px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="wallet" size={26} color="#CBD5E1" />
            </div>
            <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>No transactions yet</p>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>Your payment history will appear here.</p>
          </div>
        ) : (
          <div>
            {transactions.map((t: any, i: number) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderBottom: i < transactions.length - 1 ? '1px solid #F8FAFC' : 'none', transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#F8FAFC'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: t.type === 'credit' ? '#F0FDF4' : '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={t.type === 'credit' ? 'arrow-up' : 'arrow-down'} size={17} color={t.type === 'credit' ? '#16A34A' : '#DC2626'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.description || (t.type === 'credit' ? 'Wallet credit' : 'Payment')}
                  </p>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
                    {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15, color: t.type === 'credit' ? '#10B981' : '#EF4444', margin: 0 }}>
                    {t.type === 'credit' ? '+' : '-'}{fmtTZS(parseFloat(t.amount))}
                  </p>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
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
