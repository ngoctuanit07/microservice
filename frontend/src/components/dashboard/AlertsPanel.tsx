import { Link } from 'react-router-dom'

interface Alert {
  id: number
  type: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  host: string | null
  createdAt: string
  actionRequired: string
}

interface AlertsPanelProps {
  alerts: Alert[]
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'primary'
      case 'low': return 'info'
      default: return 'secondary'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '🔔'
      case 'low': return 'ℹ️'
      default: return '❓'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">🚨 Active Alerts</h5>
        {alerts.length > 0 && (
          <span className="badge bg-danger">{alerts.length}</span>
        )}
      </div>
      <div className="card-body">
        {alerts.length === 0 ? (
          <div className="text-center text-muted py-3">
            <div className="fs-1">✅</div>
            <p>No active alerts</p>
            <small>Your system is running smoothly!</small>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {alerts.map((alert) => (
              <div key={alert.id} className="list-group-item px-0">
                <div className="d-flex align-items-start">
                  <span className="me-2 fs-5">{getSeverityIcon(alert.severity)}</span>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="mb-1">
                        <span className={`badge bg-${getSeverityColor(alert.severity)} me-2`}>
                          {alert.type}
                        </span>
                      </h6>
                      <small className="text-muted">{formatDate(alert.createdAt)}</small>
                    </div>
                    <p className="mb-1 small">{alert.message}</p>
                    {alert.host && (
                      <p className="mb-1 text-muted small">
                        <strong>Host:</strong> {alert.host}
                      </p>
                    )}
                    <div className="mt-2">
                      <small className="text-info">
                        <strong>Action:</strong> {alert.actionRequired}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {alerts.length > 3 && (
          <div className="text-center mt-3">
            <Link to="/alerts" className="btn btn-outline-primary btn-sm">
              View All Alerts
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}