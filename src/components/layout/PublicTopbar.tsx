import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import { GSHLogo } from '@/pages/auth/_shared'

/**
 * Topbar ya kurasa za umma (Landing, Submit Project, Become Expert).
 * Nyeupe yenye glass-blur; inapata mstari/kivuli unaposogeza; viungo vyenye mstari unaokua; CTA yenye mshale unaotembea.
 */
const css = `
@keyframes ptbDrop { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: none; } }
.ptb { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,.78); -webkit-backdrop-filter: saturate(1.6) blur(16px); backdrop-filter: saturate(1.6) blur(16px);
  border-bottom: 1px solid transparent; font-family: inherit; animation: ptbDrop .5s cubic-bezier(.22,.8,.26,1) both; transition: border-color .25s, box-shadow .25s, background .25s; }
.ptb.scrolled { border-bottom-color: #E3E9F4; box-shadow: 0 6px 24px rgba(10,31,107,.06); background: rgba(255,255,255,.92); }
.ptb-in { max-width: 1200px; margin: 0 auto; height: 68px; padding: 0 clamp(16px,4vw,24px); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ptb-brand { display: flex; align-items: center; gap: 11px; text-decoration: none; min-width: 0; }
.ptb-tile { width: 40px; height: 40px; border-radius: 11px; background: #EAF1FD; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform .35s cubic-bezier(.22,.8,.26,1); }
.ptb-brand:hover .ptb-tile { transform: rotate(-8deg) scale(1.07); }
.ptb-name { font-size: 15px; font-weight: 700; color: #0A1F6B; line-height: 1.2; white-space: nowrap; }
.ptb-tag { font-size: 12px; font-weight: 500; color: #667697; margin-top: 1px; white-space: nowrap; }
.ptb-actions { display: flex; align-items: center; gap: 6px; }
.ptb-link { position: relative; color: #2B3A60; font-size: 14px; font-weight: 600; padding: 9px 14px; text-decoration: none; transition: color .2s; }
.ptb-link::after { content: ''; position: absolute; left: 14px; right: 14px; bottom: 4px; height: 2px; border-radius: 2px; background: #0D52CE; transform: scaleX(0); transform-origin: left; transition: transform .3s cubic-bezier(.22,.8,.26,1); }
.ptb-link:hover { color: #0D52CE; }
.ptb-link:hover::after, .ptb-link.on::after { transform: scaleX(1); }
.ptb-link.on { color: #0D52CE; }
.ptb-btn { height: 40px; padding: 0 18px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none; white-space: nowrap; font-family: inherit; transition: background .2s, color .2s, box-shadow .25s, transform .15s, border-color .2s; }
.ptb-btn:active { transform: scale(.97); }
.ptb-ghost { color: #0A1F6B; background: transparent; border: 1px solid #D5E0F2; }
.ptb-ghost:hover { background: #F1F5FC; border-color: #0D52CE; color: #0D52CE; }
.ptb-solid { color: #fff; background: #0D52CE; border: 1px solid #0D52CE; }
.ptb-solid:hover { background: #0A42A8; box-shadow: 0 8px 22px rgba(13,82,206,.32); transform: translateY(-1px); }
.ptb-solid svg { transition: transform .25s cubic-bezier(.22,.8,.26,1); }
.ptb-solid:hover svg { transform: translateX(4px); }
.ptb-toggle { display: none; width: 42px; height: 42px; border-radius: 10px; border: 1px solid #D5E0F2; background: #fff; color: #0A1F6B; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.ptb-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s cubic-bezier(.22,.8,.26,1); background: #fff; }
.ptb-panel > div { overflow: hidden; }
.ptb-panel.open { grid-template-rows: 1fr; border-top: 1px solid #E3E9F4; }
.ptb-panel-in { display: flex; flex-direction: column; gap: 8px; padding: 14px clamp(16px,4vw,24px) 18px; }
.ptb-panel .ptb-btn, .ptb-panel .ptb-link { height: 46px; width: 100%; justify-content: center; }
.ptb-panel .ptb-link { display: flex; align-items: center; border-radius: 10px; }
.ptb-panel .ptb-link::after { display: none; }
.ptb-panel .ptb-link:hover { background: #F1F5FC; }
@media (max-width: 720px) {
  .ptb-in { height: 62px; }
  .ptb-actions, .ptb-tag { display: none; }
  .ptb-toggle { display: inline-flex; }
}
@media (prefers-reduced-motion: reduce) { .ptb { animation: none; } }
`

export default function PublicTopbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const close = () => setOpen(false)
  const on = (p: string) => (pathname === p ? ' on' : '')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <header className={`ptb${scrolled ? ' scrolled' : ''}`}>
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
          <Link to="/login" className="ptb-btn ptb-ghost">Login</Link>
          <Link to="/submit" className="ptb-btn ptb-solid">Submit Project <ArrowRight size={15} /></Link>
        </nav>

        <button type="button" className="ptb-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(v => !v)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={`ptb-panel${open ? ' open' : ''}`} aria-hidden={!open}>
        <div>
          <div className="ptb-panel-in">
            <Link to="/apply-expert" className={`ptb-link${on('/apply-expert')}`} onClick={close} tabIndex={open ? 0 : -1}>Become Expert</Link>
            <Link to="/login" className="ptb-btn ptb-ghost" onClick={close} tabIndex={open ? 0 : -1}>Login</Link>
            <Link to="/submit" className="ptb-btn ptb-solid" onClick={close} tabIndex={open ? 0 : -1}>Submit Project <ArrowRight size={15} /></Link>
          </div>
        </div>
      </div>
    </header>
  )
}
