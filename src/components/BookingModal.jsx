import Contact from './Contact';

export default function BookingModal({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-dark text-light">
          <div className="d-flex justify-content-end p-2">
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-0">
            <Contact isModal={true} onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
} 