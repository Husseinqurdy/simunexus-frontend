import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

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

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function GSHLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="url(#lg1)" />
      <path d="M8 20C8 13.37 13.37 8 20 8C23.5 8 26.67 9.43 29 11.76" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 20H26V26C26 27.1 25.1 28 24 28H20V20Z" fill="white" fillOpacity="0.9" />
      <path d="M14 20H20V28H16C14.9 28 14 27.1 14 26V20Z" fill="white" fillOpacity="0.6" />
      <circle cx="29" cy="12" r="3" fill="#38BDF8" />
      <circle cx="29" cy="12" r="1.5" fill="white" />
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B1C3D" /><stop offset="1" stopColor="#1A3A7A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const tools = ['MATLAB', 'Simulink', 'Proteus', 'ANSYS', 'LabVIEW', 'PSCAD', 'ETAP', 'Multisim', 'HFSS', 'CST Studio']
const steps = [
  { n: '01', title: 'Submit Project', body: 'Describe your simulation. No account needed — we create one automatically.' },
  { n: '02', title: 'Expert Matched', body: 'Smart system assigns the best verified expert for your software and deadline.' },
  { n: '03', title: 'Track Progress', body: 'Watch real-time progress from 0-100% as your expert works on your simulation.' },
  { n: '04', title: 'QC & Download', body: 'Admin reviews quality first, then you get a secure time-limited download link.' },
]
const features = [
  { icon: '⚡', title: 'Express Delivery', body: 'Results in 6-12h with our express tier. Urgent (24h) and Standard also available.' },
  { icon: '🛡️', title: 'Verified Experts', body: 'Every expert passes a 2-hour live simulation test. Only top 15% accepted.' },
  { icon: '✅', title: 'Quality Control', body: 'Admin reviews every submission before delivery. No shortcuts, no compromises.' },
  { icon: '🤖', title: 'Smart Matching', body: 'AI matches your project to the highest-rated available expert by skill.' },
  { icon: '🌍', title: 'Global Platform', body: 'Multi-currency, multi-timezone. Submit anywhere, get results worldwide.' },
  { icon: '📊', title: 'Full Transparency', body: 'Track every stage: Received → Assigned → QC → Completed.' },
  { icon: '🔒', title: 'NDA Support', body: 'Enable confidential mode. Expert must sign NDA before accessing files.' },
  { icon: '💳', title: 'Flexible Payments', body: 'Pay 50% advance, 50% on delivery. Wallet system for repeat clients.' },
  { icon: '📖', title: 'Educational Mode', body: 'Optionally receive a PDF or video explanation of your simulation.' },
]
const levels = [
  { label: 'Beginner', color: '#64748B', projects: '1-10 projects', stars: 1 },
  { label: 'Verified', color: '#0EA5E9', projects: '11-30 projects', stars: 2 },
  { label: 'Top Expert', color: '#F59E0B', projects: '31-60 projects', stars: 3 },
  { label: 'Elite Expert', color: '#8B5CF6', projects: '60+ projects', stars: 4 },
]

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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .lp { font-family: 'DM Sans', sans-serif; }
        .dp { font-family: 'Syne', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatY { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-14px); } }
        @keyframes pulseRing { 0% { box-shadow:0 0 0 0 rgba(56,189,248,.6); } 100% { box-shadow:0 0 0 10px rgba(56,189,248,0); } }
        @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .au { animation: fadeUp .7s ease both; }
        .au1 { animation: fadeUp .7s .12s ease both; }
        .au2 { animation: fadeUp .7s .24s ease both; }
        .au3 { animation: fadeUp .7s .36s ease both; }
        .au4 { animation: fadeUp .7s .48s ease both; }
        .mq { animation: marquee 30s linear infinite; }
        .mq:hover { animation-play-state:paused; }
        .pr { animation: pulseRing 2s ease-out infinite; }
        .hgrid { background-image:linear-gradient(rgba(14,165,233,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,.06) 1px,transparent 1px); background-size:52px 52px; }
        .fcard { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:16px; padding:28px 24px; transition:all .3s; }
        .fcard:hover { background:rgba(14,165,233,.06); border-color:rgba(14,165,233,.3); transform:translateY(-4px); }
        .scard { background:#fff; border:1px solid #E2E8F0; border-radius:20px; padding:28px; transition:all .3s; }
        .scard:hover { box-shadow:0 16px 48px rgba(14,165,233,.12); transform:translateY(-4px); border-color:#BAE6FD; }
        .stcard { background:#fff; border-radius:20px; padding:32px 24px; text-align:center; border:1px solid #F1F5F9; transition:all .3s; }
        .stcard:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(11,28,61,.08); }
        .btncta { display:inline-flex; align-items:center; gap:8px; background:#0EA5E9; color:#fff; font-family:'Syne',sans-serif; font-weight:700; font-size:15px; padding:14px 28px; border-radius:12px; border:none; cursor:pointer; transition:all .2s; text-decoration:none; }
        .btncta:hover { background:#0284C7; transform:translateY(-1px); box-shadow:0 8px 24px rgba(14,165,233,.4); color:#fff; }
        .btngl { display:inline-flex; align-items:center; gap:8px; background:transparent; color:rgba(255,255,255,.85); font-family:'DM Sans',sans-serif; font-weight:500; font-size:15px; padding:14px 24px; border-radius:12px; border:1px solid rgba(255,255,255,.2); cursor:pointer; transition:all .2s; text-decoration:none; }
        .btngl:hover { background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.4); color:#fff; }
        .navglass { backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); background:rgba(11,28,61,.88); border-bottom:1px solid rgba(255,255,255,.08); }
        .navsolid { background:#0B1C3D; }
        .lcard { background:#fff; border-radius:20px; padding:24px; border:1px solid #F1F5F9; text-align:center; transition:all .3s; }
        .lcard:hover { box-shadow:0 12px 36px rgba(0,0,0,.08); transform:translateY(-3px); }
        .blob { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
        * { box-sizing:border-box; }
      `}</style>
      <div className="lp">
        {/* NAV */}
        <nav className={`${navScrolled ? 'navglass' : 'navsolid'}`} style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, transition:'all .3s' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
              <GSHLogo size={36} />
              <div>
                <div className="dp" style={{ color:'#fff', fontWeight:700, fontSize:15, lineHeight:1.2, letterSpacing:'.02em' }}>Global Simulation Hub</div>
                <div style={{ color:'#38BDF8', fontSize:9, fontWeight:600, letterSpacing:'.18em', textTransform:'uppercase', marginTop:1 }}>Engineering · Simulation · Delivery</div>
              </div>
            </Link>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Link to="/apply-expert" style={{ color:'rgba(255,255,255,.7)', fontSize:13, fontWeight:500, padding:'8px 14px', borderRadius:8, textDecoration:'none' }}>Become Expert</Link>
              <Link to="/login" className="btngl" style={{ fontSize:13, padding:'8px 16px' }}>Login</Link>
              <Link to="/submit" className="btncta" style={{ fontSize:13, padding:'10px 20px' }}>
                Submit Project
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ minHeight:'100vh', background:'#0B1C3D', position:'relative', display:'flex', alignItems:'center', paddingTop:96, paddingBottom:64, overflow:'hidden' }} className="hgrid">
          <div className="blob" style={{ width:500, height:500, background:'rgba(14,165,233,.08)', top:'20%', left:'10%' }} />
          <div className="blob" style={{ width:400, height:400, background:'rgba(99,102,241,.08)', bottom:'15%', right:'10%' }} />
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
            <div>
              <div className="au" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(14,165,233,.1)', border:'1px solid rgba(14,165,233,.2)', borderRadius:999, padding:'6px 16px', marginBottom:28 }}>
                <span className="pr" style={{ width:8, height:8, borderRadius:'50%', background:'#38BDF8', display:'inline-block', flexShrink:0 }} />
                <span style={{ color:'#7DD3FC', fontSize:11, fontWeight:600, letterSpacing:'.05em' }}>Engineering Simulation Marketplace</span>
              </div>
              <h1 className="dp au1" style={{ fontSize:58, fontWeight:800, lineHeight:1.07, color:'#fff', margin:'0 0 24px' }}>
                Simulation<br />
                <span style={{ background:'linear-gradient(135deg,#38BDF8,#818CF8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Delivered Fast</span><br />
                Globally.
              </h1>
              <p className="au2" style={{ color:'#94A3B8', fontSize:17, lineHeight:1.7, maxWidth:460, margin:'0 0 36px' }}>
                Connect with verified engineers for MATLAB, Proteus, ANSYS & more. Submit your project in 60 seconds — no account needed.
              </p>
              <div className="au3" style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:40 }}>
                <Link to="/submit" className="btncta" style={{ fontSize:15, padding:'15px 30px' }}>
                  Submit a Project
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </Link>
                <Link to="/apply-expert" className="btngl" style={{ fontSize:15, padding:'15px 26px' }}>Join as Expert</Link>
              </div>
              <div className="au4" style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
                {['No account needed','Secure delivery','Expert-verified'].map((t) => (
                  <div key={t} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#38BDF8" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span style={{ color:'#64748B', fontSize:13 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating card */}
            <div className="au" style={{ position:'relative', padding:'20px 0' }}>
              <div style={{ background:'rgba(255,255,255,.04)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,.1)', borderRadius:24, padding:28, boxShadow:'0 32px 80px rgba(0,0,0,.4)', animation:'floatY 6s ease-in-out infinite' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, background:'#0EA5E9', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14, fontFamily:'Syne,sans-serif' }}>M</div>
                    <div>
                      <p style={{ color:'#fff', fontSize:14, fontWeight:600, margin:0, lineHeight:1.3 }}>DC Motor Speed Control</p>
                      <p style={{ color:'#64748B', fontSize:11, margin:0 }}>MATLAB/Simulink · R2024a</p>
                    </div>
                  </div>
                  <span style={{ padding:'5px 12px', background:'rgba(251,191,36,.08)', color:'#FCD34D', fontSize:11, borderRadius:999, border:'1px solid rgba(251,191,36,.15)', fontWeight:600 }}>In Progress</span>
                </div>
                <div style={{ marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', color:'#64748B', fontSize:12, marginBottom:8 }}>
                    <span>Expert progress</span><span style={{ color:'#38BDF8', fontWeight:600 }}>73%</span>
                  </div>
                  <div style={{ height:8, background:'rgba(255,255,255,.08)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:'73%', background:'linear-gradient(90deg,#0EA5E9,#818CF8)', borderRadius:99 }} />
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'rgba(255,255,255,.04)', borderRadius:14, border:'1px solid rgba(255,255,255,.06)', marginBottom:16 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:12, flexShrink:0 }}>AK</div>
                  <div style={{ flex:1 }}>
                    <p style={{ color:'#fff', fontSize:13, fontWeight:600, margin:0 }}>Ahmed K.</p>
                    <div style={{ display:'flex', gap:2 }}>
                      {[1,2,3,4,5].map(i => <span key={i} style={{ color:'#FCD34D', fontSize:11 }}>★</span>)}
                      <span style={{ color:'#64748B', fontSize:11, marginLeft:4 }}>4.9 · Elite</span>
                    </div>
                  </div>
                  <div style={{ width:8, height:8, background:'#4ADE80', borderRadius:'50%', flexShrink:0 }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'#64748B' }}>⏱ Est. 4h remaining</span>
                  <span style={{ color:'#38BDF8', fontWeight:600 }}>Urgent delivery</span>
                </div>
              </div>
              <div style={{ position:'absolute', top:-8, right:-8, background:'#10B981', color:'#fff', fontSize:11, fontWeight:700, padding:'6px 14px', borderRadius:999, boxShadow:'0 4px 16px rgba(16,185,129,.4)', animation:'floatY 4s .5s ease-in-out infinite' }}>✓ QC Passed</div>
              <div style={{ position:'absolute', bottom:-8, left:-8, background:'#fff', color:'#0B1C3D', fontSize:11, fontWeight:700, padding:'6px 14px', borderRadius:999, boxShadow:'0 4px 20px rgba(0,0,0,.15)', display:'flex', alignItems:'center', gap:6, animation:'floatY 5s 1s ease-in-out infinite' }}>
                <span style={{ width:7, height:7, background:'#0EA5E9', borderRadius:'50%' }} />1,200+ Projects Delivered
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div style={{ background:'#060D1F', padding:'14px 0', overflow:'hidden', borderTop:'1px solid rgba(255,255,255,.04)', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
          <div className="mq" style={{ display:'flex', width:'max-content' }}>
            {[...tools,...tools].map((t,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:20, padding:'0 28px' }}>
                <span style={{ color:'#334155', fontSize:12, fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{t}</span>
                <span style={{ width:4, height:4, background:'#1E3A5F', borderRadius:'50%' }} />
              </div>
            ))}
          </div>
        </div>

        {/* STATS */}
        <section ref={statsRef.ref} style={{ padding:'80px 24px', background:'#F8FAFC' }}>
          <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
            {[
              { value:c1, suffix:'+', label:'Projects Delivered' },
              { value:c2, suffix:'%', label:'Client Satisfaction' },
              { value:c3, suffix:'', label:'Expert Engineers' },
              { value:c4, suffix:'h', label:'Min Delivery Time' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="stcard">
                <p className="dp" style={{ fontSize:44, fontWeight:800, color:'#0B1C3D', margin:'0 0 6px', lineHeight:1 }}>{value}{suffix}</p>
                <p style={{ color:'#94A3B8', fontSize:13, margin:0 }}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ padding:'96px 24px', background:'#fff' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <span style={{ color:'#0EA5E9', fontSize:11, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', display:'block', marginBottom:12 }}>How It Works</span>
              <h2 className="dp" style={{ fontSize:40, fontWeight:800, color:'#0B1C3D', margin:0 }}>Four steps to results</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
              {steps.map((s, i) => (
                <div key={i} className="scard">
                  <div className="dp" style={{ fontSize:52, fontWeight:800, color:'#F1F5F9', lineHeight:1, marginBottom:16 }}>{s.n}</div>
                  <h3 className="dp" style={{ fontSize:17, fontWeight:700, color:'#0B1C3D', margin:'0 0 10px' }}>{s.title}</h3>
                  <p style={{ color:'#64748B', fontSize:13, lineHeight:1.65, margin:0 }}>{s.body}</p>
                  <div style={{ width:32, height:3, background:'#0EA5E9', borderRadius:99, marginTop:20 }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ padding:'96px 24px', background:'#0B1C3D' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <span style={{ color:'#38BDF8', fontSize:11, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', display:'block', marginBottom:12 }}>Platform Features</span>
              <h2 className="dp" style={{ fontSize:40, fontWeight:800, color:'#fff', margin:0 }}>Why engineers choose GSH</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
              {features.map(({ icon, title, body }) => (
                <div key={title} className="fcard">
                  <div style={{ fontSize:26, marginBottom:16 }}>{icon}</div>
                  <h3 className="dp" style={{ color:'#fff', fontWeight:700, fontSize:16, margin:'0 0 8px' }}>{title}</h3>
                  <p style={{ color:'#64748B', fontSize:13, lineHeight:1.65, margin:0 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EXPERT LEVELS */}
        <section style={{ padding:'96px 24px', background:'#F8FAFC' }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:52 }}>
              <span style={{ color:'#0EA5E9', fontSize:11, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', display:'block', marginBottom:12 }}>Expert Tiers</span>
              <h2 className="dp" style={{ fontSize:40, fontWeight:800, color:'#0B1C3D', margin:'0 0 12px' }}>Ranked by performance</h2>
              <p style={{ color:'#94A3B8', fontSize:14, maxWidth:480, margin:'0 auto' }}>Every expert advances based on completed projects, ratings, and success rate.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
              {levels.map((l, i) => (
                <div key={l.label} className="lcard">
                  <div style={{ width:48, height:48, borderRadius:'50%', background:l.color+'18', margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                    {'⭐'.repeat(i+1)}
                  </div>
                  <p className="dp" style={{ fontWeight:700, color:'#0B1C3D', margin:'0 0 4px', fontSize:15 }}>{l.label}</p>
                  <p style={{ color:'#94A3B8', fontSize:12, margin:'0 0 14px' }}>{l.projects}</p>
                  <div style={{ height:5, background:'#F1F5F9', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(i+1)*25}%`, background:l.color, borderRadius:99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding:'96px 24px', background:'linear-gradient(135deg,#0B1C3D 0%,#1A3A7A 50%,#0B1C3D 100%)', position:'relative', overflow:'hidden', textAlign:'center' }} className="hgrid">
          <div className="blob" style={{ width:500, height:300, background:'rgba(14,165,233,.08)', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
          <div style={{ position:'relative', maxWidth:640, margin:'0 auto' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', borderRadius:999, padding:'7px 18px', marginBottom:32 }}>
              <span style={{ width:8, height:8, background:'#4ADE80', borderRadius:'50%', display:'inline-block' }} />
              <span style={{ color:'rgba(255,255,255,.7)', fontSize:12, fontWeight:500 }}>Platform live — accepting projects now</span>
            </div>
            <h2 className="dp" style={{ fontSize:48, fontWeight:800, color:'#fff', margin:'0 0 20px', lineHeight:1.1 }}>
              Ready to get your<br />
              <span style={{ background:'linear-gradient(135deg,#38BDF8,#818CF8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>simulation done?</span>
            </h2>
            <p style={{ color:'#64748B', fontSize:15, margin:'0 0 40px', lineHeight:1.7 }}>No account needed. Describe your project and we'll set everything up automatically.</p>
            <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/submit" className="btncta" style={{ fontSize:15, padding:'16px 34px' }}>
                Submit a Project
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
              <Link to="/apply-expert" className="btngl" style={{ fontSize:15, padding:'16px 30px' }}>Become an Expert</Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background:'#040C1F', padding:'56px 24px 28px', borderTop:'1px solid rgba(255,255,255,.04)' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:48, marginBottom:48 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                  <GSHLogo size={34} />
                  <div>
                    <p className="dp" style={{ color:'#fff', fontWeight:700, fontSize:14, margin:0 }}>Global Simulation Hub</p>
                    <p style={{ color:'#334155', fontSize:11, margin:0 }}>Engineering excellence, delivered.</p>
                  </div>
                </div>
                <p style={{ color:'#334155', fontSize:13, lineHeight:1.7, margin:0 }}>Connecting the world's best simulation engineers with clients who need results — fast, verified, and secure.</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:32 }}>
                {[
                  { title:'Platform', links:[['Submit Project','/submit'],['Become Expert','/apply-expert'],['Login','/login'],['Register','/register']] },
                  { title:'Software', links:[['MATLAB/Simulink','#'],['Proteus','#'],['ANSYS','#'],['LabVIEW','#'],['PSCAD','#']] },
                  { title:'Delivery', links:[['Express · 6-12h','#'],['Urgent · 24h','#'],['Standard · Flexible','#']] },
                ].map(({ title, links }) => (
                  <div key={title}>
                    <p style={{ color:'#fff', fontWeight:600, fontSize:13, margin:'0 0 14px' }}>{title}</p>
                    {links.map(([label, href]) => (
                      <Link key={label} to={href} style={{ display:'block', color:'#334155', fontSize:12, margin:'0 0 9px', textDecoration:'none' }}>{label}</Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop:'1px solid rgba(255,255,255,.04)', paddingTop:24, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <p style={{ color:'#1E293B', fontSize:12, margin:0 }}>© {new Date().getFullYear()} Global Simulation Hub. All rights reserved.</p>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ width:7, height:7, background:'#4ADE80', borderRadius:'50%' }} />
                <span style={{ color:'#1E293B', fontSize:12 }}>All systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
