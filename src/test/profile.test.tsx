import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const updateUser = vi.fn()
let storeUser: any

vi.mock('@/api/client', () => ({
  authApi: { updateMe: vi.fn(() => Promise.resolve({})), me: vi.fn(), updateClientProfile: vi.fn(() => Promise.resolve({})), changePassword: vi.fn() },
}))
vi.mock('@/store/authStore', () => ({ useAuthStore: () => ({ user: storeUser, updateUser }) }))

import { authApi } from '@/api/client'
import ClientProfile from '@/pages/client/ClientProfile'

const base = { id: 1, email: 'c@x.com', first_name: 'Ann', last_name: 'Lee', phone: '', whatsapp: '', country: '', role: 'client', is_profile_complete: false,
  profile_completion: 62, missing_profile_fields: ['Phone number', 'Country', 'Account type', 'University / Institution', 'Program / Department'], client_profile: { type: '', university: '', program: '', academic_year: '' } }

const mount = () => render(
  <QueryClientProvider client={new QueryClient()}><MemoryRouter><ClientProfile /></MemoryRouter></QueryClientProvider>,
)
beforeEach(() => { vi.clearAllMocks(); storeUser = { ...base } })

describe('Client profile completion', () => {
  it('shows what is missing while incomplete', () => {
    mount()
    expect(screen.getByText(/Profile 62% Complete/i)).toBeInTheDocument()
    expect(screen.getByText(/Still missing: Phone number, Country/i)).toBeInTheDocument()
  })

  it('personal info is really SAVED (PATCH) and the store is refreshed from the server', async () => {
    const u = userEvent.setup()
    ;(authApi.me as any).mockResolvedValue({ data: { ...base, phone: '+255700000000', country: 'Tanzania', profile_completion: 75 } })
    const { container } = mount()
    await u.type(container.querySelector('input[name="phone"]')!, '+255700000000')
    await u.selectOptions(container.querySelector('select[name="country"]')!, 'Tanzania')
    await u.click(screen.getByRole('button', { name: /save personal info/i }))
    await waitFor(() => expect(authApi.updateMe).toHaveBeenCalledWith(expect.objectContaining({ phone: '+255700000000', country: 'Tanzania' })))
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ profile_completion: 75 })))
  })

  it('academic info is saved and reaching 100% is reflected', async () => {
    const u = userEvent.setup()
    ;(authApi.me as any).mockResolvedValue({ data: { ...base, phone: '1', country: 'Tanzania', is_profile_complete: true, profile_completion: 100, missing_profile_fields: [] } })
    const { container } = mount()
    await u.click(screen.getByRole('button', { name: /academic/i }))
    await u.selectOptions(container.querySelector('select[name="type"]')!, 'student')
    await u.type(container.querySelector('input[name="university"]')!, 'MUST')
    await u.selectOptions(container.querySelector('select[name="program"]')!, 'Computer Science')
    await u.click(screen.getByRole('button', { name: /save academic info/i }))
    await waitFor(() => expect(authApi.updateClientProfile).toHaveBeenCalledWith(expect.objectContaining({ type: 'student', university: 'MUST', program: 'Computer Science' })))
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ profile_completion: 100, is_profile_complete: true })))
  })

  it('at 100% the warning disappears and a success state is shown', () => {
    storeUser = { ...base, is_profile_complete: true, profile_completion: 100, missing_profile_fields: [] }
    mount()
    expect(screen.getByText(/Profile Complete!/i)).toBeInTheDocument()
    expect(screen.queryByText(/Still missing/i)).not.toBeInTheDocument()
  })
})
