import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@store/auth'
import { useNotifications } from '../store/notifications'
import NotificationCenter from './notifications/NotificationCenter'
import HelpCenter from './help/HelpCenter'
import TourOverlay from './help/TourOverlay'
import { useEffect } from 'react'
import '../styles/commercial.css'

export default function Layout() {
  const { logout, user } = useAuth()
  const { connect, disconnect, connected } = useNotifications()

  useEffect(() => {
    if (user?.id && !connected) {
      connect(user.id)
    }
    
    return () => {
      disconnect()
    }
  }, [user, connect, disconnect, connected])

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <NavLink to="/" className="navbar-brand">
            🖥️ Hosting Manager
          </NavLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item"><NavLink to="/hosts" className="nav-link">Hosts</NavLink></li>
              <li className="nav-item"><NavLink to="/task" className="nav-link">Task Board</NavLink></li>
              <li className="nav-item"><NavLink to="/transaction" className="nav-link">Transactions</NavLink></li>
            </ul>

            <div className="d-flex align-items-center gap-3">
              {/* Connection Status */}
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${connected ? 'bg-success' : 'bg-secondary'}`}>
                  {connected ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>

              {/* Help Center */}
              <div data-tour="help-center">
                <HelpCenter />
              </div>

              {/* Notification Center */}
              <div data-tour="notification-center">
                <NotificationCenter />
              </div>

              <div className="text-white">
                {user?.name || user?.email} 
                {user?.role === 'ADMIN' && <span className="badge bg-warning text-dark ms-2">Admin</span>}
              </div>
              <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid mt-4">
        <div className="row">
          <aside className="col-md-3 col-lg-2 mb-3">
            <div className="list-group">
              <NavLink to="/" className="list-group-item list-group-item-action">
                📊 Dashboard
              </NavLink>
              <NavLink to="/hosts" className="list-group-item list-group-item-action">
                🖥️ Hosts
              </NavLink>
              <NavLink to="/task" className="list-group-item list-group-item-action">
                📋 Task Board
              </NavLink>
              <NavLink to="/team" className="list-group-item list-group-item-action">
                👥 Teams
              </NavLink>
              <NavLink to="/organization" className="list-group-item list-group-item-action">
                🏢 Organization
              </NavLink>
              <NavLink to="/subscription" className="list-group-item list-group-item-action">
                💳 Subscription
              </NavLink>
              <NavLink to="/transaction" className="list-group-item list-group-item-action">
                💰 Transactions
              </NavLink>
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin/roles" className="list-group-item list-group-item-action">
                  ⚙️ Admin Panel
                </NavLink>
              )}
            </div>

            {/* Quick Stats Sidebar */}
            <div className="card mt-3">
              <div className="card-body small">
                <h6 className="card-title">📈 Quick Stats</h6>
                <div className="d-flex justify-content-between">
                  <span>Status:</span>
                  <span className={connected ? 'text-success' : 'text-danger'}>
                    {connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>User:</span>
                  <span className="text-primary">{user?.name || 'Guest'}</span>
                </div>
              </div>
            </div>
          </aside>

          <main className="col-md-9 col-lg-10">
            <Outlet />
          </main>
        </div>

        {/* Global Tour Overlay */}
        <TourOverlay />
      </div>
    </div>
  )
}
