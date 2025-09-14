import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '@pages/LoginPage'
import Dashboard from '@pages/Dashboard'
import HostList from '@pages/hosts/HostList'
import HostForm from '@pages/hosts/HostForm'
import ProtectedRoute from '@components/ProtectedRoute'
import Layout from '@components/Layout'
import OrganizationDashboard from '@pages/organization/OrganizationDashboard'
import CreateOrganization from '@pages/organization/CreateOrganization'
import OrganizationMembers from '@pages/organization/OrganizationMembers'
import SubscriptionManagement from '@pages/subscription/SubscriptionManagement'
import SubscriptionSuccess from '@pages/subscription/SubscriptionSuccess'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'hosts', element: <HostList /> },
      { path: 'hosts/:id', element: <HostForm /> }, // id = "new" | number
      
      // Organization routes
      { path: 'organization', element: <OrganizationDashboard /> },
      { path: 'organization/create', element: <CreateOrganization /> },
      { path: 'organization/members', element: <OrganizationMembers /> },
      
      // Subscription routes
      { path: 'subscription', element: <SubscriptionManagement /> },
      { path: 'subscription/success', element: <SubscriptionSuccess /> },
    ]
  }
])

export default router
