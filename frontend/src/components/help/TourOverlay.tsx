import React, { useEffect, useRef, useState } from 'react'
import { useHelp } from '../../store/help'

export default function TourOverlay() {
  const { 
    currentTour, 
    currentStepIndex, 
    showHelp, 
    nextStep, 
    prevStep, 
    endTour 
  } = useHelp()
  
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const currentStep = currentTour?.[currentStepIndex]

  useEffect(() => {
    if (currentStep && showHelp) {
      const updatePosition = () => {
        const targetElement = document.querySelector(currentStep.target)
        if (targetElement && tooltipRef.current) {
          const rect = targetElement.getBoundingClientRect()
          const tooltipRect = tooltipRef.current.getBoundingClientRect()
          
          let top = 0
          let left = 0

          switch (currentStep.placement) {
            case 'top':
              top = rect.top - tooltipRect.height - 10
              left = rect.left + (rect.width / 2) - (tooltipRect.width / 2)
              break
            case 'bottom':
              top = rect.bottom + 10
              left = rect.left + (rect.width / 2) - (tooltipRect.width / 2)
              break
            case 'left':
              top = rect.top + (rect.height / 2) - (tooltipRect.height / 2)
              left = rect.left - tooltipRect.width - 10
              break
            case 'right':
              top = rect.top + (rect.height / 2) - (tooltipRect.height / 2)
              left = rect.right + 10
              break
          }

          // Ensure tooltip stays within viewport
          const padding = 10
          top = Math.max(padding, Math.min(window.innerHeight - tooltipRect.height - padding, top))
          left = Math.max(padding, Math.min(window.innerWidth - tooltipRect.width - padding, left))

          setTooltipPosition({ top, left })
        }
      }

      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition)

      return () => {
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition)
      }
    }
  }, [currentStep, showHelp])

  const highlightTarget = () => {
    if (currentStep) {
      const targetElement = document.querySelector(currentStep.target)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Add highlight class temporarily
        targetElement.classList.add('tour-highlight')
        setTimeout(() => {
          targetElement.classList.remove('tour-highlight')
        }, 2000)
      }
    }
  }

  useEffect(() => {
    highlightTarget()
  }, [currentStepIndex])

  if (!currentTour || !currentStep || !showHelp) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
        style={{ 
          opacity: 0.3, 
          zIndex: 9998,
          pointerEvents: 'none'
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="position-fixed bg-white border rounded shadow-lg p-3"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          zIndex: 9999,
          maxWidth: '350px',
          minWidth: '250px'
        }}
      >
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="mb-0 text-primary">{currentStep.title}</h6>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={endTour}
            title="Close tour"
          >
            ✕
          </button>
        </div>

        <p className="mb-3 small">{currentStep.content}</p>

        <div className="d-flex justify-content-between align-items-center">
          <div className="small text-muted">
            Step {currentStepIndex + 1} of {currentTour.length}
          </div>

          <div className="btn-group btn-group-sm">
            <button 
              className="btn btn-outline-secondary"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
            >
              Previous
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (currentStep.action) {
                  currentStep.action()
                }
                nextStep()
              }}
            >
              {currentStepIndex === currentTour.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-3">
          <div className="progress" style={{ height: '3px' }}>
            <div 
              className="progress-bar bg-primary"
              style={{ 
                width: `${((currentStepIndex + 1) / currentTour.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Arrow pointing to target */}
        <div
          className="position-absolute bg-white border"
          style={{
            width: '12px',
            height: '12px',
            transform: 'rotate(45deg)',
            ...(currentStep.placement === 'top' && {
              bottom: '-6px',
              left: '50%',
              marginLeft: '-6px',
              borderTop: 'none',
              borderLeft: 'none'
            }),
            ...(currentStep.placement === 'bottom' && {
              top: '-6px',
              left: '50%',
              marginLeft: '-6px',
              borderBottom: 'none',
              borderRight: 'none'
            }),
            ...(currentStep.placement === 'left' && {
              right: '-6px',
              top: '50%',
              marginTop: '-6px',
              borderTop: 'none',
              borderRight: 'none'
            }),
            ...(currentStep.placement === 'right' && {
              left: '-6px',
              top: '50%',
              marginTop: '-6px',
              borderBottom: 'none',
              borderLeft: 'none'
            })
          }}
        />
      </div>

      {/* Custom CSS for highlighting */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 9997 !important;
          box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.5) !important;
          border-radius: 4px !important;
          animation: pulse 2s ease-in-out;
        }
        
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(0, 123, 255, 0.3); }
        }
      `}</style>
    </>
  )
}