import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listHosts, deleteHost, revealPwd } from '@services/hostService'
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

  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h2>Hosts</h2>
        <Link to="/hosts/new" className="btn-primary" style={{maxWidth:180, textAlign:'center'}}>+ New Host</Link>
      </div>

      <div className="row" style={{margin:'12px 0'}}>
        <input placeholder="Search ip/uid/notes..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select value={exp} onChange={e=>setExp(+e.target.value)}>
          <option value={7}>Expiring in 7 days</option>
          <option value={30}>Expiring in 30 days</option>
          <option value={90}>Expiring in 90 days</option>
          <option value={0}>All</option>
        </select>
        <button className="btn" onClick={()=>load(1)}>Filter</button>
      </div>

      <div style={{overflowX:'auto'}}>
        <table className="table">
          <thead>
            <tr>
              <th>IP</th><th>Port</th><th>UID</th><th>Purchased</th><th>Expired</th><th>Notes</th><th></th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((h) => (
              <tr key={h.id}>
                <td>{h.ip}</td>
                <td>{h.port}</td>
                <td>{h.uid}</td>
                <td>{fmtDate(h.purchasedAt)}</td>
                <td>{fmtDate(h.expiredAt)}</td>
                <td>{h.notes ?? ''}</td>
                <td style={{whiteSpace:'nowrap'}}>
                  <Link to={`/hosts/${h.id}`} className="kbd">Edit</Link>{' '}
                  <a href="#" className="kbd"
                     onClick={async (e)=>{e.preventDefault(); try { const pwd=await revealPwd(h.id); alert(`Password: ${pwd}`) } catch (e:any) { alert(e?.response?.data?.message || 'Reveal failed') }}}>
                    Reveal
                  </a>{' '}
                  <a href="#" className="kbd"
                     onClick={async (e)=>{e.preventDefault(); if(confirm('Delete this host?')) { await deleteHost(h.id); await load(data.page) }}}>
                    Delete
                  </a>
                </td>
              </tr>
            ))}
            {data.items.length === 0 && !loading && (
              <tr><td colSpan={7} style={{textAlign:'center', color:'#9ca3af'}}>No data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="row" style={{justifyContent:'space-between', marginTop:12}}>
        <div>Page {data.page} / {totalPages}</div>
        <div className="row" style={{justifyContent:'flex-end'}}>
          <button disabled={data.page<=1 || loading} onClick={()=>load(data.page-1)}>Prev</button>
          <button disabled={data.page>=totalPages || loading} onClick={()=>load(data.page+1)}>Next</button>
        </div>
      </div>
    </div>
  )
}
