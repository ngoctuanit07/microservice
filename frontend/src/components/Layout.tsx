import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@store/auth'
import '../styles/commercial.css'

export default function Layout() {
  const { logout, user } = useAuth()
  
  return (
    <>
      <div className="header container row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <div><strong>Hosting Admin</strong></div>
        <div className="row" style={{justifyContent:'flex-end', gap:'10px'}}>
          <div>
            <span>{user?.email}</span>
            {user?.role === 'ADMIN' && (
              <span className="badge ml-2">Admin</span>
            )}
          </div>
          <span className="kbd">v2.0</span>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </div>
      <div className="layout">
        <aside className="sidebar">
          <nav className="nav">
            <div className="nav-section">
              <h3 className="nav-header">Core</h3>
              <NavLink to="/" end>Dashboard</NavLink>
              <NavLink to="/hosts">Hosts</NavLink>
              <NavLink to="/task">Task Board</NavLink>
              <NavLink to="/transaction">Quản lý Thu Chi</NavLink>
              <NavLink to="/team">Teams</NavLink>
            </div>
            
            <div className="nav-section">
              <h3 className="nav-header">Organization</h3>
              <NavLink to="/organization">Organization</NavLink>
              <NavLink to="/organization/members">Members</NavLink>
              <NavLink to="/subscription">Subscription</NavLink>
            </div>
            
            {user?.role === 'ADMIN' && (
              <div className="nav-section">
                <h3 className="nav-header">Admin</h3>
                <NavLink to="/admin/settings">Settings</NavLink>
                <NavLink to="/admin/roles">Roles & Permissions</NavLink>
              </div>
            )}
          </nav>
        </aside>
        <main className="main container">
          <Outlet />
        </main>
      </div>
      
      {/* Styles moved to styles/commercial.css */}
    </>
  )
}
