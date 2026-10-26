import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Play, X, ChevronLeft, ChevronRight, Film, Image as ImageIcon } from 'lucide-react'
import { publicApi } from '@/api/client'

/* ── Mkataba wa data kutoka backend: GET /public/showcase/ ───────────────── */
export interface ShowcaseVideo {
  id: number | string
  title: string
  description?: string
  video_url: string          // faili la mp4/webm AU kiungo cha YouTube/Vimeo
  thumbnail_url?: string
  duration?: string          // mfano "02:35"
  software?: string          // mfano "Simulink"
}
export interface ShowcaseImage {
  id: number | string
  title: string
  caption?: string
  image_url: string
  software?: string
}
export interface ShowcaseData { videos: ShowcaseVideo[]; images: ShowcaseImage[] }

function toEmbed(url: string): { iframe: boolean; src: string } {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return { iframe: true, src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0` }
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return { iframe: true, src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` }
  return { iframe: false, src: url }
}

const css = `
.sh-wrap { max-width: 1200px; margin: 0 auto; font-family: inherit; }
.sh-head { text-align: center; margin-bottom: 32px; }
.sh-head h2 { font-size: clamp(22px,4vw,28px); font-weight: 700; color: #0A1F4D; margin: 0 0 8px; }
.sh-head p { font-size: 15px; color: #4E5E82; margin: 0 auto; max-width: 560px; line-height: 1.6; }
.sh-label { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; color: #0A1F4D; margin: 0 0 14px; }
.sh-label svg { color: #0D52CE; }
.sh-videos { display: grid; grid-template-columns: minmax(0,1.7fr) minmax(0,1fr); gap: 20px; align-items: start; margin-bottom: 44px; }
.sh-player { position: relative; aspect-ratio: 16/9; background: #0A1F4D; border-radius: 12px; overflow: hidden; border: 1px solid #DCE3F0; }
.sh-player img, .sh-player video, .sh-player iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; object-fit: cover; }
.sh-player video { object-fit: contain; background: #000; }
.sh-play { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(10,31,107,.28); border: none; cursor: pointer; transition: background .15s; }
.sh-play:hover { background: rgba(10,31,107,.4); }
.sh-play span { width: 64px; height: 64px; border-radius: 50%; background: #F5BA2E; color: #0A1F6B; display: flex; align-items: center; justify-content: center; }
.sh-meta { padding: 14px 2px 0; }
.sh-meta h3 { font-size: 18px; font-weight: 600; color: #0A1F4D; margin: 0 0 4px; line-height: 1.35; }
.sh-meta p { font-size: 14px; color: #4E5E82; margin: 0; line-height: 1.6; }
.sh-chip { display: inline-block; font-size: 12px; font-weight: 600; color: #0A42A8; background: #EAF1FD; border-radius: 999px; padding: 3px 10px; margin-bottom: 8px; }
.sh-list { display: flex; flex-direction: column; gap: 10px; max-height: 440px; overflow-y: auto; padding-right: 2px; }
.sh-item { display: flex; gap: 12px; width: 100%; padding: 8px; border-radius: 10px; border: 1px solid #DCE3F0; background: #fff; cursor: pointer; text-align: left; font-family: inherit; transition: border-color .15s, background .15s; }
.sh-item:hover { border-color: #C3CEE2; }
.sh-item.on { border-color: #0D52CE; background: #EAF1FD; }
.sh-thumb { position: relative; width: 112px; aspect-ratio: 16/9; flex-shrink: 0; border-radius: 6px; overflow: hidden; background: #DCE3F0; display: flex; align-items: center; justify-content: center; color: #667697; }
.sh-thumb img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.sh-dur { position: absolute; right: 4px; bottom: 4px; background: rgba(10,31,77,.88); color: #fff; font-size: 12px; font-weight: 600; padding: 1px 5px; border-radius: 4px; }
.sh-item-t { font-size: 14px; font-weight: 600; color: #0A1F4D; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.sh-item-s { font-size: 12px; color: #667697; margin-top: 4px; }
.sh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.sh-card { background: #fff; border: 1px solid #DCE3F0; border-radius: 12px; overflow: hidden; cursor: pointer; padding: 0; text-align: left; font-family: inherit; transition: border-color .15s, box-shadow .15s; }
.sh-card:hover { border-color: #C3CEE2; box-shadow: 0 1px 3px rgba(10,31,107,.08); }
.sh-card .img { position: relative; aspect-ratio: 4/3; background: #EBEFF8; display: flex; align-items: center; justify-content: center; color: #8D9BB8; }
.sh-card .img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.sh-cap { padding: 10px 12px 12px; }
.sh-cap b { display: block; font-size: 14px; font-weight: 600; color: #0A1F4D; line-height: 1.35; }
.sh-cap span { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 13px; color: #4E5E82; margin-top: 2px; line-height: 1.45; }
.sh-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #8DA6D6; font-size: 14px; text-align: center; padding: 16px; position: absolute; inset: 0; }
.sh-skel { background: #EBEFF8; animation: shPulse 1.4s ease-in-out infinite; }
@keyframes shPulse { 50% { opacity: .55; } }
.sh-lb { position: fixed; inset: 0; z-index: 100; background: rgba(7,22,80,.94); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 56px 16px 24px; }
.sh-lb img { max-width: 100%; max-height: calc(100vh - 170px); object-fit: contain; border-radius: 8px; }
.sh-lb-cap { color: #fff; text-align: center; margin-top: 14px; max-width: 640px; }
.sh-lb-cap b { display: block; font-size: 16px; font-weight: 600; }
.sh-lb-cap span { font-size: 14px; color: #C9D4F0; }
.sh-lb-btn { position: absolute; width: 44px; height: 44px; border-radius: 50%; border: none; background: rgba(255,255,255,.14); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.sh-lb-btn:hover { background: rgba(255,255,255,.26); }
@media (max-width: 900px) {
  .sh-videos { grid-template-columns: 1fr; margin-bottom: 36px; }
  .sh-list { flex-direction: row; max-height: none; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; padding-bottom: 6px; }
  .sh-item { width: 250px; flex-shrink: 0; scroll-snap-align: start; }
}
@media (max-width: 560px) {
  .sh-grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
  .sh-play span { width: 54px; height: 54px; }
  .sh-meta h3 { font-size: 16px; }
  .sh-cap { padding: 8px 10px 10px; }
  .sh-cap span { display: none; }
  .sh-lb-prev { left: 8px; bottom: 16px; } .sh-lb-next { right: 8px; bottom: 16px; }
}
@media (min-width: 561px) { .sh-lb-prev { left: 16px; top: 50%; } .sh-lb-next { right: 16px; top: 50%; } }
@media (prefers-reduced-motion: reduce) { .sh-skel { animation: none; } }
`

export default function SimulationShowcase() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-showcase'],
    queryFn: async (): Promise<ShowcaseData> => {
      const res = await publicApi.showcase()
      const d: any = res.data ?? {}
      return { videos: d.videos ?? [], images: d.images ?? [] }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
  const videos = data?.videos ?? []
  const images = data?.images ?? []

  const [activeId, setActiveId] = useState<number | string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [lb, setLb] = useState<number | null>(null)

  const active = videos.find(v => v.id === activeId) ?? videos[0]

  // Lightbox: kibodi + kufunga scroll ya ukurasa
  useEffect(() => {
    if (lb === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLb(null)
      if (e.key === 'ArrowLeft') setLb(i => (i === null ? i : (i - 1 + images.length) % images.length))
      if (e.key === 'ArrowRight') setLb(i => (i === null ? i : (i + 1) % images.length))
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [lb, images.length])

  const selectVideo = (id: number | string) => { setActiveId(id); setPlaying(false) }
  const embed = active ? toEmbed(active.video_url) : null

  return (
    <div className="sh-wrap">
      <style>{css}</style>
      <div className="sh-head">
        <h2>See simulations in action</h2>
        <p>Watch real projects delivered by our verified experts and browse results from MATLAB, Simulink, Proteus, ANSYS and more.</p>
      </div>

      {/* ───────── VIDEOS ───────── */}
      <h3 className="sh-label"><Film size={18} /> Simulation videos</h3>
      <div className="sh-videos">
        <div>
          <div className="sh-player">
            {isLoading ? (
              <div className="sh-skel" style={{ position: 'absolute', inset: 0 }} />
            ) : !active ? (
              <div className="sh-empty"><Film size={36} strokeWidth={1.5} />Simulation videos will appear here</div>
            ) : playing && embed ? (
              embed.iframe
                ? <iframe src={embed.src} title={active.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
                : <video src={embed.src} poster={active.thumbnail_url} controls autoPlay playsInline />
            ) : (
              <>
                {active.thumbnail_url && <img src={active.thumbnail_url} alt={active.title} loading="lazy" />}
                <button className="sh-play" onClick={() => setPlaying(true)} aria-label={`Play ${active.title}`}>
                  <span><Play size={26} fill="#0A1F6B" /></span>
                </button>
              </>
            )}
          </div>
          {active && (
            <div className="sh-meta">
              {active.software && <span className="sh-chip">{active.software}</span>}
              <h3>{active.title}</h3>
              {active.description && <p>{active.description}</p>}
            </div>
          )}
        </div>

        <div className="sh-list" aria-label="Video playlist">
          {isLoading
            ? [0, 1, 2].map(i => <div key={i} className="sh-skel" style={{ height: 78, borderRadius: 10, flexShrink: 0, width: '100%' }} />)
            : videos.length === 0
              ? [0, 1, 2].map(i => (
                  <div key={i} className="sh-item" style={{ cursor: 'default' }}>
                    <div className="sh-thumb"><Film size={20} /></div>
                    <div><div className="sh-item-t" style={{ color: '#8D9BB8' }}>Coming soon</div><div className="sh-item-s">Video {i + 1}</div></div>
                  </div>
                ))
              : videos.map(v => (
                  <button key={v.id} className={`sh-item${active?.id === v.id ? ' on' : ''}`} onClick={() => selectVideo(v.id)}>
                    <div className="sh-thumb">
                      {v.thumbnail_url ? <img src={v.thumbnail_url} alt="" loading="lazy" /> : <Play size={20} />}
                      {v.duration && <span className="sh-dur">{v.duration}</span>}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="sh-item-t">{v.title}</div>
                      {v.software && <div className="sh-item-s">{v.software}</div>}
                    </div>
                  </button>
                ))}
        </div>
      </div>

      {/* ───────── PICHA ───────── */}
      <h3 className="sh-label"><ImageIcon size={18} /> Simulation gallery</h3>
      <div className="sh-grid">
        {isLoading
          ? [0, 1, 2, 3, 4, 5].map(i => <div key={i} className="sh-skel" style={{ aspectRatio: '4/3.6', borderRadius: 12 }} />)
          : images.length === 0
            ? [0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className="sh-card" style={{ cursor: 'default' }}>
                  <div className="img"><ImageIcon size={30} strokeWidth={1.5} /></div>
                  <div className="sh-cap"><b style={{ color: '#8D9BB8' }}>Coming soon</b></div>
                </div>
              ))
            : images.map((im, i) => (
                <button key={im.id} className="sh-card" onClick={() => setLb(i)}>
                  <div className="img"><img src={im.image_url} alt={im.title} loading="lazy" /></div>
                  <div className="sh-cap"><b>{im.title}</b>{im.caption && <span>{im.caption}</span>}</div>
                </button>
              ))}
      </div>

      {/* ───────── LIGHTBOX ───────── */}
      {lb !== null && images[lb] && (
        <div className="sh-lb" role="dialog" aria-modal="true" aria-label={images[lb].title} onClick={() => setLb(null)}>
          <button className="sh-lb-btn" style={{ top: 12, right: 12 }} onClick={() => setLb(null)} aria-label="Close"><X size={20} /></button>
          {images.length > 1 && (
            <>
              <button className="sh-lb-btn sh-lb-prev" onClick={e => { e.stopPropagation(); setLb((lb - 1 + images.length) % images.length) }} aria-label="Previous"><ChevronLeft size={22} /></button>
              <button className="sh-lb-btn sh-lb-next" onClick={e => { e.stopPropagation(); setLb((lb + 1) % images.length) }} aria-label="Next"><ChevronRight size={22} /></button>
            </>
          )}
          <img src={images[lb].image_url} alt={images[lb].title} onClick={e => e.stopPropagation()} />
          <div className="sh-lb-cap" onClick={e => e.stopPropagation()}>
            <b>{images[lb].title}</b>
            {images[lb].caption && <span>{images[lb].caption}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
