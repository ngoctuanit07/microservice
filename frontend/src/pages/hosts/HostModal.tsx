import { useEffect, useState } from 'react'
import { createHost, getHost, updateHost } from '@services/hostService'
import type { Host } from '../../types'

type Props = {
  show: boolean
  mode: 'create' | 'edit'
  hostId?: number
  onClose: () => void
  onSaved: () => void
}

export default function HostModal({ show, mode, hostId, onClose, onSaved }: Props) {
  const isNew = mode === 'create'
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const [form, setForm] = useState<Partial<Host> & { pwd?: string }>({
    ip: '', port: 22, uid: '', pwd: '', purchasedAt: '', expiredAt: '', notes: ''
  })

  useEffect(() => {
    if (!show) return
    setErr('')
    if (!isNew && hostId) {
      setLoading(true)
      getHost(hostId).then(data => {
        setForm({ ...data, pwd: '', purchasedAt: (data.purchasedAt || '').slice(0,10), expiredAt: (data.expiredAt || '').slice(0,10) })
      }).catch(e => setErr(e?.response?.data?.message || 'Load host failed')).finally(()=>setLoading(false))
    } else {
      // reset
      setForm({ ip: '', port: 22, uid: '', pwd: '', purchasedAt: '', expiredAt: '', notes: '' })
    }
  }, [show, isNew, hostId])

  const onChange = (k: string, v: any) => setForm(s => ({ ...s, [k]: v }))

  const save = async () => {
    setErr('')
    try {
      setLoading(true)
      const ip = String(form.ip || '').trim()
      const uid = String(form.uid || '').trim()
      const pwd = String(form.pwd || '')
      const port = Number(form.port || 0)

      if (!ip) throw new Error('IP is required')
      if (!uid) throw new Error('UID is required')
      if (isNew && !pwd) throw new Error('Password is required')
      if (!Number.isFinite(port) || port < 1 || port > 65535) throw new Error('Port must be between 1 and 65535')

      const purchasedAt = String(form.purchasedAt || '').trim()
      const expiredAt = String(form.expiredAt || '').trim()
      if (!purchasedAt) throw new Error('Purchased date is required')
      if (!expiredAt) throw new Error('Expired date is required')
      if (Number.isNaN(Date.parse(purchasedAt))) throw new Error('Purchased date is invalid')
      if (Number.isNaN(Date.parse(expiredAt))) throw new Error('Expired date is invalid')
      if (new Date(expiredAt) < new Date(purchasedAt)) throw new Error('Expired date must be after purchased date')

      const payload: any = { ip, port, uid, notes: form.notes || '', purchasedAt, expiredAt }
      if (isNew) payload.pwd = pwd
      if (isNew) {
        await createHost(payload)
      } else {
        if (!hostId) throw new Error('Invalid host id')
        if (pwd) payload.pwd = pwd
        await updateHost(hostId, payload)
      }

      onSaved()
      onClose()
    } catch (e:any) {
      const serverData = e?.response?.data
      const serverMsg = serverData?.message || (serverData ? JSON.stringify(serverData) : null)
      setErr(serverMsg || e?.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog" style={{background: 'rgba(0,0,0,0.4)'}}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{isNew ? 'Create Host' : 'Edit Host'}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {err && <div className="alert alert-danger">{err}</div>}

            {loading && <div className="text-center mb-2">Loading...</div>}

            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label">IP</label>
                <input className="form-control" value={form.ip ?? ''} onChange={(e)=>onChange('ip', e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Port</label>
                <input className="form-control" type="number" value={form.port ?? 22} onChange={(e)=>onChange('port', Number(e.target.value))} />
              </div>
              <div className="col-md-3">
                <label className="form-label">UID</label>
                <input className="form-control" value={form.uid ?? ''} onChange={(e)=>onChange('uid', e.target.value)} />
              </div>
            </div>

            <div className="mb-3 mt-3">
              <label className="form-label">Password {isNew ? <span className="badge bg-info text-dark">required</span> : <span className="badge bg-secondary">leave blank to keep</span>}</label>
              <input className="form-control" type="password" value={form.pwd ?? ''} onChange={(e)=>onChange('pwd', e.target.value)} />
            </div>

            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label">Purchased At</label>
                <input className="form-control" type="date" value={String(form.purchasedAt || '')} onChange={(e)=>onChange('purchasedAt', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Expired At</label>
                <input className="form-control" type="date" value={String(form.expiredAt || '')} onChange={(e)=>onChange('expiredAt', e.target.value)} />
              </div>
            </div>

            <div className="mb-3 mt-3">
              <label className="form-label">Notes</label>
              <textarea className="form-control" rows={3} value={form.notes ?? ''} onChange={(e)=>onChange('notes', e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-primary" disabled={loading} onClick={save}>{loading ? '...' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
