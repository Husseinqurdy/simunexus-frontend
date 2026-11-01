import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban, Briefcase, MessageSquare, Wallet, UserCircle, Users, BadgeDollarSign,
  ClipboardCheck, ListChecks, Images, Settings, ShieldCheck, Percent, Server, LogOut, Menu, X, ChevronDown,
  PanelLeftClose, PanelLeftOpen, Plus, Search, type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/client'
import NotificationBell from '@/components/shared/NotificationBell'
import { GSHLogo } from '@/pages/auth/_shared'

type Item = { to: string; label: string; icon: LucideIcon; end?: boolean }
type Group = { label: string; items: Item[] }

const ROLE_HOME: Record<string, string> = { client: '/client', expert: '/expert', admin: '/admin', developer: '/developer' }
const ROLE_LABEL: Record<string, string> = { client: 'Client', expert: 'Expert', admin: 'Admin', developer: 'Developer' }

function navGroups(role: string): Group[] {
  if (role === 'client') return [{ label: 'Menu', items: [
    { to: '/client', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/client/projects', label: 'My Projects', icon: FolderKanban },
    { to: '/client/chat', label: 'Messages', icon: MessageSquare },
    { to: '/client/wallet', label: 'Wallet', icon: Wallet },
    { to: '/client/profile', label: 'Profile', icon: UserCircle },
  ] }]
  if (role === 'expert') return [{ label: 'Menu', items: [
    { to: '/expert', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/expert/job-board', label: 'Job Board', icon: Briefcase },
    { to: '/expert/projects', label: 'My Projects', icon: FolderKanban },
    { to: '/expert/chat', label: 'Messages', icon: MessageSquare },
    { to: '/expert/profile', label: 'Profile', icon: UserCircle },
  ] }]
  const adminItems: Group[] = [
    { label: 'Overview', items: [
      { to: '/admin', label: 'Command Center', icon: LayoutDashboard, end: true },
      { to: '/admin/projects', label: 'All Projects', icon: FolderKanban },
      { to: '/admin/chat', label: 'Messages', icon: MessageSquare },
    ] },
    { label: 'Manage', items: [
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/financials', label: 'Financials', icon: BadgeDollarSign },
      { to: '/admin/recruitment', label: 'Recruitment', icon: ClipboardCheck },
    ] },
    { label: 'Content', items: [
      { to: '/admin/test-bank', label: 'Test Bank', icon: ListChecks },
      { to: '/admin/landing-media', label: 'Landing Media', icon: Images },
    ] },
  ]
  if (role === 'admin') return adminItems
  if (role === 'developer') return [
    { label: 'Developer', items: [
      { to: '/developer', label: 'Dev Dashboard', icon: LayoutDashboard, end: true },
      { to: '/developer/commissions', label: 'Commissions', icon: Percent },
      { to: '/developer/system', label: 'System', icon: Server },
    ] },
    { label: 'Admin tools', items: [
      { to: '/admin', label: 'Admin View', icon: ShieldCheck, end: true },
      { to: '/admin/recruitment', label: 'Recruitment', icon: ClipboardCheck },
      { to: '/admin/test-bank', label: 'Test Bank', icon: ListChecks },
      { to: '/admin/landing-media', label: 'Landing Media', icon: Images },
    ] },
  ]
  return []
}

const QUICK: Record<string, { to: string; label: string; icon: LucideIcon } | undefined> = {
  client: { to: '/client/projects/new', label: 'New project', icon: Plus },
  expert: { to: '/expert/job-board', label: 'Find jobs', icon: Search },
}

function SidebarNav({ groups, onNavigate }: { groups: Group[]; onNavigate: () => void }) {
  return (
    <nav className="nav-scroll" aria-label="Main navigation">
      {groups.map(g => (
        <div key={g.label}>
          {groups.length > 1 && <div className="nav-group-label"><span>{g.label}</span></div>}
          {g.items.map(it => (
            <NavLink key={it.to} to={it.to} end={it.end} title={it.label} onClick={onNavigate}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-ico"><it.icon size={19} strokeWidth={1.9} /></span>
              <span className="nav-label">{it.label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

function UserMenu({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const role = user?.role || 'client'
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'Account'
  const initials = (user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()
  const avatar = (user as any)?.avatar ?? undefined
  const profilePath = role === 'client' ? '/client/profile' : role === 'expert' ? '/expert/profile' : null

  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
  }, [open])

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span className="avatar">{avatar ? <img src={avatar} alt="" /> : initials}</span>
        <span className="user-meta"><b>{user?.first_name || name}</b><small>{ROLE_LABEL[role]}</small></span>
        <ChevronDown size={16} className="chev" data-open={open} />
      </button>
      {open && (
        <div className="menu-pop" role="menu">
          <div className="menu-head">
            <span className="avatar lg">{avatar ? <img src={avatar} alt="" /> : initials}</span>
            <div style={{ minWidth: 0 }}>
              <div className="menu-name">{name}</div>
              <div className="menu-mail">{user?.email}</div>
            </div>
          </div>
          {profilePath && (
            <Link to={profilePath} role="menuitem" className="menu-item" onClick={() => setOpen(false)}><UserCircle size={17} /> My profile</Link>
          )}
          <button role="menuitem" className="menu-item danger" onClick={() => { setOpen(false); onLogout() }}><LogOut size={17} /> Log out</button>
        </div>
      )}
    </div>
  )
}

export default function DashboardLayout() {
  const { user, logout, refreshToken, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem('gsh-sidebar') === '1' } catch { return false } })

  const role = user?.role || 'client'
  const groups = useMemo(() => navGroups(role), [role])
  const flat = groups.flatMap(g => g.items)
  const quick = QUICK[role]

  const handleLogout = async () => {
    try { if (refreshToken) await authApi.logout(refreshToken) } catch { /* endelea kutoka hata seva ikikataa */ }
    logout()
    navigate('/login')
  }

  // Sasisha taarifa za mtumiaji kutoka seva mara moja kwa kikao: profile %, role mpya (mf. expert aliyepitishwa)
  useEffect(() => {
    authApi.me().then(r => {
      const fresh = r.data
      if (user && fresh.role !== user.role) {
        updateUser(fresh)
        window.location.replace(ROLE_HOME[fresh.role as string] || '/')
      } else updateUser(fresh)
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => { try { localStorage.setItem('gsh-sidebar', collapsed ? '1' : '0') } catch { /* private mode */ } }, [collapsed])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Kichwa cha ukurasa: kiungo kinacholingana zaidi na njia ya sasa
  const current = [...flat].sort((a, b) => b.to.length - a.to.length).find(i => pathname === i.to || pathname.startsWith(i.to + '/'))
  const isHome = pathname === ROLE_HOME[role]
  const title = isHome ? `Welcome back${user?.first_name ? ', ' + user.first_name : ''}` : current?.label || 'Dashboard'
  const crumb = isHome ? 'Here is what is happening today' : `${ROLE_LABEL[role]} · ${current?.label || ''}`

  const showProfileCard = role === 'client' && user && !user.is_profile_complete
  const pct = user?.profile_completion ?? 0

  return (
    <div className="app-shell" data-collapsed={collapsed}>
      <aside className="app-sidebar" data-open={open} aria-label="Sidebar">
        <div className="side-brand">
          <Link to={ROLE_HOME[role]} className="brand-link" aria-label="Home">
            <span className="brand-tile"><GSHLogo size={28} /></span>
            <span className="brand-text"><b>Global Simulation Hub</b><small>{ROLE_LABEL[role]} portal</small></span>
          </Link>
          <button className="icon-btn mobile-only" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>

        <SidebarNav groups={groups} onNavigate={() => setOpen(false)} />

        <div className="side-foot">
          {showProfileCard && (
            <Link to="/client/profile" className="profile-card" title="Complete your profile">
              <div className="pc-top"><span>Complete your profile</span><b>{pct}%</b></div>
              <div className="pc-bar"><i style={{ width: `${pct}%` }} /></div>
              <small>Reach 100% to unlock downloads</small>
            </Link>
          )}
          <button className="collapse-btn desktop-only" onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}<span className="nav-label">Collapse</span>
          </button>
        </div>
      </aside>

      <div className="app-scrim" data-open={open} onClick={() => setOpen(false)} />

      <div className="app-main">
        <header className="app-topbar">
          <button className="icon-btn mobile-only" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="top-title">
            <h1 key={title}>{title}</h1>
            <p key={crumb}>{crumb}</p>
          </div>
          <div className="top-actions">
            {quick && <Link to={quick.to} className="quick-btn"><quick.icon size={16} strokeWidth={2.4} /><span>{quick.label}</span></Link>}
            <NotificationBell />
            <UserMenu onLogout={handleLogout} />
          </div>
        </header>
        <main className="app-content" key={pathname}><Outlet /></main>
      </div>
    </div>
  )
}
