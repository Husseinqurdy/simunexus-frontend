import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/api/client'
import { formatBytes, formatDuration } from '@/lib/format'
import type { SystemHealth } from '@/types'

const OK = '#137A4E', BAD = '#B92D2D', WARN = '#9A5B00', INFO = '#0D52CE'

export function useSystemHealth(intervalMs = 30000) {
  return useQuery<SystemHealth>({
    queryKey: ['system-health'],
    queryFn: () => authApi.systemHealth().then(r => r.data as SystemHealth),
    refetchInterval: intervalMs,
    retry: 1,
  })
}

const dot = (c: string): React.CSSProperties => ({ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' })

/** Kadi 4 za hali halisi: API, database, cache, WebSocket (channel layer). */
export function HealthGrid({ data, isLoading, isError }: { data?: SystemHealth; isLoading: boolean; isError: boolean }) {
  const items = [
    { label: 'Backend API', ok: !!data && !isError, text: isError ? 'Unreachable' : isLoading ? 'Checking…' : `Online · up ${formatDuration(data?.server.uptime_seconds || 0)}` },
    ...(['database', 'cache', 'websocket'] as const).map(k => {
      const c = data?.checks[k]
      return {
        label: { database: 'Database', cache: 'Redis cache', websocket: 'Channel layer' }[k],
        ok: !!c?.ok,
        text: !c ? (isLoading ? 'Checking…' : '—') : c.ok ? `${c.detail || 'OK'} · ${c.latency_ms} ms` : (c.error || 'Failed'),
      }
    }),
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
      {items.map(i => {
        const c = isLoading ? '#667697' : i.ok ? OK : BAD
        return (
          <div key={i.label} style={{ background: '#F5F7FC', border: '1px solid #DCE3F0', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={dot(c)} /><span style={{ fontSize: 14, fontWeight: 600, color: '#0A1F4D' }}>{i.label}</span>
            </div>
            <div style={{ fontSize: 13, color: c, fontWeight: 500, wordBreak: 'break-word' }}>{i.text}</div>
          </div>
        )
      })}
    </div>
  )
}

function Rows({ rows }: { rows: [string, React.ReactNode, string?][] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8 }}>
      {rows.map(([k, v, color]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 12px', background: '#F5F7FC', borderRadius: 8, fontSize: 13 }}>
          <span style={{ color: '#667697' }}>{k}</span>
          <span style={{ color: color || '#0A1F4D', fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

export function SystemInfoRows({ data }: { data?: SystemHealth }) {
  if (!data) return <p style={{ fontSize: 13, color: '#667697' }}>Loading…</p>
  const s = data.server, st = data.storage, p = data.payments, cfg = data.config
  const pct = st.disk_total ? Math.round((st.disk_used / st.disk_total) * 100) : 0
  return (
    <Rows rows={[
      ['Environment', s.environment, s.debug ? WARN : OK],
      ['Debug mode', s.debug ? 'ON (disable in production)' : 'Off', s.debug ? BAD : OK],
      ['Django / Python', `${s.django} / ${s.python}`],
      ['Version (git)', s.commit || '—'],
      ['Server time', new Date(s.time).toLocaleString()],
      ['Disk usage', `${formatBytes(st.disk_used)} of ${formatBytes(st.disk_total)} (${pct}%)`, pct > 85 ? BAD : pct > 70 ? WARN : OK],
      ['Uploaded files', `${st.media_files}${st.media_truncated ? '+' : ''} files · ${formatBytes(st.media_bytes)}`],
      ['Protected downloads (nginx)', st.x_accel_redirect ? 'X-Accel enabled' : 'Served by Django', st.x_accel_redirect ? OK : WARN],
      ['PesaPal', !p.pesapal.configured ? 'Not configured' : p.pesapal.sandbox ? 'Sandbox' : 'Live', !p.pesapal.configured ? BAD : p.pesapal.sandbox ? WARN : OK],
      ['PesaPal IPN', p.pesapal.ipn_url_set ? 'URL set' : 'URL missing', p.pesapal.ipn_url_set ? OK : WARN],
      ['AzamPay', !p.azampay.configured ? 'Not configured' : p.azampay.sandbox ? 'Sandbox' : 'Live', !p.azampay.configured ? '#667697' : p.azampay.sandbox ? WARN : OK],
      ['Frontend URL', cfg.frontend_url],
      ['JWT lifetime', `${cfg.jwt_access_minutes} min access · ${cfg.jwt_refresh_days} d refresh`],
      ['Expert test', `${cfg.expert_test_questions} question(s) · ${cfg.expert_test_minutes} min`],
    ]} />
  )
}

export function EmailInfoRows({ data }: { data?: SystemHealth }) {
  if (!data) return <p style={{ fontSize: 13, color: '#667697' }}>Loading…</p>
  const e = data.email
  const ready = !e.is_console && e.user_configured && e.password_configured
  return (
    <Rows rows={[
      ['Backend', e.backend],
      ['Host', `${e.host}:${e.port}`],
      ['Security', e.ssl ? 'SSL' : e.tls ? 'STARTTLS' : 'None', e.tls || e.ssl ? OK : WARN],
      ['From', e.from || '—'],
      ['Credentials', e.user_configured && e.password_configured ? 'Configured' : 'Missing', e.user_configured && e.password_configured ? OK : BAD],
      ['Certificate check', e.tls_verify_disabled ? 'DISABLED (insecure)' : 'Enabled', e.tls_verify_disabled ? BAD : OK],
      ['Status', e.is_console ? 'Console only (no real emails)' : ready ? 'Ready' : 'Not ready', ready ? OK : BAD],
    ]} />
  )
}

export function CountsRows({ data }: { data?: SystemHealth }) {
  if (!data) return null
  const c = data.counts
  return (
    <Rows rows={[
      ['Users online', c.users_online, INFO],
      ['Clients / Experts', `${c.users.client || 0} / ${c.users.expert || 0}`],
      ['Admins / Developers', `${c.users.admin || 0} / ${c.users.developer || 0}`],
      ['Applications to review', c.applications_to_review, c.applications_to_review ? WARN : undefined],
      ['Projects in QC', c.projects.qc || 0, (c.projects.qc || 0) ? WARN : undefined],
      ['Test questions (active)', c.test_questions],
      ['Landing media (published)', c.showcase_items],
      ['Unsettled commissions', c.unsettled_commissions, c.unsettled_commissions ? BAD : OK],
      ['Total wallet balances', `TSh ${Number(c.wallet_total).toLocaleString()}`],
    ]} />
  )
}
