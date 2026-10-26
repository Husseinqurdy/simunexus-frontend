import type { ProjectStatus } from '@/types'
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Circle,
  Check,
  Star,
  Crown,
  Inbox,
} from 'lucide-react'

// ── Status Badge ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProjectStatus, { label: string; bg: string; color: string; dot: string }> = {
  received:    { label: 'Received',     bg: '#F5F7FC', color: '#4E5E82', dot: '#667697' },
  assigned:    { label: 'Assigned',     bg: '#EAF1FD', color: '#0D52CE', dot: '#3F7BE0' },
  in_progress: { label: 'In Progress',  bg: '#FFF8E6', color: '#B85F00', dot: '#E5A00D' },
  qc:          { label: 'Quality Check', bg: '#EEF2FB', color: '#2E4DA7', dot: '#3F5FB8' },
  completed:   { label: 'Completed',    bg: '#EDF8F1', color: '#137A4E', dot: '#1B9B63' },
  revision:    { label: 'Revision',     bg: '#FDEDED', color: '#B92D2D', dot: '#D03A3A' },
  cancelled:   { label: 'Cancelled',    bg: '#F5F7FC', color: '#4E5E82', dot: '#667697' },
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.received
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.dot}20`,
      transition: 'all .15s',
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

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '18px 20px',
      border: '1px solid #DCE3F0', boxShadow: '0 1px 3px rgba(10,31,107,.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#4E5E82', margin: 0 }}>{label}</p>
        {icon && (
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EAF1FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D52CE', flexShrink: 0 }}>
            {icon}
          </div>
        )}
      </div>
      <p style={{ fontSize: 24, fontWeight: 700, color: '#0A1F4D', margin: 0, lineHeight: 1.2 }}>{value}</p>
      {trend && (
        <p style={{ fontSize: 12, color: trend.value >= 0 ? '#137A4E' : '#B92D2D', margin: '8px 0 0', fontWeight: 600 }}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  )
}

// ── Progress Bar ───────────────────────────────────────────────────────────
export function ProgressBar({ percentage, color = '#0D52CE', height = 6 }: { percentage: number; color?: string; height?: number }) {
  const pct = Math.min(Math.max(percentage, 0), 100)
  return (
    <div style={{ width: '100%', height, background: '#EBEFF8', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${pct}%`, borderRadius: 999,
        background: pct >= 80 ? '#1B9B63' : pct >= 40 ? color : '#9A5B00',
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
        border: `${size === 'sm' ? 2 : 3}px solid #DCE3F0`,
        borderTop: `${size === 'sm' ? 2 : 3}px solid #0D52CE`,
        animation: 'spin .7s linear infinite',
      }} />
      {label && <p style={{ color: '#667697', fontSize: 13, margin: 0 }}>{label}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body, action }: { icon?: React.ReactNode; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', animation: 'fadeIn .3s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(0); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{ width: 56, height: 56, borderRadius: 12, background: '#EBEFF8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#667697' }}>
        {icon || <Inbox size={26} strokeWidth={1.8} />}
      </div>
      <p style={{ fontFamily: 'inherit', fontSize: 18, fontWeight: 700, color: '#12245A', margin: '0 0 8px' }}>{title}</p>
      {body && <p style={{ fontSize: 14, color: '#667697', margin: '0 0 24px', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>{body}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}

// ── Expert Level Badge ────────────────────────────────────────────────────
const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  beginner: { label: 'Beginner',     color: '#4E5E82', bg: '#F5F7FC', Icon: Circle },
  verified: { label: 'Verified',     color: '#0D52CE', bg: '#EAF1FD', Icon: Check },
  top:      { label: 'Top Expert',   color: '#B85F00', bg: '#FFF8E6', Icon: Star },
  elite:    { label: 'Elite Expert', color: '#2E4DA7', bg: '#EEF2FB', Icon: Crown },
}

export function ExpertLevelBadge({ level }: { level: string }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.beginner
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}20`,
    }}>
      <cfg.Icon size={12} strokeWidth={2.4} />
      {cfg.label}
    </span>
  )
}

// ── Star Rating ────────────────────────────────────────────────────────────
export function StarRating({ rating, max = 5, size = 14 }: { rating: number; max?: number; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < Math.round(rating) ? '#E5A00D' : '#DCE3F0'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span style={{ fontSize: 12, color: '#4E5E82', marginLeft: 4, fontWeight: 600 }}>{Number(rating).toFixed(1)}</span>
    </div>
  )
}

// ── Software Label ─────────────────────────────────────────────────────────
const SW: Record<string, { label: string; color: string }> = {
  matlab:   { label: 'MATLAB', color: '#B85F00' },
  proteus:  { label: 'Proteus', color: '#0D52CE' },
  ansys:    { label: 'ANSYS', color: '#B92D2D' },
  labview:  { label: 'LabVIEW', color: '#137A4E' },
  multisim: { label: 'Multisim', color: '#2E4DA7' },
  pscad:    { label: 'PSCAD', color: '#0D52CE' },
  etap:     { label: 'ETAP', color: '#B92D2D' },
  hfss:     { label: 'HFSS', color: '#0A42A8' },
  cst:      { label: 'CST', color: '#2E4DA7' },
  other:    { label: 'Other', color: '#4E5E82' },
}

export function SoftwareLabel({ software }: { software: string }) {
  const cfg = SW[software] || SW.other
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
      background: cfg.color + '12', color: cfg.color, border: `1px solid ${cfg.color}25`,
    }}>
      {cfg.label}
    </span>
  )
}

// ── Delivery Badge ─────────────────────────────────────────────────────────
const DEL: Record<string, { label: string; color: string; bg: string }> = {
  standard: { label: 'Standard',     color: '#4E5E82', bg: '#F5F7FC' },
  urgent:   { label: 'Urgent 24h',   color: '#B85F00', bg: '#FFF8E6' },
  express:  { label: 'Express 6-12h', color: '#B92D2D', bg: '#FDEDED' },
}

export function DeliveryBadge({ type }: { type: string }) {
  const cfg = DEL[type] || DEL.standard
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
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
        <h1 style={{ fontFamily: 'inherit', fontSize: 24, fontWeight: 700, color: '#0A1F4D', margin: 0, lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: '#667697', margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{
      background: '#fff', borderRadius: 12, padding: '22px 24px',
      border: '1px solid #DCE3F0', boxShadow: '0 1px 3px rgba(10,31,107,.06)',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Section Title ──────────────────────────────────────────────────────────
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: 'inherit', fontSize: 16, fontWeight: 600, color: '#0A1F4D', margin: '0 0 16px' }}>
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

export function Btn({ variant = 'primary', size = 'md', children, style, className, ...rest }: BtnProps) {
  // 'primary' na 'accent' ni rangi moja (royal blue) — kitufe kimoja cha hatua kuu kila mahali
  const v = variant === 'accent' ? 'primary' : variant
  const sizes = {
    sm: { padding: '0 12px', height: 32, fontSize: 13 },
    md: { padding: '0 16px', height: 38, fontSize: 14 },
    lg: { padding: '0 22px', height: 44, fontSize: 14 },
  }
  return (
    <button className={`gsh-btn gsh-btn-${v}${className ? ' ' + className : ''}`} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      borderRadius: 8, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer',
      ...sizes[size], opacity: rest.disabled ? 0.55 : 1, ...style,
    }} {...rest}>
      {children}
    </button>
  )
}

// ── Table ──────────────────────────────────────────────────────────────────
export function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #DCE3F0', background: '#fff' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#F5F7FC', borderBottom: '1px solid #DCE3F0' }}>
            {headers.map(h => (
              <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#4E5E82', fontSize: 13, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Tr({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr onClick={onClick} className={className} style={{ borderBottom: '1px solid #EBEFF8', cursor: onClick ? 'pointer' : 'default', transition: 'background .15s' }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLTableRowElement).style.background = '#F5F7FC' }}
      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = '' }}>
      {children}
    </tr>
  )
}

export function Td({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: '12px 16px', color: '#2B3A60', verticalAlign: 'middle', ...style }}>{children}</td>
}

// ── Alert Box ──────────────────────────────────────────────────────────────
type AlertType = 'info' | 'success' | 'warning' | 'danger'
const ALERT: Record<AlertType, { bg: string; border: string; color: string; Icon: React.ElementType }> = {
  info:    { bg: '#EAF1FD', border: '#C4DBF1', color: '#0A42A8', Icon: Info },
  success: { bg: '#EDF8F1', border: '#BFE5CF', color: '#137A4E', Icon: CheckCircle2 },
  warning: { bg: '#FFF8E6', border: '#F8DC8A', color: '#B85F00', Icon: AlertTriangle },
  danger:  { bg: '#FDEDED', border: '#F3C7C7', color: '#B92D2D', Icon: XCircle },
}

export function Alert({ type = 'info', title, body, action }: { type?: AlertType; title: string; body?: string; action?: React.ReactNode }) {
  const cfg = ALERT[type]
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, animation: 'fadeIn .25s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(0); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{ display: 'flex', gap: 10 }}>
        <cfg.Icon size={17} strokeWidth={2} color={cfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: cfg.color, margin: 0, fontFamily: 'inherit' }}>{title}</p>
          {body && <p style={{ fontSize: 12, color: cfg.color + 'CC', margin: '3px 0 0', lineHeight: 1.5 }}>{body}</p>}
        </div>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}