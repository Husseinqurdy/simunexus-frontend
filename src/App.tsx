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

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout'

// Client
import ClientDashboard from '@/pages/client/ClientDashboard'
import ClientProjects from '@/pages/client/ClientProjects'
import ClientProjectDetail from '@/pages/client/ClientProjectDetail'
import ClientProfile from '@/pages/client/ClientProfile'
import ClientChat from '@/pages/client/ClientChat'
import ClientWallet from '@/pages/client/ClientWallet'

// Expert
import ExpertDashboard from '@/pages/expert/ExpertDashboard'
import ExpertJobBoard from '@/pages/expert/ExpertJobBoard'
import ExpertProjects from '@/pages/expert/ExpertProjects'
import ExpertProjectDetail from '@/pages/expert/ExpertProjectDetail'
import ExpertProfile from '@/pages/expert/ExpertProfile'
import ExpertChat from '@/pages/expert/ExpertChat'

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

// Recruitment
import ApplyExpertPage from '@/pages/public/ApplyExpertPage'

interface GuardProps { roles: Role[]; children: React.ReactNode }

function RoleGuard({ roles, children }: GuardProps) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user || !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return <>{children}</>
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
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
        <Route path="/submit" element={<SubmitProjectPublicPage />} />
        <Route path="/apply-expert" element={<ApplyExpertPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/unauthorized" element={<div className="flex items-center justify-center min-h-screen text-gray-600 text-xl">Access Denied</div>} />

        {/* Auth */}
        <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
        <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />

        {/* Client */}
        <Route path="/client" element={<RoleGuard roles={['client']}><DashboardLayout /></RoleGuard>}>
          <Route index element={<ClientDashboard />} />
          <Route path="projects" element={<ClientProjects />} />
          <Route path="projects/:id" element={<ClientProjectDetail />} />
          <Route path="chat" element={<ClientChat />} />
          <Route path="wallet" element={<ClientWallet />} />
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
