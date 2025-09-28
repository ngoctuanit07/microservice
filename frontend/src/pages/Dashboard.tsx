import { Link } from 'react-router-dom'
import { useEffect } from 'react'

import { useDashboard } from '../hooks/useDashboard'
import { useHelp, useTour } from '../store/help'

import StatsCards from '../components/dashboard/StatsCards'
import RecentActivities from '../components/dashboard/RecentActivities'
import AlertsPanel from '../components/dashboard/AlertsPanel'
import FinancialChart from '../components/dashboard/FinancialChart'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import TourOverlay from '../components/help/TourOverlay'

export default function Dashboard(): JSX.Element {
  const { stats, activities, alerts, financialData, loading, error, refresh } = useDashboard()
  const { isFirstVisit, setFirstVisit } = useHelp()
  const dashboardTour = useTour('dashboard')

  useEffect(() => {
    if (isFirstVisit && !loading && stats) {
      const t = setTimeout(() => {
        dashboardTour.startGuidedTour()
        setFirstVisit(false)
      }, 700)
      return () => clearTimeout(t)
    }
  }, [isFirstVisit, loading, stats, dashboardTour, setFirstVisit])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={refresh} />

  return (
    <div className="dashboard" data-tour="dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📊 Dashboard</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-info btn-sm" title="Take a tour" onClick={dashboardTour.startGuidedTour}>
            🎯 Tour
          </button>
          <button className="btn btn-outline-primary btn-sm" onClick={refresh}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div data-tour="stats-cards">{stats && <StatsCards stats={stats} />}</div>

      <div className="row mt-4">
        <div className="col-lg-8 mb-4" data-tour="financial-chart">
          {financialData && <FinancialChart data={financialData} />}
        </div>

        <div className="col-lg-4 mb-4" data-tour="alerts-panel">
          <AlertsPanel alerts={alerts} />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-lg-8 mb-4">
          <RecentActivities activities={activities} />
        </div>

        <div className="col-lg-4 mb-4" data-tour="quick-actions">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">⚡ Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link className="btn btn-primary" to="/hosts/new">
                  ➕ Add New Host
                </Link>
                <Link className="btn btn-outline-success" to="/hosts?filter=expiring">
                  ⚠️ Check Expiring Hosts
                </Link>
                <Link className="btn btn-outline-info" to="/transaction">
                  💰 View Transactions
                </Link>
                <Link className="btn btn-outline-warning" to="/subscription">
                  🔄 Manage Subscription
                </Link>
              </div>
            </div>
          </div>

          <div className="alert alert-light mt-4">
            <h6>💡 Getting Started Tips:</h6>
            <ul className="mb-0 small">
              <li>Add your first host using the <strong>"Add New Host"</strong> button</li>
              <li>Set up alerts to get notified before hosts expire</li>
              <li>Use teams to collaborate with colleagues</li>
              <li>Track expenses in the Transaction section</li>
              <li>Click the <strong>🎯 Tour</strong> button to learn more about each feature</li>
            </ul>
          </div>
        </div>
      </div>

      <TourOverlay />
    </div>
  )
}