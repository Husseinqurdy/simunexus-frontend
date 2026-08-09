import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import SetPasswordPage from '@/pages/auth/SetPasswordPage'

// Public
import LandingPage from '@/pages/public/LandingPage'
import SubmitProjectPublicPage from '@/pages/public/SubmitProjectPublicPage'
import ApplyExpertPage from '@/pages/public/ApplyExpertPage'
import RegisterExpertPage from '@/pages/auth/RegisterExpertPage'

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout'

// Client
import ClientDashboard from '@/pages/client/ClientDashboard'
import ClientProjects from '@/pages/client/ClientProjects'
import ClientProjectDetail from '@/pages/client/ClientProjectDetail'
import ClientProfile from '@/pages/client/ClientProfile'
import ClientChat from '@/pages/client/ClientChat'
import ClientWallet from '@/pages/client/ClientWallet'
import ClientSubmitProject from '@/pages/client/ClientSubmitProject'
import TopUpComplete from '@/pages/client/TopUpComplete'

// Expert
import ExpertDashboard from '@/pages/expert/ExpertDashboard'
import ExpertJobBoard from '@/pages/expert/ExpertJobBoard'
import ExpertProjects from '@/pages/expert/ExpertProjects'
import ExpertProjectDetail from '@/pages/expert/ExpertProjectDetail'
import ExpertProfile from '@/pages/expert/ExpertProfile'
import ExpertChat from '@/pages/expert/ExpertChat'
import ExpertApplyPage from '@/pages/expert/ExpertApplyPage'
import ExpertTestPage from '@/pages/expert/ExpertTestPage'


// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminProjects from '@/pages/admin/AdminProjects'
import AdminProjectDetail from '@/pages/admin/AdminProjectDetail'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminFinancials from '@/pages/admin/AdminFinancials'
import AdminRecruitment from '@/pages/admin/AdminRecruitment'
import AdminChat from '@/pages/admin/AdminChat'

// Developer
import DevDashboard from '@/pages/developer/DevDashboard'
import DevCommissions from '@/pages/developer/DevCommissions'
import DevSystemControl from '@/pages/developer/DevSystemControl'

interface GuardProps { roles: Role[]; children: React.ReactNode }

function RoleGuard({ roles, children }: GuardProps) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user || !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return <>{children}</>
}

// Guard maalum kwa ExpertApply — inaruhusu client NA expert (client anaweza omba kuwa expert)
function ExpertApplyGuard() {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login?from=expert" replace />
  // Admin/Developer hawawezi apply
  if (user?.role === 'admin' || user?.role === 'developer') {
    return <Navigate to="/unauthorized" replace />
  }
  return <ExpertApplyPage />
}

// Guard kwa Test page — client aliyeomba au expert
function ExpertTestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login?from=expert" replace />
  if (user?.role === 'admin' || user?.role === 'developer') {
    return <Navigate to="/unauthorized" replace />
  }
  return <>{children}</>
}

function SmartSubmitRoute() {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated && user?.role === 'client') {
    return <Navigate to="/client/projects/new" replace />
  }
  return <SubmitProjectPublicPage />
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  const params = new URLSearchParams(window.location.search)
  const fromExpert = params.get('from') === 'expert'

  // Kama alikuja kutoka apply-expert na ameingia tayari → peleka /expert/apply moja kwa moja
  if (isAuthenticated && user && fromExpert) {
    if (user.role === 'admin' || user.role === 'developer') {
      return <Navigate to="/unauthorized" replace />
    }
    return <Navigate to="/expert/apply" replace />
  }

  if (isAuthenticated && user) {
    const roleHome: Record<Role, string> = {
      client: '/client', expert: '/expert', admin: '/admin', developer: '/developer'
    }
    return <Navigate to={roleHome[user.role]} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/submit" element={<SmartSubmitRoute />} />
        <Route path="/apply-expert" element={<ApplyExpertPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/unauthorized" element={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748B', fontSize: 18 }}>
            Access Denied
          </div>
        } />

        {/* Auth */}
        <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
        <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />

        {/* ✅ Expert Apply & Test — nje ya dashboard, inaruhusu client pia */}
        <Route path="/expert/apply" element={<ExpertApplyGuard />} />
        <Route path="/expert/test/:id" element={<ExpertTestGuard><ExpertTestPage /></ExpertTestGuard>} />
        <Route path="/register-expert" element={<RegisterExpertPage />} />

        {/* Client */}
        <Route path="/client" element={<RoleGuard roles={['client']}><DashboardLayout /></RoleGuard>}>
          <Route index element={<ClientDashboard />} />
          <Route path="projects" element={<ClientProjects />} />
          <Route path="projects/new" element={<ClientSubmitProject />} />
          <Route path="projects/:id" element={<ClientProjectDetail />} />
          <Route path="chat" element={<ClientChat />} />
          <Route path="wallet" element={<ClientWallet />} />
          <Route path="wallet/topup-complete" element={<TopUpComplete />} />   {/* MPYA */}
          <Route path="profile" element={<ClientProfile />} />
        </Route>

        {/* Expert */}
        <Route path="/expert" element={<RoleGuard roles={['expert']}><DashboardLayout /></RoleGuard>}>
          <Route index element={<ExpertDashboard />} />
          <Route path="job-board" element={<ExpertJobBoard />} />
          <Route path="projects" element={<ExpertProjects />} />
          <Route path="projects/:id" element={<ExpertProjectDetail />} />
          <Route path="chat" element={<ExpertChat />} />
          <Route path="profile" element={<ExpertProfile />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<RoleGuard roles={['admin', 'developer']}><DashboardLayout /></RoleGuard>}>
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/:id" element={<AdminProjectDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="financials" element={<AdminFinancials />} />
          <Route path="recruitment" element={<AdminRecruitment />} />
          <Route path="chat" element={<AdminChat />} />
        </Route>

        {/* Developer */}
        <Route path="/developer" element={<RoleGuard roles={['developer']}><DashboardLayout /></RoleGuard>}>
          <Route index element={<DevDashboard />} />
          <Route path="commissions" element={<DevCommissions />} />
          <Route path="system" element={<DevSystemControl />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
