import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/client'
import { useState, useEffect } from 'react'
import NotificationBell from '@/components/shared/NotificationBell'

// ── GSH Logo ───────────────────────────────────────────────────────────────
function GSHLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="url(#dlg)" />
      <path d="M8 20C8 13.37 13.37 8 20 8C23.5 8 26.67 9.43 29 11.76" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 20H26V26C26 27.1 25.1 28 24 28H20V20Z" fill="white" fillOpacity="0.9" />
      <path d="M14 20H20V28H16C14.9 28 14 27.1 14 26V20Z" fill="white" fillOpacity="0.6" />
      <circle cx="29" cy="12" r="3" fill="#38BDF8" /><circle cx="29" cy="12" r="1.5" fill="white" />
      <defs>
        <linearGradient id="dlg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B1C3D" /><stop offset="1" stopColor="#1A3A7A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────
const icons: Record<string, JSX.Element> = {
  dashboard: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  projects:  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>,
  jobboard:  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  chat:      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>,
  wallet:    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3m18-3V6" /></svg>,
  profile:   <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  users:     <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  financial: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>,
  recruit:   <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
  settings:  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  logout:    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>,
  menu:      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>,
  close:     <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
}

// ── Nav config per role ────────────────────────────────────────────────────
function navLinks(role: string) {
  if (role === 'client') return [
    { to: '/client', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/client/projects', label: 'My Projects', icon: 'projects' },
    { to: '/client/chat', label: 'Messages', icon: 'chat' },
    { to: '/client/wallet', label: 'Wallet', icon: 'wallet' },
    { to: '/client/profile', label: 'Profile', icon: 'profile' },
  ]
  if (role === 'expert') return [
    { to: '/expert', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/expert/job-board', label: 'Job Board', icon: 'jobboard' },
    { to: '/expert/projects', label: 'My Projects', icon: 'projects' },
    { to: '/expert/chat', label: 'Messages', icon: 'chat' },
    { to: '/expert/profile', label: 'Profile', icon: 'profile' },
  ]
  if (role === 'admin') return [
    { to: '/admin', label: 'Command Center', icon: 'dashboard', end: true },
    { to: '/admin/projects', label: 'All Projects', icon: 'projects' },
    { to: '/admin/users', label: 'Users', icon: 'users' },
    { to: '/admin/financials', label: 'Financials', icon: 'financial' },
    { to: '/admin/recruitment', label: 'Recruitment', icon: 'recruit' },
    { to: '/admin/chat', label: 'Messages', icon: 'chat' },
  ]
  if (role === 'developer') return [
    { to: '/developer', label: 'Dev Dashboard', icon: 'dashboard', end: true },
    { to: '/admin', label: 'Admin View', icon: 'settings' },
    { to: '/developer/commissions', label: 'Commissions', icon: 'financial' },
    { to: '/developer/system', label: 'System', icon: 'settings' },
  ]
  return []
}

const ROLE_COLOR: Record<string, string> = {
  client: '#0EA5E9', expert: '#10B981', admin: '#8B5CF6', developer: '#F59E0B'
}
const ROLE_BG: Record<string, string> = {
  client: 'rgba(14,165,233,.1)', expert: 'rgba(16,185,129,.1)', admin: 'rgba(139,92,246,.1)', developer: 'rgba(245,158,11,.1)'
}

export default function DashboardLayout() {
  const { user, logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const role = user?.role || 'client'
  const links = navLinks(role)
  const roleColor = ROLE_COLOR[role]
  const roleBg = ROLE_BG[role]

  const handleLogout = async () => {
    try { if (refreshToken) await authApi.logout(refreshToken) } catch {}
    logout()
    navigate('/login')
  }

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [])

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0B1C3D', padding: '0' }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 16px' : '20px 20px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <GSHLogo size={32} />
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, lineHeight: 1.2, whiteSpace: 'nowrap' }}>Global Simulation</div>
              <div style={{ color: '#38BDF8', fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Hub — GSH</div>
            </div>
          )}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.3)', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            }
          </svg>
        </button>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {links.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '10px 12px' : '10px 14px',
            borderRadius: 10, marginBottom: 2, textDecoration: 'none', transition: 'all .2s',
            background: isActive ? roleBg : 'transparent',
            color: isActive ? roleColor : 'rgba(255,255,255,.45)',
            borderLeft: isActive ? `3px solid ${roleColor}` : '3px solid transparent',
          })}>
            <span style={{ flexShrink: 0 }}>{icons[icon]}</span>
            {!collapsed && <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '14px 10px' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginBottom: 4, background: 'rgba(255,255,255,.03)', borderRadius: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: roleBg, border: `1.5px solid ${roleColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: roleColor, fontWeight: 700, fontSize: 13, fontFamily: 'Syne,sans-serif', flexShrink: 0 }}>
              {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Syne,sans-serif' }}>
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email}
              </p>
              <span style={{ fontSize: 10, color: roleColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{role}</span>
            </div>
          </div>
        )}
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: collapsed ? '10px 12px' : '10px 14px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,.6)', fontSize: 13, fontWeight: 500, transition: 'all .2s', textAlign: 'left' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,.6)' }}>
          <span style={{ flexShrink: 0 }}>{icons.logout}</span>
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      {/* Desktop sidebar */}
      <div style={{ width: collapsed ? 70 : 230, flexShrink: 0, transition: 'width .25s ease', display: 'none', position: 'sticky', top: 0, height: '100vh' }} className="lg-sidebar">
        <SidebarContent />
      </div>
      <style>{`.lg-sidebar { display: flex !important; flex-direction: column; } @media(max-width:768px){.lg-sidebar{display:none !important;}}`}</style>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ width: 230, flexShrink: 0, height: '100vh' }}><SidebarContent /></div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #F1F5F9', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile hamburger */}
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4, display: 'flex', alignItems: 'center' }} className="mobile-menu-btn">
              {icons.menu}
            </button>
            <style>{`.mobile-menu-btn { display: none !important; } @media(max-width:768px){.mobile-menu-btn{display:flex !important;}}`}</style>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>GSH</span>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#CBD5E1" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              <span style={{ fontSize: 13, color: '#475569', fontWeight: 500, textTransform: 'capitalize' }}>{role} Portal</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Online indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 999, padding: '4px 12px' }}>
              <span style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Online</span>
            </div>

            <NotificationBell />

            {/* Avatar */}
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: roleBg, border: `2px solid ${roleColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: roleColor, fontWeight: 700, fontSize: 13, fontFamily: 'Syne,sans-serif', cursor: 'default' }}>
              {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 28px', overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
