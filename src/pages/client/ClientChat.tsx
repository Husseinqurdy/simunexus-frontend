import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '@/api/client'
import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { ChatRoom, ChatMessage } from '@/types'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { MessageCircle, Send, Loader2, ArrowLeft, Waves, CheckCheck, Check } from 'lucide-react'

export default function ClientChat() {
  const { user } = useAuthStore()
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [msg, setMsg] = useState('')
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.rooms().then(r => r.data.results as ChatRoom[]),
    refetchInterval: 15000,
  })

  const { data: messages, isLoading: msgsLoading } = useQuery({
    queryKey: ['chat-messages', selectedRoom?.id],
    queryFn: () => chatApi.messages(selectedRoom!.id).then(r => r.data.results as ChatMessage[]),
    enabled: !!selectedRoom,
    refetchInterval: 5000,
  })

  const sendMessageMutation = useMutation({
    mutationFn: ({ roomId, content }: { roomId: number; content: string }) =>
      chatApi.sendMessage(roomId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat-messages', selectedRoom?.id] })
      qc.invalidateQueries({ queryKey: ['chat-rooms'] })
    },
    onError: () => toast.error('Failed to send message.'),
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const rooms: ChatRoom[] = roomsData || []
  const totalUnread = rooms.reduce((s, r) => s + (r.unread_count || 0), 0)

  const handleSend = () => {
    if (!msg.trim() || !selectedRoom) return
    const content = msg.trim()
    setMsg('')
    sendMessageMutation.mutate({ roomId: selectedRoom.id, content })
    inputRef.current?.focus()
  }

  const openRoom = (r: ChatRoom) => {
    setSelectedRoom(r)
    setMobileView('chat')
  }

  return (
    <div className="cc-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .fu { animation: fadeUp .4s ease both; }
        .spin { animation: spin .8s linear infinite; }

        .cc-page { font-family:'DM Sans',sans-serif; font-size:14px; }
        .cc-title { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; color:#0F172A; margin:0; display:flex; align-items:center; gap:10px; }
        .cc-body { display:flex; gap:16px; height:560px; }
        .cc-sidebar { width:260px; flex-shrink:0; background:#fff; border-radius:20px; border:1px solid #F1F5F9; overflow:hidden; display:flex; flex-direction:column; }
        .cc-chatarea { flex:1; background:#fff; border-radius:20px; border:1px solid #F1F5F9; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
        .cc-mobile-back { display:none; }

        @media (max-width: 760px) {
          .cc-page { font-size:13px; }
          .cc-title { font-size:19px; }
          .cc-body { height: calc(100vh - 210px); min-height:420px; gap:0; }
          .cc-sidebar { width:100%; border-radius:16px; }
          .cc-chatarea { border-radius:16px; }
          .cc-mobile-back { display:flex; }
          .cc-sidebar.cc-hide-mobile { display:none; }
          .cc-chatarea.cc-hide-mobile { display:none; }
        }
      `}</style>

      <div className="fu" style={{ marginBottom: 20 }}>
        <h1 className="cc-title">
          Messages
          {totalUnread > 0 && (
            <span style={{ fontSize: 12, background: '#EF4444', color: '#fff', borderRadius: 999, padding: '2px 9px', fontWeight: 700 }}>
              {totalUnread}
            </span>
          )}
        </h1>
        <p style={{ color: '#94A3B8', fontSize: 13, margin: '4px 0 0' }}>Chat with the GSH support team about your projects.</p>
      </div>

      <div className="cc-body">
        {/* Sidebar — rooms */}
        <div className={`cc-sidebar ${mobileView === 'chat' ? 'cc-hide-mobile' : ''}`}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F8FAFC' }}>
            <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: '#0F172A', margin: 0 }}>Conversations</p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {roomsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                <Loader2 size={24} className="spin" style={{ color: '#0EA5E9' }} />
              </div>
            ) : rooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <MessageCircle size={26} style={{ color: '#CBD5E1' }} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#64748B', margin: '0 0 6px' }}>No conversations yet</p>
                <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>Admin will reach out when your project needs attention.</p>
              </div>
            ) : rooms.map(r => {
              const isSelected = selectedRoom?.id === r.id
              return (
                <button
                  key={r.id}
                  onClick={() => openRoom(r)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '13px 16px', border: 'none',
                    borderBottom: '1px solid #F8FAFC', cursor: 'pointer', transition: 'all .15s',
                    background: isSelected ? '#F0F9FF' : 'transparent',
                    borderLeft: isSelected ? '3px solid #0EA5E9' : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC' }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#0B1C3D,#1A3A7A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {r.other_user?.name?.[0]?.toUpperCase() || 'G'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.other_user?.name || 'GSH Support'}
                        </p>
                        <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>GSH Support Team</p>
                      </div>
                    </div>
                    {r.unread_count > 0 && (
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {r.unread_count}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main chat area */}
        <div className={`cc-chatarea ${mobileView === 'list' ? 'cc-hide-mobile' : ''}`}>
          {!selectedRoom ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', padding: 32, textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <MessageCircle size={32} style={{ color: '#CBD5E1' }} />
              </div>
              <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: '#64748B', margin: '0 0 8px' }}>Select a conversation</p>
              <p style={{ fontSize: 13, margin: 0, maxWidth: 260, lineHeight: 1.6 }}>Your messages with the GSH support team will appear here. We respond within a few hours.</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  className="cc-mobile-back"
                  onClick={() => setMobileView('list')}
                  style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer', flexShrink: 0 }}
                >
                  <ArrowLeft size={16} />
                </button>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#0B1C3D,#1A3A7A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {selectedRoom.other_user?.name?.[0]?.toUpperCase() || 'G'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedRoom.other_user?.name || 'GSH Support'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                    <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>Online</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {msgsLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                    <Loader2 size={24} className="spin" style={{ color: '#0EA5E9' }} />
                  </div>
                ) : messages?.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94A3B8', marginTop: 40 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <Waves size={24} style={{ color: '#CBD5E1' }} />
                    </div>
                    <p style={{ fontSize: 13 }}>No messages yet. Send a message below to get started!</p>
                  </div>
                ) : messages?.map(m => {
                  const isMine = m.sender === user?.id
                  return (
                    <div key={m.id} className="fu" style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      {!isMine && (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0B1C3D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>
                          {selectedRoom.other_user?.name?.[0]?.toUpperCase() || 'G'}
                        </div>
                      )}
                      <div style={{ maxWidth: '78%' }}>
                        <div style={{
                          padding: '11px 15px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMine ? '#0EA5E9' : '#F8FAFC',
                          color: isMine ? '#fff' : '#374151', fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
                        }}>
                          {m.content}
                        </div>
                        <p style={{ fontSize: 10, color: '#94A3B8', margin: '3px 4px 0', textAlign: isMine ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 4 }}>
                          {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                          {isMine && (m.is_read
                            ? <CheckCheck size={12} style={{ color: '#0EA5E9' }} />
                            : <Check size={12} style={{ color: '#CBD5E1' }} />
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid #F8FAFC', display: 'flex', gap: 10 }}>
                <input
                  ref={inputRef}
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Type a message..."
                  style={{ flex: 1, minWidth: 0, padding: '11px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none', transition: 'border-color .2s' }}
                  onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = '#0EA5E9'}
                  onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = '#E2E8F0'}
                />
                <button
                  onClick={handleSend}
                  disabled={!msg.trim() || sendMessageMutation.isPending}
                  style={{ width: 44, height: 44, borderRadius: 12, background: msg.trim() ? '#0EA5E9' : '#F1F5F9', color: msg.trim() ? '#fff' : '#94A3B8', border: 'none', cursor: msg.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}
                >
                  {sendMessageMutation.isPending ? <Loader2 size={17} className="spin" /> : <Send size={17} strokeWidth={2.4} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}