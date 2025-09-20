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
    <div className="card" style={{maxWidth: 720}}>
      <h2>{isNew ? 'Create Host' : 'Edit Host'}</h2>
      {err && <div style={{color:'#fca5a5', marginBottom:8}}>{err}</div>}

      <div className="row" style={{flexDirection:'column', gap:10}}>
        <label>IP</label>
        <input value={form.ip ?? ''} onChange={(e)=>onChange('ip', e.target.value)} placeholder="192.168.1.10" />

        <label>Port</label>
        <input type="number" value={form.port ?? 22} onChange={(e)=>onChange('port', Number(e.target.value))} placeholder="22" />

        <label>UID</label>
        <input value={form.uid ?? ''} onChange={(e)=>onChange('uid', e.target.value)} placeholder="root / admin ..." />

        <label>Password {isNew ? <span className="badge">required</span> : <span className="badge">leave blank to keep</span>}</label>
        <input type="password" value={form.pwd ?? ''} onChange={(e)=>onChange('pwd', e.target.value)} placeholder="********" />

        <label>Purchased At</label>
        <input type="date" value={String(form.purchasedAt || '')} onChange={(e)=>onChange('purchasedAt', e.target.value)} />

        <label>Expired At</label>
        <input type="date" value={String(form.expiredAt || '')} onChange={(e)=>onChange('expiredAt', e.target.value)} />

        <label>Notes</label>
        <textarea rows={3} value={form.notes ?? ''} onChange={(e)=>onChange('notes', e.target.value)} placeholder="Provider, panel, extra info..."></textarea>

        <div className="row" style={{justifyContent:'flex-end'}}>
          <button className="btn" onClick={()=>history.back()}>Cancel</button>
          <button className="btn-primary" disabled={loading} onClick={save}>{loading ? '...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
