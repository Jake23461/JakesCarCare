import React, { useState, useRef, useEffect } from 'react';

const services = [
  {
    title: 'Full Valet',
    desc: 'Complete transformation inside and out.',
    fullDesc: 'Complete transformation, inside and out. Price depends on vehicle size and condition. This comprehensive service includes everything needed to restore your vehicle to showroom condition.',
    features: [
      'Exterior shampoo and wax & interior deep clean',
      'Wheel cleaning & tire shine',
      'Window cleaning',
      'Full vacuum & dust removal',
      'Dashboard & console cleaning',
      'Leather/fabric treatment',
      'Air freshener service'
    ],
    price: '€90–€100',
    duration: '3-4 hours',
    image: '/gallery/FullValet.png',
  },
  {
    title: 'Exterior Only',
    desc: 'Full exterior wash and protection.',
    fullDesc: 'Full exterior wash and protection. No interior cleaning. Perfect for vehicles that need exterior attention while the interior is still in good condition.',
    features: [
      'Exterior shampoo and wax',
      'Wheel cleaning & tire shine',
      'Window cleaning',
      'Air freshener service'
    ],
    price: '€40',
    duration: '1-2 hours',
    image: '/gallery/Exterior.png',
  },
  {
    title: 'Interior Only',
    desc: 'Deep interior cleaning and restoration.',
    fullDesc: 'Deep interior cleaning and restoration. Restores your car\'s cabin to showroom condition. Ideal for vehicles with clean exteriors but dirty interiors.',
    features: [
      'Full vacuum & dust removal',
      'Dashboard & console cleaning',
      'Leather/fabric treatment',
      'Air freshener service'
    ],
    price: '€60',
    duration: '2-3 hours',
    image: '/gallery/Interior.png',
  },
  {
    title: 'Iron Fallout & Tar Remover',
    desc: 'Removes embedded particles for smoother finish.',
    fullDesc: 'Removes embedded iron particles and tar for a smoother, cleaner finish. Available as an add-on during booking for Exterior Only or Full Valet services. Safe for all paint types. Note: Requires an exterior wash first.',
    features: [
      'Iron fallout removal',
      'Tar spot removal',
      'Safe for all paint types',
      'Requires exterior wash first',
      'Available as add-on during booking'
    ],
    price: '+€20',
    duration: 'Add-on (30 min)',
    image: '/gallery/Tar.png',
    isAddon: true
  },
];

export default function Services({ onBookNow }) {
  const [expandedCards, setExpandedCards] = useState({});
  const detailsRefs = useRef([]);

  const toggleCard = (index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Close details when clicking outside
  useEffect(() => {
    function handleMouseDownOutside(event) {
      detailsRefs.current.forEach((ref, idx) => {
        if (ref && expandedCards[idx] && !ref.contains(event.target)) {
          setExpandedCards(prev => ({ ...prev, [idx]: false }));
        }
      });
    }
    if (Object.values(expandedCards).some(Boolean)) {
      document.addEventListener('mousedown', handleMouseDownOutside);
      return () => document.removeEventListener('mousedown', handleMouseDownOutside);
    }
  }, [expandedCards]);

  return (
    <section id="services" className="py-5 bg-dark w-100">
      <div className="container-fluid px-4">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-primary mb-3">Our Services & Pricing</h2>
          <p className="lead text-light mb-0">
            Choose from our range of professional valeting services, each designed to keep your vehicle in pristine condition. All prices are fixed and transparent.
          </p>
        </div>
        <div className="row g-4">
          {services.map((service, index) => (
            <div className="col-12 col-md-6" key={service.title}>
              <div className="position-relative">
                <div className="card h-100 shadow border-0 bg-secondary">
                  <div className="card-body d-flex flex-column align-items-center justify-content-center p-4 text-center">
                    <h3 className="h4 fw-bold text-primary mb-4">{service.title}</h3>
                    <div className="mb-4">
                      <svg width="80" height="80" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                      </svg>
                    </div>
                    <p className="text-light mb-3 text-center">{service.desc}</p>
                    <div className="mt-auto">
                      <div className="h4 fw-bold text-primary mb-2">{service.price}</div>
                      <div className="small text-light mb-3">{service.duration}</div>
                      <div className="d-flex flex-column gap-2">
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                          onClick={() => toggleCard(index)}
                        >
                          {expandedCards[index] ? 'Hide Details' : 'See Details'}
                        </button>
                        {service.isAddon ? (
                          <button
                            type="button"
                            className="btn btn-outline-secondary fw-semibold"
                            disabled
                            style={{ opacity: 0.7, cursor: 'not-allowed' }}
                          >
                            Add-on Only
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-outline-primary fw-semibold"
                            onClick={onBookNow}
                          >
                            Book Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Details Pop-out (always rendered for animation) */}
                  <div
                    ref={el => detailsRefs.current[index] = el}
                    className={`w-100 bg-secondary border border-primary rounded-bottom shadow-lg details-popout${expandedCards[index] ? ' details-popout-open' : ''}`}
                    style={{ marginTop: '1rem', zIndex: 10 }}
                  >
                    {expandedCards[index] && (
                      <div className="p-4">
                        <p className="text-light text-center mb-4">{service.fullDesc}</p>
                        <ul className="list-unstyled text-center">
                          {service.features.map((feature, i) => (
                            <li key={i} className="d-flex align-items-center justify-content-center mb-2 text-light">
                              <span className="badge bg-danger me-2" style={{ width: 8, height: 8, borderRadius: '50%' }}></span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated details popout styles */}
      <style jsx>{`
        .details-popout {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transform: translateY(-20px);
          transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s, transform 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .details-popout-open {
          max-height: 500px;
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}
  