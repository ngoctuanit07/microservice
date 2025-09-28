import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const dashboardApi = {
  getStats: () => axios.get(`${API_BASE}/dashboard/stats`),
  getRecentActivities: () => axios.get(`${API_BASE}/dashboard/recent-activities`),
  getAlerts: () => axios.get(`${API_BASE}/dashboard/alerts`),
  getFinancialOverview: () => axios.get(`${API_BASE}/dashboard/financial-overview`)
}