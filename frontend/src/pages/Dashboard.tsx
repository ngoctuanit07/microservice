import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>Welcome back 👋</p>
      <div className="row">
        <Link className="btn" to="/hosts">Manage Hosts</Link>
        <Link className="btn" to="/hosts/new">Add Host</Link>
      </div>
      <p style={{marginTop:12, color:'#9ca3af'}}>
        Tip: Filter expiring hosts in <code>Hosts</code> with <span className="badge">Expiring in 30 days</span>.
      </p>
    </div>
  )
}
