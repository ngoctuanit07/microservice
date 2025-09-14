import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '@pages/LoginPage'
import Dashboard from '@pages/Dashboard'
import HostList from '@pages/hosts/HostList'
import HostForm from '@pages/hosts/HostForm'
import EditHost from '@pages/hosts/EditHost'
import ProtectedRoute from '@components/ProtectedRoute'
import Layout from '@components/Layout'
import OrganizationDashboard from '@pages/organization/OrganizationDashboard'
import CreateOrganization from '@pages/organization/CreateOrganization'
import EditOrganization from '@pages/organization/EditOrganization'
import OrganizationMembers from '@pages/organization/OrganizationMembers'
import SubscriptionManagement from '@pages/subscription/SubscriptionManagement'
import SubscriptionSuccess from '@pages/subscription/SubscriptionSuccess'
import EditSubscription from '@pages/subscription/EditSubscription'
import TeamList from '@pages/team/TeamList'
import CreateTeam from '@pages/team/CreateTeam'
import EditTeam from '@pages/team/EditTeam'
import KanbanBoard from '@pages/task/KanbanBoard'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
  { path: 'hosts', element: <HostList /> },
  { path: 'hosts/new', element: <HostForm /> },
  { path: 'hosts/:id/edit', element: <EditHost /> },
  // Team routes
  { path: 'team', element: <TeamList /> },
  { path: 'team/create', element: <CreateTeam /> },
  { path: 'team/:id/edit', element: <EditTeam /> },
      
      // Organization routes
  { path: 'organization', element: <OrganizationDashboard /> },
  { path: 'organization/create', element: <CreateOrganization /> },
  { path: 'organization/:id/edit', element: <EditOrganization /> },
  { path: 'organization/members', element: <OrganizationMembers /> },
      
      // Subscription routes
  { path: 'subscription', element: <SubscriptionManagement /> },
  { path: 'subscription/:id/edit', element: <EditSubscription /> },
  { path: 'subscription/success', element: <SubscriptionSuccess /> },
        // Task routes
      { path: 'task', element: <KanbanBoard /> },
    ]
  }
])

export default router
