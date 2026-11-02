import { describe, it, expect, vi } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// IntersectionObserver ya majaribio: inaonyesha kila kipengele papo hapo
class IO {
  cb: IntersectionObserverCallback
  constructor(cb: IntersectionObserverCallback) { this.cb = cb }
  observe(el: Element) { this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as any) }
  unobserve() {} disconnect() {}
}
;(globalThis as any).IntersectionObserver = IO

vi.mock('@/components/public/SimulationShowcase', () => ({ default: () => <div>showcase-stub</div> }))

import LandingPage from '@/pages/public/LandingPage'

const mount = () => render(<MemoryRouter><LandingPage /></MemoryRouter>)

describe('Landing page', () => {
  it('has a clear headline and the two primary calls to action', () => {
    mount()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/delivered fast/i)
    const hero = screen.getByRole('region', { name: /engineering simulations/i })
    expect(within(hero).getByRole('link', { name: /submit a project/i })).toHaveAttribute('href', '/submit')
    expect(within(hero).getByRole('link', { name: /become an expert/i })).toHaveAttribute('href', '/apply-expert')
  })

  it('contains every section, including the backend-driven showcase', () => {
    mount()
    for (const name of [/four steps/i, /built for engineers/i, /choose how fast/i, /grow from beginner/i, /what engineers say/i, /questions, answered/i]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
    expect(screen.getByText('showcase-stub')).toBeInTheDocument()
  })

  it('no longer claims outdated things (automatic account / AI matching)', () => {
    mount()
    const text = document.body.textContent || ''
    expect(text).not.toMatch(/no account needed/i)
    expect(text).not.toMatch(/\bAI\b/)
    expect(text).toMatch(/create your account/i)
  })

  it('FAQ is an accessible accordion: one open at a time', async () => {
    const u = userEvent.setup()
    mount()
    const q1 = screen.getByRole('button', { name: /need an account/i })
    const q2 = screen.getByRole('button', { name: /how is my project priced/i })
    expect(q1).toHaveAttribute('aria-expanded', 'true')
    await u.click(q2)
    expect(q2).toHaveAttribute('aria-expanded', 'true')
    expect(q1).toHaveAttribute('aria-expanded', 'false')
    await u.click(q2)
    expect(q2).toHaveAttribute('aria-expanded', 'false')
  })

  it('statistics count up to the exact final values', async () => {
    mount()
    await waitFor(() => expect(screen.getByLabelText(/1200\+ projects delivered/i)).toHaveTextContent('1200+'), { timeout: 3000 })
    expect(screen.getByLabelText(/98% client satisfaction/i)).toHaveTextContent('98%')
  })

  it('footer links point to real routes and in-page anchors', () => {
    mount()
    const foot = screen.getByRole('contentinfo')
    expect(within(foot).getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login')
    expect(within(foot).getByRole('link', { name: /^faq$/i })).toHaveAttribute('href', '#faq')
  })
})
