import { useQuery } from '@tanstack/react-query'
import { authApi, paymentApi } from '@/api/client'

const money = (v: any) => `TSh ${Number(v || 0).toLocaleString()}`
const card: React.CSSProperties = { background: '#fff', border: '1px solid #DCE3F0', borderRadius: 12, padding: 20 }
const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 13, fontWeight: 600, color: '#4E5E82', background: '#F5F7FC', borderBottom: '1px solid #DCE3F0', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', fontSize: 14, color: '#0A1F4D', borderBottom: '1px solid #EBEFF8', whiteSpace: 'nowrap' }

export default function DevCommissions() {
  const splits = useQuery({ queryKey: ['dev-splits'], queryFn: () => paymentApi.commissions().then(r => (r.data.results ?? r.data) as any[]) })
  const experts = useQuery({ queryKey: ['dev-expert-rates'], queryFn: () => authApi.adminExpertCommissions().then(r => (r.data.results ?? r.data) as any[]) })
  const mine = useQuery({ queryKey: ['dev-my-rate'], queryFn: () => authApi.adminDeveloperCommission().then(r => r.data) })
  const wallet = useQuery({ queryKey: ['dev-wallet'], queryFn: () => paymentApi.wallet().then(r => r.data) })

  const rows = splits.data || []
  const sum = (k: string) => rows.reduce((a, r) => a + Number(r[k] || 0), 0)
  const pending = rows.filter(r => !r.settled_at).length

  const stats = [
    ['My commission rate', mine.data ? `${mine.data.commission_rate}%` : '—'],
    ['My wallet balance', money(wallet.data?.wallet?.balance)],
    ['Developer earnings (all time)', money(sum('developer_amount'))],
    ['Platform profit (all time)', money(sum('platform_amount'))],
    ['Paid to experts', money(sum('expert_amount'))],
    ['Awaiting settlement', pending],
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A1F4D', margin: '0 0 4px' }}>Commissions</h1>
      <p style={{ fontSize: 14, color: '#4E5E82', margin: '0 0 20px' }}>How each completed project was split between the expert, the developer and the platform. Rates are changed by admins.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 20 }}>
        {stats.map(([k, v]) => (
          <div key={String(k)} style={{ ...card, padding: '16px 18px' }}>
            <div style={{ fontSize: 13, color: '#4E5E82', marginBottom: 6 }}>{k}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: pending && k === 'Awaiting settlement' ? '#B92D2D' : '#0A1F4D' }}>{v}</div>
          </div>
        ))}
      </div>

      <section style={{ ...card, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px', color: '#0A1F4D' }}>Project splits</h2>
        <div style={{ overflowX: 'auto', border: '1px solid #DCE3F0', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead><tr>{['Project', 'Total', 'Expert', 'Developer', 'Platform', 'Rates (E/D/P)', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {splits.isLoading && <tr><td style={td} colSpan={7}>Loading…</td></tr>}
              {!splits.isLoading && rows.length === 0 && <tr><td style={{ ...td, color: '#667697' }} colSpan={7}>No completed projects yet.</td></tr>}
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ ...td, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.project_title || `#${r.project}`}</td>
                  <td style={td}>{money(r.total_amount)}</td>
                  <td style={td}>{money(r.expert_amount)}</td>
                  <td style={td}>{money(r.developer_amount)}</td>
                  <td style={td}>{money(r.platform_amount)}</td>
                  <td style={{ ...td, color: '#4E5E82' }}>{Number(r.expert_rate)}/{Number(r.developer_rate)}/{Number(r.platform_rate)}%</td>
                  <td style={td}>
                    <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '3px 10px', background: r.settled_at ? '#EDF8F1' : '#FDEDED', color: r.settled_at ? '#137A4E' : '#B92D2D' }}>
                      {r.settled_at ? 'Settled' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={card}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px', color: '#0A1F4D' }}>Expert commission rates</h2>
        <div style={{ overflowX: 'auto', border: '1px solid #DCE3F0', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead><tr>{['Expert', 'Level', 'Rate', 'Total earned'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {(experts.data || []).map((e: any) => (
                <tr key={e.user}><td style={td}>{e.full_name}</td><td style={{ ...td, textTransform: 'capitalize' }}>{e.level}</td><td style={td}>{Number(e.commission_rate)}%</td><td style={td}>{money(e.total_earned)}</td></tr>
              ))}
              {!experts.isLoading && !(experts.data || []).length && <tr><td style={{ ...td, color: '#667697' }} colSpan={4}>No experts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
