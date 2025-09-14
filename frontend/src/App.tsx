import { RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import router from './router'
import { useEffect } from 'react'
import { useAuth } from '@store/auth'

export default function App() {
  const refreshToken = useAuth(state => state.refreshToken)
  
  // Set up a periodic token refresh check
  useEffect(() => {
    // Initial token check
    refreshToken()
    
    // Check token every 5 minutes
    const interval = setInterval(() => {
      refreshToken()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [refreshToken])
  
  return (
    <div className="container py-4">
      <RouterProvider router={router} />
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}
