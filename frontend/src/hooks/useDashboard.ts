import { useState, useEffect } from 'react'
import { dashboardApi } from '../api/dashboardApi'

interface DashboardStats {
  hostsCount: number
  activeHosts: number
  expiringHosts: number
  expiredHosts: number
  totalTransactions: number
  pendingAlerts: number
  uptimePercentage: number
  healthStatus: 'excellent' | 'good' | 'needs-attention'
}

interface Activity {
  id: number
  action: string
  entityType: string
  entityId: number
  detail: string
  createdAt: string
  icon: string
  color: string
}

interface Alert {
  id: number
  type: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  host: string | null
  createdAt: string
  actionRequired: string
}

interface FinancialData {
  chartData: Array<{
    month: string
    income: number
    expense: number
    profit: number
  }>
  totalIncome: number
  totalExpense: number
  netProfit: number
  monthlyAverage: number
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, activitiesRes, alertsRes, financialRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentActivities(),
        dashboardApi.getAlerts(),
        dashboardApi.getFinancialOverview()
      ])

      setStats(statsRes.data)
      setActivities(activitiesRes.data)
      setAlerts(alertsRes.data)
      setFinancialData(financialRes.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data')
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    stats,
    activities,
    alerts,
    financialData,
    loading,
    error,
    refresh: fetchDashboardData
  }
}