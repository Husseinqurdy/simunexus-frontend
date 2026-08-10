import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/client'
import {
  PageHeader, ExpertLevelBadge, StarRating, LoadingSpinner,
  EmptyState, Table, Tr, Td, Card, SectionTitle
} from '@/components/shared'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import type { User } from '@/types'
import {
  Search, X, Eye, EyeOff, Ban, CheckCircle2, Trash2, KeyRound,
  Pencil, UserPlus, Users, AlertTriangle, Loader2
} from 'lucide-react'

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

type ExpertForm = { email: string; first_name: string; last_name: string; phone: string; password: string }
type EditForm = { first_name: string; last_name: string; phone: string; whatsapp: string; country: string; role: string }
type PasswordForm = { new_password: string; confirm_password: string }

export default function AdminUsers() {
  const qc = useQueryClient()
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAddExpert, setShowAddExpert] = useState(false)
  const [expertForm, setExpertForm] = useState<ExpertForm>({ email: '', first_name: '', last_name: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  // --- Edit / Set Password / Delete state ---
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ first_name: '', last_name: '', phone: '', whatsapp: '', country: '', role: 'client' })
  const [pwUser, setPwUser] = useState<User | null>(null)
  const [pwForm, setPwForm] = useState<PasswordForm>({ new_password: '', confirm_password: '' })
  const [showPw1, setShowPw1] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter, search],
    queryFn: () => authApi.adminUsers({ ...(roleFilter && { role: roleFilter }), ...(search && { search }) }).then(r => r.data),
  })

  const banMutation = useMutation({
    mutationFn: (userId: number) => authApi.adminBanUser(userId),
    onSuccess: (_, userId) => {
      const user = users.find(u => u.id === userId)
      toast.success(user?.is_active ? 'User banned.' : 'User reactivated.')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      if (selectedUser?.id === userId) setSelectedUser(null)
    },
    onError: () => toast.error('Action failed.'),
  })

  const createExpertMutation = useMutation({
    mutationFn: () => authApi.adminCreateExpert(expertForm),
    onSuccess: (res: any) => {
      toast.success(`Expert account created for ${res.data.email}`)
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setShowAddExpert(false)
      setExpertForm({ email: '', first_name: '', last_name: '', phone: '', password: '' })
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to create expert.'),
  })

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; data: EditForm }) => authApi.adminUpdateUser(vars.id, vars.data),
    onSuccess: () => {
      toast.success('User details updated.')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setEditUser(null)
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || e.response?.data?.error || 'Update failed.'),
  })

  const setPasswordMutation = useMutation({
    mutationFn: (vars: { id: number; data: PasswordForm }) => authApi.adminSetPassword(vars.id, vars.data),
    onSuccess: () => {
      toast.success('Password updated.')
      setPwUser(null)
      setPwForm({ new_password: '', confirm_password: '' })
    },
    onError: (e: any) => {
      const msg = e.response?.data?.error
      toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Failed to set password.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => authApi.adminDeleteUser(id),
    onSuccess: () => {
      toast.success('User deleted.')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setDeleteUser(null)
      if (selectedUser?.id === deleteUser?.id) setSelectedUser(null)
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Delete failed.'),
  })

  const users: User[] = data?.results || []

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 10,
    border: '1.5px solid #E2E8F0', fontSize: 13, outline: 'none',
    fontFamily: 'inherit', color: '#0F172A', boxSizing: 'border-box',
  }
  const label: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase',
    letterSpacing: '0.05em', display: 'block', marginBottom: 5,
  }

  function openEdit(u: User) {
    setEditUser(u)
    setEditForm({
      first_name: u.first_name || '', last_name: u.last_name || '',
      phone: u.phone || '', whatsapp: (u as any).whatsapp || '',
      country: u.country || '', role: u.role,
    })
  }

  return (
    <div className="au-page">
      <style>{`
        .au-page { font-size: 14px; }
        .au-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
        .au-add-btn { padding:9px 16px; border-radius:10px; background:#059669; color:#fff; border:none; cursor:pointer;
          font-size:13px; font-weight:700; font-family:Syne,sans-serif; display:flex; align-items:center; gap:6px; white-space:nowrap; }
        .au-tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
        .au-tab { padding:6px 16px; border-radius:999px; font-size:12px; font-weight:700; cursor:pointer; border:none; }
        .au-search { width:100%; max-width:380px; padding:9px 14px 9px 36px; border-radius:10px; border:1.5px solid #E2E8F0;
          font-size:13px; outline:none; font-family:inherit; color:#0F172A; }
        .au-search-wrap { position:relative; max-width:380px; margin-bottom:20px; }
        .au-search-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:#94A3B8; }
        .au-grid { display:grid; grid-template-columns: 1fr; gap:20px; }
        .au-grid.has-sidebar { grid-template-columns: 1fr 320px; }
        @media (max-width: 900px) {
          .au-grid.has-sidebar { grid-template-columns: 1fr; }
        }
        .au-table-scroll { width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .au-table-scroll table { min-width: 760px; }
        .au-actions { display:flex; gap:6px; flex-wrap:nowrap; }
        .au-icon-btn { padding:6px; border-radius:8px; border:none; cursor:pointer; display:inline-flex;
          align-items:center; justify-content:center; }
        .au-modal-overlay { position:fixed; inset:0; background:rgba(11,28,61,0.45); display:flex;
          align-items:center; justify-content:center; z-index:1000; padding:16px; }
        .au-modal { background:#fff; border-radius:16px; width:100%; max-width:440px; max-height:90vh;
          overflow-y:auto; padding:24px; }
        @media (max-width: 480px) {
          .au-page { font-size:13px; }
          .au-modal { padding:18px; border-radius:14px; }
          .au-add-btn { padding:8px 12px; font-size:12px; }
          .au-tab { padding:5px 12px; font-size:11px; }
        }
      `}</style>

      <div className="au-header">
        <PageHeader title="User Management" subtitle={`${data?.count || 0} total users`} />
        <button className="au-add-btn" onClick={() => setShowAddExpert(!showAddExpert)}>
          <UserPlus size={15} /> Add Expert
        </button>
      </div>

      {/* Add Expert Form */}
      {showAddExpert && (
        <Card style={{ marginBottom: 20, border: '1.5px solid #BBF7D0', background: '#F0FDF4' }}>
          <SectionTitle>Create Expert Account</SectionTitle>
          <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 16px', lineHeight: 1.5 }}>
            Create an expert account directly. If no password is set, a set-password link will be emailed to the expert.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={label}>First Name</label>
              <input style={inp} placeholder="Ahmed" value={expertForm.first_name} onChange={e => setExpertForm(p => ({ ...p, first_name: e.target.value }))} />
            </div>
            <div>
              <label style={label}>Last Name</label>
              <input style={inp} placeholder="Khalid" value={expertForm.last_name} onChange={e => setExpertForm(p => ({ ...p, last_name: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={label}>Email *</label>
              <input style={inp} type="email" placeholder="expert@email.com" value={expertForm.email} onChange={e => setExpertForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label style={label}>Phone / WhatsApp</label>
              <input style={inp} placeholder="+255 7XX XXX XXX" value={expertForm.phone} onChange={e => setExpertForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={label}>
              Password <span style={{ color: '#CBD5E1', fontWeight: 400, textTransform: 'none' }}>(leave blank to send email link)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                style={inp}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={expertForm.password}
                onChange={e => setExpertForm(p => ({ ...p, password: e.target.value }))}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => createExpertMutation.mutate()}
              disabled={!expertForm.email || createExpertMutation.isPending}
              style={{ padding: '10px 20px', borderRadius: 10, background: !expertForm.email || createExpertMutation.isPending ? '#6EE7B7' : '#059669', color: '#fff', border: 'none', cursor: !expertForm.email || createExpertMutation.isPending ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {createExpertMutation.isPending ? <><Loader2 size={14} className="spin" /> Creating…</> : <><CheckCircle2 size={14} /> Create Expert</>}
            </button>
            <button
              onClick={() => { setShowAddExpert(false); setExpertForm({ email: '', first_name: '', last_name: '', phone: '', password: '' }) }}
              style={{ padding: '10px 18px', borderRadius: 10, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Role tabs */}
      <div className="au-tabs">
        {ROLE_TABS.map(r => (
          <button key={r.value} className="au-tab" onClick={() => setRoleFilter(r.value)}
            style={{ background: roleFilter === r.value ? '#0B1C3D' : '#F1F5F9', color: roleFilter === r.value ? '#fff' : '#64748B' }}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="au-search-wrap">
        <Search size={15} className="au-search-icon" />
        <input className="au-search" type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className={`au-grid ${selectedUser ? 'has-sidebar' : ''}`}>
        {isLoading ? <LoadingSpinner label="Loading users..." /> :
          users.length === 0 ? <EmptyState icon={<Users size={30} />} title="No users found" /> : (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
              <div className="au-table-scroll">
                <Table headers={['User', 'Role', 'Country', 'Status', 'Joined', 'Actions']}>
                  {users.map(u => {
                    const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.client
                    return (
                      <Tr key={u.id} onClick={() => setSelectedUser(u)}>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0, background: roleStyle.bg, color: roleStyle.color }}>
                              {(u.first_name?.[0] || u.email[0]).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: '#0F172A' }}>{u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : '—'}</p>
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
                          <div className="au-actions" onClick={e => e.stopPropagation()}>
                            <button className="au-icon-btn" title="Edit" onClick={() => openEdit(u)}
                              style={{ background: '#EFF6FF', color: '#2563EB' }}>
                              <Pencil size={14} />
                            </button>
                            <button className="au-icon-btn" title="Set password" onClick={() => setPwUser(u)}
                              style={{ background: '#FFFBEB', color: '#D97706' }}>
                              <KeyRound size={14} />
                            </button>
                            <button className="au-icon-btn" title={u.is_active ? 'Ban' : 'Unban'} onClick={() => banMutation.mutate(u.id)} disabled={banMutation.isPending}
                              style={{ background: u.is_active ? '#FFF1F2' : '#F0FDF4', color: u.is_active ? '#E11D48' : '#059669' }}>
                              {u.is_active ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                            </button>
                            <button className="au-icon-btn" title="Delete" onClick={() => setDeleteUser(u)}
                              style={{ background: '#FEF2F2', color: '#DC2626' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </Td>
                      </Tr>
                    )
                  })}
                </Table>
              </div>
            </div>
          )}

        {/* User Detail Sidebar */}
        {selectedUser && (
          <Card style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, background: (ROLE_COLORS[selectedUser.role] || ROLE_COLORS.client).bg, color: (ROLE_COLORS[selectedUser.role] || ROLE_COLORS.client).color }}>
                  {(selectedUser.first_name?.[0] || selectedUser.email[0]).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 800, margin: 0, color: '#0F172A' }}>{selectedUser.first_name} {selectedUser.last_name}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            {[
              { label: 'Role',    value: selectedUser.role },
              { label: 'Phone',   value: selectedUser.phone   || '—' },
              { label: 'WhatsApp',value: (selectedUser as any).whatsapp|| '—' },
              { label: 'Country', value: selectedUser.country || '—' },
              { label: 'Status',  value: selectedUser.is_active ? (selectedUser.is_online ? 'Online' : 'Offline') : 'Banned' },
              { label: 'Logins',  value: selectedUser.login_count },
              { label: 'Joined',  value: formatDistanceToNow(new Date(selectedUser.created_at), { addSuffix: true }) },
            ].map(({ label: l, value }) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F8FAFC' }}>
                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</span>
                <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{String(value)}</span>
              </div>
            ))}

            {selectedUser.expert_profile && (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Expert Profile</p>
                <ExpertLevelBadge level={selectedUser.expert_profile.level} />
                <div style={{ marginTop: 8 }}><StarRating rating={Number(selectedUser.expert_profile.rating)} /></div>
                <p style={{ fontSize: 12, color: '#64748B', margin: '8px 0 0' }}>{selectedUser.expert_profile.completed_projects} projects · {Number(selectedUser.expert_profile.success_rate).toFixed(0)}% success</p>
                <p style={{ fontSize: 12, color: '#059669', fontWeight: 700, margin: '4px 0 0' }}>${Number(selectedUser.expert_profile.total_earned).toFixed(2)} earned</p>
                {selectedUser.expert_profile.skills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                    {selectedUser.expert_profile.skills.map((s: string) => (
                      <span key={s} style={{ padding: '3px 8px', borderRadius: 999, background: '#F1F5F9', fontSize: 11, color: '#475569', fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => openEdit(selectedUser)}
                style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Pencil size={14} /> Edit Details
              </button>
              <button onClick={() => setPwUser(selectedUser)}
                style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <KeyRound size={14} /> Set Password
              </button>
              <button
                onClick={() => banMutation.mutate(selectedUser.id)}
                disabled={banMutation.isPending}
                style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: selectedUser.is_active ? '#EF4444' : '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                {selectedUser.is_active ? <Ban size={14} /> : <CheckCircle2 size={14} />} {selectedUser.is_active ? 'Ban User' : 'Reactivate User'}
              </button>
              <button onClick={() => setDeleteUser(selectedUser)}
                style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #FCA5A5', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Trash2 size={14} /> Delete User
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* --- Edit Modal --- */}
      {editUser && (
        <div className="au-modal-overlay" onClick={() => setEditUser(null)}>
          <div className="au-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <SectionTitle>Edit User</SectionTitle>
              <button onClick={() => setEditUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={label}>First Name</label>
                <input style={inp} value={editForm.first_name} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div>
                <label style={label}>Last Name</label>
                <input style={inp} value={editForm.last_name} onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={label}>Phone</label>
                <input style={inp} value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label style={label}>WhatsApp</label>
                <input style={inp} value={editForm.whatsapp} onChange={e => setEditForm(p => ({ ...p, whatsapp: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={label}>Country</label>
                <input style={inp} value={editForm.country} onChange={e => setEditForm(p => ({ ...p, country: e.target.value }))} />
              </div>
              <div>
                <label style={label}>Role</label>
                <select style={inp} value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="client">Client</option>
                  <option value="expert">Expert</option>
                  <option value="admin">Admin</option>
                  <option value="developer">Developer</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => updateMutation.mutate({ id: editUser.id, data: editForm })}
                disabled={updateMutation.isPending}
                style={{ padding: '10px 20px', borderRadius: 10, background: '#2563EB', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {updateMutation.isPending ? <Loader2 size={14} className="spin" /> : <CheckCircle2 size={14} />} Save Changes
              </button>
              <button onClick={() => setEditUser(null)}
                style={{ padding: '10px 18px', borderRadius: 10, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Set Password Modal --- */}
      {pwUser && (
        <div className="au-modal-overlay" onClick={() => setPwUser(null)}>
          <div className="au-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <SectionTitle>Set Password</SectionTitle>
              <button onClick={() => setPwUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 16px' }}>
              Set a new password for <strong>{pwUser.email}</strong>. This changes it immediately without an email link.
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={label}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input style={inp} type={showPw1 ? 'text' : 'password'} value={pwForm.new_password}
                  onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))} />
                <button type="button" onClick={() => setShowPw1(!showPw1)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                  {showPw1 ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={label}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input style={inp} type={showPw2 ? 'text' : 'password'} value={pwForm.confirm_password}
                  onChange={e => setPwForm(p => ({ ...p, confirm_password: e.target.value }))} />
                <button type="button" onClick={() => setShowPw2(!showPw2)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                  {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => setPasswordMutation.mutate({ id: pwUser.id, data: pwForm })}
                disabled={!pwForm.new_password || !pwForm.confirm_password || setPasswordMutation.isPending}
                style={{ padding: '10px 20px', borderRadius: 10, background: '#D97706', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {setPasswordMutation.isPending ? <Loader2 size={14} className="spin" /> : <KeyRound size={14} />} Update Password
              </button>
              <button onClick={() => setPwUser(null)}
                style={{ padding: '10px 18px', borderRadius: 10, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation --- */}
      {deleteUser && (
        <div className="au-modal-overlay" onClick={() => setDeleteUser(null)}>
          <div className="au-modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} />
              </div>
              <SectionTitle>Delete User</SectionTitle>
            </div>
            <p style={{ fontSize: 13, color: '#374151', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>{deleteUser.email}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => deleteMutation.mutate(deleteUser.id)}
                disabled={deleteMutation.isPending}
                style={{ padding: '10px 20px', borderRadius: 10, background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {deleteMutation.isPending ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />} Delete Permanently
              </button>
              <button onClick={() => setDeleteUser(null)}
                style={{ padding: '10px 18px', borderRadius: 10, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}