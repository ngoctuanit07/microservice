import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listHosts, deleteHost, revealPwd } from '@services/hostService'
import HostModal from './HostModal'
import type { HostPaged } from '../../types'

function fmtDate(d: string) {
  const dt = new Date(d)
  if (Number.isNaN(+dt)) return d
  return dt.toLocaleDateString()
}

export default function HostList() {
  const [data, setData] = useState<HostPaged>({ items: [], total: 0, page: 1, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [exp, setExp] = useState(30)
  const [loading, setLoading] = useState(false)

  const load = async (page = 1) => {
    setLoading(true)
    try {
      const res = await listHosts({ page, pageSize: 10, search, expiringInDays: exp || undefined })
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, []) // initial

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create'|'edit'>('create')
  const [editingHostId, setEditingHostId] = useState<number|undefined>(undefined)

  const openCreate = () => { setModalMode('create'); setEditingHostId(undefined); setModalOpen(true) }
  const openEdit = (id: number) => { setModalMode('edit'); setEditingHostId(id); setModalOpen(true) }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="card-title mb-0">Hosts</h3>
          <button className="btn btn-primary" onClick={openCreate}>+ New Host</button>
        </div>

        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-6">
            <input className="form-control" placeholder="Search ip/uid/notes..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={exp} onChange={e=>setExp(+e.target.value)}>
              <option value={7}>Expiring in 7 days</option>
              <option value={30}>Expiring in 30 days</option>
              <option value={90}>Expiring in 90 days</option>
              <option value={0}>All</option>
            </select>
          </div>
          <div className="col-md-3 text-end">
            <button className="btn btn-outline-secondary" onClick={()=>load(1)}>Filter</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>IP</th>
                <th>Port</th>
                <th>UID</th>
                <th>Purchased</th>
                <th>Expired</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((h) => (
                <tr key={h.id}>
                  <td className="fw-bold">{h.ip}</td>
                  <td>{h.port}</td>
                  <td>{h.uid}</td>
                  <td>{fmtDate(h.purchasedAt)}</td>
                  <td>{fmtDate(h.expiredAt)}</td>
                  <td>{h.notes ?? ''}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={()=>openEdit(h.id)}>Edit</button>
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={async ()=>{ try { const pwd=await revealPwd(h.id); alert(`Password: ${pwd}`) } catch (e:any) { alert(e?.response?.data?.message || 'Reveal failed') }}}>Reveal</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={async ()=>{ if(confirm('Delete this host?')) { await deleteHost(h.id); await load(data.page) }}}>Delete</button>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && !loading && (
                <tr><td colSpan={7} className="text-center text-muted">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>Page {data.page} / {totalPages}</div>
          <div>
            <button className="btn btn-sm btn-outline-primary me-2" disabled={data.page<=1 || loading} onClick={()=>load(data.page-1)}>Prev</button>
            <button className="btn btn-sm btn-primary" disabled={data.page>=totalPages || loading} onClick={()=>load(data.page+1)}>Next</button>
          </div>
        </div>
      </div>
      <HostModal show={modalOpen} mode={modalMode} hostId={editingHostId} onClose={()=>setModalOpen(false)} onSaved={()=>load(data.page)} />
    </div>
  )
}
