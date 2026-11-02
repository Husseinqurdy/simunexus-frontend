import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())

// jsdom haina hizi
window.scrollTo = vi.fn() as any
class RO { observe() {} unobserve() {} disconnect() {} }
;(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || RO
;(globalThis as any).IntersectionObserver = (globalThis as any).IntersectionObserver || RO
Element.prototype.scrollIntoView = vi.fn() as any
