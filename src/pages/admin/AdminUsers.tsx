import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/client'
import {
  PageHeader, ExpertLevelBadge, StarRating, LoadingSpinner,
  EmptyState, Table, Tr, Td, Btn, Card
} from '@/components/shared'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import type { User } from '../../types'

const ROLE_TABS = [
  { value: '', label: 'All Users' },
  { value: 'client', label: 'Clients' },
  { value: 'expert', label: 'Experts' },
  { value: 'admin', label: 'Admins' },
]

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  client:    { bg: '#EFF6FF', color: '#2563EB' },
  expert:    { bg: '#F0FDF4', color: '#059669' },
  admin:     { bg: '#F5F3FF', color: '#7C3AED' },
  developer: { bg: '#FFFBEB', color: '#D97706' },
}

export default function AdminUsers() {
  const qc = useQueryClient()
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter, search],
    queryFn: () => authApi.adminUsers({
      ...(roleFilter && { role: roleFilter }),
      ...(search && { search }),
    }).then(r => r.data),
  })

  const banMutation = useMutation({
    mutationFn: (userId: number) => authApi.adminBanUser(userId),
    onSuccess: (_, userId) => {
      const user = users.find(u => u.id === userId)
      toast.success(user?.is_active ? '🚫 User banned.' : '✅ User reactivated.')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      if (selectedUser?.id === userId) setSelectedUser(null)
    },
    onError: () => toast.error('Action failed.'),
  })

  const users: User[] = data?.results || []

  return (
    <div>
      <PageHeader title="User Management" subtitle={`${data?.count || 0} total users`} />

      {/* Role tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {ROLE_TABS.map(r => (
          <button
            key={r.value}
            onClick={() => setRoleFilter(r.value)}
            style={{
              padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', border: 'none', transition: 'all .2s',
              background: roleFilter === r.value ? '#0B1C3D' : '#F1F5F9',
              color: roleFilter === r.value ? '#fff' : '#64748B',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 380, padding: '9px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#0F172A' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 320px' : '1fr', gap: 20 }}>
        {/* Table */}
        {isLoading ? (
          <LoadingSpinner label="Loading users..." />
        ) : users.length === 0 ? (
          <EmptyState icon="👥" title="No users found" />
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
            <Table headers={['User', 'Role', 'Country', 'Status', 'Joined', 'Actions']}>
              {users.map(u => {
                const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.client
                return (
                  <Tr key={u.id} onClick={() => setSelectedUser(u)}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                          fontSize: 13, flexShrink: 0,
                          background: roleStyle.bg, color: roleStyle.color,
                        }}>
                          {(u.first_name?.[0] || u.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: '#0F172A' }}>
                            {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : '—'}
                          </p>
                          <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{u.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.color}20` }}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </Td>
                    <Td><span style={{ fontSize: 13, color: '#64748B' }}>{u.country || '—'}</span></Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: u.is_online ? '#10B981' : '#CBD5E1', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: u.is_active ? '#374151' : '#EF4444', fontWeight: u.is_active ? 400 : 700 }}>
                          {!u.is_active ? 'Banned' : u.is_online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </Td>
                    <Td><span style={{ fontSize: 12, color: '#94A3B8' }}>{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</span></Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => banMutation.mutate(u.id)}
                          disabled={banMutation.isPending}
                          style={{
                            padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                            background: u.is_active ? '#FFF1F2' : '#F0FDF4',
                            color: u.is_active ? '#E11D48' : '#059669',
                          }}
                        >
                          {u.is_active ? 'Ban' : 'Unban'}
                        </button>
                      </div>
                    </Td>
                  </Tr>
                )
              })}
            </Table>
          </div>
        )}

        {/* User Detail Sidebar */}
        {selectedUser && (
          <Card style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18,
                  background: (ROLE_COLORS[selectedUser.role] || ROLE_COLORS.client).bg,
                  color: (ROLE_COLORS[selectedUser.role] || ROLE_COLORS.client).color,
                }}>
                  {(selectedUser.first_name?.[0] || selectedUser.email[0]).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 18 }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Role', value: selectedUser.role },
                { label: 'Phone', value: selectedUser.phone || '—' },
                { label: 'WhatsApp', value: selectedUser.whatsapp || '—' },
                { label: 'Country', value: selectedUser.country || '—' },
                { label: 'Status', value: selectedUser.is_active ? (selectedUser.is_online ? '🟢 Online' : '⚫ Offline') : '🚫 Banned' },
                { label: 'Logins', value: selectedUser.login_count ?? '—' },
                { label: 'Joined', value: formatDistanceToNow(new Date(selectedUser.created_at), { addSuffix: true }) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F8FAFC' }}>
                  <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{String(value)}</span>
                </div>
              ))}
            </div>

            {selectedUser.expert_profile && (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Expert Profile</p>
                <ExpertLevelBadge level={selectedUser.expert_profile.level} />
                <div style={{ marginTop: 8 }}>
                  <StarRating rating={Number(selectedUser.expert_profile.rating)} />
                </div>
                <p style={{ fontSize: 12, color: '#64748B', margin: '8px 0 0' }}>
                  {selectedUser.expert_profile.completed_projects} projects · {Number(selectedUser.expert_profile.success_rate).toFixed(0)}% success
                </p>
                <p style={{ fontSize: 12, color: '#059669', fontWeight: 700, margin: '4px 0 0' }}>
                  ${Number(selectedUser.expert_profile.total_earned).toFixed(2)} earned
                </p>
                {selectedUser.expert_profile.skills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                    {selectedUser.expert_profile.skills.map((s: string) => (
                      <span key={s} style={{ padding: '3px 8px', borderRadius: 999, background: '#F1F5F9', fontSize: 11, color: '#475569', fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <Btn
                variant={selectedUser.is_active ? 'danger' : 'primary'}
                size="sm"
                style={{ width: '100%', background: selectedUser.is_active ? '#EF4444' : '#059669' }}
                onClick={() => banMutation.mutate(selectedUser.id)}
                disabled={banMutation.isPending}
              >
                {selectedUser.is_active ? '🚫 Ban User' : '✅ Reactivate User'}
              </Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
