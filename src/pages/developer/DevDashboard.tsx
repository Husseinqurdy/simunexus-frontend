import { useQuery } from '@tanstack/react-query'
import { authApi, paymentApi } from '@/api/client'
import { StatCard, LoadingSpinner, PageHeader, Card, SectionTitle, Table, Tr, Td } from '@/components/shared'
import { useAuthStore } from '@/store/authStore'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'

export default function DevDashboard() {
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
      <div style={{ background: 'linear-gradient(135deg,#0B1C3D,#1A3A7A)', borderRadius: 20, padding: '24px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(245,158,11,.15)', border: '2px solid rgba(245,158,11,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15 }}>
              {(user?.first_name?.[0] || 'D').toUpperCase()}
            </div>
            <div>
              <p style={{ color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, margin: 0 }}>{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email}</p>
              <span style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>👑 Developer · Full Access</span>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, margin: 0 }}>Commission rate: <strong style={{ color: '#F59E0B' }}>{devProfile?.commission_rate || 10}%</strong> per project</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#F59E0B', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, margin: 0 }}>${wallet?.wallet?.balance || '0.00'}</p>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, margin: 0 }}>Wallet Balance</p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#10B981', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, margin: 0 }}>${devProfile?.total_earned || '0.00'}</p>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, margin: 0 }}>Total Earned</p>
          </div>
        </div>
      </div>

      {/* Platform stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
        <StatCard label="Total Revenue" value={`$${financial?.total_revenue || 0}`} color="#7C3AED" />
        <StatCard label="Platform Profit" value={`$${financial?.total_platform_profit || 0}`} color="#10B981" />
        <StatCard label="Expert Payouts" value={`$${financial?.total_expert_paid || 0}`} color="#0EA5E9" />
        <StatCard label="Projects Done" value={financial?.completed_projects || 0} color="#F59E0B" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Clients" value={summary?.total_clients || 0} />
        <StatCard label="Total Experts" value={summary?.total_experts || 0} color="#10B981" />
        <StatCard label="Online Now" value={summary?.online_users || 0} color="#0EA5E9" />
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
                  <stop offset="5%" stopColor="#0B1C3D" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0B1C3D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="devGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, '']} contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9', fontSize: 12 }} />
              <Area type="monotone" dataKey="Revenue" stroke="#0B1C3D" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
              <Area type="monotone" dataKey="MyEarning" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#devGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
            {[['#0B1C3D', 'Total Revenue'], ['#8B5CF6', 'My Earnings']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 3, background: color, borderRadius: 99 }} />
                <span style={{ fontSize: 11, color: '#94A3B8' }}>{label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* System health */}
      <Card>
        <SectionTitle>System Health</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Backend API', status: 'Online', color: '#10B981' },
            { label: 'PostgreSQL', status: 'Connected', color: '#10B981' },
            { label: 'Redis Cache', status: 'Connected', color: '#10B981' },
            { label: 'WebSocket', status: 'Active', color: '#0EA5E9' },
          ].map(({ label, status, color }) => (
            <div key={label} style={{ background: '#F8FAFC', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <div style={{ width: 8, height: 8, background: color, borderRadius: '50%', margin: '0 auto 10px', boxShadow: `0 0 0 3px ${color}25` }} />
              <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 12, color: '#0F172A', margin: '0 0 2px' }}>{label}</p>
              <p style={{ fontSize: 11, color, fontWeight: 700, margin: 0 }}>{status}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
