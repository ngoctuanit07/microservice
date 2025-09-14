import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { toast } from 'react-toastify'

// Create an API client instance
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Flag to prevent multiple concurrent refresh attempts
let isRefreshing = false
let failedQueue: { resolve: Function; reject: Function }[] = []

// Helper to process the queue of failed requests
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Add token to requests
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses and errors
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    
    // Check for specific error codes
    if (error.response?.status === 401) {
      // Unauthorized - handle token refresh or logout
      
      // Don't retry already retried requests or login requests
      if (originalRequest._retry || originalRequest.url === '/api/auth/login' || 
          originalRequest.url === '/api/auth/refresh') {
        // Clear auth and redirect to login if not already there
        localStorage.removeItem('token')
        if (!location.pathname.startsWith('/login')) {
          location.href = '/login'
        }
        return Promise.reject(error)
      }

      // Try to refresh the token if not already refreshing
      if (!isRefreshing) {
        isRefreshing = true
        originalRequest._retry = true

        try {
          const { data } = await http.post('/auth/refresh')
          const newToken = data.access_token
          
          localStorage.setItem('token', newToken)
          http.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
          
          // Process any queued requests with the new token
          processQueue(null, newToken)
          
          // Retry the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return http(originalRequest)
        } catch (refreshError) {
          // Token refresh failed, clear auth and redirect
          processQueue(new Error('Refresh failed'), null)
          localStorage.removeItem('token')
          
          if (!location.pathname.startsWith('/login')) {
            location.href = '/login'
          }
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return http(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }
    } 
    
    // Handle other common errors
    if (error.response?.status === 403) {
      toast.error('You do not have permission to access this resource')
    } else if (error.response?.status === 404) {
      toast.error('Resource not found')
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.')
    } else if (!error.response && error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please check your connection.')
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.')
    }
    
    return Promise.reject(error)
  }
)
