import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import { GSHLogo } from '@/pages/auth/_shared'

/**
 * Topbar moja ya kurasa za umma (Landing, Submit Project, Become Expert).
 * Gold (rangi ya amber ya logo) + navy. Sticky, bila blur wala kivuli.
 */
const css = `
.ptb { position: sticky; top: 0; z-index: 50; background: #F5BA2E; border-bottom: 1px solid #DCA11A; font-family: inherit; }
.ptb-in { max-width: 1200px; margin: 0 auto; height: 64px; padding: 0 clamp(16px,4vw,24px); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ptb-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; min-width: 0; }
.ptb-tile { width: 38px; height: 38px; border-radius: 9px; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ptb-name { font-size: 14px; font-weight: 700; color: #0A1F6B; line-height: 1.2; white-space: nowrap; }
.ptb-tag { font-size: 12px; font-weight: 500; color: #4A3300; margin-top: 2px; white-space: nowrap; }
.ptb-actions { display: flex; align-items: center; gap: 8px; }
.ptb-link { color: #0A1F6B; font-size: 14px; font-weight: 600; padding: 8px 12px; border-radius: 8px; text-decoration: none; transition: background .15s; }
.ptb-link:hover, .ptb-link.on { background: rgba(10,31,107,.1); }
.ptb-btn { height: 38px; padding: 0 16px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; white-space: nowrap; transition: background .15s; font-family: inherit; }
.ptb-outline { border: 1.5px solid #0A1F6B; color: #0A1F6B; background: transparent; }
.ptb-outline:hover { background: rgba(10,31,107,.08); }
.ptb-solid { border: 1.5px solid #0A1F6B; background: #0A1F6B; color: #fff; }
.ptb-solid:hover { background: #071650; }
.ptb-toggle { display: none; width: 40px; height: 40px; border-radius: 8px; border: 1.5px solid #0A1F6B; background: transparent; color: #0A1F6B; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.ptb-panel { display: none; border-top: 1px solid #DCA11A; padding: 12px clamp(16px,4vw,24px) 16px; }
.ptb-panel .ptb-btn, .ptb-panel .ptb-link { height: 44px; width: 100%; justify-content: center; }
.ptb-panel .ptb-link { display: flex; align-items: center; border: 1.5px solid transparent; }
@media (max-width: 720px) {
  .ptb-in { height: 60px; }
  .ptb-actions, .ptb-tag { display: none; }
  .ptb-toggle { display: inline-flex; }
  .ptb-panel.open { display: flex; flex-direction: column; gap: 8px; }
}
@media (max-width: 360px) { .ptb-name { font-size: 13px; } }
`

export default function PublicTopbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const close = () => setOpen(false)
  const on = (p: string) => (pathname === p ? ' on' : '')

  return (
    <header className="ptb">
      <style>{css}</style>
      <div className="ptb-in">
        <Link to="/" className="ptb-brand" onClick={close}>
          <span className="ptb-tile"><GSHLogo size={30} /></span>
          <span style={{ minWidth: 0 }}>
            <div className="ptb-name">Global Simulation Hub</div>
            <div className="ptb-tag">Engineering · Simulation · Delivery</div>
          </span>
        </Link>

        <nav className="ptb-actions" aria-label="Main">
          <Link to="/apply-expert" className={`ptb-link${on('/apply-expert')}`}>Become Expert</Link>
          <Link to="/login" className="ptb-btn ptb-outline">Login</Link>
          <Link to="/submit" className="ptb-btn ptb-solid">Submit Project <ArrowRight size={14} /></Link>
        </nav>

        <button type="button" className="ptb-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(v => !v)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={`ptb-panel${open ? ' open' : ''}`}>
        <Link to="/apply-expert" className={`ptb-link${on('/apply-expert')}`} onClick={close}>Become Expert</Link>
        <Link to="/login" className="ptb-btn ptb-outline" onClick={close}>Login</Link>
        <Link to="/submit" className="ptb-btn ptb-solid" onClick={close}>Submit Project <ArrowRight size={14} /></Link>
      </div>
    </header>
  )
}
