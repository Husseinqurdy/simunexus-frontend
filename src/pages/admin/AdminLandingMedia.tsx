import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Film, Image as ImageIcon, Loader2, Pencil, Trash2, Upload, Eye, EyeOff, X, ExternalLink } from 'lucide-react'
import { contentApi } from '@/api/client'
import { errorMessage, formatBytes } from '@/lib/format'
import type { ShowcaseItem } from '@/types'

const card: React.CSSProperties = { background: '#fff', border: '1px solid #DCE3F0', borderRadius: 12, padding: 20 }
const lab: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#2B3A60', marginBottom: 6 }
const inp: React.CSSProperties = { width: '100%', height: 40, border: '1px solid #C3CEE2', borderRadius: 8, padding: '0 12px', fontSize: 14, fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' }
const btn = (primary = true, danger = false): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  border: primary ? 'none' : `1px solid ${danger ? '#F3C7C7' : '#C3CEE2'}`, background: primary ? '#0D52CE' : '#fff', color: primary ? '#fff' : danger ? '#B92D2D' : '#0A1F6B',
})

const EMPTY = { kind: 'video' as 'video' | 'image', title: '', description: '', software: '', external_url: '', duration: '', order: 0, is_published: true }

export default function AdminLandingMedia() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'video' | 'image'>('all')
  const [form, setForm] = useState({ ...EMPTY })
  const [editing, setEditing] = useState<ShowcaseItem | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [thumb, setThumb] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const thumbRef = useRef<HTMLInputElement>(null)

  const { data: items = [], isLoading } = useQuery<ShowcaseItem[]>({
    queryKey: ['admin-showcase'],
    queryFn: () => contentApi.list().then(r => r.data),
  })
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-showcase'] })

  const reset = () => {
    setForm({ ...EMPTY }); setEditing(null); setFile(null); setThumb(null); setProgress(0)
    if (fileRef.current) fileRef.current.value = ''
    if (thumbRef.current) thumbRef.current.value = ''
  }

  const save = useMutation({
    mutationFn: async () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
      if (file) fd.append('file', file)
      if (thumb) fd.append('thumbnail', thumb)
      setProgress(0)
      return editing ? contentApi.update(editing.id, fd) : contentApi.create(fd, setProgress)
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Uploaded — it is now on the landing page'); reset(); refresh() },
    onError: (e: any) => toast.error(errorMessage(e, 'Could not save')),
  })

  const toggle = useMutation({
    mutationFn: (it: ShowcaseItem) => contentApi.update(it.id, { is_published: !it.is_published }),
    onSuccess: refresh, onError: (e: any) => toast.error(errorMessage(e)),
  })
  const remove = useMutation({
    mutationFn: (id: number) => contentApi.remove(id),
    onSuccess: () => { toast.success('Deleted'); refresh() }, onError: (e: any) => toast.error(errorMessage(e)),
  })

  const startEdit = (it: ShowcaseItem) => {
    setEditing(it)
    setForm({ kind: it.kind, title: it.title, description: it.description, software: it.software, external_url: it.external_url, duration: it.duration, order: it.order, is_published: it.is_published })
    setFile(null); setThumb(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const shown = items.filter(i => filter === 'all' || i.kind === filter)
  const needsFile = !editing && (form.kind === 'image' || !form.external_url)
  const canSave = form.title.trim() && (editing || (form.kind === 'image' ? !!file : !!file || !!form.external_url))

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A1F4D', margin: '0 0 4px' }}>Landing page media</h1>
          <p style={{ fontSize: 14, color: '#4E5E82', margin: 0 }}>Videos and images shown in “See simulations in action” on the public landing page.</p>
        </div>
        <a href="/#simulations" target="_blank" rel="noopener noreferrer" style={{ ...btn(false), textDecoration: 'none' }}><ExternalLink size={15} /> View landing page</a>
      </div>

      {/* Fomu ya kupakia / kuhariri */}
      <section style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#0A1F4D' }}>{editing ? `Edit “${editing.title}”` : 'Add new media'}</h2>
          {editing && <button style={btn(false)} onClick={reset}><X size={15} /> Cancel edit</button>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <div>
            <span style={lab}>Type</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['video', 'image'] as const).map(k => (
                <button key={k} type="button" disabled={!!editing} onClick={() => { setForm(f => ({ ...f, kind: k })); setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                  style={{ ...btn(false), flex: 1, background: form.kind === k ? '#EAF1FD' : '#fff', borderColor: form.kind === k ? '#0D52CE' : '#C3CEE2', opacity: editing ? .6 : 1 }}>
                  {k === 'video' ? <Film size={15} /> : <ImageIcon size={15} />} {k === 'video' ? 'Video' : 'Image'}
                </button>
              ))}
            </div>
          </div>
          <div><label style={lab}>Title *</label><input style={inp} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Buck converter in Simulink" /></div>
          <div><label style={lab}>Software</label><input style={inp} value={form.software} onChange={e => setForm({ ...form, software: e.target.value })} placeholder="e.g. Simulink" /></div>
          <div><label style={lab}>Display order</label><input style={inp} type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} /></div>
        </div>

        <div style={{ margin: '14px 0' }}>
          <label style={lab}>Description / caption</label>
          <textarea style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical' }} rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <div>
            <label style={lab}>{form.kind === 'video' ? 'Video file (mp4, webm, mov)' : 'Image file (jpg, png, webp, gif)'} {editing && <span style={{ fontWeight: 400, color: '#667697' }}>— leave empty to keep current</span>}</label>
            <input ref={fileRef} type="file" accept={form.kind === 'video' ? 'video/*' : 'image/*'} onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: 14, maxWidth: '100%' }} />
            {file && <div style={{ fontSize: 12, color: '#667697', marginTop: 4 }}>{file.name} · {formatBytes(file.size)}</div>}
          </div>
          {form.kind === 'video' && (
            <>
              <div><label style={lab}>…or YouTube / Vimeo link</label><input style={inp} value={form.external_url} onChange={e => setForm({ ...form, external_url: e.target.value })} placeholder="https://youtu.be/…" /></div>
              <div>
                <label style={lab}>Poster image (optional)</label>
                <input ref={thumbRef} type="file" accept="image/*" onChange={e => setThumb(e.target.files?.[0] || null)} style={{ fontSize: 14, maxWidth: '100%' }} />
              </div>
              <div><label style={lab}>Duration</label><input style={inp} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="02:35" /></div>
            </>
          )}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', fontSize: 14, color: '#2B3A60', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} style={{ accentColor: '#0D52CE', width: 16, height: 16 }} /> Published (visible on the landing page)
        </label>

        {save.isPending && file && !editing && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4E5E82', marginBottom: 6 }}><span>Uploading…</span><span>{progress}%</span></div>
            <div style={{ height: 6, background: '#DCE3F0', borderRadius: 6, overflow: 'hidden' }}><div style={{ width: `${progress}%`, height: '100%', background: '#0D52CE', transition: 'width .2s' }} /></div>
          </div>
        )}
        <button style={{ ...btn(), opacity: canSave && !save.isPending ? 1 : .6 }} disabled={!canSave || save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? <><Loader2 size={15} className="spin" /> Saving…</> : <><Upload size={15} /> {editing ? 'Save changes' : needsFile ? 'Upload' : 'Add'}</>}
        </button>
      </section>

      {/* Orodha */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['all', 'video', 'image'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...btn(false), background: filter === f ? '#0A1F6B' : '#fff', color: filter === f ? '#fff' : '#0A1F6B', borderColor: filter === f ? '#0A1F6B' : '#C3CEE2' }}>
            {f === 'all' ? `All (${items.length})` : f === 'video' ? `Videos (${items.filter(i => i.kind === 'video').length})` : `Images (${items.filter(i => i.kind === 'image').length})`}
          </button>
        ))}
      </div>

      {isLoading ? <p style={{ color: '#667697' }}>Loading…</p> : shown.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: '#667697', fontSize: 14 }}>Nothing here yet. Upload your first {filter === 'image' ? 'image' : 'video'} above.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {shown.map(it => (
            <article key={it.id} style={{ ...card, padding: 0, overflow: 'hidden', opacity: it.is_published ? 1 : .75 }}>
              <div style={{ aspectRatio: '16/9', background: '#EBEFF8', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8D9BB8' }}>
                {it.kind === 'image' && it.file_url ? <img src={it.file_url} alt={it.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  : it.thumbnail_url ? <img src={it.thumbnail_url} alt={it.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  : it.kind === 'video' ? <Film size={34} /> : <ImageIcon size={34} />}
                <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '3px 10px', background: '#0A1F6B', color: '#fff' }}>{it.kind === 'video' ? 'Video' : 'Image'}</span>
                {!it.is_published && <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '3px 10px', background: '#F5BA2E', color: '#0A1F6B' }}>Hidden</span>}
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0A1F4D', marginBottom: 2 }}>{it.title}</div>
                <div style={{ fontSize: 12, color: '#667697', marginBottom: 10 }}>
                  {[it.software, it.duration, it.file_size ? formatBytes(it.file_size) : it.external_url ? 'External link' : '', `order ${it.order}`].filter(Boolean).join(' · ')}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button style={btn(false)} onClick={() => startEdit(it)}><Pencil size={14} /> Edit</button>
                  <button style={btn(false)} onClick={() => toggle.mutate(it)} disabled={toggle.isPending}>{it.is_published ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Publish</>}</button>
                  <button style={btn(false, true)} onClick={() => { if (window.confirm(`Delete “${it.title}”? The file will be removed.`)) remove.mutate(it.id) }} aria-label={`Delete ${it.title}`}><Trash2 size={14} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
