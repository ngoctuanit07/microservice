import React from 'react'

type Props = {
  show: boolean
  title: React.ReactNode
  children?: React.ReactNode
  onClose: () => void
  onSave: () => void | Promise<void>
  saveLabel?: string
  saveDisabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function EntityModal({ show, title, children, onClose, onSave, saveLabel = 'Save', saveDisabled = false, size = 'md' }: Props) {
  if (!show) return null

  const dialogClass = size === 'lg' ? 'modal-dialog modal-lg' : size === 'sm' ? 'modal-dialog modal-sm' : 'modal-dialog'

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className={dialogClass} role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-primary" disabled={saveDisabled} onClick={() => void onSave()}>{saveDisabled ? '...' : saveLabel}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
