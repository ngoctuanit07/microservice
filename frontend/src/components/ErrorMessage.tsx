interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="alert alert-danger d-flex align-items-center" role="alert">
      <div className="me-3">
        <span className="fs-4">⚠️</span>
      </div>
      <div className="flex-grow-1">
        <h6 className="alert-heading">Error Loading Data</h6>
        <p className="mb-2">{message}</p>
        {onRetry && (
          <button className="btn btn-danger btn-sm" onClick={onRetry}>
            🔄 Try Again
          </button>
        )}
      </div>
    </div>
  )
}