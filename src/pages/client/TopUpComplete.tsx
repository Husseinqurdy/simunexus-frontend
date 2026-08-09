import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { paymentApi } from '@/api/client'

/*
  Route this component at the path you set as PESAPAL_CALLBACK_URL, e.g.
  https://gsh.simunexus.com/wallet/topup-complete

  PesaPal redirects the customer's browser here after they finish (or
  cancel) checkout on PesaPal's hosted page, appending query params like:
    ?OrderTrackingId=...&OrderMerchantReference=<our external_id>

  The IPN webhook (server-to-server, hits the backend directly) is what
  actually credits the wallet — this page just polls our own
  /wallet/topup/<reference>/status/ endpoint until that IPN has landed,
  then shows the result. If the query param is missing for some reason,
  we fall back to the reference stashed in sessionStorage before redirect.
*/

type ViewState = 'checking' | 'success' | 'failed' | 'timeout'

function Icon({ name, size = 22, color = 'currentColor' }: { name: 'check' | 'alert' | 'spinner'; size?: number; color?: string }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const, stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (name === 'check') return <svg {...c} strokeWidth={3}><path d="M4.5 12.75l6 6 9-13.5" /></svg>
  if (name === 'alert') return <svg {...c}><path d="M12 3.5 21.5 20h-19L12 3.5Z" /><path d="M12 9.8v4.2M12 17v.2" /></svg>
  return null
}

export default function TopUpComplete() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [state, setState] = useState<ViewState>('checking')
  const attemptsRef = useRef(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const reference =
      params.get('OrderMerchantReference') ||
      sessionStorage.getItem('pending_topup_reference') ||
      ''

    if (!reference) {
      setState('failed')
      return
    }

    const poll = async () => {
      attemptsRef.current += 1
      try {
        const { data } = await paymentApi.topUpStatus(reference)
        if (data.status === 'success') {
          if (pollRef.current) clearInterval(pollRef.current)
          sessionStorage.removeItem('pending_topup_reference')
          setState('success')
          queryClient.invalidateQueries({ queryKey: ['wallet'] })
        } else if (data.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current)
          sessionStorage.removeItem('pending_topup_reference')
          setState('failed')
        } else if (attemptsRef.current >= 20) {
          // ~1 minute at 3s intervals — the IPN can lag a little behind
          // the redirect, so we give it a bit longer before giving up.
          if (pollRef.current) clearInterval(pollRef.current)
          setState('timeout')
        }
      } catch {
        // transient network hiccup — keep trying until attempts run out
      }
    }

    poll()
    pollRef.current = setInterval(poll, 3000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [queryClient])

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", maxWidth: 420, margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        .tcbtn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(120deg,#0EA5E9,#7C3AED);color:#fff;font-family:'Syne',sans-serif;font-weight:700;font-size:14.5px;padding:12px 24px;border-radius:12px;border:none;cursor:pointer;text-decoration:none}
      `}</style>

      {state === 'checking' && (
        <>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #E2E8F0', borderTop: '3px solid #0EA5E9', margin: '0 auto 20px', animation: 'spin .8s linear infinite' }} />
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 19, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>Confirming your payment...</h1>
          <p style={{ fontSize: 13.5, color: '#64748B', margin: 0 }}>This usually takes a few seconds. Please don't close this page.</p>
        </>
      )}

      {state === 'success' && (
        <>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Icon name="check" size={26} color="#10B981" />
          </div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>Payment successful!</h1>
          <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 24px' }}>Your wallet has been credited.</p>
          <button className="tcbtn" onClick={() => navigate('/client/wallet')}>Back to Wallet</button>
        </>
      )}

      {(state === 'failed' || state === 'timeout') && (
        <>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Icon name="alert" size={24} color="#EF4444" />
          </div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
            {state === 'timeout' ? 'Still confirming' : 'Payment not completed'}
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 24px' }}>
            {state === 'timeout'
              ? "This is taking longer than usual. If you completed checkout, your wallet will update shortly — check back in a minute."
              : 'The payment was cancelled or failed. You can try again from your wallet.'}
          </p>
          <button className="tcbtn" onClick={() => navigate('/client/wallet')}>Back to Wallet</button>
        </>
      )}
    </div>
  )
}
