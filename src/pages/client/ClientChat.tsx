import { useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '@/api/client'
import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import type { ChatRoom, ChatMessage } from '@/types'
import { useAuthStore } from '@/store/authStore'

export default function ClientChat() {
  const { user } = useAuthStore()
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [msg, setMsg] = useState('')
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  const rooms: ChatRoom[] = roomsData || []
  const totalUnread = rooms.reduce((s, r) => s + (r.unread_count || 0), 0)

  const handleSend = () => {
    // WebSocket send would go here in production
    if (!msg.trim() || !selectedRoom) return
    setMsg('')
    inputRef.current?.focus()
  }

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fadeUp .4s ease both}`}</style>

      <div className="fu" style={{ marginBottom:20 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'#0F172A', margin:0 }}>
          Messages {totalUnread > 0 && <span style={{ fontSize:14, background:'#EF4444', color:'#fff', borderRadius:999, padding:'2px 8px', marginLeft:8 }}>{totalUnread}</span>}
        </h1>
        <p style={{ color:'#94A3B8', fontSize:13, margin:'4px 0 0' }}>Chat with the GSH support team about your projects.</p>
      </div>

      <div style={{ display:'flex', gap:16, height:560 }}>
        {/* Sidebar — rooms */}
        <div style={{ width:260, flexShrink:0, background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid #F8FAFC' }}>
            <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'#0F172A', margin:0 }}>Conversations</p>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {roomsLoading ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:32, gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', border:'2px solid #E2E8F0', borderTop:'2px solid #0EA5E9', animation:'spin .7s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : rooms.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 16px', color:'#94A3B8' }}>
                <div style={{ fontSize:36, marginBottom:10 }}>💬</div>
                <p style={{ fontSize:13, fontWeight:600, color:'#64748B', margin:'0 0 6px' }}>No conversations yet</p>
                <p style={{ fontSize:12, lineHeight:1.5, margin:0 }}>Admin will reach out when your project needs attention.</p>
              </div>
            ) : rooms.map(r => (
              <button key={r.id} onClick={() => setSelectedRoom(r)}
                style={{ width:'100%', textAlign:'left', padding:'13px 16px', border:'none', borderBottom:'1px solid #F8FAFC', cursor:'pointer', transition:'all .15s', background: selectedRoom?.id===r.id?'#F0F9FF':'transparent', borderLeft: selectedRoom?.id===r.id?'3px solid #0EA5E9':'3px solid transparent' }}
                onMouseEnter={e => { if (selectedRoom?.id!==r.id) (e.currentTarget as HTMLButtonElement).style.background='#F8FAFC' }}
                onMouseLeave={e => { if (selectedRoom?.id!==r.id) (e.currentTarget as HTMLButtonElement).style.background='transparent' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#0B1C3D,#1A3A7A)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, flexShrink:0 }}>
                      {r.other_user?.name?.[0]?.toUpperCase() || 'G'}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#0F172A', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {r.other_user?.name || 'GSH Support'}
                      </p>
                      <p style={{ fontSize:11, color:'#94A3B8', margin:0 }}>GSH Support Team</p>
                    </div>
                  </div>
                  {r.unread_count > 0 && (
                    <span style={{ width:20, height:20, borderRadius:'50%', background:'#EF4444', color:'#fff', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {r.unread_count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main chat area */}
        <div style={{ flex:1, background:'#fff', borderRadius:20, border:'1px solid #F1F5F9', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {!selectedRoom ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#94A3B8', padding:32, textAlign:'center' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, marginBottom:16 }}>💬</div>
              <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#64748B', margin:'0 0 8px' }}>Select a conversation</p>
              <p style={{ fontSize:13, margin:0, maxWidth:260, lineHeight:1.6 }}>Your messages with the GSH support team will appear here. We respond within a few hours.</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding:'14px 20px', borderBottom:'1px solid #F8FAFC', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#0B1C3D,#1A3A7A)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14 }}>
                  {selectedRoom.other_user?.name?.[0]?.toUpperCase() || 'G'}
                </div>
                <div>
                  <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'#0F172A', margin:0 }}>{selectedRoom.other_user?.name || 'GSH Support'}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#10B981', display:'inline-block' }} />
                    <span style={{ fontSize:11, color:'#10B981', fontWeight:600 }}>Online</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
                {msgsLoading ? (
                  <div style={{ display:'flex', justifyContent:'center', padding:24 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', border:'2px solid #E2E8F0', borderTop:'2px solid #0EA5E9', animation:'spin .7s linear infinite' }} />
                  </div>
                ) : messages?.length === 0 ? (
                  <div style={{ textAlign:'center', color:'#94A3B8', marginTop:40 }}>
                    <p style={{ fontSize:13 }}>No messages yet. Send a message below to get started!</p>
                  </div>
                ) : messages?.map(m => {
                  const isMine = m.sender === user?.id
                  return (
                    <div key={m.id} style={{ display:'flex', justifyContent: isMine?'flex-end':'flex-start' }}>
                      {!isMine && (
                        <div style={{ width:28, height:28, borderRadius:'50%', background:'#0B1C3D', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700, marginRight:8, flexShrink:0, alignSelf:'flex-end' }}>
                          {selectedRoom.other_user?.name?.[0]?.toUpperCase()||'G'}
                        </div>
                      )}
                      <div style={{ maxWidth:'70%' }}>
                        <div style={{
                          padding:'11px 15px', borderRadius: isMine?'18px 18px 4px 18px':'18px 18px 18px 4px',
                          background: isMine?'#0EA5E9':'#F8FAFC',
                          color: isMine?'#fff':'#374151', fontSize:14, lineHeight:1.5,
                        }}>
                          {m.content}
                        </div>
                        <p style={{ fontSize:10, color:'#94A3B8', margin:'3px 4px 0', textAlign: isMine?'right':'left' }}>
                          {formatDistanceToNow(new Date(m.created_at), {addSuffix:true})}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding:'12px 16px', borderTop:'1px solid #F8FAFC', display:'flex', gap:10 }}>
                <input
                  ref={inputRef}
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Type a message..."
                  style={{ flex:1, padding:'11px 16px', border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:14, fontFamily:'DM Sans,sans-serif', outline:'none', transition:'border-color .2s' }}
                  onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor='#0EA5E9'}
                  onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor='#E2E8F0'}
                />
                <button onClick={handleSend} disabled={!msg.trim()}
                  style={{ width:44, height:44, borderRadius:12, background: msg.trim()?'#0EA5E9':'#F1F5F9', color: msg.trim()?'#fff':'#94A3B8', border:'none', cursor: msg.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
