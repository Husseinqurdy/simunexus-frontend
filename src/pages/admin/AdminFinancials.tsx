import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentApi } from '@/api/client'
import { LoadingSpinner, EmptyState, Card, SectionTitle, Table, Tr, Td, Btn } from '@/components/shared'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'

type Tab = 'overview' | 'commissions' | 'coupons'

function StatCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 20, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, fontFamily: 'Syne,sans-serif' }}>{value}</p>
      </div>
    </div>
  )
}

export default function AdminFinancials() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('overview')
  const [couponForm, setCouponForm] = useState({ code: '', discount_percent: '', max_uses: '1' })
  const [showCouponForm, setShowCouponForm] = useState(false)

  const { data: financial, isLoading: finLoading } = useQuery({
    queryKey: ['financial-dashboard'],
    queryFn: () => paymentApi.financialDashboard().then(r => r.data),
  })

  const { data: commissionsData, isLoading: commLoading } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: () => paymentApi.commissions().then(r => r.data),
    enabled: tab === 'commissions',
  })

  const { data: couponsData, isLoading: couponLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => paymentApi.coupons().then(r => r.data),
    enabled: tab === 'coupons',
  })

  const createCouponMutation = useMutation({
    mutationFn: () => paymentApi.createCoupon({
      code: couponForm.code,
      discount_percent: couponForm.discount_percent,
      max_uses: Number(couponForm.max_uses),
      is_active: true,
    }),
    onSuccess: () => {
      toast.success('Coupon created!')
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      setCouponForm({ code: '', discount_percent: '', max_uses: '1' })
      setShowCouponForm(false)
    },
    onError: () => toast.error('Failed to create coupon.'),
  })

  const TABS: { value: Tab; label: string; icon: string }[] = [
    { value: 'overview',     label: 'Overview',     icon: '📊' },
    { value: 'commissions',  label: 'Commissions',  icon: '💰' },
    { value: 'coupons',      label: 'Coupons',      icon: '🎟️' },
  ]

  const commissions = commissionsData?.results || []
  const coupons     = couponsData?.results     || []

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>Financials</h1>
        <p style={{ color: '#94A3B8', fontSize: 13, margin: '4px 0 0' }}>Revenue, commissions, and coupon management</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #F1F5F9' }}>
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            style={{
              padding: '10px 18px', borderRadius: '10px 10px 0 0', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', border: 'none', transition: 'all .2s', fontFamily: 'Syne,sans-serif',
              background: tab === t.value ? '#0B1C3D' : 'transparent',
              color: tab === t.value ? '#fff' : '#94A3B8',
              borderBottom: tab === t.value ? '2px solid #0B1C3D' : '2px solid transparent',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        finLoading ? <LoadingSpinner label="Loading financials..." /> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
              <StatCard label="Total Revenue"      value={`$${Number(financial?.total_revenue        || 0).toFixed(2)}`} color="#7C3AED" icon="💵" />
              <StatCard label="Platform Profit"    value={`$${Number(financial?.total_platform_profit|| 0).toFixed(2)}`} color="#10B981" icon="🏢" />
              <StatCard label="Paid to Experts"    value={`$${Number(financial?.total_expert_paid    || 0).toFixed(2)}`} color="#0EA5E9" icon="👨‍💻" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              <StatCard label="Developer Commission" value={`$${Number(financial?.total_developer_paid|| 0).toFixed(2)}`} color="#F59E0B" icon="⚙️" />
              <StatCard label="Completed Payments"   value={financial?.total_payments      || 0}                         color="#64748B" icon="✅" />
              <StatCard label="Projects Delivered"   value={financial?.completed_projects  || 0}                         color="#059669" icon="🚀" />
            </div>

            {/* Commission split */}
            <Card>
              <SectionTitle>Revenue Split</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { label: 'Expert Share',     value: '60%', color: '#0EA5E9', icon: '👨‍💻', desc: 'Default expert commission' },
                  { label: 'Platform Share',   value: '30%', color: '#7C3AED', icon: '🏢', desc: 'GSH platform cut'          },
                  { label: 'Developer Share',  value: '10%', color: '#F59E0B', icon: '⚙️', desc: 'Developer commission'      },
                ].map(item => (
                  <div key={item.label} style={{ padding: '16px 20px', borderRadius: 12, background: item.color + '08', border: `1px solid ${item.color}20`, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                    <p style={{ fontSize: 28, fontWeight: 800, color: item.color, margin: 0, fontFamily: 'Syne,sans-serif' }}>{item.value}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '4px 0 2px' }}>{item.label}</p>
                    <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )
      )}

      {/* ── COMMISSIONS ── */}
      {tab === 'commissions' && (
        commLoading ? <LoadingSpinner label="Loading commissions..." /> :
        commissions.length === 0 ? (
          <EmptyState icon="💰" title="No commissions yet" body="Commissions appear after projects are completed." />
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
            <Table headers={['Project', 'Total', 'Expert', 'Developer', 'Platform', 'Status', 'Date']}>
              {commissions.map((c: any) => (
                <Tr key={c.id}>
                  <Td><span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>#{c.project}</span></Td>
                  <Td><span style={{ fontWeight: 700, color: '#7C3AED', fontFamily: 'Syne,sans-serif' }}>${Number(c.total_amount).toFixed(2)}</span></Td>
                  <Td><span style={{ color: '#0EA5E9', fontWeight: 700 }}>${Number(c.expert_amount).toFixed(2)}</span></Td>
                  <Td><span style={{ color: '#F59E0B', fontWeight: 700 }}>${Number(c.developer_amount).toFixed(2)}</span></Td>
                  <Td><span style={{ color: '#10B981', fontWeight: 700 }}>${Number(c.platform_amount).toFixed(2)}</span></Td>
                  <Td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: c.is_settled ? '#F0FDF4' : '#FFFBEB',
                      color:      c.is_settled ? '#059669' : '#D97706',
                      border:    `1px solid ${c.is_settled ? '#BBF7D0' : '#FDE68A'}`,
                    }}>
                      {c.is_settled ? 'Settled' : 'Pending'}
                    </span>
                  </Td>
                  <Td><span style={{ fontSize: 12, color: '#94A3B8' }}>{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span></Td>
                </Tr>
              ))}
            </Table>
          </div>
        )
      )}

      {/* ── COUPONS ── */}
      {tab === 'coupons' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Btn variant="accent" onClick={() => setShowCouponForm(!showCouponForm)}>
              {showCouponForm ? 'Cancel' : '+ New Coupon'}
            </Btn>
          </div>

          {showCouponForm && (
            <Card style={{ marginBottom: 20, border: '1.5px solid #BAE6FD', background: '#F0F9FF' }}>
              <SectionTitle>Create Coupon</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                {[
                  { label: 'Code',         key: 'code',             placeholder: 'GSH20OFF', upper: true },
                  { label: 'Discount (%)', key: 'discount_percent', placeholder: '10'        },
                  { label: 'Max Uses',     key: 'max_uses',         placeholder: '1'         },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 5 }}>{f.label}</label>
                    <input
                      type={f.key === 'code' ? 'text' : 'number'}
                      placeholder={f.placeholder}
                      value={(couponForm as any)[f.key]}
                      onChange={e => setCouponForm(p => ({ ...p, [f.key]: f.upper ? e.target.value.toUpperCase() : e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>
              <Btn variant="accent" onClick={() => createCouponMutation.mutate()} disabled={!couponForm.code || !couponForm.discount_percent || createCouponMutation.isPending}>
                {createCouponMutation.isPending ? 'Creating…' : 'Create Coupon'}
              </Btn>
            </Card>
          )}

          {couponLoading ? <LoadingSpinner label="Loading coupons..." /> :
            coupons.length === 0 ? (
              <EmptyState icon="🎟️" title="No coupons yet" body="Create your first coupon to offer discounts." />
            ) : (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
                <Table headers={['Code', 'Discount', 'Uses', 'Max Uses', 'Status', 'Expires']}>
                  {coupons.map((c: any) => (
                    <Tr key={c.id}>
                      <Td><span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 13, color: '#0B1C3D', letterSpacing: '0.05em' }}>{c.code}</span></Td>
                      <Td><span style={{ fontWeight: 800, color: '#7C3AED', fontFamily: 'Syne,sans-serif' }}>{c.discount_percent}%</span></Td>
                      <Td><span style={{ fontSize: 13, color: '#374151' }}>{c.uses}</span></Td>
                      <Td><span style={{ fontSize: 13, color: '#374151' }}>{c.max_uses}</span></Td>
                      <Td>
                        <span style={{
                          padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: c.is_active && c.uses < c.max_uses ? '#F0FDF4' : '#FFF1F2',
                          color:      c.is_active && c.uses < c.max_uses ? '#059669' : '#E11D48',
                          border:    `1px solid ${c.is_active && c.uses < c.max_uses ? '#BBF7D0' : '#FECDD3'}`,
                        }}>
                          {c.is_active && c.uses < c.max_uses ? 'Active' : 'Inactive'}
                        </span>
                      </Td>
                      <Td>
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>
                          {c.expires_at ? format(new Date(c.expires_at), 'dd MMM yyyy') : 'No expiry'}
                        </span>
                      </Td>
                    </Tr>
                  ))}
                </Table>
              </div>
            )
          }
        </>
      )}
    </div>
  )
}
