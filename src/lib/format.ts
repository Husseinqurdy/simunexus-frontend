export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const v = bytes / Math.pow(1024, i)
  return `${v >= 100 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`
}

export function formatDuration(seconds: number): string {
  const d = Math.floor(seconds / 86400), h = Math.floor((seconds % 86400) / 3600), m = Math.floor((seconds % 3600) / 60)
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`
}

export function errorMessage(e: any, fallback = 'Something went wrong. Please try again.'): string {
  const d = e?.response?.data
  if (!d) return e?.message === 'Network Error' ? 'Network error — check your connection.' : fallback
  if (typeof d === 'string') return fallback
  if (d.error) return d.error
  if (d.detail) return d.detail
  const first = Object.values(d)[0] as any
  if (Array.isArray(first) && first.length) return String(first[0])
  if (typeof first === 'string') return first
  return fallback
}
