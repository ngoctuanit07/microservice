interface Stats {
  hostsCount: number
  activeHosts: number
  expiringHosts: number
  expiredHosts: number
  totalTransactions: number
  pendingAlerts: number
  uptimePercentage: number
  healthStatus: 'excellent' | 'good' | 'needs-attention'
}

interface StatsCardsProps {
  stats: Stats
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success'
      case 'good': return 'primary'
      case 'needs-attention': return 'warning'
      default: return 'secondary'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent': return '✅'
      case 'good': return '👍'
      case 'needs-attention': return '⚠️'
      default: return '❓'
    }
  }

  return (
    <div className="row">
      {/* Total Hosts */}
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card border-primary">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title text-muted">Total Hosts</h6>
                <h3 className="text-primary">{stats.hostsCount}</h3>
              </div>
              <div className="fs-1">🖥️</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Hosts */}
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card border-success">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title text-muted">Active Hosts</h6>
                <h3 className="text-success">{stats.activeHosts}</h3>
                <small className="text-muted">{stats.uptimePercentage}% uptime</small>
              </div>
              <div className="fs-1">🟢</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expiring Soon */}
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card border-warning">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title text-muted">Expiring Soon</h6>
                <h3 className="text-warning">{stats.expiringHosts}</h3>
                <small className="text-muted">Next 30 days</small>
              </div>
              <div className="fs-1">⏰</div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Status */}
      <div className="col-lg-3 col-md-6 mb-3">
        <div className={`card border-${getHealthColor(stats.healthStatus)}`}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title text-muted">System Health</h6>
                <h5 className={`text-${getHealthColor(stats.healthStatus)} text-capitalize`}>
                  {stats.healthStatus.replace('-', ' ')}
                </h5>
                <small className="text-muted">{stats.pendingAlerts} alerts</small>
              </div>
              <div className="fs-1">{getHealthIcon(stats.healthStatus)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}