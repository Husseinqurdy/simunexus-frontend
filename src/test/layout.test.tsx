import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const logout = vi.fn()
const user = { id: 1, email: 'ann@x.com', first_name: 'Ann', last_name: 'Lee', role: 'client', is_profile_complete: false, profile_completion: 62 }

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({ user, logout, refreshToken: 'r', updateUser: vi.fn() }),
}))
vi.mock('@/api/client', () => ({ authApi: { me: vi.fn(() => Promise.resolve({ data: user })), logout: vi.fn(() => Promise.resolve({})) } }))
vi.mock('@/components/shared/NotificationBell', () => ({ default: () => <button aria-label="Notifications" /> }))

import { authApi } from '@/api/client'
import DashboardLayout from '@/components/layout/DashboardLayout'

const mount = (path = '/client/projects') => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/login" element={<div>login page</div>} />
      <Route element={<DashboardLayout />}>
        <Route path="/client" element={<div>home</div>} />
        <Route path="/client/projects" element={<div>projects page</div>} />
      </Route>
    </Routes>
  </MemoryRouter>,
)
beforeEach(() => vi.clearAllMocks())

describe('Dashboard layout', () => {
  it('has Log out in the topbar user menu, NOT in the sidebar', async () => {
    const u = userEvent.setup()
    mount()
    const sidebar = screen.getByRole('complementary', { name: /sidebar/i })
    expect(within(sidebar).queryByText(/log ?out/i)).toBeNull()

    const header = screen.getByRole('banner')
    await u.click(within(header).getByRole('button', { name: /ann/i }))
    const item = await screen.findByRole('menuitem', { name: /log out/i })
    expect(header.contains(item)).toBe(true)

    await u.click(item)
    await waitFor(() => expect(authApi.logout).toHaveBeenCalledWith('r'))
    expect(logout).toHaveBeenCalled()
    expect(await screen.findByText('login page')).toBeInTheDocument()
  })

  it('user menu closes with Escape', async () => {
    const u = userEvent.setup()
    mount()
    await u.click(within(screen.getByRole('banner')).getByRole('button', { name: /ann/i }))
    expect(await screen.findByRole('menu')).toBeInTheDocument()
    await u.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('shows the page title, active nav item and role quick action', () => {
    mount('/client/projects')
    expect(screen.getByRole('heading', { level: 1, name: 'My Projects' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /my projects/i })).toHaveClass('active')
    expect(screen.getByRole('link', { name: /new project/i })).toHaveAttribute('href', '/client/projects/new')
  })

  it('greets the user on the dashboard home and shows the profile progress card', () => {
    mount('/client')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome back, Ann')
    expect(screen.getByText(/complete your profile/i, { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('62%')).toBeInTheDocument()
  })

  it('sidebar collapses and the choice is remembered', async () => {
    const u = userEvent.setup()
    mount()
    const shell = document.querySelector('.app-shell')!
    expect(shell).toHaveAttribute('data-collapsed', 'false')
    await u.click(screen.getByRole('button', { name: /collapse sidebar/i }))
    expect(shell).toHaveAttribute('data-collapsed', 'true')
    expect(localStorage.getItem('gsh-sidebar')).toBe('1')
    localStorage.removeItem('gsh-sidebar')
  })
})
