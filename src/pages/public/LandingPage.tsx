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

/* --------------------------------- icons ---------------------------------- */
/* Hand-built line icons (no emoji anywhere on the page) */

type IconName =
  | 'zap' | 'shield' | 'check-circle' | 'cpu' | 'globe' | 'bar-chart'
  | 'lock' | 'credit-card' | 'book-open' | 'clock' | 'check' | 'star'
  | 'quote' | 'arrow-right' | 'menu' | 'x'

function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 1.8 }:
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

function StarRow({ count, size = 13, color = '#F59E0B' }: { count: number; size?: number; color?: string }) {
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

function GSHLogo({ size = 44 }: { size?: number }) {
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

/* Gradient wave divider used to blend sections together instead of a hard cut.
   Blue -> orange, echoing the circuit-blue / Simulink-orange of the brand mark. */
function WaveDivider({ from, to, flip = false }: { from: string; to: string; flip?: boolean }) {
  const gradId = `wave-${from}-${to}`.replace(/[^a-zA-Z0-9-]/g, '')
  return (
    <div style={{ background: from, lineHeight: 0, transform: flip ? 'scaleX(-1)' : undefined }}>
      <svg viewBox="0 0 1440 90" width="100%" height="60" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
        <path d="M0,32 C240,80 480,0 720,28 C960,56 1200,84 1440,24 L1440,90 L0,90 Z" fill={to} />
        <path d="M0,20 C240,64 480,-8 720,18 C960,46 1200,70 1440,12" fill="none" stroke={`url(#${gradId})`} strokeWidth="2.5" opacity="0.55" />
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
  { icon: 'zap', title: 'Express Delivery', body: 'Results in 6-12h with our express tier. Urgent (24h) and Standard also available.', tint: '#38BDF8' },
  { icon: 'shield', title: 'Verified Experts', body: 'Every expert passes a 2-hour live simulation test. Only top 15% accepted.', tint: '#FB923C' },
  { icon: 'check-circle', title: 'Quality Control', body: 'Admin reviews every submission before delivery. No shortcuts, no compromises.', tint: '#38BDF8' },
  { icon: 'cpu', title: 'Smart Matching', body: 'AI matches your project to the highest-rated available expert by skill.', tint: '#FB923C' },
  { icon: 'globe', title: 'Global Platform', body: 'Multi-currency, multi-timezone. Submit anywhere, get results worldwide.', tint: '#38BDF8' },
  { icon: 'bar-chart', title: 'Full Transparency', body: 'Track every stage: Received → Assigned → QC → Completed.', tint: '#FB923C' },
  { icon: 'lock', title: 'NDA Support', body: 'Enable confidential mode. Expert must sign NDA before accessing files.', tint: '#38BDF8' },
  { icon: 'credit-card', title: 'Flexible Payments', body: 'Pay 50% advance, 50% on delivery. Wallet system for repeat clients.', tint: '#FB923C' },
  { icon: 'book-open', title: 'Educational Mode', body: 'Optionally receive a PDF or video explanation of your simulation.', tint: '#38BDF8' },
]

const levels = [
  { label: 'Beginner', color: '#64748B', projects: '1-10 projects', stars: 1 },
  { label: 'Verified', color: '#0EA5E9', projects: '11-30 projects', stars: 2 },
  { label: 'Top Expert', color: '#F59E0B', projects: '31-60 projects', stars: 3 },
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
      transform: inView ? 'translateY(0)' : 'translateY(26px)',
      transition: `opacity .7s cubic-bezier(.22,.61,.36,1) ${delay}ms, transform .7s cubic-bezier(.22,.61,.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false)
  const statsRef = useInView()
  const c1 = useCounter(1200, 2000, statsRef.inView)
  const c2 = useCounter(98, 2000, statsRef.inView)
  const c3 = useCounter(47, 2000, statsRef.inView)
  const c4 = useCounter(6, 2000, statsRef.inView)

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        .lp { font-family: 'DM Sans', sans-serif; }
        .dp { font-family: 'Syne', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatY { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-14px); } }
        @keyframes pulseRing { 0% { box-shadow:0 0 0 0 rgba(56,189,248,.6); } 100% { box-shadow:0 0 0 10px rgba(56,189,248,0); } }
        @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        @keyframes drift { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(20px,-16px) scale(1.05); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .au { animation: fadeUp .7s cubic-bezier(.22,.61,.36,1) both; }
        .au1 { animation: fadeUp .7s .12s cubic-bezier(.22,.61,.36,1) both; }
        .au2 { animation: fadeUp .7s .24s cubic-bezier(.22,.61,.36,1) both; }
        .au3 { animation: fadeUp .7s .36s cubic-bezier(.22,.61,.36,1) both; }
        .au4 { animation: fadeUp .7s .48s cubic-bezier(.22,.61,.36,1) both; }
        .mq { animation: marquee 30s linear infinite; }
        .mq:hover { animation-play-state:paused; }
        .pr { animation: pulseRing 2s ease-out infinite; }
        .drift { animation: drift 9s ease-in-out infinite; }
        .hgrid { background-image:linear-gradient(rgba(14,165,233,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,.06) 1px,transparent 1px); background-size:52px 52px; }
        .fcard { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:18px; padding:28px 24px; transition:background .35s cubic-bezier(.22,.61,.36,1), border-color .35s cubic-bezier(.22,.61,.36,1), transform .35s cubic-bezier(.22,.61,.36,1); }
        .fcard:hover { background:linear-gradient(160deg, rgba(14,165,233,.10), rgba(249,115,22,.10)); border-color:rgba(148,190,255,.35); transform:translateY(-5px); }
        .scard { background:#fff; border:1px solid #E2E8F0; border-radius:20px; padding:28px; transition:box-shadow .35s cubic-bezier(.22,.61,.36,1), transform .35s cubic-bezier(.22,.61,.36,1), border-color .35s cubic-bezier(.22,.61,.36,1); }
        .scard:hover { box-shadow:0 18px 50px rgba(11,28,61,.10); transform:translateY(-5px); border-color:#BAE6FD; }
        .stcard { background:#fff; border-radius:20px; padding:30px 22px; text-align:center; border:1px solid #F1F5F9; transition:all .35s cubic-bezier(.22,.61,.36,1); }
        .stcard:hover { transform:translateY(-5px); box-shadow:0 18px 44px rgba(11,28,61,.09); }
        .tcard { background:#fff; border-radius:20px; padding:26px; border:1px solid #EEF2FF; transition:box-shadow .35s cubic-bezier(.22,.61,.36,1), transform .35s cubic-bezier(.22,.61,.36,1), border-color .35s cubic-bezier(.22,.61,.36,1); position:relative; overflow:hidden; }
        .tcard:hover { transform:translateY(-5px); box-shadow:0 20px 48px rgba(11,28,61,.12); border-color:#FED7AA; }
        .tcard::before { content:""; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#0EA5E9,#F97316); opacity:.0; transition:opacity .35s; }
        .tcard:hover::before { opacity:1; }
        .btncta { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(120deg,#0EA5E9,#F97316); color:#fff; font-family:'Syne',sans-serif; font-weight:700; font-size:15px; padding:14px 28px; border-radius:12px; border:none; cursor:pointer; transition:background-position .4s cubic-bezier(.22,.61,.36,1), transform .25s cubic-bezier(.22,.61,.36,1), box-shadow .25s cubic-bezier(.22,.61,.36,1); text-decoration:none; background-size:170% 170%; background-position:0% 50%; }
        .btncta:hover { background-position:100% 50%; transform:translateY(-2px); box-shadow:0 12px 30px rgba(249,115,22,.3); color:#fff; }
        .btngl { display:inline-flex; align-items:center; gap:8px; background:transparent; color:rgba(255,255,255,.88); font-family:'DM Sans',sans-serif; font-weight:500; font-size:14.5px; padding:13px 23px; border-radius:12px; border:1px solid rgba(255,255,255,.2); cursor:pointer; transition:background .25s cubic-bezier(.22,.61,.36,1), border-color .25s cubic-bezier(.22,.61,.36,1), color .25s cubic-bezier(.22,.61,.36,1); text-decoration:none; }
        .btngl:hover { background:rgba(255,255,255,.08); border-color:rgba(56,189,248,.5); color:#fff; }
        .navglass { backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); background:rgba(11,28,61,.9); border-bottom:1px solid rgba(255,255,255,.08); }
        .navsolid { background:#0B1C3D; }
        .lcard { background:#fff; border-radius:20px; padding:24px 20px; border:1px solid #F1F5F9; text-align:center; transition:all .35s cubic-bezier(.22,.61,.36,1); }
        .lcard:hover { box-shadow:0 14px 40px rgba(11,28,61,.10); transform:translateY(-4px); }
        .blob { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
        .iconwrap { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
        .navlink { color:rgba(255,255,255,.72); font-size:13.5px; font-weight:500; padding:8px 14px; border-radius:8px; text-decoration:none; transition:color .2s, background .2s; }
        .navlink:hover { color:#fff; background:rgba(255,255,255,.06); }
        .mobiletoggle { display:none; }
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
          .navlink.nav-extra { display:none; }
          .nav-subtitle { display:none; }
        }

        /* ---- Responsive scale: phones ---- */
        @media (max-width: 480px) {
          .grid-4 { grid-template-columns:1fr 1fr !important; gap:12px !important; }
          .btncta, .btngl { font-size:13.5px !important; padding:12px 20px !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .au, .au1, .au2, .au3, .au4, .mq, .pr, .drift { animation: none !important; }
          .fcard, .scard, .stcard, .tcard, .lcard, .btncta, .btngl { transition: none !important; }
        }
      `}</style>
      <div className="lp">
        {/* NAV */}
        <nav className={`${navScrolled ? 'navglass' : 'navsolid'}`} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, transition: 'background .3s, backdrop-filter .3s' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px clamp(16px,4vw,24px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', minWidth: 0 }}>
              <GSHLogo size={40} />
              <div style={{ minWidth: 0 }}>
                <div className="dp" style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2, letterSpacing: '.01em', whiteSpace: 'nowrap' }}>Global Simulation Hub</div>
                <div className="nav-subtitle" style={{ color: '#FDBA74', fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', marginTop: 2, whiteSpace: 'nowrap' }}>Engineering · Simulation · Delivery</div>
              </div>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link to="/apply-expert" className="navlink nav-extra">Become Expert</Link>
              <Link to="/login" className="btngl" style={{ fontSize: 13, padding: '9px 16px' }}>Login</Link>
              <Link to="/submit" className="btncta" style={{ fontSize: 13, padding: '10px 18px' }}>
                Submit Project
                <Icon name="arrow-right" size={14} />
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ minHeight: '100vh', background: '#0B1C3D', position: 'relative', display: 'flex', alignItems: 'center', paddingTop: 'clamp(84px,14vw,96px)', paddingBottom: 'clamp(48px,8vw,64px)', overflow: 'hidden' }} className="hgrid">
          <div className="blob drift" style={{ width: 520, height: 520, background: 'rgba(14,165,233,.10)', top: '16%', left: '8%' }} />
          <div className="blob drift" style={{ width: 460, height: 460, background: 'rgba(249,115,22,.12)', bottom: '10%', right: '6%', animationDelay: '3s' }} />
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,4vw,24px)', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,6vw,64px)', alignItems: 'center' }} className="grid-2">
            <div>
              <div className="au" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,.1)', border: '1px solid rgba(14,165,233,.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 26 }}>
                <span className="pr" style={{ width: 8, height: 8, borderRadius: '50%', background: '#38BDF8', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ color: '#7DD3FC', fontSize: 11.5, fontWeight: 600, letterSpacing: '.05em' }}>Engineering Simulation Marketplace</span>
              </div>
              <h1 className="dp au1" style={{ fontSize: 'clamp(32px, 4.2vw, 54px)', fontWeight: 800, lineHeight: 1.1, color: '#fff', margin: '0 0 20px' }}>
                Simulation<br />
                <span style={{ background: 'linear-gradient(120deg,#38BDF8,#FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Delivered Fast</span><br />
                Globally.
              </h1>
              <p className="au2" style={{ color: '#A3AFC4', fontSize: 16.5, lineHeight: 1.7, maxWidth: 440, margin: '0 0 32px' }}>
                Connect with verified engineers for MATLAB, Proteus, ANSYS & more. Submit your project in 60 seconds — no account needed.
              </p>
              <div className="au3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 36 }}>
                <Link to="/submit" className="btncta" style={{ fontSize: 15, padding: '15px 30px' }}>
                  Submit a Project
                  <Icon name="arrow-right" size={16} />
                </Link>
                <Link to="/apply-expert" className="btngl" style={{ fontSize: 15, padding: '15px 26px' }}>Join as Expert</Link>
              </div>
              <div className="au4" style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
                {['No account needed', 'Secure delivery', 'Expert-verified'].map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="check" size={14} color="#38BDF8" strokeWidth={3} />
                    <span style={{ color: '#7C8CA6', fontSize: 13 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating card */}
            <div className="au" style={{ position: 'relative', padding: '20px 0' }}>
              <div style={{ background: 'rgba(255,255,255,.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: 'clamp(20px,3vw,28px)', boxShadow: '0 32px 80px rgba(0,0,0,.4)', animation: 'floatY 6s ease-in-out infinite' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#0EA5E9,#F97316)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'Syne,sans-serif', flexShrink: 0 }}>M</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>DC Motor Speed Control</p>
                      <p style={{ color: '#7C8CA6', fontSize: 11.5, margin: 0 }}>MATLAB/Simulink · R2024a</p>
                    </div>
                  </div>
                  <span style={{ padding: '5px 12px', background: 'rgba(251,191,36,.08)', color: '#FCD34D', fontSize: 11, borderRadius: 999, border: '1px solid rgba(251,191,36,.15)', fontWeight: 600, whiteSpace: 'nowrap' }}>In Progress</span>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7C8CA6', fontSize: 12.5, marginBottom: 8 }}>
                    <span>Expert progress</span><span style={{ color: '#38BDF8', fontWeight: 600 }}>73%</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '73%', background: 'linear-gradient(90deg,#0EA5E9,#FB923C)', borderRadius: 99, transition: 'width 1.2s ease' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)', marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#F97316,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12.5, flexShrink: 0 }}>AK</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#fff', fontSize: 13.5, fontWeight: 600, margin: 0 }}>Ahmed K.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <StarRow count={5} size={11} />
                      <span style={{ color: '#7C8CA6', fontSize: 11, marginLeft: 2 }}>4.9 · Elite</span>
                    </div>
                  </div>
                  <div style={{ width: 8, height: 8, background: '#4ADE80', borderRadius: '50%', flexShrink: 0 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7C8CA6', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="clock" size={13} color="#7C8CA6" />Est. 4h remaining</span>
                  <span style={{ color: '#38BDF8', fontWeight: 600 }}>Urgent delivery</span>
                </div>
              </div>
              <div style={{ position: 'absolute', top: -8, right: -8, background: '#10B981', color: '#fff', fontSize: 11, fontWeight: 700, padding: '6px 14px 6px 12px', borderRadius: 999, boxShadow: '0 4px 16px rgba(16,185,129,.4)', animation: 'floatY 4s .5s ease-in-out infinite', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="check" size={12} color="#fff" strokeWidth={3.2} />QC Passed
              </div>
              <div style={{ position: 'absolute', bottom: -8, left: -8, background: '#fff', color: '#0B1C3D', fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 999, boxShadow: '0 4px 20px rgba(11,28,61,.18)', display: 'flex', alignItems: 'center', gap: 6, animation: 'floatY 5s 1s ease-in-out infinite' }}>
                <span style={{ width: 7, height: 7, background: 'linear-gradient(135deg,#0EA5E9,#F97316)', borderRadius: '50%' }} />1,200+ Projects Delivered
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div style={{ background: '#060D1F', padding: '14px 0', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
          <div className="mq" style={{ display: 'flex', width: 'max-content' }}>
            {[...tools, ...tools].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '0 28px' }}>
                <span style={{ color: '#3A4A6B', fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{t}</span>
                <span style={{ width: 4, height: 4, background: '#1E3A5F', borderRadius: '50%' }} />
              </div>
            ))}
          </div>
        </div>

        {/* transition: navy -> light */}
        <WaveDivider from="#0B1C3D" to="#F8FAFC" />

        {/* STATS */}
        <section ref={statsRef.ref} style={{ padding: 'clamp(48px,8vw,70px) clamp(16px,4vw,24px) clamp(56px,9vw,80px)', background: '#F8FAFC' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }} className="grid-4">
            {[
              { value: c1, suffix: '+', label: 'Projects Delivered' },
              { value: c2, suffix: '%', label: 'Client Satisfaction' },
              { value: c3, suffix: '', label: 'Expert Engineers' },
              { value: c4, suffix: 'h', label: 'Min Delivery Time' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="stcard">
                <p className="dp" style={{ fontSize: 'clamp(28px,5vw,38px)', fontWeight: 800, color: '#0B1C3D', margin: '0 0 6px', lineHeight: 1 }}>{value}{suffix}</p>
                <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ padding: 'clamp(56px,10vw,96px) clamp(16px,4vw,24px)', background: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <span style={{ color: '#EA580C', fontSize: 11.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>How It Works</span>
                <h2 className="dp" style={{ fontSize: 'clamp(26px,3.2vw,36px)', fontWeight: 800, color: '#0B1C3D', margin: 0 }}>Four steps to results</h2>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }} className="grid-4">
              {steps.map((s, i) => (
                <Reveal key={i} delay={i * 90}>
                  <div className="scard">
                    <div className="dp" style={{ fontSize: 'clamp(32px,4vw,42px)', fontWeight: 800, background: 'linear-gradient(135deg,#E0F2FE,#FFE4CC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 14 }}>{s.n}</div>
                    <h3 className="dp" style={{ fontSize: 17, fontWeight: 700, color: '#0B1C3D', margin: '0 0 10px' }}>{s.title}</h3>
                    <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{s.body}</p>
                    <div style={{ width: 32, height: 3, background: 'linear-gradient(90deg,#0EA5E9,#F97316)', borderRadius: 99, marginTop: 18 }} />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* transition: light -> navy */}
        <WaveDivider from="#fff" to="#0B1C3D" />

        {/* FEATURES */}
        <section style={{ padding: 'clamp(56px,9vw,90px) clamp(16px,4vw,24px) clamp(60px,10vw,96px)', background: '#0B1C3D', position: 'relative', overflow: 'hidden' }}>
          <div className="blob" style={{ width: 460, height: 460, background: 'rgba(249,115,22,.10)', top: '-10%', right: '-6%' }} />
          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <span style={{ color: '#38BDF8', fontSize: 11.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Platform Features</span>
                <h2 className="dp" style={{ fontSize: 'clamp(26px,3.2vw,36px)', fontWeight: 800, color: '#fff', margin: 0 }}>Why engineers choose GSH</h2>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="grid-3">
              {features.map(({ icon, title, body, tint }, i) => (
                <Reveal key={title} delay={(i % 3) * 90}>
                  <div className="fcard">
                    <div className="iconwrap" style={{ background: `${tint}1A`, border: `1px solid ${tint}33` }}>
                      <Icon name={icon} size={21} color={tint} />
                    </div>
                    <h3 className="dp" style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>{title}</h3>
                    <p style={{ color: '#8291AC', fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* transition: navy -> light */}
        <WaveDivider from="#0B1C3D" to="#F8FAFC" />

        {/* TESTIMONIALS */}
        <section style={{ padding: 'clamp(56px,9vw,90px) clamp(16px,4vw,24px) clamp(60px,10vw,96px)', background: '#F8FAFC' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 44 }}>
                <span style={{ color: '#0EA5E9', fontSize: 11.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Client Voices</span>
                <h2 className="dp" style={{ fontSize: 'clamp(26px,3.2vw,36px)', fontWeight: 800, color: '#0B1C3D', margin: '0 0 12px' }}>Trusted by engineers worldwide</h2>
                <p style={{ color: '#94A3B8', fontSize: 14.5, maxWidth: 480, margin: '0 auto' }}>Real results from students and professionals who needed simulations done right.</p>
              </div>
            </Reveal>

            <Reveal>
              <div style={{ background: '#0B1C3D', borderRadius: 24, padding: 'clamp(30px,5vw,44px) clamp(22px,5vw,48px)', marginBottom: 26, position: 'relative', overflow: 'hidden' }}>
                <div className="blob" style={{ width: 260, height: 260, background: 'rgba(249,115,22,.18)', top: '-30%', left: '-6%' }} />
                <div className="blob" style={{ width: 220, height: 220, background: 'rgba(14,165,233,.16)', bottom: '-40%', right: '4%' }} />
                <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
                  <Icon name="quote" size={28} color="#FDBA74" />
                  <p className="dp" style={{ color: '#fff', fontSize: 'clamp(18px,2.4vw,21px)', lineHeight: 1.55, fontWeight: 600, margin: '18px 0 22px' }}>
                    "{featured.quote}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Avatar photo={featured.photo} initials={featured.initials} size={40} gradient="linear-gradient(135deg,#0EA5E9,#F97316)" />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: 13.5, margin: 0 }}>{featured.name}</p>
                      <p style={{ color: '#7C8CA6', fontSize: 12, margin: 0 }}>{featured.role}</p>
                    </div>
                    <StarRow count={featured.rating} />
                  </div>
                </div>
              </div>
            </Reveal>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="grid-3">
              {testimonials.slice(1).map((t, i) => (
                <Reveal key={t.name} delay={i * 100}>
                  <div className="tcard">
                    <Icon name="quote" size={19} color="#7DD3FC" />
                    <p style={{ color: '#334155', fontSize: 14, lineHeight: 1.7, margin: '14px 0 20px' }}>{t.quote}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar photo={t.photo} initials={t.initials} size={36} gradient={i % 2 === 0 ? 'linear-gradient(135deg,#0EA5E9,#38BDF8)' : 'linear-gradient(135deg,#F97316,#FB923C)'} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#0B1C3D', fontWeight: 600, fontSize: 13.5, margin: 0 }}>{t.name}</p>
                        <p style={{ color: '#94A3B8', fontSize: 11.5, margin: 0 }}>{t.role}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: 14 }}><StarRow count={t.rating} /></div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* EXPERT LEVELS */}
        <section style={{ padding: 'clamp(56px,9vw,90px) clamp(16px,4vw,24px) clamp(60px,10vw,96px)', background: '#F8FAFC' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 46 }}>
                <span style={{ color: '#EA580C', fontSize: 11.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Expert Tiers</span>
                <h2 className="dp" style={{ fontSize: 'clamp(26px,3.2vw,36px)', fontWeight: 800, color: '#0B1C3D', margin: '0 0 12px' }}>Ranked by performance</h2>
                <p style={{ color: '#94A3B8', fontSize: 14.5, maxWidth: 480, margin: '0 auto' }}>Every expert advances based on completed projects, ratings, and success rate.</p>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }} className="grid-4">
              {levels.map((l, i) => (
                <Reveal key={l.label} delay={i * 90}>
                  <div className="lcard">
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: l.color + '16', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <StarRow count={l.stars} size={10} color={l.color} />
                    </div>
                    <p className="dp" style={{ fontWeight: 700, color: '#0B1C3D', margin: '0 0 4px', fontSize: 14.5 }}>{l.label}</p>
                    <p style={{ color: '#94A3B8', fontSize: 12, margin: '0 0 12px' }}>{l.projects}</p>
                    <div style={{ height: 5, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(i + 1) * 25}%`, background: l.color, borderRadius: 99, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: 'clamp(64px,10vw,96px) clamp(16px,4vw,24px)', background: 'linear-gradient(135deg,#0B1C3D 0%,#123B7A 50%,#C2410C 100%)', position: 'relative', overflow: 'hidden', textAlign: 'center' }} className="hgrid">
          <div className="blob drift" style={{ width: 500, height: 300, background: 'rgba(251,146,60,.16)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          <Reveal>
            <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 999, padding: '7px 18px', marginBottom: 30 }}>
                <span style={{ width: 8, height: 8, background: '#4ADE80', borderRadius: '50%', display: 'inline-block' }} />
                <span style={{ color: 'rgba(255,255,255,.75)', fontSize: 12.5, fontWeight: 500 }}>Platform live — accepting projects now</span>
              </div>
              <h2 className="dp" style={{ fontSize: 'clamp(28px,3.6vw,42px)', fontWeight: 800, color: '#fff', margin: '0 0 18px', lineHeight: 1.15 }}>
                Ready to get your<br />
                <span style={{ background: 'linear-gradient(120deg,#38BDF8,#FDBA74)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>simulation done?</span>
              </h2>
              <p style={{ color: '#B9C4DE', fontSize: 15, margin: '0 0 36px', lineHeight: 1.7 }}>No account needed. Describe your project and we'll set everything up automatically.</p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/submit" className="btncta" style={{ fontSize: 15, padding: '16px 34px' }}>
                  Submit a Project
                  <Icon name="arrow-right" size={16} />
                </Link>
                <Link to="/apply-expert" className="btngl" style={{ fontSize: 15, padding: '16px 30px' }}>Become an Expert</Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#040C1F', padding: '52px clamp(16px,4vw,24px) 26px', borderTop: '1px solid rgba(255,255,255,.04)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, marginBottom: 44 }} className="grid-2">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <GSHLogo size={38} />
                  <div>
                    <p className="dp" style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0 }}>Global Simulation Hub</p>
                    <p style={{ color: '#3A4A6B', fontSize: 11.5, margin: 0 }}>Engineering excellence, delivered.</p>
                  </div>
                </div>
                <p style={{ color: '#3A4A6B', fontSize: 13, lineHeight: 1.7, margin: 0 }}>Connecting the world's best simulation engineers with clients who need results — fast, verified, and secure.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }} className="grid-3">
                {[
                  { title: 'Platform', links: [['Submit Project', '/submit'], ['Become Expert', '/apply-expert'], ['Login', '/login'], ['Register', '/register']] },
                  { title: 'Software', links: [['MATLAB/Simulink', '#'], ['Proteus', '#'], ['ANSYS', '#'], ['LabVIEW', '#'], ['PSCAD', '#']] },
                  { title: 'Delivery', links: [['Express · 6-12h', '#'], ['Urgent · 24h', '#'], ['Standard · Flexible', '#']] },
                ].map(({ title, links }) => (
                  <div key={title}>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: '0 0 14px' }}>{title}</p>
                    {links.map(([label, href]) => (
                      <Link key={label} to={href} style={{ display: 'block', color: '#3A4A6B', fontSize: 12.5, margin: '0 0 9px', textDecoration: 'none' }}>{label}</Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,.04)', paddingTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ color: '#243352', fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Global Simulation Hub. All rights reserved.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 7, height: 7, background: '#4ADE80', borderRadius: '50%' }} />
                <span style={{ color: '#243352', fontSize: 12 }}>All systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
