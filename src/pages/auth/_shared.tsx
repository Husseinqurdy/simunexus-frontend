export const authStyles = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.ap { font-family: 'DM Sans', sans-serif; }
.dp { font-family: 'Syne', sans-serif; }
@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
.au  { animation: fadeUp .6s ease both; }
.au1 { animation: fadeUp .6s .08s ease both; }
.au2 { animation: fadeUp .6s .16s ease both; }
.au3 { animation: fadeUp .6s .24s ease both; }
.au4 { animation: fadeUp .6s .32s ease both; }
.hgrid { background-image:linear-gradient(rgba(14,165,233,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,.05) 1px,transparent 1px); background-size:48px 48px; }
.afield label { display:block; font-size:12px; font-weight:600; color:#64748B; letter-spacing:.04em; text-transform:uppercase; margin-bottom:6px; }
.afield input, .afield select, .afield textarea { width:100%; background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:10px; padding:11px 14px; font-size:14px; color:#0F172A; font-family:'DM Sans',sans-serif; transition:all .2s; outline:none; }
.afield input:focus, .afield select:focus, .afield textarea:focus { border-color:#0EA5E9; background:#fff; box-shadow:0 0 0 4px rgba(14,165,233,.08); }
.afield input::placeholder { color:#CBD5E1; }
.afield .err { font-size:11px; color:#EF4444; margin-top:5px; font-weight:500; }
.abtn { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; background:#0EA5E9; color:#fff; font-family:'Syne',sans-serif; font-weight:700; font-size:15px; padding:14px; border-radius:12px; border:none; cursor:pointer; transition:all .2s; letter-spacing:.01em; }
.abtn:hover:not(:disabled) { background:#0284C7; box-shadow:0 8px 24px rgba(14,165,233,.35); transform:translateY(-1px); }
.abtn:active:not(:disabled) { transform:scale(.98); }
.abtn:disabled { opacity:.6; cursor:not-allowed; }
.abtn-outline { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; background:#fff; color:#0B1C3D; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:12px; border-radius:12px; border:1.5px solid #E2E8F0; cursor:pointer; transition:all .2s; }
.abtn-outline:hover { border-color:#0EA5E9; color:#0EA5E9; background:#F0F9FF; }
.divider { display:flex; align-items:center; gap:12px; margin:20px 0; }
.divider::before,.divider::after { content:''; flex:1; height:1px; background:#F1F5F9; }
.divider span { font-size:11px; color:#CBD5E1; font-weight:600; letter-spacing:.06em; text-transform:uppercase; }
`

export function GSHLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="url(#aul1)" />
      <path d="M8 20C8 13.37 13.37 8 20 8C23.5 8 26.67 9.43 29 11.76" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 20H26V26C26 27.1 25.1 28 24 28H20V20Z" fill="white" fillOpacity="0.9" />
      <path d="M14 20H20V28H16C14.9 28 14 27.1 14 26V20Z" fill="white" fillOpacity="0.6" />
      <circle cx="29" cy="12" r="3" fill="#38BDF8" />
      <circle cx="29" cy="12" r="1.5" fill="white" />
      <defs>
        <linearGradient id="aul1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B1C3D" /><stop offset="1" stopColor="#1A3A7A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight:'100vh', background:'#0B1C3D', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }} className="hgrid ap">
      <div style={{ position:'absolute', width:400, height:400, background:'rgba(14,165,233,.07)', borderRadius:'50%', filter:'blur(80px)', top:'10%', left:'-5%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:300, height:300, background:'rgba(99,102,241,.07)', borderRadius:'50%', filter:'blur(80px)', bottom:'10%', right:'-5%', pointerEvents:'none' }} />
      <div style={{ position:'relative', width:'100%', maxWidth:460 }}>
        {children}
      </div>
    </div>
  )
}
