import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/api/client', () => ({
  authApi: { submitWithAccount: vi.fn(() => new Promise(() => {})), me: vi.fn() },
  recruitApi: {
    tools: vi.fn(() => Promise.resolve({ data: [{ id: 1, name: 'MATLAB' }, { id: 2, name: 'Proteus' }] })),
    myApplication: vi.fn(() => Promise.reject(new Error('none'))),
    apply: vi.fn(),
  },
}))
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({ user: { role: 'client' }, updateUser: vi.fn() }),
}))

import { authApi } from '@/api/client'
import SubmitProjectPublicPage from '@/pages/public/SubmitProjectPublicPage'
import ExpertApplyPage from '@/pages/expert/ExpertApplyPage'

const wrap = (ui: React.ReactNode) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>{ui}</MemoryRouter>
  </QueryClientProvider>
)

beforeEach(() => vi.clearAllMocks())

describe('Public submit wizard', () => {
  it('does not submit when moving from step 2 to step 3; submits only on the final button', async () => {
    const u = userEvent.setup()
    render(wrap(<SubmitProjectPublicPage />))

    // Hatua 1: akaunti
    await u.type(screen.getByLabelText(/first name/i), 'John')
    await u.type(screen.getByLabelText(/^username/i), 'john_doe')
    await u.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await u.type(screen.getByLabelText(/phone/i), '+255700000000')
    await u.type(screen.getByLabelText(/^password/i), 'Str0ng-Pass-123!')
    await u.type(screen.getByLabelText(/confirm password/i), 'Str0ng-Pass-123!')
    await u.click(screen.getByRole('button', { name: /continue/i }))

    // Hatua 2: mradi
    await screen.findByText(/project details/i)
    await u.type(screen.getByLabelText(/project title/i), 'Buck converter')
    await u.type(screen.getByLabelText(/description/i), 'Design and simulate a buck converter please')
    await u.click(screen.getByRole('button', { name: /matlab/i }))
    await u.type(screen.getByLabelText(/deadline/i), '2031-01-01T10:00')
    const continueBtn = screen.getByRole('button', { name: /continue/i })
    await u.click(continueBtn)

    // Kitufe cha "Continue" lazima kiondolewe kabisa kwenye DOM. Kama kingebaki na kubadilika
    // kuwa type="submit", kivinjari kingetuma fomu papo hapo (kosa la "inajisubmit hatua ya 2").
    await screen.findByRole('button', { name: /create account & submit/i })
    expect(continueBtn.isConnected).toBe(false)

    // Hatua 3 inaonekana, na HAKUNA kutuma kuliko kutokea
    await screen.findByText(/files & delivery/i, { selector: 'h2' })
    await new Promise(r => setTimeout(r, 150))
    expect(authApi.submitWithAccount).not.toHaveBeenCalled()

    // Kitufe cha mwisho ndicho kinachotuma
    await u.click(screen.getByRole('button', { name: /create account & submit/i }))
    await waitFor(() => expect(authApi.submitWithAccount).toHaveBeenCalledTimes(1))
  })

  it('Enter key on step 1 does not submit the whole form', async () => {
    const u = userEvent.setup()
    render(wrap(<SubmitProjectPublicPage />))
    await u.type(screen.getByLabelText(/first name/i), 'John{enter}')
    expect(authApi.submitWithAccount).not.toHaveBeenCalled()
  })
})

describe('Expert application form', () => {
  it('lets the user type a full description without losing focus', async () => {
    const u = userEvent.setup()
    render(wrap(<ExpertApplyPage />))
    const box = await screen.findByLabelText(/about your experience/i)
    const text = 'I have five years of Simulink experience.'
    await u.type(box, text)
    expect((screen.getByLabelText(/about your experience/i) as HTMLTextAreaElement).value).toBe(text)
  })
})
