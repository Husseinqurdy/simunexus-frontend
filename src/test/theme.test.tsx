import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

let user: any
vi.mock('@/store/authStore', () => ({ useAuthStore: () => ({ user, logout: vi.fn(), refreshToken: 'r', updateUser: vi.fn() }) }))
vi.mock('@/api/client', () => ({ authApi: { me: vi.fn(() => Promise.resolve({ data: user })), logout: vi.fn(() => Promise.resolve({})) } }))
vi.mock('@/components/shared/NotificationBell', () => ({ default: () => <button aria-label="Notifications" /> }))

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useThemeStore } from '@/store/themeStore'

function Where() { return <div data-testid="where">{useLocation().pathname}</div> }
const mount = (path: string) => render(
  <MemoryRouter initialEntries={[path]}>
    <Where />
    <Routes><Route element={<DashboardLayout />}>
      <Route path="*" element={<div>page</div>} />
    </Route></Routes>
  </MemoryRouter>,
)
const shell = () => document.querySelector('.app-shell')!

beforeEach(() => {
  vi.clearAllMocks(); localStorage.clear(); useThemeStore.setState({ theme: 'light' })
  user = { id: 1, email: 'a@x.com', first_name: 'Ann', last_name: 'Lee', role: 'admin', is_profile_complete: true, profile_completion: 100 }
})

describe('Role-based design (hybrid C)', () => {
  it('admin gets the dense layout and a dark-mode toggle', async () => {
    const u = userEvent.setup()
    mount('/admin')
    expect(shell()).toHaveAttribute('data-ui', 'dense')
    expect(shell()).toHaveAttribute('data-theme', 'light')
    await u.click(screen.getByRole('button', { name: /switch to dark mode/i }))
    expect(shell()).toHaveAttribute('data-theme', 'dark')
    expect(useThemeStore.getState().theme).toBe('dark')
    await u.click(screen.getByRole('button', { name: /switch to light mode/i }))
    expect(shell()).toHaveAttribute('data-theme', 'light')
  })

  it('clients and experts get the soft layout, no dark toggle, and are never dark even if stored as dark', () => {
    useThemeStore.setState({ theme: 'dark' })
    for (const role of ['client', 'expert']) {
      user = { ...user, role }
      const { unmount } = mount(`/${role}`)
      expect(shell()).toHaveAttribute('data-ui', 'soft')
      expect(shell()).toHaveAttribute('data-theme', 'light')
      expect(screen.queryByRole('button', { name: /dark mode|light mode/i })).toBeNull()
      unmount()
    }
  })

  it('Ctrl+K opens the command palette, filters, and Enter navigates', async () => {
    const u = userEvent.setup()
    mount('/admin')
    await u.keyboard('{Control>}k{/Control}')
    const dlg = await screen.findByRole('dialog', { name: /command palette/i })
    await u.type(within(dlg).getByLabelText('Search'), 'test bank')
    expect(within(dlg).getAllByRole('option')).toHaveLength(1)
    await u.keyboard('{Enter}')
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/admin/test-bank'))
    expect(screen.queryByRole('dialog', { name: /command palette/i })).toBeNull()
  })

  it('palette: arrows move selection, Esc closes, empty state shows', async () => {
    const u = userEvent.setup()
    mount('/admin')
    await u.click(screen.getByRole('button', { name: /command palette/i }))
    const dlg = await screen.findByRole('dialog', { name: /command palette/i })
    const opts = () => within(dlg).getAllByRole('option')
    expect(opts()[0]).toHaveAttribute('aria-selected', 'true')
    await u.keyboard('{ArrowDown}')
    expect(opts()[1]).toHaveAttribute('aria-selected', 'true')
    await u.type(within(dlg).getByLabelText('Search'), 'zzzz-nothing')
    expect(within(dlg).getByText(/no results/i)).toBeInTheDocument()
    await u.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /command palette/i })).toBeNull())
  })

  it('palette offers role-appropriate pages only', async () => {
    const u = userEvent.setup()
    user = { ...user, role: 'client' }
    mount('/client')
    await u.keyboard('{Control>}k{/Control}')
    const dlg = await screen.findByRole('dialog', { name: /command palette/i })
    expect(within(dlg).queryByText('Test Bank')).toBeNull()
    expect(within(dlg).getByText('My Projects')).toBeInTheDocument()
    expect(within(dlg).getByText('Log out')).toBeInTheDocument()
  })
})
