import { useSystemHealth, HealthGrid, SystemInfoRows, EmailInfoRows, CountsRows } from '@/components/shared/SystemHealth'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, projectApi, paymentApi } from '@/api/client'
import toast from 'react-hot-toast'

// ── Icons ─────────────────────────────────────────────────────────────────────
const Ic = {
  users:   <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  online:  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" /></svg>,
  projects:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>,
  revenue: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  expert:  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
  dev:     <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>,
  platform:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>,
  check:   <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
  edit:    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>,
  refresh: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  email:   <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
  ban:     <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
  db:      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.25c0 2.278-3.694 4.125-8.25 4.125S3.75 10.903 3.75 8.625m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>,
}

type Tab = 'overview' | 'commissions' | 'users' | 'email'

function StatCard({ label, value, color, icon, delay = 0 }: {
  label: string; value: string | number; color: string; icon: React.ReactNode; delay?: number
}) {
  return (
    <div className="sc" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#C3CEE2', textAlign: 'right' }}>{label}</span>
      </div>
      <p style={{ fontSize: 24, fontWeight: 700, color, margin: 0, fontFamily: 'inherit', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
    </div>
  )
}

function CommissionRing({ expert, developer }: { expert: number; developer: number }) {
  const platform = 100 - expert - developer
  const r = 52, cx = 64, cy = 64
  const circ = 2 * Math.PI * r

  const segments = [
    { pct: expert,   color: '#0D52CE', label: 'Expert'   },
    { pct: developer,color: '#9A5B00', label: 'Developer' },
    { pct: platform, color: '#137A4E', label: 'Platform'  },
  ]

  let offset = 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EBEFF8" strokeWidth="14" />
        {segments.map(({ pct, color }) => {
          const dash = (pct / 100) * circ
          const el = (
            <circle key={color} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="14"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform="rotate(-90 64 64)"
              style={{ transition: 'stroke-dasharray .6s ease' }}
            />
          )
          offset += dash
          return el
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#667697" fontFamily="Inter">Split</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="12" fill="#0A1F4D" fontFamily="Inter" fontWeight="700">100%</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {segments.map(({ pct, color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#2B3A60', fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: 'inherit', marginLeft: 'auto' }}>{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DevSystemControl() {
  const health = useSystemHealth()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('overview')
  const [expertRate, setExpertRate] = useState(60)
  const [devRate, setDevRate] = useState(10)
  const [emailAddr, setEmailAddr] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [editRates, setEditRates] = useState(false)

  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ['system-summary'],
    queryFn:  () => authApi.systemSummary().then(r => r.data),
    refetchInterval: 30000,
  })
  const { data: financial } = useQuery({
    queryKey: ['financial-dashboard'],
    queryFn:  () => paymentApi.financialDashboard().then(r => r.data),
  })
  const { data: usersData } = useQuery({
    queryKey: ['all-users-dev'],
    queryFn:  () => authApi.adminUsers({ page_size: 100 }).then(r => r.data),
    enabled:  tab === 'users',
  })

  const testEmailMutation = useMutation({
    mutationFn: (email: string) => authApi.testEmail({ email }),
    onSuccess: () => { toast.success('Test email sent!'); setEmailAddr('') },
    onError:   () => toast.error('Failed to send email.'),
  })
  const resendLinkMutation = useMutation({
    mutationFn: (email: string) => authApi.resendPasswordLink({ email }),
    onSuccess: () => { toast.success('Password link resent!'); setResendEmail('') },
    onError:   () => toast.error('Failed to resend link.'),
  })
  const banMutation = useMutation({
    mutationFn: (id: number) => authApi.adminBanUser(id),
    onSuccess: () => { toast.success('Done.'); qc.invalidateQueries({ queryKey: ['all-users-dev'] }) },
    onError:   () => toast.error('Action failed.'),
  })

  const platform = Math.max(0, 100 - expertRate - devRate)
  const users = usersData?.results || []

  const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
    { value: 'overview',     label: 'Overview',     icon: Ic.db       },
    { value: 'commissions',  label: 'Commissions',  icon: Ic.revenue  },
    { value: 'users',        label: 'Users',        icon: Ic.users    },
    { value: 'email',        label: 'Email Tools',  icon: Ic.email    },
  ]

  return (
    <div style={{ fontFamily: 'inherit', maxWidth: 1000 }}>
      <style>{`
        
        @keyframes fadeUp  { from{opacity:0;transform:translateY(0)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes spin    { to{transform:rotate(360deg)} }

        .fu { animation:fadeUp .4s ease both; }
        .fi { animation:fadeIn .35s ease both; }

        .sc {
          background:#fff; border-radius:14px; padding:18px 20px;
          border:1px solid #EBEFF8; box-shadow:0 1px 4px rgba(0,0,0,.05);
          animation:fadeUp .4s ease both;
          transition:box-shadow .2s,transform .2s;
        }
        .sc:hover { box-shadow:0 6px 20px rgba(10,31,107,.08); transform:translateY(0); }

        .tab-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:9px 16px; border-radius:10px; font-size:13px; font-weight:600;
          cursor:pointer; border:none; transition:all .2s;
          font-family: inherit;
        }

        .inp {
          width:100%; padding:9px 12px; border-radius:10px;
          border:1.5px solid #DCE3F0; font-size:13px; outline:none;
          font-family:inherit; color:#0A1F4D; box-sizing:border-box;
          transition:border-color .2s;
        }
        .inp:focus { border-color:#0D52CE; }

        .user-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:11px 16px; border-radius:10px; gap:10px;
          transition:background .15s; animation:fadeIn .35s ease both;
        }
        .user-row:hover { background:#F5F7FC; }

        .action-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:8px 16px; border-radius:9px; border:none; cursor:pointer;
          font-size:13px; font-weight:700; font-family:inherit;
          transition:opacity .2s,transform .1s;
        }
        .action-btn:hover  { opacity:.88; transform:translateY(0); }
        .action-btn:active { transform:translateY(0); }

        @media(max-width:640px) {
          .stat-grid { grid-template-columns:repeat(2,1fr) !important; }
          .tabs-row  { flex-wrap:wrap !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="fu" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#667697', margin: '0 0 3px' }}>Developer Portal</p>
        <h1 style={{ fontFamily: 'inherit', fontSize: 24, fontWeight: 700, color: '#0A1F6B', margin: 0, letterSpacing: '-0.02em' }}>System Control</h1>
        <p style={{ color: '#667697', fontSize: 13, margin: '4px 0 0' }}>Full system oversight and configuration.</p>
      </div>

      {/* ── Tabs ── */}
      <div className="tabs-row fu" style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid #EBEFF8', paddingBottom: 0, animationDelay: '40ms', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.value} className="tab-btn" onClick={() => setTab(t.value)}
            style={{ background: tab === t.value ? '#0A1F6B' : 'transparent', color: tab === t.value ? '#fff' : '#667697', borderBottom: tab === t.value ? '2px solid #0A1F6B' : '2px solid transparent', borderRadius: '10px 10px 0 0', paddingBottom: 11 }}>
            <span style={{ color: tab === t.value ? '#8DB8F7' : 'inherit' }}>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ════════ OVERVIEW ════════ */}
      {tab === 'overview' && (
        <div className="fi">
          {sumLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #DCE3F0', borderTop: '3px solid #0D52CE', animation: 'spin .7s linear infinite' }} />
            </div>
          ) : (
            <>
              <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                <StatCard label="Total Clients"  value={summary?.total_clients  || 0} color="#0A1F6B" icon={Ic.users}    delay={0}   />
                <StatCard label="Total Experts"  value={summary?.total_experts  || 0} color="#0D52CE" icon={Ic.expert}   delay={60}  />
                <StatCard label="Online Now"     value={summary?.online_users   || 0} color="#1B9B63" icon={Ic.online}   delay={120} />
                <StatCard label="Total Revenue"  value={`TSh ${Number(financial?.total_revenue || 0).toLocaleString()}`} color="#2E4DA7" icon={Ic.revenue} delay={180} />
              </div>
              <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                <StatCard label="Platform Profit" value={`TSh ${Number(financial?.total_platform_profit || 0).toLocaleString()}`} color="#1B9B63" icon={Ic.platform} delay={80}  />
                <StatCard label="Paid to Experts"  value={`TSh ${Number(financial?.total_expert_paid    || 0).toLocaleString()}`} color="#0D52CE" icon={Ic.expert}   delay={120} />
                <StatCard label="Projects Done"    value={financial?.completed_projects || 0}                                     color="#E5A00D" icon={Ic.projects} delay={160} />
              </div>

              {/* DB & system info */}
              <div className="sc fu" style={{ animationDelay: '200ms' }}>
                <p style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 14, color: '#0A1F4D', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#2E4DA7' }}>{Ic.db}</span> System Info
                </p>
                <HealthGrid data={health.data} isLoading={health.isLoading} isError={health.isError} />
                <div style={{ height: 14 }} />
                <SystemInfoRows data={health.data} />
                <div style={{ height: 14 }} />
                <CountsRows data={health.data} />
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════ COMMISSIONS ════════ */}
      {tab === 'commissions' && (
        <div className="fi">
          <div className="sc" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 15, color: '#0A1F4D', margin: 0 }}>Commission Split Configuration</p>
              <button className="action-btn" onClick={() => setEditRates(!editRates)}
                style={{ background: editRates ? '#EBEFF8' : '#EAF1FD', color: editRates ? '#4E5E82' : '#0D52CE' }}>
                {Ic.edit} {editRates ? 'Cancel' : 'Edit Rates'}
              </button>
            </div>

            <CommissionRing expert={expertRate} developer={devRate} />

            {editRates && (
              <div style={{ marginTop: 24, borderTop: '1px solid #EBEFF8', paddingTop: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D52CE', marginBottom: 8 }}>
                      Expert Rate (%)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="range" min="30" max="80" value={expertRate} onChange={e => setExpertRate(Number(e.target.value))}
                        style={{ flex: 1, accentColor: '#0D52CE' }} />
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#0D52CE', fontFamily: 'inherit', minWidth: 44, textAlign: 'right' }}>{expertRate}%</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#9A5B00', marginBottom: 8 }}>
                      Developer Rate (%)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="range" min="0" max="20" value={devRate} onChange={e => setDevRate(Number(e.target.value))}
                        style={{ flex: 1, accentColor: '#E5A00D' }} />
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#9A5B00', fontFamily: 'inherit', minWidth: 44, textAlign: 'right' }}>{devRate}%</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#EDF8F1', border: '1px solid #BFE5CF', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#0E5C3A', fontWeight: 600 }}>Platform (auto-calculated)</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#137A4E', fontFamily: 'inherit' }}>{platform}%</span>
                </div>

                {platform < 0 ? (
                  <div style={{ background: '#FDEDED', border: '1px solid #F3C7C7', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                    <p style={{ fontSize: 13, color: '#B92D2D', fontWeight: 700, margin: 0 }}>
                      Total exceeds 100%. Reduce expert or developer rate.
                    </p>
                  </div>
                ) : (
                  <button className="action-btn"
                    onClick={() => { toast.success(`Rates saved: Expert ${expertRate}%, Developer ${devRate}%, Platform ${platform}%`); setEditRates(false) }}
                    style={{ width: '100%', justifyContent: 'center', background: '#0D52CE', color: '#fff' }}
                    disabled={platform < 0}
                  >
                    {Ic.check} Save Commission Rates
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Expert Share',    value: `${expertRate}%`,  color: '#0D52CE', icon: Ic.expert,   desc: 'Per completed project' },
              { label: 'Developer Share', value: `${devRate}%`,     color: '#9A5B00', icon: Ic.dev,      desc: 'Fixed platform developer' },
              { label: 'Platform Share',  value: `${platform}%`,    color: '#137A4E', icon: Ic.platform, desc: 'System operating margin' },
            ].map(({ label, value, color, icon, desc }) => (
              <div key={label} className="sc fu">
                <div style={{ width: 42, height: 42, borderRadius: 12, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 12 }}>
                  {icon}
                </div>
                <p style={{ fontSize: 28, fontWeight: 700, color, margin: '0 0 4px', fontFamily: 'inherit', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#2B3A60', margin: '0 0 3px' }}>{label}</p>
                <p style={{ fontSize: 12, color: '#667697', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════ USERS ════════ */}
      {tab === 'users' && (
        <div className="fi">
          <div className="sc">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 15, color: '#0A1F4D', margin: 0 }}>All Users</p>
              <span style={{ fontSize: 12, color: '#667697' }}>{users.length} total</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#667697', fontSize: 13 }}>Loading users...</div>
              ) : users.map((u: any, i: number) => {
                const ROLE_CFG: Record<string, { color: string; bg: string }> = {
                  client:    { color: '#0D52CE', bg: '#EAF1FD' },
                  expert:    { color: '#137A4E', bg: '#EDF8F1' },
                  admin:     { color: '#2E4DA7', bg: '#EEF2FB' },
                  developer: { color: '#B85F00', bg: '#FFF8E6' },
                }
                const rc = ROLE_CFG[u.role] || ROLE_CFG.client
                return (
                  <div key={u.id} className="user-row" style={{ animationDelay: `${i * 30}ms` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: rc.bg, color: rc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {(u.first_name?.[0] || u.email[0]).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0A1F4D', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.first_name} {u.last_name} {!u.first_name && !u.last_name ? u.email : ''}
                        </p>
                        <p style={{ fontSize: 12, color: '#667697', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span style={{ padding: '3px 9px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: rc.bg, color: rc.color, border: `1px solid ${rc.color}20` }}>
                        {u.role}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: u.is_online ? '#1B9B63' : '#C3CEE2' }} />
                        <span style={{ fontSize: 12, color: u.is_active ? '#4E5E82' : '#D03A3A', fontWeight: u.is_active ? 400 : 700 }}>
                          {!u.is_active ? 'Banned' : u.is_online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <button className="action-btn" onClick={() => banMutation.mutate(u.id)}
                        style={{ background: u.is_active ? '#FDEDED' : '#EDF8F1', color: u.is_active ? '#B92D2D' : '#137A4E', padding: '5px 10px', fontSize: 12 }}>
                        {u.is_active ? <>{Ic.ban} Ban</> : <>{Ic.check} Unban</>}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════ EMAIL TOOLS ════════ */}
      {tab === 'email' && (
        <div className="fi" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Test email */}
          <div className="sc">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ color: '#0D52CE' }}>{Ic.email}</div>
              <p style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 15, color: '#0A1F4D', margin: 0 }}>Send Test Email</p>
            </div>
            <p style={{ fontSize: 13, color: '#4E5E82', margin: '0 0 14px', lineHeight: 1.6 }}>
              Send a test email to verify that the email system is working correctly.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="inp" type="email" placeholder="recipient@email.com" value={emailAddr} onChange={e => setEmailAddr(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && emailAddr && testEmailMutation.mutate(emailAddr)} />
              <button className="action-btn"
                onClick={() => emailAddr && testEmailMutation.mutate(emailAddr)}
                disabled={!emailAddr || testEmailMutation.isPending}
                style={{ background: '#0D52CE', color: '#fff', flexShrink: 0 }}>
                {testEmailMutation.isPending
                  ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                  : <>{Ic.email} Send</>
                }
              </button>
            </div>
          </div>

          {/* Resend password link */}
          <div className="sc">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ color: '#2E4DA7' }}>{Ic.refresh}</div>
              <p style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 15, color: '#0A1F4D', margin: 0 }}>Resend Password Link</p>
            </div>
            <p style={{ fontSize: 13, color: '#4E5E82', margin: '0 0 14px', lineHeight: 1.6 }}>
              Resend a set-password email to a user who hasn't set their password yet.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="inp" type="email" placeholder="user@email.com" value={resendEmail} onChange={e => setResendEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && resendEmail && resendLinkMutation.mutate(resendEmail)} />
              <button className="action-btn"
                onClick={() => resendEmail && resendLinkMutation.mutate(resendEmail)}
                disabled={!resendEmail || resendLinkMutation.isPending}
                style={{ background: '#2E4DA7', color: '#fff', flexShrink: 0 }}>
                {resendLinkMutation.isPending
                  ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                  : <>{Ic.refresh} Resend</>
                }
              </button>
            </div>
          </div>

          {/* Email config info */}
          <div className="sc">
            <p style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 15, color: '#0A1F4D', margin: '0 0 14px' }}>Email Configuration</p>
            <EmailInfoRows data={health.data} />
          </div>
        </div>
      )}
    </div>
  )
}
