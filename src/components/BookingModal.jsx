import Contact from './Contact';

export default function BookingModal({ show, onClose, onLeaveReview }) {
  if (!show) return null;
  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-dark text-light">
          <div className="d-flex justify-content-end p-2">
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-0">
            <Contact isModal={true} onClose={onClose} onLeaveReview={onLeaveReview} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable confirmation modal for destructive actions
export function ConfirmModal({ show, onConfirm, onCancel, title = 'Are you sure?', message = '', confirmText = 'Yes', cancelText = 'Cancel' }) {
  if (!show) return null;
  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 2000 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-light border-0 shadow-lg">
          <div className="modal-header border-0">
            <h5 className="modal-title text-danger">{title}</h5>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer border-0 d-flex justify-content-end gap-2">
            <button className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
            <button className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
} 