import { useState, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TourStep {
  id: string
  target: string
  title: string
  content: string
  placement: 'top' | 'bottom' | 'left' | 'right'
  action?: () => void
}

interface HelpState {
  isFirstVisit: boolean
  completedTours: string[]
  showHelp: boolean
  currentTour: TourStep[] | null
  currentStepIndex: number
  
  // Actions
  setFirstVisit: (value: boolean) => void
  markTourCompleted: (tourId: string) => void
  startTour: (tour: TourStep[]) => void
  nextStep: () => void
  prevStep: () => void
  endTour: () => void
  toggleHelp: () => void
}

export const useHelpStore = create<HelpState>()(
  persist(
    (set, get) => ({
      isFirstVisit: true,
      completedTours: [],
      showHelp: false,
      currentTour: null,
      currentStepIndex: 0,

      setFirstVisit: (value: boolean) => set({ isFirstVisit: value }),

      markTourCompleted: (tourId: string) => {
        const { completedTours } = get()
        if (!completedTours.includes(tourId)) {
          set({ completedTours: [...completedTours, tourId] })
        }
      },

      startTour: (tour: TourStep[]) => {
        set({ 
          currentTour: tour, 
          currentStepIndex: 0, 
          showHelp: true 
        })
      },

      nextStep: () => {
        const { currentTour, currentStepIndex } = get()
        if (currentTour && currentStepIndex < currentTour.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 })
        } else {
          get().endTour()
        }
      },

      prevStep: () => {
        const { currentStepIndex } = get()
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 })
        }
      },

      endTour: () => {
        const { currentTour } = get()
        if (currentTour) {
          // Mark tour as completed (could use first step id as tour id)
          get().markTourCompleted(currentTour[0]?.id || 'default')
        }
        set({ 
          currentTour: null, 
          currentStepIndex: 0, 
          showHelp: false 
        })
      },

      toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),
    }),
    {
      name: 'help-store',
    }
  )
)

// Predefined tours
export const TOURS = {
  dashboard: [
    {
      id: 'dashboard-welcome',
      target: '[data-tour="dashboard"]',
      title: '🎉 Welcome to Your Dashboard!',
      content: 'This is your command center where you can see all your important information at a glance.',
      placement: 'bottom' as const,
    },
    {
      id: 'dashboard-stats',
      target: '[data-tour="stats-cards"]',
      title: '📊 Quick Stats',
      content: 'These cards show your most important metrics: total hosts, active hosts, and system health.',
      placement: 'bottom' as const,
    },
    {
      id: 'dashboard-chart',
      target: '[data-tour="financial-chart"]',
      title: '💰 Financial Overview',
      content: 'Track your income, expenses, and profits over time with this interactive chart.',
      placement: 'top' as const,
    },
    {
      id: 'dashboard-alerts',
      target: '[data-tour="alerts-panel"]',
      title: '🚨 Alerts & Notifications',
      content: 'Keep an eye on important alerts about your hosts, like expiration warnings.',
      placement: 'left' as const,
    },
    {
      id: 'dashboard-actions',
      target: '[data-tour="quick-actions"]',
      title: '⚡ Quick Actions',
      content: 'Use these buttons to quickly perform common tasks without navigating through menus.',
      placement: 'left' as const,
    },
  ],

  hosts: [
    {
      id: 'hosts-list',
      target: '[data-tour="hosts-table"]',
      title: '🖥️ Your Hosts',
      content: 'This table shows all your hosting accounts with their status, expiration dates, and actions.',
      placement: 'top' as const,
    },
    {
      id: 'hosts-add',
      target: '[data-tour="add-host-btn"]',
      title: '➕ Adding New Hosts',
      content: 'Click here to add a new hosting account. We\'ll guide you through the process.',
      placement: 'bottom' as const,
    },
    {
      id: 'hosts-filters',
      target: '[data-tour="hosts-filters"]',
      title: '🔍 Filter & Search',
      content: 'Use filters to quickly find hosts by status, expiration date, or search by name.',
      placement: 'bottom' as const,
    },
  ],

  notifications: [
    {
      id: 'notifications-center',
      target: '[data-tour="notification-center"]',
      title: '🔔 Notification Center',
      content: 'Click here to see all your notifications and alerts. The badge shows unread count.',
      placement: 'bottom' as const,
    },
    {
      id: 'notifications-realtime',
      target: '[data-tour="connection-status"]',
      title: '🟢 Real-time Updates',
      content: 'This indicator shows your connection status. You\'ll receive instant notifications when online.',
      placement: 'bottom' as const,
    },
  ],
}

// Hook for easy usage
export const useHelp = () => {
  const store = useHelpStore()
  return store
}

// Hook for guided tour
export const useTour = (tourName: keyof typeof TOURS) => {
  const { startTour, completedTours } = useHelp()
  
  const startGuidedTour = () => {
    const tour = TOURS[tourName]
    if (tour) {
      startTour(tour)
    }
  }

  const isCompleted = completedTours.includes(TOURS[tourName]?.[0]?.id || '')

  return {
    startGuidedTour,
    isCompleted,
  }
}