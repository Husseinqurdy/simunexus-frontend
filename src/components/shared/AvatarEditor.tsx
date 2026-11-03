import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { errorMessage } from '@/lib/format'
import type { User } from '@/types'

/**
 * Picha ya profile: kupakia, kubadilisha na kuondoa. Seva inarudisha User kamili (pamoja na URL kamili ya picha),
 * na tunauweka kwenye store papo hapo, kwa hiyo topbar inasasishwa na picha inabaki baada ya kutoka na kuingia tena.
 */
export default function AvatarEditor({ avatar, initials, size = 96, name = 'photo' }: {
  avatar?: string | null; initials: string; size?: number; name?: string
}) {
  const qc = useQueryClient()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [broken, setBroken] = useState<string | null>(null)

  const apply = (user: User) => {
    useAuthStore.getState().updateUser(user)
    qc.invalidateQueries({ queryKey: ['me'] })
  }

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''                                   // ruhusu kuchagua faili ileile tena
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image (JPG, PNG or WebP).'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('The photo is too large. The maximum size is 10 MB.'); return }

    const url = URL.createObjectURL(file)
    setPreview(url); setBusy(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await authApi.updateMe(fd)
      apply(res.data as User)
      setBroken(null)
      toast.success('Photo updated.')
    } catch (err) {
      toast.error(errorMessage(err, 'Could not upload the photo. Please try again.'))
    } finally {
      setBusy(false); setPreview(null); URL.revokeObjectURL(url)
    }
  }

  const remove = async () => {
    if (!window.confirm('Remove your profile photo?')) return
    setBusy(true)
    try { apply((await authApi.removeAvatar()).data as User); toast.success('Photo removed.') }
    catch (err) { toast.error(errorMessage(err, 'Could not remove the photo.')) }
    finally { setBusy(false) }
  }

  const src = preview || (avatar && broken !== avatar ? avatar : null)
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: '#0A1F6B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.34 }}>
          {src
            ? <img src={src} alt={`Your ${name}`} onError={() => avatar && setBroken(avatar)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span aria-hidden>{initials}</span>}
        </div>
        <button type="button" onClick={() => input.current?.click()} disabled={busy} aria-label="Change photo" title="Change photo"
          style={{ position: 'absolute', bottom: -2, right: -2, width: Math.max(28, size * 0.31), height: Math.max(28, size * 0.31), borderRadius: '50%', background: '#0D52CE', border: '2.5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: busy ? 'wait' : 'pointer', color: '#fff' }}>
          {busy ? <Loader2 size={14} className="spin" /> : <Camera size={14} />}
        </button>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onPick} hidden aria-label="Upload photo" />
      </div>
      {avatar && !busy && (
        <button type="button" onClick={remove} style={{ background: 'none', border: 'none', color: '#667697', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
          <Trash2 size={12} /> Remove photo
        </button>
      )}
    </div>
  )
}
