import { useState } from 'react'
import { useNotifications } from '../../store/notifications'
import { Link } from 'react-router-dom'

export default function NotificationCenter() {
  const { notifications, alerts, unreadCount, markAsRead, clearNotifications } = useNotifications()
  const [showDropdown, setShowDropdown] = useState(false)

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '🔔'
      default: return 'ℹ️'
    }
  }

  const allItems = [
    ...alerts.map(a => ({ ...a, itemType: 'alert' })),
    ...notifications.map(n => ({ ...n, itemType: 'notification' }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="position-relative">
      <button
        className="btn btn-outline-secondary position-relative"
        onClick={() => setShowDropdown(!showDropdown)}
        type="button"
      >
        🔔
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div 
          className="dropdown-menu dropdown-menu-end show position-absolute"
          style={{ minWidth: '350px', maxHeight: '500px', overflowY: 'auto', top: '100%', right: 0, zIndex: 1050 }}
        >
          <div className="dropdown-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Notifications</h6>
            {notifications.length > 0 && (
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={clearNotifications}
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="dropdown-divider"></div>

          {allItems.length === 0 ? (
            <div className="dropdown-item-text text-center py-3">
              <div className="text-muted">
                <div className="fs-1">📭</div>
                <p className="mb-0">No notifications</p>
              </div>
            </div>
          ) : (
            allItems.slice(0, 10).map((item) => (
              <div key={`${item.itemType}-${item.id}`} className="dropdown-item">
                {item.itemType === 'notification' ? (
                  <div 
                    className={`d-flex align-items-start ${!(item as any).read ? 'bg-light' : ''}`}
                    onClick={() => {
                      if (!(item as any).read) {
                        markAsRead(item.id)
                      }
                      if ((item as any).actionUrl) {
                        window.location.href = (item as any).actionUrl
                      }
                    }}
                    style={{ cursor: (item as any).actionUrl ? 'pointer' : 'default' }}
                  >
                    <span className="me-2">{getNotificationIcon((item as any).type)}</span>
                    <div className="flex-grow-1">
                      <h6 className="dropdown-header-text mb-1">{(item as any).title}</h6>
                      <p className="mb-1 small text-muted">{(item as any).message}</p>
                      <small className="text-muted">{formatTime(item.timestamp)}</small>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-start">
                    <span className="me-2">{getAlertIcon((item as any).severity)}</span>
                    <div className="flex-grow-1">
                      <h6 className="dropdown-header-text mb-1">
                        <span className={`badge bg-${
                          (item as any).severity === 'critical' ? 'danger' : 
                          (item as any).severity === 'high' ? 'warning' : 'primary'
                        } me-2`}>
                          {(item as any).type}
                        </span>
                      </h6>
                      <p className="mb-1 small text-muted">{(item as any).message}</p>
                      {(item as any).host && (
                        <p className="mb-1 small">
                          <strong>Host:</strong> {(item as any).host}
                        </p>
                      )}
                      <small className="text-muted">{formatTime(item.timestamp)}</small>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {allItems.length > 10 && (
            <div className="dropdown-divider"></div>
          )}
          
          <div className="dropdown-item text-center">
            <Link to="/notifications" className="btn btn-sm btn-primary">
              View All Notifications
            </Link>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1040 }}
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  )
}