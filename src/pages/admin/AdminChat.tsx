import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi, authApi } from '@/api/client'
import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { ChatRoom, ChatMessage, User } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/shared'
import toast from 'react-hot-toast'

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  client:    { bg: '#EFF6FF', color: '#2563EB' },
  expert:    { bg: '#F0FDF4', color: '#059669' },
  admin:     { bg: '#F5F3FF', color: '#7C3AED' },
  developer: { bg: '#FFFBEB', color: '#D97706' },
}

export default function AdminChat() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [msg, setMsg] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['admin-chat-rooms'],
    queryFn: () => chatApi.rooms().then(r => r.data.results as ChatRoom[]),
    refetchInterval: 10000,
  })

  const { data: messages, isLoading: msgsLoading } = useQuery({
    queryKey: ['chat-messages', selectedRoom?.id],
    queryFn: () => chatApi.messages(selectedRoom!.id).then(r => r.data.results as ChatMessage[]),
    enabled: !!selectedRoom,
    refetchInterval: 4000,
  })

  const { data: usersData } = useQuery({
    queryKey: ['chat-users', userSearch],
    queryFn: () => authApi.adminUsers({ search: userSearch, role: '' }).then(r => r.data),
    enabled: showNewChat,
  })

  const createRoomMutation = useMutation({
    mutationFn: ({ userId, projectId }: { userId: number; projectId?: number }) =>
      chatApi.createRoom({ user_id: userId, ...(projectId && { project_id: projectId }) }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-chat-rooms'] })
      setShowNewChat(false)
      setUserSearch('')
      // Refresh rooms and select the new one
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['admin-chat-rooms'] })
      }, 500)
      toast.success('Chat room ready!')
    },
    onError: () => toast.error('Could not create chat room.'),
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const rooms: ChatRoom[] = roomsData || []
  const chatUsers: User[] = usersData?.results?.filter((u: User) => u.id !== user?.id) || []
  const totalUnread = rooms.reduce((s, r) => s + (r.unread_count || 0), 0)

  const handleSend = () => {
    if (!msg.trim() || !selectedRoom) return
    // In production this sends via WebSocket; for now just refetch
    setMsg('')
    inputRef.current?.focus()
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        .fu { animation: fadeUp .3s ease both }
      `}</style>

      <div className="fu" style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Messages {totalUnread > 0 && <span style={{ fontSize: 13, background: '#EF4444', color: '#fff', borderRadius: 999, padding: '2px 8px', marginLeft: 8 }}>{totalUnread}</span>}
          </h1>
          <p style={{ color: '#94A3B8', fontSize: 13, margin: '4px 0 0' }}>Manage conversations with clients and experts.</p>
        </div>
        <button
          onClick={() => setShowNewChat(!showNewChat)}
          style={{ padding: '9px 18px', borderRadius: 10, background: '#0B1C3D', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Syne,sans-serif', display: 'flex', alignItems: 'center', gap: 7 }}
        >
          <span>+</span> New Chat
        </button>
      </div>

      {/* New Chat User Picker */}
      {showNewChat && (
        <div className="fu" style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
          <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: '#0F172A', margin: '0 0 12px' }}>Start new conversation</p>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, outline: 'none', fontFamily: 'inherit', marginBottom: 10, boxSizing: 'border-box', color: '#0F172A' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
            {chatUsers.map((u: User) => {
              const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.client
              return (
                <button
                  key={u.id}
                  onClick={() => createRoomMutation.mutate({ userId: u.id })}
                  disabled={createRoomMutation.isPending}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid #F1F5F9', background: '#FAFAFA', cursor: 'pointer', textAlign: 'left', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#F0F9FF'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#FAFAFA'}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0, background: roleStyle.bg, color: roleStyle.color }}>
                    {(u.first_name?.[0] || u.email[0]).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{u.first_name} {u.last_name} <span style={{ fontSize: 11, color: roleStyle.color, background: roleStyle.bg, padding: '1px 6px', borderRadius: 999, fontWeight: 700, marginLeft: 4 }}>{u.role}</span></p>
                    <p style={{ fontSize: 11, color: '#94A3B8', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                  </div>
                </button>
              )
            })}
            {chatUsers.length === 0 && userSearch && (
              <p style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', padding: '16px 0' }}>No users found</p>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, height: 580 }}>
        {/* Rooms Sidebar */}
        <div style={{ width: 280, flexShrink: 0, background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F8FAFC' }}>
            <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: '#0F172A', margin: 0 }}>
              Conversations <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400 }}>({rooms.length})</span>
            </p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {roomsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', border: '2.5px solid #E2E8F0', borderTop: '2.5px solid #0EA5E9', animation: 'spin .7s linear infinite' }} />
              </div>
            ) : rooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#64748B', margin: '0 0 5px' }}>No conversations yet</p>
                <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>Click "New Chat" to start one.</p>
              </div>
            ) : rooms.map(r => {
              const roleStyle = ROLE_COLORS[r.other_user?.role] || ROLE_COLORS.client
              const isSelected = selectedRoom?.id === r.id
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoom(r)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none',
                    borderBottom: '1px solid #F8FAFC', cursor: 'pointer', transition: 'all .15s',
                    background: isSelected ? '#F0F9FF' : 'transparent',
                    borderLeft: isSelected ? '3px solid #0EA5E9' : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC' }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0, background: roleStyle.bg, color: roleStyle.color }}>
                      {r.other_user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                          {r.other_user?.name || 'Unknown'}
                        </p>
                        {r.unread_count > 0 && (
                          <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {r.unread_count}
                          </span>
                        )}
                      </div>
                      <span style={{ padding: '1px 6px', borderRadius: 999, background: roleStyle.bg, color: roleStyle.color, fontSize: 10, fontWeight: 700 }}>
                        {r.other_user?.role}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedRoom ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', padding: 32, textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 16 }}>💬</div>
              <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: '#64748B', margin: '0 0 8px' }}>Select a conversation</p>
              <p style={{ fontSize: 13, margin: 0, maxWidth: 280, lineHeight: 1.6 }}>
                Choose a conversation from the left panel, or start a new one by clicking "New Chat" above.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, ...((ROLE_COLORS[selectedRoom.other_user?.role] || ROLE_COLORS.client)) }}>
                  {selectedRoom.other_user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: '#0F172A', margin: 0 }}>
                    {selectedRoom.other_user?.name || 'Unknown'}
                  </p>
                  <span style={{ padding: '1px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, ...((ROLE_COLORS[selectedRoom.other_user?.role] || ROLE_COLORS.client)) }}>
                    {selectedRoom.other_user?.role}
                  </span>
                  {selectedRoom.project && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: '#94A3B8' }}>· Project #{selectedRoom.project}</span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {msgsLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', border: '2.5px solid #E2E8F0', borderTop: '2.5px solid #0EA5E9', animation: 'spin .7s linear infinite' }} />
                  </div>
                ) : messages?.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94A3B8', marginTop: 40 }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>👋</div>
                    <p style={{ fontSize: 13 }}>No messages yet. Say hello!</p>
                  </div>
                ) : messages?.map((m: ChatMessage) => {
                  const isMine = m.sender === user?.id
                  return (
                    <div key={m.id} className="fu" style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      {!isMine && (
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#0B1C3D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>
                          {selectedRoom.other_user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div style={{ maxWidth: '68%' }}>
                        {!isMine && (
                          <p style={{ fontSize: 11, color: '#94A3B8', margin: '0 0 3px 2px', fontWeight: 600 }}>{m.sender_name}</p>
                        )}
                        <div style={{ padding: '11px 15px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isMine ? '#0EA5E9' : '#F8FAFC', color: isMine ? '#fff' : '#374151', fontSize: 14, lineHeight: 1.55 }}>
                          {m.content}
                        </div>
                        <p style={{ fontSize: 10, color: '#94A3B8', margin: '3px 4px 0', textAlign: isMine ? 'right' : 'left' }}>
                          {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                          {isMine && m.is_read && <span style={{ marginLeft: 5, color: '#0EA5E9' }}>✓✓</span>}
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
                  style={{ flex: 1, padding: '11px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none', transition: 'border-color .2s' }}
                  onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = '#0EA5E9'}
                  onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = '#E2E8F0'}
                />
                <button
                  onClick={handleSend}
                  disabled={!msg.trim()}
                  style={{ width: 44, height: 44, borderRadius: 12, background: msg.trim() ? '#0EA5E9' : '#F1F5F9', color: msg.trim() ? '#fff' : '#94A3B8', border: 'none', cursor: msg.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
