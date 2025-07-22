import { useState, useEffect, useRef } from 'react';

const heroImages = [
  import.meta.env.BASE_URL + 'gallery/option1.jpg',
  import.meta.env.BASE_URL + 'gallery/option 4.jpg',
  import.meta.env.BASE_URL + 'gallery/option 3.jpg',
];

export default function Hero({ onBookNow }) {
  const [isVisible, setIsVisible] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    intervalRef.current = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000); // 4 seconds
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <section className="position-relative w-100" style={{ minHeight: '60vh', overflow: 'hidden' }}>
      {/* Carousel background images */}
      {heroImages.map((img, idx) => (
        <img
          key={img}
          src={img}
          alt="Car background"
          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover transition-opacity"
          style={{
            zIndex: 0,
            minHeight: '60vh',
            objectPosition: 'center',
            opacity: idx === bgIndex ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        />
      ))}
      {/* Dark overlay */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1, minHeight: '60vh' }} />
      {/* Content */}
      <div className="container position-relative d-flex flex-column justify-content-center align-items-center text-center" style={{ zIndex: 2, minHeight: '60vh' }}>
        <div className={`transition-opacity ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transition: 'opacity 1s ease-in-out' }}>
          <div className="mb-4">
            <img 
              src={import.meta.env.BASE_URL + 'gallery/Logo.png'} 
              alt="Jakes Car Care Logo" 
              className="img-fluid"
              style={{
                maxHeight: '400px',
                filter: 'drop-shadow(4px 4px 12px rgba(0,0,0,0.8))',
                transition: 'transform 0.3s ease',
                marginBottom: '1rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            />
          </div>
          <h2 
            className="fw-bold text-white mb-3"
            style={{
              fontFamily: "'Bebas Neue', 'Poppins', 'Segoe UI', sans-serif",
              background: 'linear-gradient(90deg, #ff512f 0%, #dd2476 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
              letterSpacing: '0.08em',
              lineHeight: '1.1',
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'
            }}
          >
            Jakes Car Care
          </h2>
          <p 
            className="lead text-light mb-3 px-3"
            style={{
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
              fontSize: '1.25rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Professional car valeting services at your doorstep
          </p>
          <div className="mb-4">
            <a 
              href="tel:0877665058"
              className="btn btn-outline-light btn-lg px-4 py-2 fw-semibold"
              style={{
                fontSize: '1.1rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: '2px solid white',
                borderRadius: '50px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#000';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              📞 Call 087 766 5058
            </a>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-lg px-5 py-3 fw-semibold shadow-lg"
          style={{
            fontSize: '1.1rem',
            letterSpacing: '0.02em',
            transition: 'all 0.3s ease',
            border: '2px solid transparent'
          }}
          onClick={onBookNow}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(220,53,69,0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
          }}
        >
          Book Now
        </button>
      </div>
    </section>
  );
}
  