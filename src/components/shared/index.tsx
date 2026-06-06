import type { ProjectStatus } from '@/types'

// ── Status Badge ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProjectStatus, { label: string; bg: string; color: string; dot: string }> = {
  received:    { label: 'Received',     bg: '#F8FAFC', color: '#64748B', dot: '#94A3B8' },
  assigned:    { label: 'Assigned',     bg: '#EFF6FF', color: '#2563EB', dot: '#3B82F6' },
  in_progress: { label: 'In Progress',  bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B' },
  qc:          { label: 'Quality Check', bg: '#F5F3FF', color: '#7C3AED', dot: '#8B5CF6' },
  completed:   { label: 'Completed',    bg: '#F0FDF4', color: '#059669', dot: '#10B981' },
  revision:    { label: 'Revision',     bg: '#FFF1F2', color: '#E11D48', dot: '#F43F5E' },
  cancelled:   { label: 'Cancelled',    bg: '#F8FAFC', color: '#64748B', dot: '#94A3B8' },
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.received
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.dot}20`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  color?: string
  trend?: { value: number; label: string }
}

export function StatCard({ label, value, icon, color = '#0B1C3D', trend }: StatCardProps) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '20px 22px',
      border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      transition: 'all .2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
        {icon && (
          <div style={{ width: 34, height: 34, borderRadius: 10, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
            {icon}
          </div>
        )}
      </div>
      <p style={{ fontSize: 28, fontWeight: 800, color, margin: 0, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{value}</p>
      {trend && (
        <p style={{ fontSize: 11, color: trend.value >= 0 ? '#10B981' : '#EF4444', margin: '8px 0 0', fontWeight: 600 }}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  )
}

// ── Progress Bar ───────────────────────────────────────────────────────────
export function ProgressBar({ percentage, color = '#0EA5E9', height = 6 }: { percentage: number; color?: string; height?: number }) {
  const pct = Math.min(Math.max(percentage, 0), 100)
  return (
    <div style={{ width: '100%', height, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${pct}%`, borderRadius: 999,
        background: pct >= 80 ? '#10B981' : pct >= 40 ? color : '#F59E0B',
        transition: 'width .5s ease',
      }} />
    </div>
  )
}

// ── Loading Spinner ────────────────────────────────────────────────────────
export function LoadingSpinner({ size = 'md', label }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const dim = { sm: 20, md: 36, lg: 52 }[size]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: size === 'sm' ? 12 : 48, gap: 12 }}>
      <div style={{
        width: dim, height: dim, borderRadius: '50%',
        border: `${size === 'sm' ? 2 : 3}px solid #E2E8F0`,
        borderTop: `${size === 'sm' ? 2 : 3}px solid #0EA5E9`,
        animation: 'spin .7s linear infinite',
      }} />
      {label && <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>{label}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body, action }: { icon?: string; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon || '📭'}</div>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#1E293B', margin: '0 0 8px' }}>{title}</p>
      {body && <p style={{ fontSize: 14, color: '#94A3B8', margin: '0 0 24px', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>{body}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}

// ── Expert Level Badge ────────────────────────────────────────────────────
const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  beginner: { label: 'Beginner',    color: '#64748B', bg: '#F8FAFC', icon: '○' },
  verified: { label: 'Verified',    color: '#2563EB', bg: '#EFF6FF', icon: '✓' },
  top:      { label: 'Top Expert',  color: '#D97706', bg: '#FFFBEB', icon: '⭐' },
  elite:    { label: 'Elite Expert',color: '#7C3AED', bg: '#F5F3FF', icon: '👑' },
}

export function ExpertLevelBadge({ level }: { level: string }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.beginner
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}20`,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

// ── Star Rating ────────────────────────────────────────────────────────────
export function StarRating({ rating, max = 5, size = 14 }: { rating: number; max?: number; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < Math.round(rating) ? '#F59E0B' : '#E2E8F0'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span style={{ fontSize: 12, color: '#64748B', marginLeft: 4, fontWeight: 600 }}>{Number(rating).toFixed(1)}</span>
    </div>
  )
}

// ── Software Label ─────────────────────────────────────────────────────────
const SW: Record<string, { label: string; color: string }> = {
  matlab:   { label: 'MATLAB', color: '#D97706' },
  proteus:  { label: 'Proteus', color: '#2563EB' },
  ansys:    { label: 'ANSYS', color: '#DC2626' },
  labview:  { label: 'LabVIEW', color: '#059669' },
  multisim: { label: 'Multisim', color: '#7C3AED' },
  pscad:    { label: 'PSCAD', color: '#0891B2' },
  etap:     { label: 'ETAP', color: '#BE185D' },
  hfss:     { label: 'HFSS', color: '#1D4ED8' },
  cst:      { label: 'CST', color: '#9333EA' },
  other:    { label: 'Other', color: '#64748B' },
}

export function SoftwareLabel({ software }: { software: string }) {
  const cfg = SW[software] || SW.other
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: cfg.color + '12', color: cfg.color, border: `1px solid ${cfg.color}25`,
    }}>
      {cfg.label}
    </span>
  )
}

// ── Delivery Badge ─────────────────────────────────────────────────────────
const DEL: Record<string, { label: string; color: string; bg: string }> = {
  standard: { label: 'Standard',     color: '#64748B', bg: '#F8FAFC' },
  urgent:   { label: 'Urgent 24h',   color: '#D97706', bg: '#FFFBEB' },
  express:  { label: 'Express 6-12h', color: '#DC2626', bg: '#FFF1F2' },
}

export function DeliveryBadge({ type }: { type: string }) {
  const cfg = DEL[type] || DEL.standard
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}20`,
    }}>
      {cfg.label}
    </span>
  )
}

// ── Page Header ────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
      <div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: '#94A3B8', margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '22px 24px',
      border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Section Title ──────────────────────────────────────────────────────────
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 16px' }}>
      {children}
    </h2>
  )
}

// ── Button ─────────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Btn({ variant = 'primary', size = 'md', children, style, ...rest }: BtnProps) {
  const variants = {
    primary: { background: '#0B1C3D', color: '#fff', border: 'none' },
    accent:  { background: '#0EA5E9', color: '#fff', border: 'none' },
    danger:  { background: '#EF4444', color: '#fff', border: 'none' },
    ghost:   { background: 'transparent', color: '#64748B', border: '1px solid transparent' },
    outline: { background: '#fff', color: '#374151', border: '1.5px solid #E2E8F0' },
  }
  const sizes = {
    sm: { padding: '6px 14px', fontSize: 12 },
    md: { padding: '9px 18px', fontSize: 13 },
    lg: { padding: '12px 24px', fontSize: 15 },
  }
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      borderRadius: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, cursor: 'pointer',
      transition: 'all .2s', ...variants[variant], ...sizes[size],
      opacity: rest.disabled ? 0.55 : 1, ...style,
    }} {...rest}>
      {children}
    </button>
  )
}

// ── Table ──────────────────────────────────────────────────────────────────
export function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid #F1F5F9' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
            {headers.map(h => (
              <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Tr({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr onClick={onClick} style={{ borderBottom: '1px solid #F8FAFC', cursor: onClick ? 'pointer' : 'default', transition: 'background .15s' }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLTableRowElement).style.background = '#F8FAFC' }}
      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = '' }}>
      {children}
    </tr>
  )
}

export function Td({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: '12px 16px', color: '#374151', verticalAlign: 'middle', ...style }}>{children}</td>
}

// ── Alert Box ──────────────────────────────────────────────────────────────
type AlertType = 'info' | 'success' | 'warning' | 'danger'
const ALERT: Record<AlertType, { bg: string; border: string; color: string; icon: string }> = {
  info:    { bg: '#EFF6FF', border: '#BFDBFE', color: '#1D4ED8', icon: 'ℹ️' },
  success: { bg: '#F0FDF4', border: '#BBF7D0', color: '#059669', icon: '✅' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', icon: '⚠️' },
  danger:  { bg: '#FFF1F2', border: '#FECDD3', color: '#E11D48', icon: '🚫' },
}

export function Alert({ type = 'info', title, body, action }: { type?: AlertType; title: string; body?: string; action?: React.ReactNode }) {
  const cfg = ALERT[type]
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: cfg.color, margin: 0, fontFamily: 'Syne, sans-serif' }}>{title}</p>
          {body && <p style={{ fontSize: 12, color: cfg.color + 'CC', margin: '3px 0 0', lineHeight: 1.5 }}>{body}</p>}
        </div>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}
