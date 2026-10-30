import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  UploadCloud, File as FileIcon, FileText, Image as ImageIcon, Film, Music, Lock, Download,
  Eye, Trash2, X, Loader2, CheckCircle2, AlertCircle, RotateCcw,
} from 'lucide-react'
import { projectApi } from '@/api/client'
import { formatBytes, errorMessage } from '@/lib/format'
import type { PreviewKind, ProjectFile } from '@/types'

/* ═════════════════════════════════════════════════════════════════════════
   Vipengele vya faili vinavyotumika kila mahali (client, expert, admin):
   • FileDropzone      — chagua/buruta faili (extension yoyote, ukubwa wowote)
   • useUploadQueue    — foleni ya upload (moja moja, progress, jaribu tena, ghairi)
   • UploadQueueList   — orodha ya faili zinazopakiwa
   • FilePreviewModal  — picha / video / sauti / PDF / maandishi
   • ProjectFilesPanel — orodha ya faili za mradi + preview + download + upload
   ═════════════════════════════════════════════════════════════════════════ */

const C = {
  navy: '#0A1F6B', blue: '#0D52CE', tint: '#EAF1FD', border: '#DCE3F0', border2: '#C3CEE2',
  text: '#0A1F4D', muted: '#4E5E82', faint: '#667697', bg: '#F5F7FC',
  green: '#137A4E', red: '#B92D2D', amber: '#9A5B00',
}

export function withInline(url: string) {
  return url + (url.includes('?') ? '&' : '?') + 'inline=1'
}

export function KindIcon({ kind, size = 18 }: { kind: PreviewKind; size?: number }) {
  const p = { size, strokeWidth: 1.8 }
  if (kind === 'image') return <ImageIcon {...p} />
  if (kind === 'video') return <Film {...p} />
  if (kind === 'audio') return <Music {...p} />
  if (kind === 'pdf' || kind === 'text') return <FileText {...p} />
  return <FileIcon {...p} />
}

export function guessKind(name: string, mime = ''): PreviewKind {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp'].includes(ext)) return 'image'
  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'm4v', 'mkv', 'avi'].includes(ext)) return 'video'
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio'
  if (ext === 'pdf') return 'pdf'
  if (['txt', 'csv', 'json', 'log', 'md'].includes(ext)) return 'text'
  return 'other'
}

/* ───────────────────────────── Dropzone ───────────────────────────── */

export function FileDropzone({ onFiles, disabled, label = 'Drop files here or click to browse', hint, compact }: {
  onFiles: (files: File[]) => void
  disabled?: boolean
  label?: string
  hint?: string
  compact?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const take = (list: FileList | null) => {
    if (!list || disabled) return
    const files = Array.from(list)
    if (files.length) onFiles(files)
    if (input.current) input.current.value = ''
  }

  return (
    <div
      role="button" tabIndex={0} aria-disabled={disabled}
      onClick={() => !disabled && input.current?.click()}
      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) { e.preventDefault(); input.current?.click() } }}
      onDragOver={e => { e.preventDefault(); if (!disabled) setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); take(e.dataTransfer.files) }}
      style={{
        border: `1.5px dashed ${over ? C.blue : C.border2}`, background: over ? C.tint : '#fff',
        borderRadius: 12, padding: compact ? '14px 16px' : '26px 16px', textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .6 : 1, transition: 'background .15s, border-color .15s',
      }}
    >
      <input ref={input} type="file" multiple hidden onChange={e => take(e.target.files)} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: C.blue }}>
        <UploadCloud size={compact ? 20 : 26} strokeWidth={1.8} />
        <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{label}</span>
      </div>
      {!compact && <p style={{ margin: '6px 0 0', fontSize: 13, color: C.muted }}>{hint || 'Any file type and any size: simulation models, videos, images, PDFs, data…'}</p>}
    </div>
  )
}

/* ─────────────────────────── Foleni ya upload ─────────────────────────── */

export interface QueueItem {
  id: string
  file: File
  status: 'queued' | 'uploading' | 'done' | 'error'
  percent: number
  error?: string
}

let uidCounter = 0
const uid = () => `${Date.now()}-${++uidCounter}`

export function useUploadQueue() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [busy, setBusy] = useState(false)
  const ref = useRef<QueueItem[]>([])
  const abort = useRef<AbortController | null>(null)
  const cancelled = useRef(false)

  const sync = (next: QueueItem[]) => { ref.current = next; setItems(next) }
  const patch = (id: string, p: Partial<QueueItem>) => sync(ref.current.map(i => (i.id === id ? { ...i, ...p } : i)))

  const add = useCallback((files: File[]) => {
    sync([...ref.current, ...files.map(f => ({ id: uid(), file: f, status: 'queued' as const, percent: 0 }))])
  }, [])
  const remove = useCallback((id: string) => sync(ref.current.filter(i => i.id !== id)), [])
  const reset = useCallback(() => sync([]), [])
  const cancel = useCallback(() => { cancelled.current = true; abort.current?.abort() }, [])

  /** Pakia faili zote zilizo kwenye foleni moja moja. Inarudisha { ok, failed }. */
  const run = useCallback(async (projectId: number, fileType?: string) => {
    cancelled.current = false
    setBusy(true)
    let ok = 0, failed = 0
    const todo = ref.current.filter(i => i.status === 'queued' || i.status === 'error')
    for (const item of todo) {
      if (cancelled.current) break
      patch(item.id, { status: 'uploading', percent: 0, error: undefined })
      const fd = new FormData()
      fd.append('files', item.file)
      if (fileType) fd.append('file_type', fileType)
      abort.current = new AbortController()
      try {
        await projectApi.uploadFiles(projectId, fd, pct => patch(item.id, { percent: pct }), abort.current.signal)
        patch(item.id, { status: 'done', percent: 100 })
        ok++
      } catch (e: any) {
        if (e?.code === 'ERR_CANCELED') { patch(item.id, { status: 'queued', percent: 0 }); break }
        patch(item.id, { status: 'error', error: errorMessage(e, 'Upload failed') })
        failed++
      }
    }
    setBusy(false)
    return { ok, failed }
  }, [])

  const pending = items.filter(i => i.status === 'queued' || i.status === 'error').length
  return { items, add, remove, reset, run, cancel, busy, pending }
}

export function UploadQueueList({ items, onRemove, busy }: { items: QueueItem[]; onRemove: (id: string) => void; busy: boolean }) {
  if (!items.length) return null
  return (
    <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map(i => (
        <li key={i.id} style={{ border: `1px solid ${i.status === 'error' ? '#F3C7C7' : C.border}`, background: '#fff', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.blue, display: 'flex' }}><KindIcon kind={guessKind(i.file.name, i.file.type)} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.file.name}</div>
              <div style={{ fontSize: 12, color: i.status === 'error' ? C.red : C.faint }}>
                {i.status === 'error' ? i.error : i.status === 'uploading' ? `Uploading… ${i.percent}%` : i.status === 'done' ? 'Uploaded' : formatBytes(i.file.size)}
                {i.status === 'uploading' || i.status === 'error' ? ` · ${formatBytes(i.file.size)}` : ''}
              </div>
            </div>
            {i.status === 'uploading' && <Loader2 size={16} color={C.blue} className="spin" />}
            {i.status === 'done' && <CheckCircle2 size={18} color={C.green} />}
            {i.status === 'error' && <AlertCircle size={18} color={C.red} />}
            {!(busy && i.status === 'uploading') && i.status !== 'done' && (
              <button type="button" onClick={() => onRemove(i.id)} aria-label={`Remove ${i.file.name}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.faint, display: 'flex', padding: 4 }}>
                <X size={16} />
              </button>
            )}
          </div>
          {i.status === 'uploading' && (
            <div style={{ height: 4, borderRadius: 4, background: C.border, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: `${i.percent}%`, height: '100%', background: C.blue, transition: 'width .2s' }} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

/* ───────────────────────────── Preview ───────────────────────────── */

export function FilePreviewModal({ name, url, kind, onClose }: { name: string; url: string; kind: PreviewKind; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  const src = withInline(url)
  return (
    <div role="dialog" aria-modal="true" aria-label={name} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(7,22,80,.92)', display: 'flex', flexDirection: 'column', padding: 'clamp(10px,3vw,24px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#fff', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        <a href={url} target="_blank" rel="noopener noreferrer"
          style={{ color: '#fff', border: '1px solid rgba(255,255,255,.4)', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <Download size={14} /> Download
        </a>
        <button onClick={onClose} aria-label="Close preview"
          style={{ background: 'rgba(255,255,255,.14)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={18} />
        </button>
      </div>
      <div onClick={e => e.stopPropagation()} style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {kind === 'image' && <img src={src} alt={name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />}
        {kind === 'video' && <video src={src} controls autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, background: '#000' }} />}
        {kind === 'audio' && <audio src={src} controls autoPlay style={{ width: 'min(520px,100%)' }} />}
        {(kind === 'pdf' || kind === 'text') && (
          <iframe src={src} title={name} style={{ width: '100%', height: '100%', border: 0, borderRadius: 8, background: '#fff' }} />
        )}
      </div>
    </div>
  )
}

/* ───────────────────── Paneli ya faili za mradi ───────────────────── */

const TYPE_LABEL: Record<string, string> = {
  client_upload: 'Client input files',
  expert_partial: 'Work in progress',
  expert_final: 'Final deliverables',
  explanation: 'Explanation / report',
  admin_delivery: 'Delivery files (admin)',
}
const TYPE_ORDER = ['client_upload', 'expert_partial', 'expert_final', 'explanation', 'admin_delivery']

export function ProjectFilesPanel({
  projectId, files, uploadTypes = [], canDelete, onChanged, profileLink, title = 'Files', emptyText = 'No files yet.',
}: {
  projectId: number
  files: ProjectFile[]
  /** Aina za faili ambazo mtumiaji huyu anaruhusiwa kupakia ([] = hawezi kupakia) */
  uploadTypes?: { value: string; label: string }[]
  canDelete?: (f: ProjectFile) => boolean
  onChanged: () => void
  /** Kiungo cha kukamilisha profile (kwa mteja) */
  profileLink?: string
  title?: string
  emptyText?: string
}) {
  const q = useUploadQueue()
  const [type, setType] = useState(uploadTypes[0]?.value || '')
  const [preview, setPreview] = useState<ProjectFile | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => { if (!type && uploadTypes[0]) setType(uploadTypes[0].value) }, [uploadTypes, type])

  const groups = TYPE_ORDER
    .map(t => ({ type: t, items: files.filter(f => f.file_type === t) }))
    .filter(g => g.items.length)

  const start = async () => {
    if (!q.pending) return
    const { ok, failed } = await q.run(projectId, type || undefined)
    if (ok) { toast.success(`${ok} file${ok > 1 ? 's' : ''} uploaded`); onChanged() }
    if (failed) toast.error(`${failed} file${failed > 1 ? 's' : ''} failed — you can retry`)
    if (ok && !failed) setTimeout(q.reset, 1200)
  }

  const remove = async (f: ProjectFile) => {
    if (!window.confirm(`Delete "${f.original_name}"?`)) return
    setDeleting(f.id)
    try { await projectApi.deleteFile(f.id); toast.success('File deleted'); onChanged() }
    catch (e) { toast.error(errorMessage(e, 'Could not delete the file')) }
    finally { setDeleting(null) }
  }

  return (
    <section style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 600, color: C.text }}>
        {title} <span style={{ fontWeight: 500, color: C.faint, fontSize: 14 }}>({files.length})</span>
      </h3>

      {groups.length === 0 && <p style={{ margin: '0 0 8px', fontSize: 14, color: C.muted }}>{emptyText}</p>}

      {groups.map(g => (
        <div key={g.type} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 8 }}>{TYPE_LABEL[g.type] || g.type}</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {g.items.map(f => {
              const locked = f.locked || !f.url
              return (
                <li key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', background: locked ? C.bg : '#fff' }}>
                  <span style={{ color: locked ? C.faint : C.blue, display: 'flex' }}>{locked ? <Lock size={18} /> : <KindIcon kind={f.preview} />}</span>
                  <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.original_name}</div>
                    <div style={{ fontSize: 12, color: C.faint }}>
                      {formatBytes(f.file_size)}
                      {f.uploaded_by_name ? ` · ${f.uploaded_by_name}` : ''} · {new Date(f.created_at).toLocaleDateString()}
                    </div>
                    {locked && f.lock_reason === 'PROFILE_INCOMPLETE' && (
                      <div style={{ fontSize: 12, color: C.amber, marginTop: 4 }}>
                        Complete your profile to unlock downloads.{' '}
                        {profileLink && <Link to={profileLink} style={{ color: C.blue, fontWeight: 600 }}>Complete profile</Link>}
                      </div>
                    )}
                  </div>
                  {!locked && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {f.preview !== 'other' && (
                        <button onClick={() => setPreview(f)} style={iconBtn} aria-label={`Preview ${f.original_name}`}><Eye size={15} /> <span className="fp-lbl">Preview</span></button>
                      )}
                      <a href={f.url!} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn, textDecoration: 'none' }} aria-label={`Download ${f.original_name}`}>
                        <Download size={15} /> <span className="fp-lbl">Download</span>
                      </a>
                    </div>
                  )}
                  {canDelete?.(f) && (
                    <button onClick={() => remove(f)} disabled={deleting === f.id} style={{ ...iconBtn, color: C.red, borderColor: '#F3C7C7' }} aria-label={`Delete ${f.original_name}`}>
                      {deleting === f.id ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      {uploadTypes.length > 0 && (
        <div style={{ borderTop: groups.length ? `1px solid ${C.border}` : 'none', paddingTop: groups.length ? 16 : 0 }}>
          {uploadTypes.length > 1 && (
            <label style={{ display: 'block', marginBottom: 10 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2B3A60', marginBottom: 6 }}>File type</span>
              <select value={type} onChange={e => setType(e.target.value)} disabled={q.busy}
                style={{ height: 40, border: `1px solid ${C.border2}`, borderRadius: 8, padding: '0 10px', fontSize: 14, background: '#fff', maxWidth: '100%' }}>
                {uploadTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
          )}
          <FileDropzone onFiles={q.add} disabled={q.busy} compact={files.length > 0} />
          <UploadQueueList items={q.items} onRemove={q.remove} busy={q.busy} />
          {q.items.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <button onClick={start} disabled={q.busy || !q.pending} style={primaryBtn(q.busy || !q.pending)}>
                {q.busy ? <><Loader2 size={15} className="spin" /> Uploading…</> : q.items.some(i => i.status === 'error') ? <><RotateCcw size={15} /> Retry failed</> : <><UploadCloud size={15} /> Upload {q.pending} file{q.pending > 1 ? 's' : ''}</>}
              </button>
              {q.busy && <button onClick={q.cancel} style={{ ...iconBtn, height: 40 }}>Cancel</button>}
            </div>
          )}
        </div>
      )}

      {preview && preview.url && (
        <FilePreviewModal name={preview.original_name} url={preview.url} kind={preview.preview} onClose={() => setPreview(null)} />
      )}
      <style>{`@media (max-width: 480px) { .fp-lbl { display: none } }`}</style>
    </section>
  )
}

const iconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 11px', borderRadius: 8,
  border: `1px solid ${C.border2}`, background: '#fff', color: C.navy, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
const primaryBtn = (disabled: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 40, padding: '0 18px', borderRadius: 8,
  border: 'none', background: C.blue, color: '#fff', fontSize: 14, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? .6 : 1, fontFamily: 'inherit',
})
