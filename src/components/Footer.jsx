import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-4 mt-5 w-100 border-top border-danger" style={{letterSpacing: '0.01em'}}>
      <div className="container-fluid px-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center mb-3 mb-md-0">
          <img 
            src={import.meta.env.BASE_URL + 'gallery/Logo.png'} 
            alt="Jakes Car Care Logo" 
            style={{ height: 44, width: 44, objectFit: 'contain', marginRight: 12, filter: 'brightness(0) invert(1)' }}
          />
          <span className="fw-bold fs-6" style={{
            fontFamily: "'GoodTimes', 'Poppins', 'Segoe UI', sans-serif",
            background: 'linear-gradient(45deg, #fff, #dc3545)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none'
          }}>
            Jakes Car Care
          </span>
        </div>
        <div className="text-center small flex-grow-1 mb-3 mb-md-0">
          <div>
            <strong>Serving Roscommon, Longford & surrounding areas</strong>
          </div>
          <div>
            <Link to="/service-areas" className="text-info fw-semibold">See all service areas</Link>
          </div>
          <div>
            <span>See more photos & updates on our </span>
            <a href="https://www.facebook.com/profile.php?id=61560837419584" target="_blank" rel="noopener noreferrer" className="text-info fw-semibold">Facebook page</a>
            <span>!</span>
          </div>
          <div className="mt-2">
            © {new Date().getFullYear()} Jakes Car Care. All rights reserved.
          </div>
        </div>
        <div className="d-flex gap-3 justify-content-center">
          <a href="https://www.facebook.com/YOUR_FACEBOOK_PAGE" target="_blank" rel="noopener noreferrer" className="text-white-50 footer-social" aria-label="Facebook">
            <i className="bi bi-facebook fs-5"></i>
          </a>
          <a href="#" className="text-white-50 footer-social" aria-label="Instagram">
            <i className="bi bi-instagram fs-5"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
  