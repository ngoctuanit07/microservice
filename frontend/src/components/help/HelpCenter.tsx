import { useState } from 'react'
import { useHelp, useTour } from '../../store/help'

export default function HelpCenter() {
  const { toggleHelp, showHelp } = useHelp()
  const [showDropdown, setShowDropdown] = useState(false)
  
  const dashboardTour = useTour('dashboard')
  const hostsTour = useTour('hosts')
  const notificationsTour = useTour('notifications')

  const faqs = [
    {
      q: "How do I add a new host?",
      a: "Click on 'Add New Host' from the dashboard or navigate to Hosts > Add Host. Fill in the required information including IP, port, and credentials."
    },
    {
      q: "What happens when a host expires?",
      a: "You'll receive notifications starting 7 days before expiration. The host status will change to 'EXPIRED' and you'll need to renew it to continue monitoring."
    },
    {
      q: "How do notifications work?",
      a: "Real-time notifications appear in the notification center and as toast messages. You'll be notified about host expiration, downtime, and system alerts."
    },
    {
      q: "Can I export my data?",
      a: "Yes! You can export your hosts data, transaction history, and reports from their respective sections."
    },
    {
      q: "How do I manage team access?",
      a: "Go to Teams section to create teams and assign hosts. Team members will have access to assigned hosts based on their role."
    }
  ]

  return (
    <div className="position-relative">
      <button
        className="btn btn-outline-info btn-sm"
        onClick={() => setShowDropdown(!showDropdown)}
        title="Help & Support"
      >
        ❓ Help
      </button>

      {showDropdown && (
        <div
          className="dropdown-menu dropdown-menu-end show position-absolute"
          style={{ 
            minWidth: '400px', 
            maxHeight: '500px', 
            overflowY: 'auto', 
            top: '100%', 
            right: 0, 
            zIndex: 1050 
          }}
        >
          <div className="dropdown-header">
            <h6 className="mb-0">❓ Help & Support</h6>
          </div>

          <div className="dropdown-divider"></div>

          {/* Guided Tours */}
          <div className="px-3 py-2">
            <h6 className="small text-muted mb-2">🎯 GUIDED TOURS</h6>
            
            <div className="d-grid gap-1">
              <button
                className="btn btn-sm btn-outline-primary d-flex justify-content-between align-items-center"
                onClick={() => {
                  dashboardTour.startGuidedTour()
                  setShowDropdown(false)
                }}
              >
                <span>📊 Dashboard Tour</span>
                {dashboardTour.isCompleted && <span className="badge bg-success">✓</span>}
              </button>
              
              <button
                className="btn btn-sm btn-outline-primary d-flex justify-content-between align-items-center"
                onClick={() => {
                  hostsTour.startGuidedTour()
                  setShowDropdown(false)
                }}
              >
                <span>🖥️ Hosts Management</span>
                {hostsTour.isCompleted && <span className="badge bg-success">✓</span>}
              </button>
              
              <button
                className="btn btn-sm btn-outline-primary d-flex justify-content-between align-items-center"
                onClick={() => {
                  notificationsTour.startGuidedTour()
                  setShowDropdown(false)
                }}
              >
                <span>🔔 Notifications</span>
                {notificationsTour.isCompleted && <span className="badge bg-success">✓</span>}
              </button>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* Quick Help */}
          <div className="px-3 py-2">
            <h6 className="small text-muted mb-2">🚀 QUICK START</h6>
            <div className="small">
              <div className="mb-2">
                <strong>1. Add Your First Host</strong><br/>
                <span className="text-muted">Click "Add New Host" to start monitoring</span>
              </div>
              <div className="mb-2">
                <strong>2. Set Up Notifications</strong><br/>
                <span className="text-muted">Configure alerts for expiration reminders</span>
              </div>
              <div className="mb-2">
                <strong>3. Organize with Teams</strong><br/>
                <span className="text-muted">Create teams for collaboration</span>
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* FAQ Accordion */}
          <div className="px-3 py-2">
            <h6 className="small text-muted mb-2">❓ FREQUENTLY ASKED</h6>
            <div className="accordion accordion-flush" id="helpAccordion">
              {faqs.slice(0, 3).map((faq, index) => (
                <div key={index} className="accordion-item border-0">
                  <h6 className="accordion-header">
                    <button
                      className="accordion-button collapsed py-2 px-0 small"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#faq${index}`}
                    >
                      {faq.q}
                    </button>
                  </h6>
                  <div
                    id={`faq${index}`}
                    className="accordion-collapse collapse"
                    data-bs-parent="#helpAccordion"
                  >
                    <div className="accordion-body py-2 px-0 small text-muted">
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* Contact Support */}
          <div className="px-3 py-2">
            <h6 className="small text-muted mb-2">📞 SUPPORT</h6>
            <div className="d-grid gap-1">
              <a 
                href="mailto:support@example.com" 
                className="btn btn-sm btn-outline-secondary"
              >
                📧 Email Support
              </a>
              <a 
                href="#" 
                className="btn btn-sm btn-outline-secondary"
                onClick={(e) => {
                  e.preventDefault()
                  window.open('https://your-docs.com', '_blank')
                }}
              >
                📚 Documentation
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1040 }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}