import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { createHost, getHost, updateHost } from '@services/hostService'
import type { Host } from '../../types'

function toDateInputValue(s?: string) {
  if (!s) return ''
  const d = new Date(s)
  if (Number.isNaN(+d)) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth()+1).padStart(2,'0')
  const dd = String(d.getDate()).padStart(2,'0')
  return `${yyyy}-${mm}-${dd}`
}

export default function HostForm() {
  const { id } = useParams()
  const location = useLocation()
  // robustly detect the 'new' path — prevents '/hosts/new' being treated as an id
  const isNew = id === 'new' || location.pathname.endsWith('/hosts/new')
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const [form, setForm] = useState<Partial<Host> & { pwd?: string }>({
    ip: '', port: 22, uid: '', pwd: '',
    purchasedAt: '', expiredAt: '', notes: ''
  })

  useEffect(() => {
    (async () => {
      if (!isNew && id) {
        // ensure id is numeric
        if (isNaN(Number(id))) {
          setErr('Invalid host id');
          setTimeout(() => nav('/hosts'), 900);
          return
        }
        setLoading(true)
        try {
          const data = await getHost(Number(id))
          setForm({
            ...data,
            pwd: '', // keep empty unless updating
            purchasedAt: toDateInputValue(data.purchasedAt),
            expiredAt: toDateInputValue(data.expiredAt)
          })
        } catch (e:any) {
          setErr(e?.response?.data?.message || 'Load host failed')
        } finally {
          setLoading(false)
        }
      }
    })()
  }, [id, isNew])

  const onChange = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }))

  const save = async () => {
    setErr('')
    try {
      setLoading(true)
      if (isNew) {
        // client-side validation to satisfy backend DTO
        const ip = String(form.ip || '').trim()
        const uid = String(form.uid || '').trim()
        const pwd = String(form.pwd || '')
        const port = Number(form.port || 0)

        if (!ip) throw new Error('IP is required')
        if (!uid) throw new Error('UID is required')
        if (!pwd) throw new Error('Password is required')
        if (!Number.isFinite(port) || port < 1 || port > 65535) throw new Error('Port must be between 1 and 65535')

        const purchasedAt = String(form.purchasedAt || '').trim()
        const expiredAt = String(form.expiredAt || '').trim()
        if (!purchasedAt) throw new Error('Purchased date is required')
        if (!expiredAt) throw new Error('Expired date is required')
        // validate dates
        if (Number.isNaN(Date.parse(purchasedAt))) throw new Error('Purchased date is invalid')
        if (Number.isNaN(Date.parse(expiredAt))) throw new Error('Expired date is invalid')
        if (new Date(expiredAt) < new Date(purchasedAt)) throw new Error('Expired date must be after purchased date')

        const payload: any = {
          ip,
          port,
          uid,
          pwd,
          purchasedAt,
          expiredAt,
          notes: form.notes || ''
        }
        // log payload for easier debugging in the browser console
        try {
          console.debug('[HostForm] create payload', payload)
        } catch (err) {
          /* ignore */
        }
        await createHost(payload)
      } else {
        const payload: any = {
          ip: form.ip, port: form.port, uid: form.uid,
          purchasedAt: form.purchasedAt, expiredAt: form.expiredAt, notes: form.notes
        }
        if (form.pwd) payload.pwd = form.pwd
        await updateHost(Number(id), payload)
      }
      nav('/hosts')
    } catch (e: any) {
      // log full error for debugging
      try { console.error('[HostForm] save error', e) } catch (_) { }

      const status = e?.response?.status
      const serverData = e?.response?.data
      const serverMsg = serverData?.message || (serverData ? JSON.stringify(serverData) : null)

      const shown = serverMsg || e?.message || 'Save failed'
      // include status when present
      setErr(status ? `(${status}) ${shown}` : shown)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card shadow-sm" style={{maxWidth: 900}}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">{isNew ? 'Create Host' : 'Edit Host'}</h4>
          <div>
            <button className="btn btn-secondary me-2" onClick={()=>history.back()}>Cancel</button>
            <button className="btn btn-primary" disabled={loading} onClick={save}>{loading ? '...' : 'Save'}</button>
          </div>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        <form>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">IP</label>
              <input className="form-control" value={form.ip ?? ''} onChange={(e)=>onChange('ip', e.target.value)} placeholder="192.168.1.10" />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Port</label>
              <input className="form-control" type="number" value={form.port ?? 22} onChange={(e)=>onChange('port', Number(e.target.value))} placeholder="22" />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">UID</label>
              <input className="form-control" value={form.uid ?? ''} onChange={(e)=>onChange('uid', e.target.value)} placeholder="root / admin ..." />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Password {isNew ? <span className="badge bg-info text-dark">required</span> : <span className="badge bg-secondary">leave blank to keep</span>}</label>
            <input className="form-control" type="password" value={form.pwd ?? ''} onChange={(e)=>onChange('pwd', e.target.value)} placeholder="********" />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Purchased At</label>
              <input className="form-control" type="date" value={String(form.purchasedAt || '')} onChange={(e)=>onChange('purchasedAt', e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Expired At</label>
              <input className="form-control" type="date" value={String(form.expiredAt || '')} onChange={(e)=>onChange('expiredAt', e.target.value)} />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Notes</label>
            <textarea className="form-control" rows={3} value={form.notes ?? ''} onChange={(e)=>onChange('notes', e.target.value)} placeholder="Provider, panel, extra info..."></textarea>
          </div>
        </form>
      </div>
    </div>
  )
}
