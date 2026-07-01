import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { projectApi } from '@/api/client'
import {
  PageHeader, StatusBadge, SoftwareLabel, DeliveryBadge,
  LoadingSpinner, EmptyState, Table, Tr, Td, Btn
} from '@/components/shared'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'
import type { Project, ProjectStatus } from '@/types'

const STATUSES: { value: string; label: string; color: string }[] = [
  { value: '',            label: 'All',         color: '#64748B' },
  { value: 'received',   label: 'Received',     color: '#94A3B8' },
  { value: 'assigned',   label: 'Assigned',     color: '#3B82F6' },
  { value: 'in_progress',label: 'In Progress',  color: '#F59E0B' },
  { value: 'qc',         label: 'QC Review',    color: '#8B5CF6' },
  { value: 'completed',  label: 'Completed',    color: '#10B981' },
  { value: 'revision',   label: 'Revision',     color: '#F43F5E' },
  { value: 'cancelled',  label: 'Cancelled',    color: '#CBD5E1' },
]

export default function AdminProjects() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')

  const statusFilter = searchParams.get('status') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects-list', statusFilter, search],
    queryFn: () => projectApi.list({
      ...(statusFilter && { status: statusFilter }),
      ...(search && { search }),
      ordering: '-created_at',
    }).then(r => r.data),
    refetchInterval: 30000,
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: string; reason?: string }) =>
      projectApi.approve(id, { action, reason }),
    onSuccess: (_, { action }) => {
      toast.success(action === 'approve' ? '✅ Project approved & delivered!' : '↩ Revision requested.')
      qc.invalidateQueries({ queryKey: ['admin-projects-list'] })
    },
    onError: () => toast.error('Action failed.'),
  })

  const projects: Project[] = data?.results || []

  const counts: Record<string, number> = {}
  STATUSES.forEach(s => {
    if (s.value) counts[s.value] = 0
  })

  const handleRevision = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    const reason = prompt('Reason for requesting revision:')
    if (reason) approveMutation.mutate({ id, action: 'reject', reason })
  }

  return (
    <div>
      <PageHeader
        title="All Projects"
        subtitle={`${data?.count || 0} total projects`}
      />

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => setSearchParams(s.value ? { status: s.value } : {})}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', border: 'none', transition: 'all .2s',
              background: statusFilter === s.value ? s.color : '#F1F5F9',
              color: statusFilter === s.value ? '#fff' : '#64748B',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by title, client, expert..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: 400, padding: '9px 14px', borderRadius: 10,
            border: '1.5px solid #E2E8F0', fontSize: 13, outline: 'none',
            fontFamily: 'inherit', color: '#0F172A',
          }}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState icon="📋" title="No projects found" body="Try adjusting your filters." />
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
          <Table headers={['Project', 'Client', 'Expert', 'Status', 'Price', 'Delivery', 'Deadline', 'Actions']}>
            {projects.map(p => (
              <Tr key={p.id} onClick={() => navigate(`/admin/projects/${p.id}`)}>
                <Td>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 3px', color: '#0F172A', fontFamily: 'Syne,sans-serif' }}>
                    {p.title.length > 38 ? p.title.slice(0, 38) + '…' : p.title}
                  </p>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <SoftwareLabel software={p.software} />
                    {p.is_nda && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', background: '#F5F3FF', padding: '2px 7px', borderRadius: 999, border: '1px solid #DDD6FE' }}>NDA</span>
                    )}
                  </div>
                </Td>
                <Td><span style={{ fontSize: 13, color: '#475569' }}>{p.client_name || '—'}</span></Td>
                <Td>
                  {p.expert_name
                    ? <span style={{ fontSize: 13, color: '#475569' }}>{p.expert_name}</span>
                    : <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 700 }}>⚠ Unassigned</span>
                  }
                </Td>
                <Td><StatusBadge status={p.status as ProjectStatus} /></Td>
                <Td>
                  {p.client_price
                    ? <span style={{ fontWeight: 700, color: '#059669', fontFamily: 'Syne,sans-serif', fontSize: 14 }}>${p.client_price}</span>
                    : <span style={{ fontSize: 12, color: '#CBD5E1', fontStyle: 'italic' }}>Not set</span>
                  }
                </Td>
                <Td><DeliveryBadge type={p.delivery_type} /></Td>
                <Td>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>
                    {formatDistanceToNow(new Date(p.deadline), { addSuffix: true })}
                  </span>
                </Td>
                <Td>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/admin/projects/${p.id}`)}
                      style={{ padding: '5px 12px', borderRadius: 8, background: '#EFF6FF', color: '#2563EB', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                    >
                      Manage
                    </button>
                    {p.status === 'qc' && (
                      <>
                        <button
                          onClick={e => { e.stopPropagation(); approveMutation.mutate({ id: p.id, action: 'approve' }) }}
                          disabled={approveMutation.isPending}
                          style={{ padding: '5px 10px', borderRadius: 8, background: '#F0FDF4', color: '#059669', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800 }}
                          title="Approve & Deliver"
                        >✓</button>
                        <button
                          onClick={e => handleRevision(e, p.id)}
                          disabled={approveMutation.isPending}
                          style={{ padding: '5px 10px', borderRadius: 8, background: '#FFF1F2', color: '#E11D48', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800 }}
                          title="Request Revision"
                        >✗</button>
                      </>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  )
}
