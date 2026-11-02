import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, Search, type LucideIcon } from 'lucide-react'

export interface Command { id: string; label: string; hint?: string; icon: LucideIcon; run: () => void; keywords?: string }

/** Ctrl/⌘ + K: tafuta ukurasa au kitendo na ukifikie kwa kibodi tu (mtindo wa Linear). */
export default function CommandPalette({ open, onClose, commands }: { open: boolean; onClose: () => void; commands: Command[] }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  useNavigate() // hakikisha tuko ndani ya Router (commands zinatumia navigate kutoka kwa mzazi)

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return commands
    return commands.filter(c => `${c.label} ${c.hint || ''} ${c.keywords || ''}`.toLowerCase().includes(s))
  }, [q, commands])

  useEffect(() => { if (open) { setQ(''); setActive(0); setTimeout(() => input.current?.focus(), 30) } }, [open])
  useEffect(() => { setActive(0) }, [q])
  useEffect(() => { list.current?.children[active]?.scrollIntoView({ block: 'nearest' }) }, [active])

  if (!open) return null

  const choose = (c?: Command) => { if (!c) return; onClose(); setTimeout(c.run, 0) }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); choose(results[active]) }
  }

  return (
    <div className="cmd-overlay" role="dialog" aria-modal="true" aria-label="Command palette" onClick={onClose} onKeyDown={onKey}>
      <div className="cmd-box" onClick={e => e.stopPropagation()}>
        <div className="cmd-input">
          <Search size={18} />
          <input ref={input} value={q} onChange={e => setQ(e.target.value)} placeholder="Search pages and actions…" aria-label="Search" />
          <kbd>Esc</kbd>
        </div>
        <ul ref={list} className="cmd-list" role="listbox">
          {results.length === 0 && <li className="cmd-empty">No results for “{q}”</li>}
          {results.map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === active} className={`cmd-item${i === active ? ' on' : ''}`}
              onMouseEnter={() => setActive(i)} onClick={() => choose(c)}>
              <span className="cmd-ico"><c.icon size={17} strokeWidth={1.9} /></span>
              <span className="cmd-label">{c.label}</span>
              {c.hint && <span className="cmd-hint">{c.hint}</span>}
              {i === active && <CornerDownLeft size={14} className="cmd-enter" />}
            </li>
          ))}
        </ul>
        <div className="cmd-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span></div>
      </div>
    </div>
  )
}
