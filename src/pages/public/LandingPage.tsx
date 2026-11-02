import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BookOpen, Check, ChevronDown, CircleCheck, Clock, Cpu, CreditCard, FolderLock, Lock,
  Quote, ShieldCheck, Star, UploadCloud, UserCheck, Workflow, Zap, Activity, type LucideIcon,
} from 'lucide-react'
import PublicTopbar from '@/components/layout/PublicTopbar'
import SimulationShowcase from '@/components/public/SimulationShowcase'
import { GSHLogo } from '@/pages/auth/_shared'

/* ───────────────────────────── hooks ───────────────────────────── */

const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Inarudisha `inView` mara kipengele kinapoingia kwenye skrini (mara moja tu). */
function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || reduced()) { setInView(true); return }
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return <div ref={ref} className={`rv${inView ? ' in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}

function useCountUp(target: number, start: boolean, ms = 1600) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!start) return
    if (reduced()) { setV(target); return }
    let raf = 0; const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms)
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, start, ms])
  return v
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4)
  const n = useCountUp(value, inView)
  return (
    <div ref={ref} className="lp-stat">
      <div className="lp-stat-n" aria-label={`${value}${suffix} ${label}`}>{n}{suffix}</div>
      <div className="lp-stat-l">{label}</div>
    </div>
  )
}

/* ───────────────────────────── data ───────────────────────────── */

const SOFTWARE = ['MATLAB', 'Simulink', 'Proteus', 'ANSYS', 'LabVIEW', 'Multisim', 'PSCAD', 'ETAP', 'HFSS', 'CST Studio', 'LTspice']

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: UploadCloud, title: 'Submit your project', body: 'Describe your simulation, attach any files, and create your account in the same step.' },
  { icon: UserCheck, title: 'Priced & matched', body: 'We review and price your project, then a verified expert with the right skills takes it on.' },
  { icon: Activity, title: 'Track progress', body: 'Follow progress from 0 to 100% and chat with your expert while the work is done.' },
  { icon: CircleCheck, title: 'Quality check & download', body: 'Our team reviews the result first. Then you download your files from a secure link.' },
]

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Zap, title: 'Express delivery', body: 'Results in 6–12 hours with Express. Urgent (24 hours) and Standard are also available.' },
  { icon: ShieldCheck, title: 'Verified experts', body: 'Every expert passes a timed skills test on their own tools before taking projects.' },
  { icon: CircleCheck, title: 'Quality control', body: 'The GSH team reviews every submission before delivery. No shortcuts.' },
  { icon: Cpu, title: 'Skill-based matching', body: 'Projects go to experts who work with your software, and experts see jobs that fit their skills.' },
  { icon: FolderLock, title: 'Private by default', body: 'Only you, your expert and the GSH team can open your files. Downloads use secure links.' },
  { icon: Workflow, title: 'Full transparency', body: 'See every stage: Received, Assigned, In progress, Quality check, Completed.' },
  { icon: Lock, title: 'NDA mode', body: 'Mark a project confidential. Its details stay hidden from the job board until an expert claims it.' },
  { icon: CreditCard, title: 'Flexible payments', body: 'Pay in full or 50% in advance. Top up a wallet once and pay for every project from it.' },
  { icon: BookOpen, title: 'Learn from the work', body: 'Optionally get an explanation of your simulation so you can understand and defend it.' },
]

const TIERS = [
  { name: 'Standard', time: 'Flexible deadline', price: 'Best price', icon: Clock, accent: false },
  { name: 'Urgent', time: 'Delivered within 24 hours', price: '2× price', icon: Zap, accent: false },
  { name: 'Express', time: 'Delivered in 6–12 hours', price: '3× price', icon: Zap, accent: true },
]

const LEVELS = [
  { label: 'Beginner', projects: '1–10 projects', stars: 1 },
  { label: 'Verified', projects: '11–30 projects', stars: 2 },
  { label: 'Top Expert', projects: '31–60 projects', stars: 3 },
  { label: 'Elite Expert', projects: '60+ projects', stars: 4 },
]

const TESTIMONIALS = [
  { name: 'Ahmed K.', role: 'MSc Electrical Engineering', initials: 'AK', rating: 5, photo: '/testimonials/ahmed-k.jpg', quote: 'My Simulink model was due in 18 hours and the expert delivered in 11, fully documented. The progress tracker made the whole thing feel safe.' },
  { name: 'Fatima N.', role: 'Control Systems Researcher', initials: 'FN', rating: 5, photo: '/testimonials/fatima-n.jpg', quote: 'The QC step is what sold me. I got my ANSYS thermal analysis back with a reviewer note attached, not just a raw file.' },
  { name: 'James O.', role: 'Power Systems Consultant', initials: 'JO', rating: 5, photo: '/testimonials/james-o.jpg', quote: 'I needed an ETAP load-flow study with an NDA in place. Setup took minutes and the expert was clearly vetted.' },
  { name: 'Grace M.', role: 'Final-Year Mechatronics Student', initials: 'GM', rating: 4, photo: '/testimonials/grace-m.jpg', quote: 'Educational Mode was the real win. The explanation meant I could defend my Proteus project in my viva with confidence.' },
]

const FAQ = [
  { q: 'Do I need an account to submit a project?', a: 'You create one as part of the submission. Choose a username and password in the form and your account is ready as soon as you submit, with no email confirmation step.' },
  { q: 'How is my project priced?', a: 'After you submit, our team reviews the details and sets a price. You are notified and can pay in full, or pay 50% in advance and the balance before delivery.' },
  { q: 'How do I pay?', a: 'Top up your wallet online, then pay for projects from the wallet. Your balance stays available for the next project.' },
  { q: 'Are my files and ideas private?', a: 'Yes. Only you, your assigned expert and the GSH team can open your files. For sensitive work, turn on NDA mode so the project details are hidden from the job board until an expert claims it.' },
  { q: 'When can I download my results?', a: 'Once our team has reviewed the work and marked the project completed. Completing your profile to 100% unlocks the downloads.' },
  { q: 'Can I work as an expert?', a: 'Yes. Apply, choose the tools you work with, complete a short timed test, and an admin reviews your solution. Approved experts choose jobs from the job board and are paid into their wallet.' },
]

/* ───────────────────────────── styles ───────────────────────────── */

const css = `
.lp { font-family: inherit; color: #0A1F4D; background: #F5F7FC; overflow-x: clip; }
.lp * { box-sizing: border-box; }
.lp-wrap { max-width: 1200px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 24px); }
.lp-sec { padding: clamp(56px, 8vw, 96px) 0; }
.lp-sec.alt { background: #fff; border-top: 1px solid #E3E9F4; border-bottom: 1px solid #E3E9F4; }
.lp-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #0D52CE; background: #EAF1FD; border-radius: 999px; padding: 6px 14px; margin: 0 0 16px; }
.lp-h2 { font-size: clamp(26px, 3.6vw, 38px); line-height: 1.15; font-weight: 700; color: #0A1F4D; margin: 0 0 12px; letter-spacing: -.01em; }
.lp-lead { font-size: clamp(15px, 1.6vw, 17px); line-height: 1.7; color: #4E5E82; margin: 0; max-width: 620px; }
.lp-head { text-align: center; margin: 0 auto clamp(32px, 5vw, 52px); }
.lp-head .lp-lead { margin: 0 auto; }

/* scroll reveal */
.rv { opacity: 0; transform: translateY(26px); transition: opacity .7s cubic-bezier(.22,.8,.26,1), transform .7s cubic-bezier(.22,.8,.26,1); }
.rv.in { opacity: 1; transform: none; }

/* buttons */
.lp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 52px; padding: 0 26px; border-radius: 12px; font-size: 15px; font-weight: 600; text-decoration: none; border: 1px solid transparent; font-family: inherit; cursor: pointer; transition: background .2s, box-shadow .25s, transform .15s, border-color .2s, color .2s; }
.lp-btn:active { transform: scale(.98); }
.lp-btn svg { transition: transform .25s cubic-bezier(.22,.8,.26,1); }
.lp-btn:hover svg { transform: translateX(4px); }
.lp-primary { background: #0D52CE; color: #fff; }
.lp-primary:hover { background: #0A42A8; box-shadow: 0 12px 28px rgba(13,82,206,.32); transform: translateY(-2px); }
.lp-ghost { background: #fff; color: #0A1F6B; border-color: #D5E0F2; }
.lp-ghost:hover { border-color: #0D52CE; color: #0D52CE; box-shadow: 0 8px 20px rgba(10,31,107,.08); transform: translateY(-2px); }
.lp-white { background: #fff; color: #0A1F6B; }
.lp-white:hover { box-shadow: 0 12px 28px rgba(0,0,0,.25); transform: translateY(-2px); }
.lp-outline-w { background: transparent; color: #fff; border-color: rgba(255,255,255,.45); }
.lp-outline-w:hover { background: rgba(255,255,255,.1); border-color: #fff; transform: translateY(-2px); }

/* hero */
.lp-hero { position: relative; padding: clamp(36px, 6vw, 76px) 0 clamp(48px, 7vw, 88px); background-image: linear-gradient(rgba(13,82,206,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(13,82,206,.05) 1px, transparent 1px); background-size: 44px 44px; background-position: center top; }
.lp-hero::after { content: ''; position: absolute; inset: auto 0 0 0; height: 80px; background: #F5F7FC; mask-image: linear-gradient(to top, #000, transparent); -webkit-mask-image: linear-gradient(to top, #000, transparent); pointer-events: none; }
.lp-hero-grid { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: clamp(28px, 5vw, 64px); align-items: center; }
.lp-hero h1 { font-size: clamp(34px, 5.2vw, 58px); line-height: 1.07; font-weight: 800; letter-spacing: -.025em; color: #0A1F4D; margin: 0 0 20px; }
.lp-hero h1 em { font-style: normal; color: #0D52CE; position: relative; white-space: nowrap; }
.lp-hero h1 em::after { content: ''; position: absolute; left: 0; right: 0; bottom: -2px; height: 8px; border-radius: 4px; background: rgba(13,82,206,.18); transform-origin: left; animation: lpUnderline .9s .8s cubic-bezier(.22,.8,.26,1) both; z-index: -1; }
.lp-hero .lp-lead { font-size: clamp(16px, 1.8vw, 19px); margin-bottom: 30px; max-width: 540px; }
.lp-cta { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 30px; }
.lp-trust { display: flex; flex-wrap: wrap; gap: 10px 22px; font-size: 14px; color: #4E5E82; font-weight: 500; }
.lp-trust span { display: inline-flex; align-items: center; gap: 8px; }
.lp-trust svg { color: #137A4E; }
.lp-anim { animation: lpRise .8s cubic-bezier(.22,.8,.26,1) both; }
.lp-anim.d1 { animation-delay: .08s } .lp-anim.d2 { animation-delay: .18s } .lp-anim.d3 { animation-delay: .3s } .lp-anim.d4 { animation-delay: .42s }

/* hero mockup */
.lp-mock-wrap { position: relative; padding: 18px 0 18px 18px; animation: lpRise .9s .25s cubic-bezier(.22,.8,.26,1) both; }
.lp-mock { background: #fff; border: 1px solid #E3E9F4; border-radius: 20px; padding: clamp(18px, 2.4vw, 26px); box-shadow: 0 30px 70px rgba(10,31,107,.14), 0 2px 6px rgba(10,31,107,.05); animation: lpFloat 7s ease-in-out infinite; }
.lp-mock-top { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
.lp-mock-ico { width: 44px; height: 44px; border-radius: 12px; background: #EAF1FD; color: #0D52CE; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lp-mock-title { font-size: 15px; font-weight: 700; color: #0A1F4D; line-height: 1.25; }
.lp-mock-sub { font-size: 13px; color: #667697; }
.lp-pill { margin-left: auto; font-size: 12px; font-weight: 600; color: #9A5B00; background: #FFF8E6; border-radius: 999px; padding: 4px 11px; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.lp-pill i { width: 7px; height: 7px; border-radius: 50%; background: #E5A00D; animation: lpPulse 1.6s infinite; }
.lp-bar { height: 8px; border-radius: 8px; background: #EBEFF8; overflow: hidden; margin: 4px 0 6px; }
.lp-bar i { display: block; height: 100%; width: 72%; border-radius: 8px; background: #0D52CE; animation: lpFill 2.2s .9s cubic-bezier(.22,.8,.26,1) both; }
.lp-bar-l { display: flex; justify-content: space-between; font-size: 12.5px; color: #667697; margin-bottom: 18px; }
.lp-bar-l b { color: #0A1F4D; }
.lp-steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.lp-steps li { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #2B3A60; font-weight: 500; opacity: 0; animation: lpRise .6s cubic-bezier(.22,.8,.26,1) both; }
.lp-steps li:nth-child(1) { animation-delay: .7s } .lp-steps li:nth-child(2) { animation-delay: .85s } .lp-steps li:nth-child(3) { animation-delay: 1s } .lp-steps li:nth-child(4) { animation-delay: 1.15s } .lp-steps li:nth-child(5) { animation-delay: 1.3s }
.lp-dot { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #EDF8F1; color: #137A4E; }
.lp-dot.now { background: #EAF1FD; color: #0D52CE; animation: lpPulseBlue 2s infinite; }
.lp-dot.todo { background: #EBEFF8; color: #8D9BB8; }
.lp-chip { position: absolute; display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #E3E9F4; border-radius: 12px; padding: 10px 14px; font-size: 13px; font-weight: 600; color: #0A1F4D; box-shadow: 0 14px 32px rgba(10,31,107,.14); }
.lp-chip svg { color: #137A4E; }
.lp-chip.a { top: -4px; right: -6px; animation: lpFloat 6s 1s ease-in-out infinite, lpPop .6s 1.5s cubic-bezier(.22,.8,.26,1) both; }
.lp-chip.b { bottom: 6px; left: -4px; animation: lpFloat 8s .4s ease-in-out infinite, lpPop .6s 1.8s cubic-bezier(.22,.8,.26,1) both; }

/* software marquee */
.lp-marq { padding: 22px 0; background: #fff; border-top: 1px solid #E3E9F4; border-bottom: 1px solid #E3E9F4; overflow: hidden; }
.lp-marq-lbl { text-align: center; font-size: 13px; font-weight: 600; color: #667697; margin-bottom: 14px; }
.lp-marq-mask { overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); }
.lp-marq-track { display: flex; gap: 14px; width: max-content; animation: lpMarq 34s linear infinite; }
.lp-marq-mask:hover .lp-marq-track { animation-play-state: paused; }
.lp-sw { font-size: 15px; font-weight: 600; color: #3A4A70; background: #F5F7FC; border: 1px solid #E3E9F4; border-radius: 10px; padding: 10px 20px; white-space: nowrap; }

/* stats */
.lp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.lp-stat { text-align: center; padding: clamp(18px, 3vw, 28px) 12px; background: #fff; border: 1px solid #E3E9F4; border-radius: 16px; transition: transform .3s cubic-bezier(.22,.8,.26,1), box-shadow .3s; }
.lp-stat:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(10,31,107,.1); }
.lp-stat-n { font-size: clamp(30px, 4.4vw, 46px); font-weight: 800; color: #0D52CE; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
.lp-stat-l { font-size: 14px; color: #4E5E82; margin-top: 8px; font-weight: 500; }

/* steps */
.lp-flow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; position: relative; }
.lp-flow::before { content: ''; position: absolute; left: 12%; right: 12%; top: 38px; height: 2px; background: repeating-linear-gradient(90deg, #C4DBF1 0 8px, transparent 8px 16px); z-index: 0; }
.lp-step { position: relative; z-index: 1; text-align: center; padding: 0 8px; }
.lp-step-ico { width: 76px; height: 76px; border-radius: 22px; margin: 0 auto 18px; background: #fff; border: 1px solid #E3E9F4; color: #0D52CE; display: flex; align-items: center; justify-content: center; position: relative; box-shadow: 0 8px 22px rgba(10,31,107,.08); transition: transform .35s cubic-bezier(.22,.8,.26,1), background .25s, color .25s; }
.lp-step:hover .lp-step-ico { transform: translateY(-6px) rotate(-4deg); background: #0D52CE; color: #fff; }
.lp-step-n { position: absolute; top: -8px; right: -8px; width: 26px; height: 26px; border-radius: 50%; background: #0A1F6B; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.lp-step h3 { font-size: 17px; font-weight: 700; color: #0A1F4D; margin: 0 0 8px; }
.lp-step p { font-size: 14.5px; line-height: 1.65; color: #4E5E82; margin: 0; }

/* feature cards */
.lp-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.lp-card { background: #fff; border: 1px solid #E3E9F4; border-radius: 16px; padding: 26px; transition: transform .3s cubic-bezier(.22,.8,.26,1), box-shadow .3s, border-color .3s; height: 100%; }
.lp-card:hover { transform: translateY(-5px); box-shadow: 0 18px 40px rgba(10,31,107,.11); border-color: #C4DBF1; }
.lp-card-ico { width: 48px; height: 48px; border-radius: 13px; background: #EAF1FD; color: #0D52CE; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; transition: background .25s, color .25s, transform .3s cubic-bezier(.22,.8,.26,1); }
.lp-card:hover .lp-card-ico { background: #0D52CE; color: #fff; transform: scale(1.08) rotate(-5deg); }
.lp-card h3 { font-size: 17px; font-weight: 700; margin: 0 0 8px; color: #0A1F4D; }
.lp-card p { font-size: 14.5px; line-height: 1.65; color: #4E5E82; margin: 0; }

/* delivery tiers */
.lp-tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; max-width: 980px; margin: 0 auto; }
.lp-tier { position: relative; background: #fff; border: 1px solid #E3E9F4; border-radius: 18px; padding: 30px 26px; text-align: left; transition: transform .3s cubic-bezier(.22,.8,.26,1), box-shadow .3s; display: flex; flex-direction: column; }
.lp-tier:hover { transform: translateY(-6px); box-shadow: 0 20px 44px rgba(10,31,107,.12); }
.lp-tier.hot { background: #0A1F6B; border-color: #0A1F6B; color: #fff; }
.lp-tier.hot .lp-tier-time, .lp-tier.hot li { color: #C9D8F5; }
.lp-tier.hot h3 { color: #fff; }
.lp-tag { position: absolute; top: -12px; left: 26px; background: #0D52CE; color: #fff; font-size: 12px; font-weight: 700; border-radius: 999px; padding: 4px 12px; }
.lp-tier h3 { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #0A1F4D; display: flex; align-items: center; gap: 8px; }
.lp-tier-time { font-size: 14px; color: #667697; margin-bottom: 18px; }
.lp-tier-price { font-size: 30px; font-weight: 800; letter-spacing: -.02em; margin-bottom: 18px; color: #0D52CE; }
.lp-tier.hot .lp-tier-price { color: #fff; }
.lp-tier ul { list-style: none; margin: 0 0 24px; padding: 0; display: grid; gap: 10px; flex: 1; }
.lp-tier li { display: flex; gap: 10px; align-items: center; font-size: 14px; color: #3A4A70; }
.lp-tier li svg { color: #137A4E; flex-shrink: 0; }
.lp-tier.hot li svg { color: #7CCBA2; }
.lp-tier .lp-btn { height: 46px; width: 100%; }

/* levels */
.lp-levels { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.lp-level { background: #fff; border: 1px solid #E3E9F4; border-radius: 16px; padding: 22px; text-align: center; position: relative; overflow: hidden; transition: transform .3s cubic-bezier(.22,.8,.26,1), box-shadow .3s; }
.lp-level:hover { transform: translateY(-4px); box-shadow: 0 14px 32px rgba(10,31,107,.1); }
.lp-level b { display: block; font-size: 16px; color: #0A1F4D; margin: 10px 0 2px; }
.lp-level small { font-size: 13px; color: #667697; }
.lp-stars { display: inline-flex; gap: 3px; color: #E5A00D; }
.lp-stars .off { color: #DCE3F0; }

/* testimonials */
.lp-tgrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
.lp-quote { background: #fff; border: 1px solid #E3E9F4; border-radius: 18px; padding: 28px; display: flex; flex-direction: column; gap: 18px; transition: transform .3s cubic-bezier(.22,.8,.26,1), box-shadow .3s; height: 100%; }
.lp-quote:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(10,31,107,.1); }
.lp-quote p { font-size: 15.5px; line-height: 1.7; color: #2B3A60; margin: 0; flex: 1; }
.lp-who { display: flex; align-items: center; gap: 12px; }
.lp-ava { position: relative; width: 44px; height: 44px; border-radius: 50%; background: #0A1F6B; color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.lp-ava img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.lp-who b { display: block; font-size: 14.5px; color: #0A1F4D; }
.lp-who small { font-size: 13px; color: #667697; }

/* faq */
.lp-faq { max-width: 780px; margin: 0 auto; display: grid; gap: 10px; }
.lp-qa { background: #fff; border: 1px solid #E3E9F4; border-radius: 14px; overflow: hidden; transition: border-color .25s, box-shadow .25s; }
.lp-qa.open { border-color: #C4DBF1; box-shadow: 0 10px 26px rgba(10,31,107,.07); }
.lp-qa button { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 22px; background: none; border: none; text-align: left; font-family: inherit; font-size: 16px; font-weight: 600; color: #0A1F4D; cursor: pointer; }
.lp-qa button svg { flex-shrink: 0; color: #667697; transition: transform .3s cubic-bezier(.22,.8,.26,1), color .2s; }
.lp-qa.open button svg { transform: rotate(180deg); color: #0D52CE; }
.lp-qa-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s cubic-bezier(.22,.8,.26,1); }
.lp-qa.open .lp-qa-body { grid-template-rows: 1fr; }
.lp-qa-body > div { overflow: hidden; }
.lp-qa-body p { margin: 0; padding: 0 22px 20px; font-size: 15px; line-height: 1.7; color: #4E5E82; }

/* cta band */
.lp-band { background: #0A1F6B; color: #fff; border-radius: clamp(18px, 3vw, 28px); padding: clamp(36px, 6vw, 68px) clamp(22px, 5vw, 56px); text-align: center; position: relative; overflow: hidden; background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 40px 40px; }
.lp-band h2 { font-size: clamp(26px, 4vw, 42px); font-weight: 800; letter-spacing: -.02em; margin: 0 0 12px; line-height: 1.12; }
.lp-band p { font-size: clamp(15px, 1.7vw, 18px); color: #C9D8F5; margin: 0 auto 28px; max-width: 560px; line-height: 1.65; }
.lp-band .lp-cta { justify-content: center; margin: 0; }

/* footer */
.lp-foot { background: #071650; color: #A9C8F0; padding: clamp(40px, 6vw, 64px) 0 28px; margin-top: clamp(56px, 8vw, 96px); }
.lp-foot-grid { display: grid; grid-template-columns: 1.5fr repeat(3, 1fr); gap: 32px; margin-bottom: 36px; }
.lp-foot h4 { font-size: 14px; color: #fff; margin: 0 0 14px; font-weight: 600; }
.lp-foot a { display: block; color: #A9C8F0; text-decoration: none; font-size: 14px; padding: 5px 0; transition: color .2s, transform .2s; }
.lp-foot a:hover { color: #fff; transform: translateX(3px); }
.lp-foot-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.lp-foot-brand .t { width: 42px; height: 42px; border-radius: 11px; background: #fff; display: flex; align-items: center; justify-content: center; }
.lp-foot-brand b { color: #fff; font-size: 15px; display: block; }
.lp-foot-brand small { font-size: 12.5px; }
.lp-foot p { font-size: 14px; line-height: 1.7; margin: 0; max-width: 340px; }
.lp-copy { border-top: 1px solid rgba(255,255,255,.12); padding-top: 20px; font-size: 13px; color: #8DA6D6; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }

@keyframes lpRise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
@keyframes lpFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
@keyframes lpFill { from { width: 0; } }
@keyframes lpUnderline { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes lpPop { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: none; } }
@keyframes lpPulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
@keyframes lpPulseBlue { 0%,100% { box-shadow: 0 0 0 0 rgba(13,82,206,.4); } 50% { box-shadow: 0 0 0 7px rgba(13,82,206,0); } }
@keyframes lpMarq { to { transform: translateX(calc(-50% - 7px)); } }

@media (max-width: 1000px) {
  .lp-hero-grid { grid-template-columns: 1fr; }
  .lp-mock-wrap { max-width: 520px; margin: 0 auto; width: 100%; }
  .lp-grid3 { grid-template-columns: repeat(2, 1fr); }
  .lp-levels, .lp-stats { grid-template-columns: repeat(2, 1fr); }
  .lp-flow { grid-template-columns: repeat(2, 1fr); gap: 32px 20px; }
  .lp-flow::before { display: none; }
  .lp-foot-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 680px) {
  .lp-grid3, .lp-tiers, .lp-tgrid { grid-template-columns: 1fr; }
  .lp-cta .lp-btn { flex: 1 1 100%; }
  .lp-chip.a { right: 0; } .lp-chip.b { left: 0; }
  .lp-mock-wrap { padding: 16px 0; }
  .lp-flow { grid-template-columns: 1fr; }
  .lp-foot-grid { grid-template-columns: 1fr; }
  .lp-hero h1 em { white-space: normal; }
}
@media (prefers-reduced-motion: reduce) {
  .lp *, .lp *::before, .lp *::after { animation: none !important; transition: none !important; }
  .rv { opacity: 1; transform: none; }
  .lp-steps li { opacity: 1; }
}
`

/* ───────────────────────────── page ───────────────────────────── */

export default function LandingPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="lp">
      <style>{css}</style>
      <PublicTopbar />

      {/* ── Hero ── */}
      <section className="lp-hero" aria-labelledby="hero-title">
        <div className="lp-wrap lp-hero-grid">
          <div>
            <span className="lp-eyebrow lp-anim"><ShieldCheck size={15} /> Verified simulation experts</span>
            <h1 id="hero-title" className="lp-anim d1">Engineering simulations, <em>delivered fast</em> by experts you can trust.</h1>
            <p className="lp-lead lp-anim d2">Send us your MATLAB, Simulink, Proteus, ANSYS or LabVIEW project. A verified expert builds it, our team checks the quality, and you download the results.</p>
            <div className="lp-cta lp-anim d3">
              <Link to="/submit" className="lp-btn lp-primary">Submit a project <ArrowRight size={18} /></Link>
              <Link to="/apply-expert" className="lp-btn lp-ghost">Become an expert</Link>
            </div>
            <div className="lp-trust lp-anim d4">
              <span><Check size={16} strokeWidth={3} /> Quality-checked delivery</span>
              <span><Check size={16} strokeWidth={3} /> NDA mode</span>
              <span><Check size={16} strokeWidth={3} /> Track every stage</span>
            </div>
          </div>

          <div className="lp-mock-wrap" aria-hidden="true">
            <div className="lp-mock">
              <div className="lp-mock-top">
                <div className="lp-mock-ico"><Cpu size={22} /></div>
                <div><div className="lp-mock-title">DC Motor Speed Control</div><div className="lp-mock-sub">MATLAB / Simulink · R2024a</div></div>
                <span className="lp-pill"><i /> In progress</span>
              </div>
              <div className="lp-bar"><i /></div>
              <div className="lp-bar-l"><span>Progress</span><b>72%</b></div>
              <ul className="lp-steps">
                <li><span className="lp-dot"><Check size={14} strokeWidth={3} /></span> Project received</li>
                <li><span className="lp-dot"><Check size={14} strokeWidth={3} /></span> Expert assigned</li>
                <li><span className="lp-dot now"><Activity size={14} /></span> Simulation in progress</li>
                <li><span className="lp-dot todo"><ShieldCheck size={14} /></span> Quality check</li>
                <li><span className="lp-dot todo"><Check size={14} strokeWidth={3} /></span> Ready to download</li>
              </ul>
            </div>
            <span className="lp-chip a"><CircleCheck size={16} /> Expert assigned</span>
            <span className="lp-chip b"><ShieldCheck size={16} /> Reviewed by GSH</span>
          </div>
        </div>
      </section>

      {/* ── Software marquee ── */}
      <div className="lp-marq" aria-label="Supported software">
        <div className="lp-marq-lbl">Works with the tools engineers use</div>
        <div className="lp-marq-mask">
          <div className="lp-marq-track">
            {[...SOFTWARE, ...SOFTWARE].map((s, i) => <span key={i} className="lp-sw" aria-hidden={i >= SOFTWARE.length}>{s}</span>)}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <section className="lp-sec" style={{ paddingBottom: 0 }} aria-label="Platform statistics">
        <div className="lp-wrap lp-stats">
          <Stat value={1200} suffix="+" label="Projects delivered" />
          <Stat value={98} suffix="%" label="Client satisfaction" />
          <Stat value={47} suffix="" label="Expert engineers" />
          <Stat value={6} suffix="h" label="Fastest delivery" />
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="lp-sec" aria-labelledby="how-title">
        <div className="lp-wrap">
          <Reveal className="lp-head">
            <span className="lp-eyebrow">How it works</span>
            <h2 id="how-title" className="lp-h2">Four steps from brief to results</h2>
            <p className="lp-lead">No back-and-forth. You describe it once and follow it all the way to delivery.</p>
          </Reveal>
          <div className="lp-flow">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 110} className="lp-step">
                <div className="lp-step-ico"><s.icon size={30} strokeWidth={1.7} /><span className="lp-step-n">{i + 1}</span></div>
                <h3>{s.title}</h3><p>{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="lp-sec alt" aria-labelledby="feat-title">
        <div className="lp-wrap">
          <Reveal className="lp-head">
            <span className="lp-eyebrow">Why GSH</span>
            <h2 id="feat-title" className="lp-h2">Built for engineers who need it right</h2>
            <p className="lp-lead">Speed matters, but so do accuracy, privacy and knowing exactly where your project stands.</p>
          </Reveal>
          <div className="lp-grid3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 90}>
                <div className="lp-card">
                  <div className="lp-card-ico"><f.icon size={23} strokeWidth={1.8} /></div>
                  <h3>{f.title}</h3><p>{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Simulations showcase (video + picha kutoka backend) ── */}
      <section id="simulations" className="lp-sec" aria-label="Simulations in action">
        <div className="lp-wrap"><SimulationShowcase /></div>
      </section>

      {/* ── Delivery tiers ── */}
      <section id="pricing" className="lp-sec alt" aria-labelledby="tier-title">
        <div className="lp-wrap">
          <Reveal className="lp-head">
            <span className="lp-eyebrow">Delivery options</span>
            <h2 id="tier-title" className="lp-h2">Choose how fast you need it</h2>
            <p className="lp-lead">Every option includes progress tracking, quality review and a secure download.</p>
          </Reveal>
          <div className="lp-tiers">
            {TIERS.map((t, i) => (
              <Reveal key={t.name} delay={i * 110}>
                <div className={`lp-tier${t.accent ? ' hot' : ''}`}>
                  {t.accent && <span className="lp-tag">Fastest</span>}
                  <h3><t.icon size={20} /> {t.name}</h3>
                  <div className="lp-tier-time">{t.time}</div>
                  <div className="lp-tier-price">{t.price}</div>
                  <ul>
                    <li><Check size={16} strokeWidth={3} /> Verified expert</li>
                    <li><Check size={16} strokeWidth={3} /> Progress tracking and chat</li>
                    <li><Check size={16} strokeWidth={3} /> Quality review before delivery</li>
                  </ul>
                  <Link to="/submit" className={`lp-btn ${t.accent ? 'lp-white' : 'lp-ghost'}`}>Submit a project <ArrowRight size={16} /></Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Expert levels ── */}
      <section className="lp-sec" aria-labelledby="lvl-title">
        <div className="lp-wrap">
          <Reveal className="lp-head">
            <span className="lp-eyebrow">For experts</span>
            <h2 id="lvl-title" className="lp-h2">Grow from Beginner to Elite</h2>
            <p className="lp-lead">Experts advance by completing projects, earning ratings and delivering on time.</p>
          </Reveal>
          <div className="lp-levels">
            {LEVELS.map((l, i) => (
              <Reveal key={l.label} delay={i * 90}>
                <div className="lp-level">
                  <span className="lp-stars" aria-label={`${l.stars} of 4 stars`}>
                    {[1, 2, 3, 4].map(n => <Star key={n} size={18} fill="currentColor" className={n <= l.stars ? '' : 'off'} />)}
                  </span>
                  <b>{l.label}</b><small>{l.projects}</small>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="lp-sec alt" aria-labelledby="test-title">
        <div className="lp-wrap">
          <Reveal className="lp-head">
            <span className="lp-eyebrow">Testimonials</span>
            <h2 id="test-title" className="lp-h2">What engineers say</h2>
            <p className="lp-lead">Students and professionals who needed their simulations done right.</p>
          </Reveal>
          <div className="lp-tgrid">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={(i % 2) * 110}>
                <figure className="lp-quote" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Quote size={26} color="#C4DBF1" fill="#C4DBF1" />
                    <span className="lp-stars" aria-label={`${t.rating} out of 5`}>
                      {[1, 2, 3, 4, 5].map(n => <Star key={n} size={15} fill="currentColor" className={n <= t.rating ? '' : 'off'} />)}
                    </span>
                  </div>
                  <p>“{t.quote}”</p>
                  <figcaption className="lp-who">
                    <span className="lp-ava">
                      <span aria-hidden>{t.initials}</span>
                      <img src={t.photo} alt="" loading="lazy" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                    </span>
                    <span><b>{t.name}</b><small>{t.role}</small></span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="lp-sec" aria-labelledby="faq-title">
        <div className="lp-wrap">
          <Reveal className="lp-head">
            <span className="lp-eyebrow">FAQ</span>
            <h2 id="faq-title" className="lp-h2">Questions, answered</h2>
          </Reveal>
          <div className="lp-faq">
            {FAQ.map((f, i) => {
              const isOpen = open === i
              return (
                <Reveal key={f.q} delay={i * 60}>
                  <div className={`lp-qa${isOpen ? ' open' : ''}`}>
                    <button type="button" aria-expanded={isOpen} aria-controls={`faq-${i}`} id={`faq-btn-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                      <span>{f.q}</span><ChevronDown size={20} />
                    </button>
                    <div className="lp-qa-body" id={`faq-${i}`} role="region" aria-labelledby={`faq-btn-${i}`}>
                      <div><p>{f.a}</p></div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="lp-wrap" aria-label="Get started">
        <Reveal>
          <div className="lp-band">
            <h2>Ready to get your simulation done?</h2>
            <p>Describe your project, create your account and we take it from there.</p>
            <div className="lp-cta">
              <Link to="/submit" className="lp-btn lp-white">Submit a project <ArrowRight size={18} /></Link>
              <Link to="/apply-expert" className="lp-btn lp-outline-w">Become an expert</Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-foot">
        <div className="lp-wrap">
          <div className="lp-foot-grid">
            <div>
              <div className="lp-foot-brand"><span className="t"><GSHLogo size={30} /></span><span><b>Global Simulation Hub</b><small>Engineering excellence, delivered.</small></span></div>
              <p>Connecting simulation engineers with clients who need results that are fast, verified and secure.</p>
            </div>
            <div><h4>Platform</h4><Link to="/submit">Submit project</Link><Link to="/apply-expert">Become expert</Link><Link to="/login">Login</Link><Link to="/register">Register</Link></div>
            <div><h4>Explore</h4><a href="#how">How it works</a><a href="#features">Why GSH</a><a href="#simulations">Simulations</a><a href="#faq">FAQ</a></div>
            <div><h4>Delivery</h4><a href="#pricing">Express · 6–12h</a><a href="#pricing">Urgent · 24h</a><a href="#pricing">Standard · Flexible</a></div>
          </div>
          <div className="lp-copy"><span>© {new Date().getFullYear()} Global Simulation Hub. All rights reserved.</span><span>MATLAB · Simulink · Proteus · ANSYS · LabVIEW</span></div>
        </div>
      </footer>
    </div>
  )
}
