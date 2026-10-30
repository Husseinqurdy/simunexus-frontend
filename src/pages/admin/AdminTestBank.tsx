import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import { recruitApi } from '@/api/client'
import { FileDropzone } from '@/components/shared/Files'
import { errorMessage, formatBytes } from '@/lib/format'
import type { QuestionUpload, TestQuestion, TestTool } from '@/types'

const card: React.CSSProperties = { background: '#fff', border: '1px solid #DCE3F0', borderRadius: 12, padding: 20 }
const lab: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#2B3A60', marginBottom: 6 }
const inp: React.CSSProperties = { width: '100%', height: 40, border: '1px solid #C3CEE2', borderRadius: 8, padding: '0 12px', fontSize: 14, fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' }
const btn = (primary = true, danger = false): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  border: primary ? 'none' : `1px solid ${danger ? '#F3C7C7' : '#C3CEE2'}`, background: primary ? '#0D52CE' : '#fff', color: primary ? '#fff' : danger ? '#B92D2D' : '#0A1F6B',
})
const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 13, fontWeight: 600, color: '#4E5E82', background: '#F5F7FC', borderBottom: '1px solid #DCE3F0' }
const td: React.CSSProperties = { padding: '10px 12px', fontSize: 14, color: '#0A1F4D', borderBottom: '1px solid #EBEFF8', verticalAlign: 'top' }

interface UploadResult { created: number; results: { file: string; created: number; skipped: number; detected: number; tools: { name: string; count: number }[]; error: string | null }[] }

export default function AdminTestBank() {
  const qc = useQueryClient()
  const [toolFilter, setToolFilter] = useState<number | ''>('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editQ, setEditQ] = useState<Partial<TestQuestion> | null>(null)

  // Upload
  const [uploadTool, setUploadTool] = useState<string>('')        // id au 'new'
  const [newToolName, setNewToolName] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<UploadResult | null>(null)

  const tools = useQuery<TestTool[]>({ queryKey: ['bank-tools'], queryFn: () => recruitApi.adminTools().then(r => r.data) })
  const questions = useQuery({
    queryKey: ['bank-questions', toolFilter, search, page],
    queryFn: () => recruitApi.adminQuestions({ tool: toolFilter || undefined, search: search || undefined, page }).then(r => r.data),
    placeholderData: prev => prev,
  })
  const uploads = useQuery<{ results: QuestionUpload[] }>({ queryKey: ['bank-uploads'], queryFn: () => recruitApi.adminUploads().then(r => r.data) })

  const refreshAll = () => { qc.invalidateQueries({ queryKey: ['bank-tools'] }); qc.invalidateQueries({ queryKey: ['bank-questions'] }); qc.invalidateQueries({ queryKey: ['bank-uploads'] }) }

  const upload = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      if (uploadTool === 'new') fd.append('tool_name', newToolName.trim())
      else if (uploadTool) fd.append('tool', uploadTool)
      setProgress(0); setResult(null)
      return recruitApi.adminUploadBank(fd, setProgress)
    },
    onSuccess: (r) => { setResult(r.data); setFiles([]); toast.success(`${r.data.created} question(s) saved`); refreshAll() },
    onError: (e: any) => {
      if (e?.response?.data?.results) setResult(e.response.data)
      toast.error(errorMessage(e, 'Could not read the PDF'))
    },
  })

  const saveQ = useMutation({
    mutationFn: (q: Partial<TestQuestion>) => q.id
      ? recruitApi.adminUpdateQuestion(q.id, { text: q.text, tool: q.tool, is_active: q.is_active, number: q.number })
      : recruitApi.adminCreateQuestion({ text: q.text, tool: q.tool, is_active: q.is_active ?? true, number: q.number }),
    onSuccess: () => { toast.success('Saved'); setEditQ(null); refreshAll() },
    onError: (e: any) => toast.error(errorMessage(e)),
  })
  const delQ = useMutation({ mutationFn: (id: number) => recruitApi.adminDeleteQuestion(id), onSuccess: () => { toast.success('Deleted'); refreshAll() }, onError: (e: any) => toast.error(errorMessage(e)) })
  const toggleTool = useMutation({ mutationFn: (t: TestTool) => recruitApi.adminUpdateTool(t.id, { is_active: !t.is_active }), onSuccess: refreshAll })
  const delTool = useMutation({
    mutationFn: (id: number) => recruitApi.adminDeleteTool(id),
    onSuccess: () => { toast.success('Tool deleted'); setToolFilter(''); refreshAll() }, onError: (e: any) => toast.error(errorMessage(e)),
  })
  const addTool = useMutation({
    mutationFn: (name: string) => recruitApi.adminCreateTool({ name }),
    onSuccess: () => { toast.success('Tool added'); refreshAll() }, onError: (e: any) => toast.error(errorMessage(e)),
  })
  const delUpload = useMutation({
    mutationFn: (id: number) => recruitApi.adminDeleteUpload(id),
    onSuccess: (r) => { toast.success(`Removed ${r.data.removed_questions} question(s)`); refreshAll() }, onError: (e: any) => toast.error(errorMessage(e)),
  })

  const toolList = tools.data || []
  const qs: TestQuestion[] = questions.data?.results || []
  const total = questions.data?.count || 0
  const pages = Math.max(1, Math.ceil(total / 20))
  const canUpload = files.length > 0 && (uploadTool === 'new' ? newToolName.trim().length > 1 : true)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A1F4D', margin: '0 0 4px' }}>Expert test bank</h1>
      <p style={{ fontSize: 14, color: '#4E5E82', margin: '0 0 20px' }}>
        Upload PDFs of test questions per tool. When an applicant starts the test, one question is picked at random from the tools they chose.
      </p>

      {/* ── Upload ── */}
      <section style={{ ...card, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: '#0A1F4D' }}>Upload questions from PDF</h2>
        <p style={{ fontSize: 13, color: '#4E5E82', margin: '0 0 14px', lineHeight: 1.6 }}>
          Number each question (<code>1.</code> <code>2)</code> <code>Q3:</code>). To put several tools in one PDF, add a line like <code>Tool: MATLAB</code> before that tool's questions.
          Text-based PDFs only (not scans).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lab}>Tool for these questions</label>
            <select style={inp} value={uploadTool} onChange={e => setUploadTool(e.target.value)}>
              <option value="">Detect from “Tool:” lines in the PDF</option>
              {toolList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              <option value="new">+ New tool…</option>
            </select>
          </div>
          {uploadTool === 'new' && (
            <div><label style={lab}>New tool name</label><input style={inp} value={newToolName} onChange={e => setNewToolName(e.target.value)} placeholder="e.g. PSCAD" /></div>
          )}
        </div>
        <FileDropzone onFiles={f => setFiles(p => [...p, ...f])} disabled={upload.isPending} label="Drop PDF files here or click to browse" hint="PDF or .txt, several files allowed" compact />
        {files.length > 0 && (
          <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {files.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #DCE3F0', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <span style={{ color: '#667697' }}>{formatBytes(f.size)}</span>
                {!upload.isPending && <button aria-label="Remove" onClick={() => setFiles(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667697', display: 'flex' }}><X size={15} /></button>}
              </li>
            ))}
          </ul>
        )}
        {upload.isPending && (
          <div style={{ margin: '12px 0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4E5E82', marginBottom: 6 }}><span>{progress < 100 ? 'Uploading…' : 'Reading questions…'}</span><span>{progress}%</span></div>
            <div style={{ height: 6, background: '#DCE3F0', borderRadius: 6, overflow: 'hidden' }}><div style={{ width: `${progress}%`, height: '100%', background: '#0D52CE' }} /></div>
          </div>
        )}
        <button style={{ ...btn(), marginTop: 14, opacity: canUpload && !upload.isPending ? 1 : .6 }} disabled={!canUpload || upload.isPending} onClick={() => upload.mutate()}>
          {upload.isPending ? <><Loader2 size={15} className="spin" /> Processing…</> : <><Upload size={15} /> Upload & parse</>}
        </button>

        {result && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.results.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', border: `1px solid ${r.error ? '#F3C7C7' : '#BFE5CF'}`, background: r.error ? '#FDEDED' : '#EDF8F1', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
                {r.error ? <AlertCircle size={18} color="#B92D2D" /> : <CheckCircle2 size={18} color="#137A4E" />}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#0A1F4D', wordBreak: 'break-word' }}>{r.file}</div>
                  {r.error ? <div style={{ color: '#B92D2D' }}>{r.error}</div> : (
                    <div style={{ color: '#137A4E' }}>
                      {r.created} saved{r.skipped ? `, ${r.skipped} duplicate(s) skipped` : ''} · detected {r.detected}
                      {r.tools.length > 0 && <> · {r.tools.map(t => `${t.name} (${t.count})`).join(', ')}</>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Tools ── */}
      <section style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#0A1F4D' }}>Tools</h2>
          <button style={btn(false)} onClick={() => { const n = window.prompt('New tool name'); if (n && n.trim().length > 1) addTool.mutate(n.trim()) }}><Plus size={15} /> Add tool</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => { setToolFilter(''); setPage(1) }} style={{ ...btn(false), background: toolFilter === '' ? '#0A1F6B' : '#fff', color: toolFilter === '' ? '#fff' : '#0A1F6B' }}>All ({toolList.reduce((a, t) => a + (t.question_count || 0), 0)})</button>
          {toolList.map(t => (
            <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${toolFilter === t.id ? '#0D52CE' : '#C3CEE2'}`, borderRadius: 8, background: toolFilter === t.id ? '#EAF1FD' : '#fff', opacity: t.is_active ? 1 : .6 }}>
              <button onClick={() => { setToolFilter(t.id); setPage(1) }} style={{ background: 'none', border: 'none', padding: '0 12px', height: 36, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#0A1F6B' }}>
                {t.name} <span style={{ color: '#667697', fontWeight: 500 }}>({t.active_question_count}/{t.question_count})</span>
              </button>
              <button title={t.is_active ? 'Hide from applicants' : 'Show to applicants'} onClick={() => toggleTool.mutate(t)} style={{ background: 'none', border: 'none', borderLeft: '1px solid #DCE3F0', height: 36, padding: '0 8px', cursor: 'pointer', fontSize: 12, color: t.is_active ? '#137A4E' : '#667697', fontWeight: 600 }}>{t.is_active ? 'On' : 'Off'}</button>
              <button aria-label={`Delete ${t.name}`} onClick={() => { if (window.confirm(`Delete “${t.name}” and its ${t.question_count} question(s)?`)) delTool.mutate(t.id) }} style={{ background: 'none', border: 'none', borderLeft: '1px solid #DCE3F0', height: 36, padding: '0 8px', cursor: 'pointer', color: '#B92D2D', display: 'flex', alignItems: 'center' }}><Trash2 size={14} /></button>
            </span>
          ))}
          {!tools.isLoading && toolList.length === 0 && <span style={{ fontSize: 14, color: '#667697' }}>No tools yet. Upload a PDF or add one.</span>}
        </div>
        <p style={{ fontSize: 12, color: '#667697', margin: '10px 0 0' }}>“On” tools appear in the expert application form. Numbers show active / total questions.</p>
      </section>

      {/* ── Maswali ── */}
      <section style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#0A1F4D' }}>Questions <span style={{ fontWeight: 500, color: '#667697' }}>({total})</span></h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input style={{ ...inp, width: 220 }} placeholder="Search questions…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            <button style={btn()} disabled={!toolList.length} onClick={() => setEditQ({ tool: Number(toolFilter) || toolList[0]?.id, text: '', is_active: true })}><Plus size={15} /> Add question</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto', border: '1px solid #DCE3F0', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead><tr><th style={{ ...th, width: 110 }}>Tool</th><th style={th}>Question</th><th style={{ ...th, width: 70 }}>Active</th><th style={{ ...th, width: 90 }} /></tr></thead>
            <tbody>
              {questions.isLoading && <tr><td style={td} colSpan={4}>Loading…</td></tr>}
              {!questions.isLoading && qs.length === 0 && <tr><td style={{ ...td, color: '#667697' }} colSpan={4}>No questions found.</td></tr>}
              {qs.map(q => (
                <tr key={q.id} style={{ opacity: q.is_active ? 1 : .55 }}>
                  <td style={td}><span style={{ fontSize: 12, fontWeight: 600, background: '#EAF1FD', color: '#0A42A8', borderRadius: 999, padding: '3px 10px' }}>{q.tool_name}</span></td>
                  <td style={{ ...td, lineHeight: 1.5 }}>
                    {q.number ? <span style={{ color: '#667697' }}>{q.number}. </span> : null}{q.text.length > 260 ? q.text.slice(0, 260) + '…' : q.text}
                    {q.source_name && <div style={{ fontSize: 12, color: '#667697', marginTop: 4 }}>from {q.source_name}</div>}
                  </td>
                  <td style={td}>
                    <input type="checkbox" checked={q.is_active} aria-label="Active" style={{ accentColor: '#0D52CE', width: 16, height: 16 }}
                      onChange={() => saveQ.mutate({ ...q, is_active: !q.is_active })} />
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ ...btn(false), height: 32, padding: '0 9px' }} aria-label="Edit" onClick={() => setEditQ(q)}><Pencil size={14} /></button>
                      <button style={{ ...btn(false, true), height: 32, padding: '0 9px' }} aria-label="Delete" onClick={() => { if (window.confirm('Delete this question?')) delQ.mutate(q.id) }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <button style={btn(false)} disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={15} /></button>
            <span style={{ fontSize: 14, color: '#4E5E82' }}>Page {page} of {pages}</span>
            <button style={btn(false)} disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={15} /></button>
          </div>
        )}
      </section>

      {/* ── Historia ya upload ── */}
      <section style={card}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px', color: '#0A1F4D' }}>Upload history</h2>
        {(uploads.data?.results || []).length === 0 && <p style={{ fontSize: 14, color: '#667697', margin: 0 }}>No uploads yet.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(uploads.data?.results || []).map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', border: '1px solid #DCE3F0', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0A1F4D', wordBreak: 'break-word' }}>{u.original_name}</div>
                <div style={{ fontSize: 12, color: u.status === 'failed' ? '#B92D2D' : '#667697' }}>
                  {u.status === 'failed' ? u.message : `${u.questions_created} questions${u.tool_name ? ` · ${u.tool_name}` : ''}`} · {new Date(u.created_at).toLocaleString()}{u.uploaded_by_name ? ` · ${u.uploaded_by_name}` : ''}
                </div>
              </div>
              <a href={u.url} target="_blank" rel="noopener noreferrer" style={{ ...btn(false), textDecoration: 'none' }}>Open PDF</a>
              <button style={btn(false, true)} onClick={() => { if (window.confirm(`Remove this upload and the ${u.questions_created} question(s) created from it?`)) delUpload.mutate(u.id) }}><Trash2 size={14} /> Undo</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dirisha la kuhariri swali ── */}
      {editQ && (
        <div role="dialog" aria-modal="true" onClick={() => setEditQ(null)} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(7,22,80,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ ...card, width: 'min(640px, 100%)', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 14px', color: '#0A1F4D' }}>{editQ.id ? 'Edit question' : 'Add question'}</h3>
            <label style={lab}>Tool</label>
            <select style={{ ...inp, marginBottom: 14 }} value={editQ.tool} onChange={e => setEditQ({ ...editQ, tool: Number(e.target.value) })}>
              {toolList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <label style={lab}>Question</label>
            <textarea style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical' }} rows={8} value={editQ.text || ''} onChange={e => setEditQ({ ...editQ, text: e.target.value })} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0', fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={editQ.is_active ?? true} onChange={e => setEditQ({ ...editQ, is_active: e.target.checked })} style={{ accentColor: '#0D52CE', width: 16, height: 16 }} /> Active (can be given to applicants)
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={btn(false)} onClick={() => setEditQ(null)}>Cancel</button>
              <button style={{ ...btn(), opacity: (editQ.text || '').trim().length >= 10 ? 1 : .6 }} disabled={(editQ.text || '').trim().length < 10 || saveQ.isPending} onClick={() => saveQ.mutate(editQ)}>
                {saveQ.isPending ? <Loader2 size={15} className="spin" /> : null} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
