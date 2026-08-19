import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

/* ---------------------------------- hooks --------------------------------- */

function useCounter(target: number, duration = 2000, started = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!started) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, started])
  return count
}

function useInView(threshold = 0.18) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

/* Types a set of lines out one character at a time, in order, on mount.
   Returns the currently-visible slice of each line plus the index of the
   line the caret should sit on (stays on the last line once finished). */
function useTypewriter(lines: string[], speed = 42, lineDelay = 260, startDelay = 400) {
  const [output, setOutput] = useState<string[]>(() => lines.map(() => ''))
  useEffect(() => {
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setOutput(lines); return }
    let li = 0
    let ci = 0
    let timer: ReturnType<typeof setTimeout>
    const startTimer = setTimeout(function tick() {
      setOutput((prev) => {
        const next = [...prev]
        next[li] = lines[li].slice(0, ci + 1)
        return next
      })
      ci++
      if (ci >= lines[li].length) {
        li++
        ci = 0
        if (li >= lines.length) return
        timer = setTimeout(tick, lineDelay)
      } else {
        timer = setTimeout(tick, speed)
      }
    }, startDelay)
    return () => { clearTimeout(startTimer); clearTimeout(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const activeIndex = output.findIndex((t, i) => t.length < lines[i].length)
  return { output, activeIndex: activeIndex === -1 ? lines.length - 1 : activeIndex }
}

/* --------------------------------- icons ---------------------------------- */
/* Hand-built line icons (no emoji anywhere on the page) */

type IconName =
  | 'zap' | 'shield' | 'check-circle' | 'cpu' | 'globe' | 'bar-chart'
  | 'lock' | 'credit-card' | 'book-open' | 'clock' | 'check' | 'star'
  | 'quote' | 'arrow-right' | 'menu' | 'x'

function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.8 }:
  { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const, stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'zap': return <svg {...common}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" /></svg>
    case 'shield': return <svg {...common}><path d="M12 3l7 3v5.2c0 4.8-3.2 8-7 9.3-3.8-1.3-7-4.5-7-9.3V6l7-3Z" /><path d="M9 12.2l2 2 4-4.4" /></svg>
    case 'check-circle': return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M8.4 12.4l2.4 2.4 4.6-5" /></svg>
    case 'cpu': return <svg {...common}><rect x="6.5" y="6.5" width="11" height="11" rx="2" /><path d="M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3" /></svg>
    case 'globe': return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.4 2.6 3.7 6 3.7 9s-1.3 6.4-3.7 9c-2.4-2.6-3.7-6-3.7-9S9.6 5.6 12 3Z" /></svg>
    case 'bar-chart': return <svg {...common}><path d="M4.5 20V11M12 20V4M19.5 20v-6.5" /></svg>
    case 'lock': return <svg {...common}><rect x="5" y="11" width="14" height="9" rx="2.2" /><path d="M8 11V7.5a4 4 0 1 1 8 0V11" /></svg>
    case 'credit-card': return <svg {...common}><rect x="3" y="6" width="18" height="13" rx="2.2" /><path d="M3 10.2h18" /></svg>
    case 'book-open': return <svg {...common}><path d="M12 6.2c-2-1.5-5-2-8-1v12.6c3-1 6-.5 8 1 2-1.5 5-2 8-1V5.2c-3-1-6-.5-8 1Z" /><path d="M12 6.2v12.6" /></svg>
    case 'clock': return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7.2v5l3.4 2" /></svg>
    case 'check': return <svg {...common} strokeWidth={strokeWidth || 3}><path d="M4.5 12.75l6 6 9-13.5" /></svg>
    case 'star': return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2.2l3 6.3 6.8.9-5 4.7 1.2 6.9L12 17.6l-6 3.4 1.2-6.9-5-4.7 6.8-.9 3-6.3Z" /></svg>
    case 'quote': return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M8 6.5C5.2 6.5 3 8.9 3 12s2.2 5.4 5 5.4c0 2.4-1.8 4.3-4.2 4.3v2.3C7.8 24 10.2 20.6 10.2 16.6V11c0-2.6-1-4.5-2.2-4.5Zm10.6 0c-2.8 0-5 2.4-5 5.5s2.2 5.4 5 5.4c0 2.4-1.8 4.3-4.2 4.3v2.3c3.9 0 6.3-3.4 6.3-7.4V11c0-2.6-1-4.5-2.1-4.5Z" /></svg>
    case 'arrow-right': return <svg {...common}><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
    case 'menu': return <svg {...common}><path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" /></svg>
    case 'x': return <svg {...common}><path d="M6 6l12 12M18 6L6 18" /></svg>
  }
}

function StarRow({ count, size = 12, color = '#F59E0B' }: { count: number; size?: number; color?: string }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => <Icon key={i} name="star" size={size} color={color} />)}
    </div>
  )
}

/* Avatar with a real photo when available; falls back to initials-on-gradient
   automatically if the photo is missing or fails to load — safe to drop in
   photos later without breaking the layout. */
function Avatar({ photo, initials, size, gradient }: { photo?: string; initials: string; size: number; gradient: string }) {
  const [failed, setFailed] = useState(!photo)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, position: 'relative',
      overflow: 'hidden', background: gradient, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.34,
    }}>
      {initials}
      {photo && !failed && (
        <img
          src={photo}
          alt=""
          onError={() => setFailed(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  )
}

function GSHLogo({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/gsh-icon.png"
      alt="Global Simulation Hub"
      style={{
        height: size,
        width: 'auto',
        maxWidth: 'none',
        maxHeight: 'none',
        display: 'block',
        flexShrink: 0,
      }}
    />
  )
}

/* Soft wave divider blending two light-blue tones together instead of a hard cut. */
function WaveDivider({ from, to }: { from: string; to: string }) {
  return (
    <div style={{ background: from, lineHeight: 0 }}>
      <svg viewBox="0 0 1440 70" width="100%" height="46" preserveAspectRatio="none">
        <path d="M0,26 C240,58 480,4 720,22 C960,40 1200,60 1440,18 L1440,70 L0,70 Z" fill={to} />
      </svg>
    </div>
  )
}

/* --------------------------------- content --------------------------------- */

const tools = ['MATLAB', 'Simulink', 'Proteus', 'ANSYS', 'LabVIEW', 'PSCAD', 'ETAP', 'Multisim', 'HFSS', 'CST Studio']

const steps = [
  { n: '01', title: 'Submit Project', body: 'Describe your simulation. No account needed — we create one automatically.' },
  { n: '02', title: 'Expert Matched', body: 'Smart system assigns the best verified expert for your software and deadline.' },
  { n: '03', title: 'Track Progress', body: 'Watch real-time progress from 0-100% as your expert works on your simulation.' },
  { n: '04', title: 'QC & Download', body: 'Admin reviews quality first, then you get a secure time-limited download link.' },
]

const features: { icon: IconName; title: string; body: string; tint: string }[] = [
  { icon: 'zap', title: 'Express Delivery', body: 'Results in 6-12h with our express tier. Urgent (24h) and Standard also available.', tint: '#0EA5E9' },
  { icon: 'shield', title: 'Verified Experts', body: 'Every expert passes a 2-hour live simulation test. Only top 15% accepted.', tint: '#F97316' },
  { icon: 'check-circle', title: 'Quality Control', body: 'Admin reviews every submission before delivery. No shortcuts, no compromises.', tint: '#0EA5E9' },
  { icon: 'cpu', title: 'Smart Matching', body: 'AI matches your project to the highest-rated available expert by skill.', tint: '#F97316' },
  { icon: 'globe', title: 'Global Platform', body: 'Multi-currency, multi-timezone. Submit anywhere, get results worldwide.', tint: '#0EA5E9' },
  { icon: 'bar-chart', title: 'Full Transparency', body: 'Track every stage: Received → Assigned → QC → Completed.', tint: '#F97316' },
  { icon: 'lock', title: 'NDA Support', body: 'Enable confidential mode. Expert must sign NDA before accessing files.', tint: '#0EA5E9' },
  { icon: 'credit-card', title: 'Flexible Payments', body: 'Pay 50% advance, 50% on delivery. Wallet system for repeat clients.', tint: '#F97316' },
  { icon: 'book-open', title: 'Educational Mode', body: 'Optionally receive a PDF or video explanation of your simulation.', tint: '#0EA5E9' },
]

const levels = [
  { label: 'Beginner', color: '#64748B', projects: '1-10 projects', stars: 1 },
  { label: 'Verified', color: '#0EA5E9', projects: '11-30 projects', stars: 2 },
  { label: 'Top Expert', color: '#2563EB', projects: '31-60 projects', stars: 3 },
  { label: 'Elite Expert', color: '#F97316', projects: '60+ projects', stars: 4 },
]

const testimonials = [
  { name: 'Ahmed K.', role: 'MSc Electrical Engineering', initials: 'AK', rating: 5, photo: '/testimonials/ahmed-k.jpg', quote: 'My Simulink model was due in 18 hours and the expert delivered in 11, fully documented. The progress tracker made the whole thing feel safe.' },
  { name: 'Fatima N.', role: 'Control Systems Researcher', initials: 'FN', rating: 5, photo: '/testimonials/fatima-n.jpg', quote: 'The QC step is what sold me. I got my ANSYS thermal analysis back with a reviewer note attached, not just a raw file.' },
  { name: 'James O.', role: 'Power Systems Consultant', initials: 'JO', rating: 5, photo: '/testimonials/james-o.jpg', quote: 'I needed an ETAP load-flow study with an NDA in place. Setup took minutes and the expert was clearly vetted.' },
  { name: 'Grace M.', role: 'Final-Year Mechatronics Student', initials: 'GM', rating: 4, photo: '/testimonials/grace-m.jpg', quote: 'Educational Mode was the real win — the explainer video meant I could defend my Proteus project in my viva with confidence.' },
]

const featured = testimonials[0]

/* ---------------------------------- page ----------------------------------- */

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity .6s cubic-bezier(.22,.61,.36,1) ${delay}ms, transform .6s cubic-bezier(.22,.61,.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const heroLines = ['Simulation', 'Delivered Fast', 'Globally.']
  const { output: heroTyped, activeIndex: heroCaretLine } = useTypewriter(heroLines)
  const statsRef = useInView()
  const c1 = useCounter(1200, 1800, statsRef.inView)
  const c2 = useCounter(98, 1800, statsRef.inView)
  const c3 = useCounter(47, 1800, statsRef.inView)
  const c4 = useCounter(6, 1800, statsRef.inView)

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 640) setMobileNavOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        .lp { font-family: 'DM Sans', sans-serif; background:#EAF4FF; }
        .dp { font-family: 'Syne', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatY { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes pulseRing { 0% { box-shadow:0 0 0 0 rgba(14,165,233,.45); } 100% { box-shadow:0 0 0 9px rgba(14,165,233,0); } }
        @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        @keyframes drift { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(16px,-12px) scale(1.04); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 50% { opacity:0; } }
        .caret { display:inline-block; width:3px; height:0.82em; background:currentColor; margin-left:5px; vertical-align:-0.08em; animation:blink 1s steps(1) infinite; border-radius:1px; }
        .au { animation: fadeUp .6s cubic-bezier(.22,.61,.36,1) both; }
        .au1 { animation: fadeUp .6s .1s cubic-bezier(.22,.61,.36,1) both; }
        .au2 { animation: fadeUp .6s .2s cubic-bezier(.22,.61,.36,1) both; }
        .au3 { animation: fadeUp .6s .3s cubic-bezier(.22,.61,.36,1) both; }
        .au4 { animation: fadeUp .6s .4s cubic-bezier(.22,.61,.36,1) both; }
        .mq { animation: marquee 28s linear infinite; }
        .mq:hover { animation-play-state:paused; }
        .pr { animation: pulseRing 2s ease-out infinite; }
        .drift { animation: drift 8s ease-in-out infinite; }
        .hgrid { background-image:linear-gradient(rgba(14,165,233,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,.09) 1px,transparent 1px); background-size:48px 48px; }
        .fcard { background:#fff; border:1px solid #DCEEFF; border-radius:16px; padding:24px 22px; transition:box-shadow .3s cubic-bezier(.22,.61,.36,1), border-color .3s cubic-bezier(.22,.61,.36,1), transform .3s cubic-bezier(.22,.61,.36,1); }
        .fcard:hover { box-shadow:0 14px 34px rgba(14,116,233,.12); border-color:#BAE0FD; transform:translateY(-4px); }
        .scard { background:#fff; border:1px solid #DCEEFF; border-radius:18px; padding:26px; transition:box-shadow .3s cubic-bezier(.22,.61,.36,1), transform .3s cubic-bezier(.22,.61,.36,1), border-color .3s cubic-bezier(.22,.61,.36,1); }
        .scard:hover { box-shadow:0 16px 38px rgba(14,116,233,.12); transform:translateY(-4px); border-color:#BAE0FD; }
        .stcard { background:#fff; border-radius:18px; padding:26px 20px; text-align:center; border:1px solid #DCEEFF; transition:all .3s cubic-bezier(.22,.61,.36,1); }
        .stcard:hover { transform:translateY(-4px); box-shadow:0 16px 36px rgba(14,116,233,.1); }
        .tcard { background:#fff; border-radius:18px; padding:24px; border:1px solid #E4F0FE; transition:box-shadow .3s cubic-bezier(.22,.61,.36,1), transform .3s cubic-bezier(.22,.61,.36,1), border-color .3s cubic-bezier(.22,.61,.36,1); position:relative; overflow:hidden; }
        .tcard:hover { transform:translateY(-4px); box-shadow:0 18px 40px rgba(14,116,233,.14); border-color:#FED7AA; }
        .tcard::before { content:""; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#0EA5E9,#F97316); opacity:.0; transition:opacity .3s; }
        .tcard:hover::before { opacity:1; }
        .btncta { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(120deg,#0EA5E9,#2563EB); color:#fff; font-family:'Syne',sans-serif; font-weight:700; font-size:14px; padding:13px 26px; border-radius:11px; border:none; cursor:pointer; transition:background-position .35s cubic-bezier(.22,.61,.36,1), transform .22s cubic-bezier(.22,.61,.36,1), box-shadow .22s cubic-bezier(.22,.61,.36,1); text-decoration:none; background-size:170% 170%; background-position:0% 50%; }
        .btncta:hover { background-position:100% 50%; transform:translateY(-2px); box-shadow:0 10px 26px rgba(14,165,233,.28); color:#fff; }
        .btngl { display:inline-flex; align-items:center; gap:8px; background:#fff; color:#0B1C3D; font-family:'DM Sans',sans-serif; font-weight:500; font-size:13.5px; padding:12px 21px; border-radius:11px; border:1px solid #BFDDFB; cursor:pointer; transition:background .22s cubic-bezier(.22,.61,.36,1), border-color .22s cubic-bezier(.22,.61,.36,1); text-decoration:none; }
        .btngl:hover { background:#F0F8FF; border-color:#0EA5E9; }
        .navglass { backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); background:rgba(255,255,255,.9); border-bottom:1px solid rgba(11,28,61,.06); box-shadow:0 6px 20px rgba(14,116,233,.08); }
        .navsolid { background:#F5FAFF; border-bottom:1px solid rgba(11,28,61,.04); }
        .navbtn-outline { display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#fff; color:#0B1C3D; font-family:'DM Sans',sans-serif; font-weight:500; border:1px solid rgba(14,165,233,.3); border-radius:11px; cursor:pointer; text-decoration:none; transition:background .2s cubic-bezier(.22,.61,.36,1), border-color .2s cubic-bezier(.22,.61,.36,1); }
        .navbtn-outline:hover { background:rgba(14,165,233,.08); border-color:rgba(14,165,233,.55); }
        .nav-desktop-actions { display:flex; align-items:center; gap:6px; }
        .nav-toggle { display:none; align-items:center; justify-content:center; width:38px; height:38px; border-radius:10px; border:1px solid #DCEEFF; background:#fff; color:#0B1C3D; cursor:pointer; flex-shrink:0; transition:background .2s, border-color .2s; }
        .nav-toggle:hover { background:#F0F8FF; border-color:#BAE0FD; }
        .nav-mobile-panel { background:#fff; border-top:1px solid rgba(11,28,61,.05); box-shadow:0 12px 26px rgba(14,116,233,.1); animation:slideDown .2s cubic-bezier(.22,.61,.36,1) both; }
        @media (min-width: 641px) { .nav-mobile-panel { display:none !important; } }
        .lcard { background:#fff; border-radius:18px; padding:22px 18px; border:1px solid #DCEEFF; text-align:center; transition:all .3s cubic-bezier(.22,.61,.36,1); }
        .lcard:hover { box-shadow:0 14px 34px rgba(14,116,233,.1); transform:translateY(-3px); }
        .blob { position:absolute; border-radius:50%; filter:blur(74px); pointer-events:none; }
        .iconwrap { width:42px; height:42px; border-radius:11px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
        .navlink { color:#3B506E; font-size:13px; font-weight:500; padding:8px 14px; border-radius:8px; text-decoration:none; transition:color .2s, background .2s; }
        .navlink:hover { color:#0B1C3D; background:rgba(14,165,233,.08); }
        * { box-sizing:border-box; }

        /* ---- Responsive scale: tablets ---- */
        @media (max-width: 900px) {
          .grid-2 { grid-template-columns:1fr !important; }
          .grid-3 { grid-template-columns:1fr 1fr !important; }
          .grid-4 { grid-template-columns:1fr 1fr !important; }
        }

        /* ---- Responsive scale: small tablets / large phones ---- */
        @media (max-width: 640px) {
          .grid-3 { grid-template-columns:1fr !important; }
          .nav-subtitle { display:none; }
          .nav-desktop-actions { display:none !important; }
          .nav-toggle { display:flex !important; }
        }

        /* ---- Responsive scale: phones ---- */
        @media (max-width: 480px) {
          .grid-4 { grid-template-columns:1fr 1fr !important; gap:12px !important; }
          .btncta, .btngl, .navbtn-outline { font-size:13px !important; padding:11px 18px !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .au, .au1, .au2, .au3, .au4, .mq, .pr, .drift, .nav-mobile-panel { animation: none !important; }
          .fcard, .scard, .stcard, .tcard, .lcard, .btncta, .btngl, .navbtn-outline, .nav-toggle { transition: none !important; }
        }
      `}</style>
      <div className="lp">
        {/* NAV */}
        <nav className={`${navScrolled ? 'navglass' : 'navsolid'}`} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, transition: 'background .3s, backdrop-filter .3s, box-shadow .3s' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '13px clamp(16px,4vw,24px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', minWidth: 0 }} onClick={() => setMobileNavOpen(false)}>
              <GSHLogo size={36} />
              <div style={{ minWidth: 0 }}>
                <div className="dp" style={{ color: '#0B1C3D', fontWeight: 700, fontSize: 14, lineHeight: 1.2, letterSpacing: '.01em', whiteSpace: 'nowrap' }}>Global Simulation Hub</div>
                <div className="nav-subtitle" style={{ color: '#0EA5E9', fontSize: 9, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 2, whiteSpace: 'nowrap' }}>Engineering · Simulation · Delivery</div>
              </div>
            </Link>

            {/* Desktop actions — hidden below 640px in favor of the hamburger menu */}
            <div className="nav-desktop-actions">
              <Link to="/apply-expert" className="navlink">Become Expert</Link>
              <Link to="/login" className="navbtn-outline" style={{ fontSize: 12.5, padding: '9px 16px' }}>Login</Link>
              <Link to="/submit" className="btncta" style={{ fontSize: 12.5, padding: '10px 17px' }}>
                Submit Project
                <Icon name="arrow-right" size={13} />
              </Link>
            </div>

            {/* Hamburger toggle — shown only on small screens */}
            <button
              type="button"
              className="nav-toggle"
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              <Icon name={mobileNavOpen ? 'x' : 'menu'} size={18} color="#0B1C3D" />
            </button>
          </div>

          {/* Mobile dropdown — Become Expert, Login, Submit Project stacked full-width */}
          {mobileNavOpen && (
            <div className="nav-mobile-panel">
              <div style={{ maxWidth: 1200, margin: '0 auto', padding: '6px clamp(16px,4vw,24px) 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/apply-expert" className="navlink" style={{ padding: '13px 14px', fontSize: 14 }} onClick={() => setMobileNavOpen(false)}>
                  Become Expert
                </Link>
                <Link to="/login" className="navbtn-outline" style={{ width: '100%', fontSize: 14, padding: '13px 16px' }} onClick={() => setMobileNavOpen(false)}>
                  Login
                </Link>
                <Link to="/submit" className="btncta" style={{ width: '100%', fontSize: 14, padding: '13px 16px' }} onClick={() => setMobileNavOpen(false)}>
                  Submit Project
                  <Icon name="arrow-right" size={14} />
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* HERO — light blue, the color that carries the whole page */}
        <section style={{ minHeight: '92vh', background: 'linear-gradient(180deg,#F5FAFF 0%,#E4F1FE 100%)', position: 'relative', display: 'flex', alignItems: 'center', paddingTop: 'clamp(80px,13vw,92px)', paddingBottom: 'clamp(44px,7vw,56px)', overflow: 'hidden' }} className="hgrid">
          <div className="blob drift" style={{ width: 440, height: 440, background: 'rgba(14,165,233,.14)', top: '14%', left: '6%' }} />
          <div className="blob drift" style={{ width: 380, height: 380, background: 'rgba(249,115,22,.10)', bottom: '8%', right: '4%', animationDelay: '3s' }} />
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,4vw,24px)', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(28px,6vw,56px)', alignItems: 'center', position: 'relative' }} className="grid-2">
            <div>
              <div className="au" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #BFE0FB', borderRadius: 999, padding: '6px 15px', marginBottom: 22 }}>
                <span className="pr" style={{ width: 7, height: 7, borderRadius: '50%', background: '#0EA5E9', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ color: '#0369A1', fontSize: 11, fontWeight: 600, letterSpacing: '.04em' }}>Engineering Simulation Marketplace</span>
              </div>
              <h1 className="dp au1" style={{ fontSize: 'clamp(30px, 3.6vw, 44px)', fontWeight: 800, lineHeight: 1.14, color: '#0B1C3D', margin: '0 0 18px', minHeight: 'calc(3 * 1.14 * clamp(30px, 3.6vw, 44px))' }}>
                {heroTyped[0]}
                {heroCaretLine === 0 && <span className="caret" style={{ color: '#0B1C3D' }} />}
                <br />
                <span style={{ background: 'linear-gradient(120deg,#0EA5E9,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{heroTyped[1]}</span>
                {heroCaretLine === 1 && <span className="caret" style={{ color: '#F97316' }} />}
                <br />
                {heroTyped[2]}
                {heroCaretLine === 2 && <span className="caret" style={{ color: '#0B1C3D' }} />}
              </h1>
              <p className="au2" style={{ color: '#4C6076', fontSize: 15.5, lineHeight: 1.7, maxWidth: 430, margin: '0 0 28px' }}>
                Connect with verified engineers for MATLAB, Proteus, ANSYS & more. Submit your project in 60 seconds — no account needed.
              </p>
              <div className="au3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 30 }}>
                <Link to="/submit" className="btncta" style={{ fontSize: 14, padding: '14px 27px' }}>
                  Submit a Project
                  <Icon name="arrow-right" size={15} />
                </Link>
                <Link to="/apply-expert" className="btngl" style={{ fontSize: 14, padding: '14px 24px' }}>Join as Expert</Link>
              </div>
              <div className="au4" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {['No account needed', 'Secure delivery', 'Expert-verified'].map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="check" size={13} color="#0EA5E9" strokeWidth={3} />
                    <span style={{ color: '#64748B', fontSize: 12.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating card */}
            <div className="au" style={{ position: 'relative', padding: '18px 0' }}>
              <div style={{ background: '#fff', border: '1px solid #DCEEFF', borderRadius: 22, padding: 'clamp(20px,3vw,26px)', boxShadow: '0 26px 60px rgba(14,116,233,.16)', animation: 'floatY 6s ease-in-out infinite' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#0EA5E9,#2563EB)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: 'Syne,sans-serif', flexShrink: 0 }}>M</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: '#0B1C3D', fontSize: 13.5, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>DC Motor Speed Control</p>
                      <p style={{ color: '#8092A8', fontSize: 11, margin: 0 }}>MATLAB/Simulink · R2024a</p>
                    </div>
                  </div>
                  <span style={{ padding: '5px 12px', background: '#FFF7E6', color: '#B45309', fontSize: 10.5, borderRadius: 999, border: '1px solid #FDE7BC', fontWeight: 600, whiteSpace: 'nowrap' }}>In Progress</span>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8092A8', fontSize: 12, marginBottom: 8 }}>
                    <span>Expert progress</span><span style={{ color: '#0EA5E9', fontWeight: 600 }}>73%</span>
                  </div>
                  <div style={{ height: 7, background: '#EAF4FF', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '73%', background: 'linear-gradient(90deg,#0EA5E9,#F97316)', borderRadius: 99, transition: 'width 1.2s ease' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 15px', background: '#F5FAFF', borderRadius: 13, border: '1px solid #E4F0FE', marginBottom: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#F97316,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>AK</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#0B1C3D', fontSize: 13, fontWeight: 600, margin: 0 }}>Ahmed K.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <StarRow count={5} size={10} />
                      <span style={{ color: '#8092A8', fontSize: 10.5, marginLeft: 2 }}>4.9 · Elite</span>
                    </div>
                  </div>
                  <div style={{ width: 8, height: 8, background: '#22C55E', borderRadius: '50%', flexShrink: 0 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#8092A8', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="clock" size={12} color="#8092A8" />Est. 4h remaining</span>
                  <span style={{ color: '#0EA5E9', fontWeight: 600 }}>Urgent delivery</span>
                </div>
              </div>
              <div style={{ position: 'absolute', top: -8, right: -8, background: '#16A34A', color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '6px 13px 6px 11px', borderRadius: 999, boxShadow: '0 6px 16px rgba(22,163,74,.3)', animation: 'floatY 4s .5s ease-in-out infinite', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="check" size={11} color="#fff" strokeWidth={3.2} />QC Passed
              </div>
              <div style={{ position: 'absolute', bottom: -8, left: -8, background: '#fff', color: '#0B1C3D', fontSize: 10.5, fontWeight: 700, padding: '6px 13px', borderRadius: 999, border: '1px solid #DCEEFF', boxShadow: '0 8px 22px rgba(14,116,233,.14)', display: 'flex', alignItems: 'center', gap: 6, animation: 'floatY 5s 1s ease-in-out infinite' }}>
                <span style={{ width: 7, height: 7, background: 'linear-gradient(135deg,#0EA5E9,#F97316)', borderRadius: '50%' }} />1,200+ Projects Delivered
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div style={{ background: '#DCEEFF', padding: '13px 0', overflow: 'hidden', borderTop: '1px solid #CCE4FA', borderBottom: '1px solid #CCE4FA' }}>
          <div className="mq" style={{ display: 'flex', width: 'max-content' }}>
            {[...tools, ...tools].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '0 26px' }}>
                <span style={{ color: '#5B84AC', fontSize: 11.5, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{t}</span>
                <span style={{ width: 4, height: 4, background: '#9FC7E8', borderRadius: '50%' }} />
              </div>
            ))}
          </div>
        </div>

        {/* STATS */}
        <section ref={statsRef.ref} style={{ padding: 'clamp(44px,7vw,60px) clamp(16px,4vw,24px) clamp(50px,8vw,68px)', background: '#EAF4FF' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }} className="grid-4">
            {[
              { value: c1, suffix: '+', label: 'Projects Delivered' },
              { value: c2, suffix: '%', label: 'Client Satisfaction' },
              { value: c3, suffix: '', label: 'Expert Engineers' },
              { value: c4, suffix: 'h', label: 'Min Delivery Time' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="stcard">
                <p className="dp" style={{ fontSize: 'clamp(24px,4vw,30px)', fontWeight: 800, color: '#0B1C3D', margin: '0 0 6px', lineHeight: 1 }}>{value}{suffix}</p>
                <p style={{ color: '#8092A8', fontSize: 12.5, margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,24px)', background: '#F5FAFF' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 42 }}>
                <span style={{ color: '#EA580C', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>How It Works</span>
                <h2 className="dp" style={{ fontSize: 'clamp(22px,2.8vw,30px)', fontWeight: 800, color: '#0B1C3D', margin: 0 }}>Four steps to results</h2>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }} className="grid-4">
              {steps.map((s, i) => (
                <Reveal key={i} delay={i * 80}>
                  <div className="scard">
                    <div className="dp" style={{ fontSize: 'clamp(26px,3.2vw,32px)', fontWeight: 800, background: 'linear-gradient(135deg,#0EA5E9,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 12, opacity: 0.35 }}>{s.n}</div>
                    <h3 className="dp" style={{ fontSize: 16, fontWeight: 700, color: '#0B1C3D', margin: '0 0 8px' }}>{s.title}</h3>
                    <p style={{ color: '#64748B', fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>{s.body}</p>
                    <div style={{ width: 28, height: 3, background: 'linear-gradient(90deg,#0EA5E9,#F97316)', borderRadius: 99, marginTop: 16 }} />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ padding: 'clamp(48px,8vw,76px) clamp(16px,4vw,24px) clamp(52px,9vw,80px)', background: '#DCEEFF', position: 'relative', overflow: 'hidden' }}>
          <div className="blob" style={{ width: 400, height: 400, background: 'rgba(249,115,22,.08)', top: '-8%', right: '-6%' }} />
          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 42 }}>
                <span style={{ color: '#0369A1', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Platform Features</span>
                <h2 className="dp" style={{ fontSize: 'clamp(22px,2.8vw,30px)', fontWeight: 800, color: '#0B1C3D', margin: 0 }}>Why engineers choose GSH</h2>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="grid-3">
              {features.map(({ icon, title, body, tint }, i) => (
                <Reveal key={title} delay={(i % 3) * 80}>
                  <div className="fcard">
                    <div className="iconwrap" style={{ background: `${tint}14`, border: `1px solid ${tint}33` }}>
                      <Icon name={icon} size={19} color={tint} />
                    </div>
                    <h3 className="dp" style={{ color: '#0B1C3D', fontWeight: 700, fontSize: 15, margin: '0 0 7px' }}>{title}</h3>
                    <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ padding: 'clamp(48px,8vw,76px) clamp(16px,4vw,24px) clamp(52px,9vw,80px)', background: '#F5FAFF' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <span style={{ color: '#0EA5E9', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Client Voices</span>
                <h2 className="dp" style={{ fontSize: 'clamp(22px,2.8vw,30px)', fontWeight: 800, color: '#0B1C3D', margin: '0 0 10px' }}>Trusted by engineers worldwide</h2>
                <p style={{ color: '#8092A8', fontSize: 13.5, maxWidth: 460, margin: '0 auto' }}>Real results from students and professionals who needed simulations done right.</p>
              </div>
            </Reveal>

            <Reveal>
              <div style={{ background: 'linear-gradient(135deg,#0EA5E9,#2563EB)', borderRadius: 22, padding: 'clamp(28px,5vw,40px) clamp(20px,5vw,44px)', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
                <div className="blob" style={{ width: 240, height: 240, background: 'rgba(249,115,22,.20)', top: '-30%', left: '-6%' }} />
                <div className="blob" style={{ width: 200, height: 200, background: 'rgba(255,255,255,.14)', bottom: '-40%', right: '4%' }} />
                <div style={{ position: 'relative', maxWidth: 660, margin: '0 auto', textAlign: 'center' }}>
                  <Icon name="quote" size={26} color="#FED7AA" />
                  <p className="dp" style={{ color: '#fff', fontSize: 'clamp(16px,2.1vw,19px)', lineHeight: 1.55, fontWeight: 600, margin: '16px 0 20px' }}>
                    "{featured.quote}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Avatar photo={featured.photo} initials={featured.initials} size={38} gradient="linear-gradient(135deg,#F97316,#FDBA74)" />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: 0 }}>{featured.name}</p>
                      <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 11.5, margin: 0 }}>{featured.role}</p>
                    </div>
                    <StarRow count={featured.rating} color="#FED7AA" />
                  </div>
                </div>
              </div>
            </Reveal>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="grid-3">
              {testimonials.slice(1).map((t, i) => (
                <Reveal key={t.name} delay={i * 90}>
                  <div className="tcard">
                    <Icon name="quote" size={18} color="#7DD3FC" />
                    <p style={{ color: '#3B506E', fontSize: 13.5, lineHeight: 1.65, margin: '12px 0 18px' }}>{t.quote}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar photo={t.photo} initials={t.initials} size={34} gradient={i % 2 === 0 ? 'linear-gradient(135deg,#0EA5E9,#38BDF8)' : 'linear-gradient(135deg,#F97316,#FB923C)'} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#0B1C3D', fontWeight: 600, fontSize: 13, margin: 0 }}>{t.name}</p>
                        <p style={{ color: '#8092A8', fontSize: 11, margin: 0 }}>{t.role}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}><StarRow count={t.rating} /></div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* EXPERT LEVELS */}
        <section style={{ padding: 'clamp(48px,8vw,76px) clamp(16px,4vw,24px) clamp(52px,9vw,80px)', background: '#EAF4FF' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <span style={{ color: '#EA580C', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Expert Tiers</span>
                <h2 className="dp" style={{ fontSize: 'clamp(22px,2.8vw,30px)', fontWeight: 800, color: '#0B1C3D', margin: '0 0 10px' }}>Ranked by performance</h2>
                <p style={{ color: '#8092A8', fontSize: 13.5, maxWidth: 460, margin: '0 auto' }}>Every expert advances based on completed projects, ratings, and success rate.</p>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }} className="grid-4">
              {levels.map((l, i) => (
                <Reveal key={l.label} delay={i * 80}>
                  <div className="lcard">
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: l.color + '14', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <StarRow count={l.stars} size={9} color={l.color} />
                    </div>
                    <p className="dp" style={{ fontWeight: 700, color: '#0B1C3D', margin: '0 0 4px', fontSize: 14 }}>{l.label}</p>
                    <p style={{ color: '#8092A8', fontSize: 11.5, margin: '0 0 10px' }}>{l.projects}</p>
                    <div style={{ height: 5, background: '#EAF4FF', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(i + 1) * 25}%`, background: l.color, borderRadius: 99, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: 'clamp(56px,9vw,84px) clamp(16px,4vw,24px)', background: 'linear-gradient(135deg,#0EA5E9 0%,#2563EB 60%,#1D4ED8 100%)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <div className="blob drift" style={{ width: 460, height: 280, background: 'rgba(249,180,60,.20)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          <Reveal>
            <div style={{ position: 'relative', maxWidth: 620, margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 999, padding: '6px 16px', marginBottom: 26 }}>
                <span style={{ width: 7, height: 7, background: '#BBF7D0', borderRadius: '50%', display: 'inline-block' }} />
                <span style={{ color: 'rgba(255,255,255,.85)', fontSize: 12, fontWeight: 500 }}>Platform live — accepting projects now</span>
              </div>
              <h2 className="dp" style={{ fontSize: 'clamp(24px,3.1vw,34px)', fontWeight: 800, color: '#fff', margin: '0 0 16px', lineHeight: 1.15 }}>
                Ready to get your<br />
                <span style={{ color: '#FED7AA' }}>simulation done?</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 14, margin: '0 0 30px', lineHeight: 1.7 }}>No account needed. Describe your project and we'll set everything up automatically.</p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/submit" className="btncta" style={{ fontSize: 14, padding: '15px 32px', background: '#fff', color: '#1D4ED8' }}>
                  Submit a Project
                  <Icon name="arrow-right" size={15} color="#1D4ED8" />
                </Link>
                <Link to="/apply-expert" className="btngl" style={{ fontSize: 14, padding: '15px 28px', background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.32)' }}>Become an Expert</Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* FOOTER — a deeper blue anchor at the base of the page */}
        <footer style={{ background: 'linear-gradient(180deg,#0F2A57,#0B1E3F)', padding: '48px clamp(16px,4vw,24px) 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 36, marginBottom: 40 }} className="grid-2">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <GSHLogo size={34} />
                  <div>
                    <p className="dp" style={{ color: '#fff', fontWeight: 700, fontSize: 13.5, margin: 0 }}>Global Simulation Hub</p>
                    <p style={{ color: '#5D7DAA', fontSize: 11, margin: 0 }}>Engineering excellence, delivered.</p>
                  </div>
                </div>
                <p style={{ color: '#5D7DAA', fontSize: 12.5, lineHeight: 1.7, margin: 0 }}>Connecting the world's best simulation engineers with clients who need results — fast, verified, and secure.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 26 }} className="grid-3">
                {[
                  { title: 'Platform', links: [['Submit Project', '/submit'], ['Become Expert', '/apply-expert'], ['Login', '/login'], ['Register', '/register']] },
                  { title: 'Software', links: [['MATLAB/Simulink', '#'], ['Proteus', '#'], ['ANSYS', '#'], ['LabVIEW', '#'], ['PSCAD', '#']] },
                  { title: 'Delivery', links: [['Express · 6-12h', '#'], ['Urgent · 24h', '#'], ['Standard · Flexible', '#']] },
                ].map(({ title, links }) => (
                  <div key={title}>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: 12.5, margin: '0 0 12px' }}>{title}</p>
                    {links.map(([label, href]) => (
                      <Link key={label} to={href} style={{ display: 'block', color: '#5D7DAA', fontSize: 12, margin: '0 0 9px', textDecoration: 'none' }}>{label}</Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ color: '#3E5A83', fontSize: 11.5, margin: 0 }}>© {new Date().getFullYear()} Global Simulation Hub. All rights reserved.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 7, height: 7, background: '#4ADE80', borderRadius: '50%' }} />
                <span style={{ color: '#3E5A83', fontSize: 11.5 }}>All systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
