import { useSystemHealth, HealthGrid, CountsRows } from '@/components/shared/SystemHealth'
import { useQuery } from '@tanstack/react-query'
import { authApi, paymentApi } from '@/api/client'
import { StatCard, LoadingSpinner, PageHeader, Card, SectionTitle, Table, Tr, Td } from '@/components/shared'
import { useAuthStore } from '@/store/authStore'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'

export default function DevDashboard() {
  const health = useSystemHealth()
  const { user } = useAuthStore()
  const devProfile = user?.developer_profile

  const { data: summary } = useQuery({ queryKey: ['system-summary'], queryFn: () => authApi.systemSummary().then(r => r.data), refetchInterval: 15000 })
  const { data: financial } = useQuery({ queryKey: ['financial-dashboard'], queryFn: () => paymentApi.financialDashboard().then(r => r.data) })
  const { data: wallet } = useQuery({ queryKey: ['wallet'], queryFn: () => paymentApi.wallet().then(r => r.data) })
  const { data: commissions } = useQuery({ queryKey: ['commissions'], queryFn: () => paymentApi.commissions().then(r => r.data) })

  const splits = commissions?.results || []
  const chartData = splits.slice(0, 12).reverse().map((c: any, i: number) => ({
    name: `P${i + 1}`,
    Revenue: parseFloat(c.total_amount),
    MyEarning: parseFloat(c.developer_amount),
  }))

  return (
    <div>
      <PageHeader
        title="Developer Dashboard"
        subtitle={`Full system visibility · ${user?.email}`}
      />

      {/* Dev info banner */}
      <div style={{ background: 'linear-gradient(135deg,#0A1F6B,#12348C)', borderRadius: 16, padding: '24px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(229,160,13,.15)', border: '2px solid rgba(229,160,13,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5BA2E', fontFamily: 'inherit', fontWeight: 700, fontSize: 15 }}>
              {(user?.first_name?.[0] || 'D').toUpperCase()}
            </div>
            <div>
              <p style={{ color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 15, margin: 0 }}>{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email}</p>
              <span style={{ fontSize: 12, color: '#F5BA2E', fontWeight: 600}}> Developer · Full Access</span>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, margin: 0 }}>Commission rate: <strong style={{ color: '#E5A00D' }}>{devProfile?.commission_rate || 10}%</strong> per project</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#F5BA2E', fontFamily: 'inherit', fontWeight: 700, fontSize: 24, margin: 0 }}>TSh {Number(wallet?.wallet?.balance || 0).toLocaleString()}</p>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, margin: 0 }}>Wallet Balance</p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#1B9B63', fontFamily: 'inherit', fontWeight: 700, fontSize: 24, margin: 0 }}>TSh {Number(devProfile?.total_earned || 0).toLocaleString()}</p>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, margin: 0 }}>Total Earned</p>
          </div>
        </div>
      </div>

      {/* Platform stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
        <StatCard label="Total Revenue" value={`TSh ${Number(financial?.total_revenue || 0).toLocaleString()}`} color="#2E4DA7" />
        <StatCard label="Platform Profit" value={`TSh ${Number(financial?.total_platform_profit || 0).toLocaleString()}`} color="#1B9B63" />
        <StatCard label="Expert Payouts" value={`TSh ${Number(financial?.total_expert_paid || 0).toLocaleString()}`} color="#0D52CE" />
        <StatCard label="Projects Done" value={financial?.completed_projects || 0} color="#E5A00D" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Clients" value={summary?.total_clients || 0} />
        <StatCard label="Total Experts" value={summary?.total_experts || 0} color="#1B9B63" />
        <StatCard label="Online Now" value={summary?.online_users || 0} color="#0D52CE" />
        <StatCard label="Total Users" value={summary?.total_users || 0} />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <SectionTitle>Revenue & Developer Earnings</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A1F6B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0A1F6B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="devGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3F5FB8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3F5FB8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBEFF8" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#667697' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#667697' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`TSh ${Number(v).toLocaleString()}`, '']} contentStyle={{ borderRadius: 12, border: '1px solid #EBEFF8', fontSize: 12 }} />
              <Area type="monotone" dataKey="Revenue" stroke="#0A1F6B" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
              <Area type="monotone" dataKey="MyEarning" stroke="#3F5FB8" strokeWidth={2.5} fill="url(#devGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
            {[['#0A1F6B', 'Total Revenue'], ['#3F5FB8', 'My Earnings']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 3, background: color, borderRadius: 99 }} />
                <span style={{ fontSize: 12, color: '#667697' }}>{label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* System health (live kutoka seva) */}
      <Card>
        <SectionTitle>System Health</SectionTitle>
        <HealthGrid data={health.data} isLoading={health.isLoading} isError={health.isError} />
        <div style={{ marginTop: 16 }}><CountsRows data={health.data} /></div>
      </Card>
    </div>
  )
}
