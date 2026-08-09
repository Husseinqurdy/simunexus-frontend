import { useState } from 'react'

export const authStyles = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.ap { font-family: 'DM Sans', sans-serif; }
.dp { font-family: 'Syne', sans-serif; }
@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes drift { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(18px,-14px) scale(1.05); } }
.au  { animation: fadeUp .6s cubic-bezier(.22,.61,.36,1) both; }
.au1 { animation: fadeUp .6s .08s cubic-bezier(.22,.61,.36,1) both; }
.au2 { animation: fadeUp .6s .16s cubic-bezier(.22,.61,.36,1) both; }
.au3 { animation: fadeUp .6s .24s cubic-bezier(.22,.61,.36,1) both; }
.au4 { animation: fadeUp .6s .32s cubic-bezier(.22,.61,.36,1) both; }
.hgrid { background-image:linear-gradient(rgba(14,165,233,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,.05) 1px,transparent 1px); background-size:48px 48px; }
.ablob { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; animation: drift 9s ease-in-out infinite; }
.afield label { display:block; font-size:12px; font-weight:600; color:#64748B; letter-spacing:.04em; text-transform:uppercase; margin-bottom:6px; }
.afield input, .afield select, .afield textarea { width:100%; background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:10px; padding:11px 14px; font-size:14px; color:#0F172A; font-family:'DM Sans',sans-serif; transition:border-color .2s, background .2s, box-shadow .2s; outline:none; }
.afield input:focus, .afield select:focus, .afield textarea:focus { border-color:#0EA5E9; background:#fff; box-shadow:0 0 0 4px rgba(14,165,233,.08); }
.afield input::placeholder { color:#CBD5E1; }
.afield .err { font-size:11px; color:#EF4444; margin-top:5px; font-weight:500; }
.abtn { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; background:linear-gradient(120deg,#0EA5E9,#F97316); background-size:170% 170%; background-position:0% 50%; color:#fff; font-family:'Syne',sans-serif; font-weight:700; font-size:15px; padding:14px; border-radius:12px; border:none; cursor:pointer; transition:background-position .4s cubic-bezier(.22,.61,.36,1), box-shadow .25s cubic-bezier(.22,.61,.36,1), transform .25s cubic-bezier(.22,.61,.36,1); letter-spacing:.01em; }
.abtn:hover:not(:disabled) { background-position:100% 50%; box-shadow:0 10px 26px rgba(249,115,22,.3); transform:translateY(-1px); }
.abtn:active:not(:disabled) { transform:scale(.98); }
.abtn:disabled { opacity:.6; cursor:not-allowed; }
.abtn-outline { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; background:#fff; color:#0B1C3D; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:12px; border-radius:12px; border:1.5px solid #E2E8F0; cursor:pointer; transition:border-color .2s, color .2s, background .2s; }
.abtn-outline:hover { border-color:#0EA5E9; color:#0EA5E9; background:#F0F9FF; }
.divider { display:flex; align-items:center; gap:12px; margin:20px 0; }
.divider::before,.divider::after { content:''; flex:1; height:1px; background:#F1F5F9; }
.divider span { font-size:11px; color:#CBD5E1; font-weight:600; letter-spacing:.06em; text-transform:uppercase; }
@media (prefers-reduced-motion: reduce) {
  .au, .au1, .au2, .au3, .au4, .ablob { animation: none !important; }
  .afield input, .afield select, .afield textarea, .abtn, .abtn-outline { transition: none !important; }
}
`

/* Real brand icon (extracted from the SimuNexus logo artwork), with a smooth
   fade + scale-in on load instead of popping in abruptly. Falls back
   gracefully — layout never breaks if the image is briefly unavailable. */
export function GSHLogo({ size = 36 }: { size?: number }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      src="/gsh-icon.png"
      alt="Global Simulation Hub"
      onLoad={() => setLoaded(true)}
      style={{
        height: size,
        width: 'auto',
        maxWidth: 'none',
        maxHeight: 'none',
        display: 'block',
        flexShrink: 0,
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'scale(1)' : 'scale(0.9)',
        transition: 'opacity .5s cubic-bezier(.22,.61,.36,1), transform .5s cubic-bezier(.22,.61,.36,1)',
      }}
    />
  )
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0B1C3D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }} className="hgrid ap">
      <div className="ablob" style={{ width: 400, height: 400, background: 'rgba(14,165,233,.08)', top: '10%', left: '-5%' }} />
      <div className="ablob" style={{ width: 300, height: 300, background: 'rgba(249,115,22,.10)', bottom: '10%', right: '-5%', animationDelay: '3s' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 460 }}>
        {children}
      </div>
    </div>
  )
}
