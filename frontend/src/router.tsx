import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '@pages/LoginPage'
import Dashboard from '@pages/Dashboard'
import HostList from '@pages/hosts/HostList'
import HostForm from '@pages/hosts/HostForm'
import ProtectedRoute from '@components/ProtectedRoute'
import Layout from '@components/Layout'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'hosts', element: <HostList /> },
      { path: 'hosts/:id', element: <HostForm /> } // id = "new" | number
    ]
  }
])

export default router
