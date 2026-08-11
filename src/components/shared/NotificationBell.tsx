import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifApi } from '@/api/client'
import type { Notification } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell, ClipboardList, Handshake, Zap, Search, PartyPopper,
  Undo2, DollarSign, CheckCircle2, MessageCircle, BellRing
} from 'lucide-react'

const TYPE_ICONS: Record<string, React.ElementType> = {
  new_project: ClipboardList,
  project_assigned: Handshake,
  project_claimed: Zap,
  project_submitted_for_qc: Search,
  project_completed: PartyPopper,
  revision_requested: Undo2,
  price_set: DollarSign,
  payment_received: CheckCircle2,
  message_received: MessageCircle,
  system: BellRing,
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
    <div className="nb-wrap">
      <style>{`
        @keyframes nbFadeIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes nbPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        .nb-wrap { position: relative; }
        .nb-bell {
          position: relative; width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .18s ease, border-color .18s ease, transform .12s ease;
          color: #64748B;
        }
        .nb-bell:hover { transform: translateY(-1px); }
        .nb-bell:active { transform: translateY(0) scale(0.96); }
        .nb-badge { animation: nbPulse 1.8s ease-in-out infinite; }
        .nb-dropdown {
          animation: nbFadeIn .18s ease-out;
          transform-origin: top right;
        }
        .nb-row {
          transition: background .15s ease;
        }
        .nb-footer-btn {
          transition: color .15s ease, opacity .15s ease;
        }
        .nb-footer-btn:hover { opacity: 0.7; }

        @media (max-width: 480px) {
          .nb-dropdown {
            position: fixed !important;
            top: 60px !important;
            right: 10px !important;
            left: 10px !important;
            width: auto !important;
          }
        }
      `}</style>

      {/* Bell button */}
      <button
        className="nb-bell"
        onClick={handleOpen}
        style={{
          background: open ? '#EFF6FF' : '#F8FAFC',
          border: `1px solid ${open ? '#BFDBFE' : '#F1F5F9'}`,
        }}
      >
        <Bell size={17} strokeWidth={1.8} />
        {!!unread && unread > 0 && (
          <span className="nb-badge" style={{
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
          <div className="nb-dropdown" style={{
            position: 'absolute', right: 0, top: 44, width: 340, maxWidth: '90vw', zIndex: 40,
            background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9',
            boxShadow: '0 20px 60px rgba(0,0,0,.12)', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#0F172A', margin: 0 }}>Notifications</p>
              {unread && unread > 0
                ? <span style={{ fontSize: 12, color: '#0EA5E9', fontWeight: 700 }}>{unread} new</span>
                : <span style={{ fontSize: 12, color: '#94A3B8' }}>All read</span>
              }
            </div>

            {/* List */}
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {!notifs || notifs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: '#94A3B8' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Bell size={22} style={{ color: '#CBD5E1' }} />
                  </div>
                  <p style={{ fontSize: 13, margin: 0 }}>No notifications yet</p>
                </div>
              ) : notifs.map(n => {
                const Icon = TYPE_ICONS[n.type] || BellRing
                return (
                  <div key={n.id} className="nb-row" style={{
                    padding: '13px 18px', borderBottom: '1px solid #F8FAFC',
                    background: !n.is_read ? '#F0F9FF' : '#fff',
                  }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                        background: !n.is_read ? '#DBEAFE' : '#F1F5F9',
                        color: !n.is_read ? '#2563EB' : '#94A3B8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={15} strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 2px', lineHeight: 1.35, fontFamily: 'Syne, sans-serif' }}>{n.title}</p>
                        <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 4px', lineHeight: 1.45 }}>{n.body}</p>
                        <p style={{ fontSize: 11, color: '#CBD5E1', margin: 0 }}>
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.is_read && (
                        <span style={{ width: 7, height: 7, background: '#0EA5E9', borderRadius: '50%', flexShrink: 0, marginTop: 4 }} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            {notifs && notifs.length > 0 && (
              <div style={{ padding: '10px 18px', borderTop: '1px solid #F8FAFC', textAlign: 'center' }}>
                <button className="nb-footer-btn" onClick={() => markRead.mutate()} style={{ fontSize: 12.5, color: '#0EA5E9', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
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