import { io, Socket } from 'socket.io-client'
import { create } from 'zustand'
import { toast } from 'react-toastify'

interface Notification {
  id: number
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  actionUrl?: string
  read?: boolean
}

interface Alert {
  id: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  message: string
  host?: string
  actionRequired: string
  timestamp: Date
}

interface NotificationState {
  socket: Socket | null
  connected: boolean
  notifications: Notification[]
  alerts: Alert[]
  unreadCount: number
  
  // Actions
  connect: (userId: number) => void
  disconnect: () => void
  addNotification: (notification: Notification) => void
  addAlert: (alert: Alert) => void
  markAsRead: (notificationId: number) => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  socket: null,
  connected: false,
  notifications: [],
  alerts: [],
  unreadCount: 0,

  connect: (userId: number) => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      query: { userId },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      console.log('Connected to notification server')
      set({ connected: true })
      
      // Join user-specific room
      socket.emit('join_user_room', { userId })
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from notification server')
      set({ connected: false })
    })

    socket.on('notification', (notification: Notification) => {
      const state = get()
      
      // Add to store
      state.addNotification(notification)
      
      // Show toast notification
      const toastType = notification.type === 'error' ? 'error' : 
                       notification.type === 'warning' ? 'warn' : 
                       notification.type === 'success' ? 'success' : 'info'
                       
      toast[toastType](`${notification.title}: ${notification.message}`, {
        onClick: notification.actionUrl ? 
          () => window.location.href = notification.actionUrl! : undefined
      })
    })

    socket.on('alert', (alert: Alert) => {
      const state = get()
      state.addAlert(alert)
      
      // Show urgent alert toast
      const toastType = alert.severity === 'critical' ? 'error' : 
                       alert.severity === 'high' ? 'warn' : 'info'
                       
      toast[toastType](`${alert.type}: ${alert.message}`, {
        autoClose: alert.severity === 'critical' ? false : 10000,
        closeOnClick: false,
      })
    })

    socket.on('host_status_update', (update: any) => {
      console.log('Host status update:', update)
      
      // You can emit this to other parts of your app that need host updates
      window.dispatchEvent(new CustomEvent('host-status-update', { detail: update }))
    })

    socket.on('system_message', (message: any) => {
      toast.info(`System: ${message.message}`, {
        autoClose: 10000,
      })
    })

    set({ socket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null, connected: false })
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50), // Keep last 50
      unreadCount: state.unreadCount + 1,
    }))
  },

  addAlert: (alert: Alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 20), // Keep last 20
    }))
  },

  markAsRead: (notificationId: number) => {
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },
}))

// Hook for easy usage
export const useNotifications = () => {
  const store = useNotificationStore()
  return store
}