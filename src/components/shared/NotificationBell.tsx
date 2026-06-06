import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifApi } from '@/api/client'
import type { Notification } from '@/types'
import { formatDistanceToNow } from 'date-fns'

const TYPE_ICONS: Record<string, string> = {
  new_project: '📋',
  project_assigned: '🤝',
  project_claimed: '⚡',
  project_submitted_for_qc: '🔍',
  project_completed: '🎉',
  revision_requested: '↩️',
  price_set: '💰',
  payment_received: '✅',
  message_received: '💬',
  system: '🔔',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()

  const { data: unread } = useQuery({
    queryKey: ['notif-unread'],
    queryFn: () => notifApi.unread().then(r => r.data.unread_count as number),
    refetchInterval: 15000,
  })

  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notifApi.list().then(r => r.data.results as Notification[]),
    enabled: open,
  })

  const markRead = useMutation({
    mutationFn: () => notifApi.markRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notif-unread'] }),
  })

  const handleOpen = () => {
    const next = !open
    setOpen(next)
    if (next && unread && unread > 0) {
      setTimeout(() => markRead.mutate(), 1500)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          position: 'relative', width: 36, height: 36, borderRadius: 10,
          background: open ? '#EFF6FF' : '#F8FAFC',
          border: `1px solid ${open ? '#BFDBFE' : '#F1F5F9'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all .2s', color: '#64748B',
        }}
      >
        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {!!unread && unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            minWidth: 17, height: 17, background: '#EF4444', borderRadius: 999,
            color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '0 4px',
            border: '2px solid #fff',
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', right: 0, top: 44, width: 340, zIndex: 40,
            background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9',
            boxShadow: '0 20px 60px rgba(0,0,0,.12)', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#0F172A', margin: 0 }}>Notifications</p>
              {unread && unread > 0
                ? <span style={{ fontSize: 11, color: '#0EA5E9', fontWeight: 700 }}>{unread} new</span>
                : <span style={{ fontSize: 11, color: '#94A3B8' }}>All read</span>
              }
            </div>

            {/* List */}
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {!notifs || notifs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: '#94A3B8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                  <p style={{ fontSize: 13, margin: 0 }}>No notifications yet</p>
                </div>
              ) : notifs.map(n => (
                <div key={n.id} style={{
                  padding: '13px 18px', borderBottom: '1px solid #F8FAFC',
                  background: !n.is_read ? '#F0F9FF' : '#fff',
                  transition: 'background .15s',
                }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{TYPE_ICONS[n.type] || '🔔'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 2px', lineHeight: 1.3, fontFamily: 'Syne, sans-serif' }}>{n.title}</p>
                      <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 4px', lineHeight: 1.4 }}>{n.body}</p>
                      <p style={{ fontSize: 11, color: '#CBD5E1', margin: 0 }}>
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <span style={{ width: 7, height: 7, background: '#0EA5E9', borderRadius: '50%', flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            {notifs && notifs.length > 0 && (
              <div style={{ padding: '10px 18px', borderTop: '1px solid #F8FAFC', textAlign: 'center' }}>
                <button onClick={() => markRead.mutate()} style={{ fontSize: 12, color: '#0EA5E9', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
