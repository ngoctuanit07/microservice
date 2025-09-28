interface Activity {
  id: number
  action: string
  entityType: string
  entityId: number
  detail: string
  createdAt: string
  icon: string
  color: string
}

interface RecentActivitiesProps {
  activities: Activity[]
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">📈 Recent Activities</h5>
      </div>
      <div className="card-body">
        {activities.length === 0 ? (
          <div className="text-center text-muted py-3">
            <div className="fs-1">📭</div>
            <p>No recent activities</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {activities.map((activity) => (
              <div key={activity.id} className="list-group-item d-flex align-items-center px-0">
                <div className="me-3">
                  <span className="fs-5">{activity.icon}</span>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">
                        <span className={`badge bg-${activity.color} me-2`}>
                          {activity.action}
                        </span>
                        {activity.entityType}
                      </h6>
                      {activity.detail && (
                        <p className="mb-1 text-muted small">{activity.detail}</p>
                      )}
                    </div>
                    <small className="text-muted">{formatDate(activity.createdAt)}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}