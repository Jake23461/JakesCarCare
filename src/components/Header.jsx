import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header({ onLeaveReview }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingScroll, setPendingScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to #services after navigation to home
  useEffect(() => {
    if (pendingScroll && location.pathname === '/') {
      const section = document.getElementById('services');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
      setPendingScroll(false);
    }
  }, [pendingScroll, location]);

  // Add smooth scroll and menu close for Services link
  const handleServicesClick = (e) => {
    e.preventDefault();
    // Close menu if open (for mobile)
    const navCollapse = document.getElementById('navbarNav');
    if (navCollapse && navCollapse.classList.contains('show')) {
      navCollapse.classList.remove('show');
    }
    setMenuOpen(false);
    if (location.pathname === '/') {
      const section = document.getElementById('services');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setPendingScroll(true);
      navigate('/');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3">
      <div className="container-fluid px-4">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          {/* Logo image */}
          <img 
            src={import.meta.env.BASE_URL + 'gallery/Logo.png'} 
            alt="Jakes Car Care Logo" 
            className="me-2"
            style={{ 
              height: 44, 
              width: 44, 
              filter: 'brightness(0) invert(1)' // Makes the logo white
            }}
          />
          <span 
            className="fw-bold fs-6"
            style={{
              fontFamily: "'GoodTimes', 'Poppins', 'Segoe UI', sans-serif",
              letterSpacing: '0.02em',
              background: 'linear-gradient(45deg, #ffffff, #dc3545)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none'
            }}
          >
            Jakes Car Care
          </span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="#services" onClick={handleServicesClick}>Services</a>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/service-areas">Service Areas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/blog">Blog</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#reviews" onClick={e => { e.preventDefault(); onLeaveReview(); }}>Reviews</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
  