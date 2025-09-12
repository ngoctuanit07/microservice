import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@store/auth'

export default function Layout() {
  const { logout } = useAuth()
  return (
    <>
      <div className="header container row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <div><strong>Hosting Admin</strong></div>
        <div className="row" style={{justifyContent:'flex-end'}}>
          <span className="kbd">v1.0</span>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </div>
      <div className="layout">
        <aside className="sidebar">
          <nav className="nav">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/hosts">Hosts</NavLink>
          </nav>
        </aside>
        <main className="main container">
          <Outlet />
        </main>
      </div>
    </>
  )
}
