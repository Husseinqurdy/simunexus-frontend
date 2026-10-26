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
import { AlertTriangle, Check, X, ClipboardList } from 'lucide-react'

const formatTSH = (value: number | string | undefined) => {
  const n = Number(value || 0)
  return `TSH ${n.toLocaleString('en-US')}`
}

const STATUSES: { value: string; label: string; color: string }[] = [
  { value: '',            label: 'All',         color: '#4E5E82' },
  { value: 'received',   label: 'Received',     color: '#667697' },
  { value: 'assigned',   label: 'Assigned',     color: '#3F7BE0' },
  { value: 'in_progress',label: 'In Progress',  color: '#9A5B00' },
  { value: 'qc',         label: 'QC Review',    color: '#3F5FB8' },
  { value: 'completed',  label: 'Completed',    color: '#137A4E' },
  { value: 'revision',   label: 'Revision',     color: '#B92D2D' },
  { value: 'cancelled',  label: 'Cancelled',    color: '#C3CEE2' },
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
      toast.success(action === 'approve' ? 'Project approved & delivered!' : 'Revision requested.')
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
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(0); }
          to { opacity: 1; transform: translateY(0); }
        }
        .proj-filter-btn {
          transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
        }
        .proj-filter-btn:hover {
          transform: translateY(0);
        }
        .proj-search-input {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .proj-search-input:focus {
          border-color: #0D52CE;
          box-shadow: 0 0 0 3px rgba(13,82,206,0.12);
        }
        .proj-row-anim {
          transition: background 0.15s ease;
        }
        .proj-action-btn {
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .proj-action-btn:hover {
          transform: scale(1);
          opacity: 0.9;
        }
        .proj-action-btn:active {
          transform: scale(0.94);
        }
      `}</style>

      <PageHeader
        title="All Projects"
        subtitle={`${data?.count || 0} total projects`}
      />

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button
            key={s.value}
            className="proj-filter-btn"
            onClick={() => setSearchParams(s.value ? { status: s.value } : {})}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', border: 'none',
              background: statusFilter === s.value ? s.color : '#EBEFF8',
              color: statusFilter === s.value ? '#fff' : '#4E5E82',
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
          className="proj-search-input"
          placeholder="Search by title, client, expert..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: 400, padding: '9px 14px', borderRadius: 10,
            border: '1.5px solid #DCE3F0', fontSize: 13, outline: 'none',
            fontFamily: 'inherit', color: '#0A1F4D', boxSizing: 'border-box',
          }}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState title="No projects found" body="Try adjusting your filters." />
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EBEFF8', overflow: 'hidden' }}>
          <Table headers={['Project', 'Client', 'Expert', 'Status', 'Price', 'Delivery', 'Deadline', 'Actions']}>
            {projects.map(p => (
              <Tr key={p.id} className="proj-row-anim" onClick={() => navigate(`/admin/projects/${p.id}`)}>
                <Td>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 3px', color: '#0A1F4D', fontFamily: 'inherit' }}>
                    {p.title.length > 38 ? p.title.slice(0, 38) + '…' : p.title}
                  </p>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <SoftwareLabel software={p.software} />
                    {p.is_nda && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#2E4DA7', background: '#EEF2FB', padding: '2px 7px', borderRadius: 999, border: '1px solid #C9D4F0' }}>NDA</span>
                    )}
                  </div>
                </Td>
                <Td><span style={{ fontSize: 13, color: '#3A4A70' }}>{p.client_name || '—'}</span></Td>
                <Td>
                  {p.expert_name
                    ? <span style={{ fontSize: 13, color: '#3A4A70' }}>{p.expert_name}</span>
                    : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9A5B00', fontWeight: 700 }}>
                        <AlertTriangle size={13} strokeWidth={2.2} /> Unassigned
                      </span>
                    )
                  }
                </Td>
                <Td><StatusBadge status={p.status as ProjectStatus} /></Td>
                <Td>
                  {p.client_price
                    ? <span style={{ fontWeight: 700, color: '#137A4E', fontFamily: 'inherit', fontSize: 13 }}>{formatTSH(p.client_price)}</span>
                    : <span style={{ fontSize: 12, color: '#C3CEE2', fontStyle: 'italic' }}>Not set</span>
                  }
                </Td>
                <Td><DeliveryBadge type={p.delivery_type} /></Td>
                <Td>
                  <span style={{ fontSize: 12, color: '#667697' }}>
                    {formatDistanceToNow(new Date(p.deadline), { addSuffix: true })}
                  </span>
                </Td>
                <Td>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button
                      className="proj-action-btn"
                      onClick={() => navigate(`/admin/projects/${p.id}`)}
                      style={{ padding: '5px 12px', borderRadius: 8, background: '#EAF1FD', color: '#0D52CE', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                    >
                      Manage
                    </button>
                    {p.status === 'qc' && (
                      <>
                        <button
                          className="proj-action-btn"
                          onClick={e => { e.stopPropagation(); approveMutation.mutate({ id: p.id, action: 'approve' }) }}
                          disabled={approveMutation.isPending}
                          style={{ padding: '5px 10px', borderRadius: 8, background: '#EDF8F1', color: '#137A4E', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Approve & Deliver"
                        >
                          <Check size={14} strokeWidth={2.6} />
                        </button>
                        <button
                          className="proj-action-btn"
                          onClick={e => handleRevision(e, p.id)}
                          disabled={approveMutation.isPending}
                          style={{ padding: '5px 10px', borderRadius: 8, background: '#FDEDED', color: '#B92D2D', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Request Revision"
                        >
                          <X size={14} strokeWidth={2.6} />
                        </button>
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