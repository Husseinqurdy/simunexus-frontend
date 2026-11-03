import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const updateUser = vi.fn()
let user: any

vi.mock('@/api/client', () => ({
  authApi: { updateMe: vi.fn(), removeAvatar: vi.fn(), me: vi.fn(() => Promise.resolve({ data: user })), logout: vi.fn() },
}))
vi.mock('@/store/authStore', () => {
  const useAuthStore: any = () => ({ user, logout: vi.fn(), refreshToken: 'r', updateUser })
  useAuthStore.getState = () => ({ updateUser })
  return { useAuthStore }
})
vi.mock('@/components/shared/NotificationBell', () => ({ default: () => <span /> }))
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }))

import toast from 'react-hot-toast'
import { authApi } from '@/api/client'
import AvatarEditor from '@/components/shared/AvatarEditor'
import DashboardLayout from '@/components/layout/DashboardLayout'

const URL1 = 'https://api.simunexus.com/api/auth/avatar/abc.jpg/'
const wrap = (ui: React.ReactNode) => <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>
const png = () => new File([new Uint8Array([137, 80, 78, 71])], 'me.png', { type: 'image/png' })

beforeEach(() => {
  vi.clearAllMocks()
  user = { id: 1, email: 'e@x.com', first_name: 'Eli', last_name: 'T', role: 'expert', avatar: null, is_profile_complete: true }
  ;(globalThis as any).URL.createObjectURL = vi.fn(() => 'blob:preview')
  ;(globalThis as any).URL.revokeObjectURL = vi.fn()
})

describe('AvatarEditor', () => {
  it('uploads the photo as multipart "avatar" and puts the server user in the store (topbar updates)', async () => {
    const u = userEvent.setup()
    ;(authApi.updateMe as any).mockResolvedValue({ data: { ...user, avatar: URL1 } })
    const { container } = render(wrap(<AvatarEditor avatar={null} initials="E" />))
    await u.upload(container.querySelector('input[type="file"]')!, png())
    await waitFor(() => expect(authApi.updateMe).toHaveBeenCalledTimes(1))
    const fd = (authApi.updateMe as any).mock.calls[0][0] as FormData
    expect(fd).toBeInstanceOf(FormData)
    expect((fd.get('avatar') as File).name).toBe('me.png')
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ avatar: URL1 })))
    expect(toast.success).toHaveBeenCalled()
  })

  it('shows the server message when the photo is rejected, and keeps initials', async () => {
    const u = userEvent.setup()
    ;(authApi.updateMe as any).mockRejectedValue({ response: { data: { avatar: ['This file is not a valid image.'] } } })
    const { container } = render(wrap(<AvatarEditor avatar={null} initials="E" />))
    await u.upload(container.querySelector('input[type="file"]')!, png())
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('This file is not a valid image.'))
    expect(updateUser).not.toHaveBeenCalled()
    expect(screen.getByText('E')).toBeInTheDocument()
  })

  it('rejects non-images and files over 10 MB before calling the server', async () => {
    const { container } = render(wrap(<AvatarEditor avatar={null} initials="E" />))
    const input = container.querySelector('input[type="file"]')!
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } })
    const big = new File(['x'], 'big.png', { type: 'image/png' }); Object.defineProperty(big, 'size', { value: 11 * 1024 * 1024 })
    fireEvent.change(input, { target: { files: [big] } })
    expect(authApi.updateMe).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledTimes(2)
  })

  it('removes the photo through the API', async () => {
    const u = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    ;(authApi.removeAvatar as any).mockResolvedValue({ data: { ...user, avatar: null } })
    render(wrap(<AvatarEditor avatar={URL1} initials="E" />))
    await u.click(screen.getByRole('button', { name: /remove photo/i }))
    await waitFor(() => expect(authApi.removeAvatar).toHaveBeenCalled())
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ avatar: null })))
  })

  it('falls back to initials when the image URL fails to load', () => {
    render(wrap(<AvatarEditor avatar={URL1} initials="E" />))
    fireEvent.error(screen.getByAltText(/your photo/i))
    expect(screen.getByText('E')).toBeInTheDocument()
  })
})

describe('Topbar badge', () => {
  const mount = () => render(wrap(
    <MemoryRouter initialEntries={['/expert']}><Routes><Route element={<DashboardLayout />}><Route path="/expert" element={<div />} /></Route></Routes></MemoryRouter>,
  ))

  it('shows the uploaded photo in the topbar badge', () => {
    user = { ...user, avatar: URL1 }
    mount()
    const badge = within(screen.getByRole('banner')).getByRole('button', { name: /eli/i })
    expect(badge.querySelector('img')).toHaveAttribute('src', URL1)
  })

  it('falls back to initials if the photo cannot load', () => {
    user = { ...user, avatar: URL1 }
    mount()
    const badge = within(screen.getByRole('banner')).getByRole('button', { name: /eli/i })
    fireEvent.error(badge.querySelector('img')!)
    expect(badge.querySelector('img')).toBeNull()
    expect(badge.textContent).toContain('E')
  })
})
