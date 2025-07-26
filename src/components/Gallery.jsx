import { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('beforeAfter');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxType, setLightboxType] = useState('single'); // 'single' or 'beforeAfter'
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const lightboxRef = useRef(null);
  const touchStartX = useRef(null);

  const openLightbox = (image, type = 'single') => {
    setLightboxImage(image);
    setLightboxType(type);
    if (type !== 'video') {
      const idx = imagesInCategory.findIndex(img => img.id === image.id);
      setLightboxIndex(idx);
    } else {
      setLightboxIndex(null);
    }
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxType('single');
    setLightboxIndex(null);
  };

  const showPrevImage = () => {
    if (lightboxIndex === null || imagesInCategory.length === 0) return;
    const prevIdx = (lightboxIndex - 1 + imagesInCategory.length) % imagesInCategory.length;
    setLightboxImage(imagesInCategory[prevIdx]);
    setLightboxIndex(prevIdx);
  };
  const showNextImage = () => {
    if (lightboxIndex === null || imagesInCategory.length === 0) return;
    const nextIdx = (lightboxIndex + 1) % imagesInCategory.length;
    setLightboxImage(imagesInCategory[nextIdx]);
    setLightboxIndex(nextIdx);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft' && lightboxType !== 'video') {
      showPrevImage();
    } else if (e.key === 'ArrowRight' && lightboxType !== 'video') {
      showNextImage();
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
    }
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        showPrevImage();
      } else {
        showNextImage();
      }
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    loadGalleryItems();
  }, []);

  const loadGalleryItems = async () => {
    try {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'gallery'));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setGalleryItems(items);
    } catch (error) {
      console.error('Error loading gallery items:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedItems = galleryItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Sort items by order within each category
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category].sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  const imagesInCategory = groupedItems[activeCategory]?.filter(item => item.type !== 'video') || [];

  useEffect(() => {
    if (lightboxImage && lightboxType !== 'video' && lightboxRef.current) {
      lightboxRef.current.focus();
    }
  }, [lightboxImage, lightboxType]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setCurrentSlide(0); // Reset to first slide when changing category
  };

  const nextSlide = () => {
    const categoryItems = groupedItems[activeCategory] || [];
    const totalSlides = Math.ceil(categoryItems.length / 3);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    const categoryItems = groupedItems[activeCategory] || [];
    const totalSlides = Math.ceil(categoryItems.length / 3);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const categories = [
    { id: 'beforeAfter', name: 'Before & After' },
    { id: 'interiors', name: 'Interiors' },
    { id: 'exteriors', name: 'Exteriors' },
    { id: 'videos', name: 'Videos' }
  ];

  if (loading) {
    return (
      <section className="py-5 bg-dark text-light w-100">
        <div className="container-fluid px-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading gallery...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5 bg-dark text-light w-100">
      <div className="container-fluid px-4">
        <h2 className="display-6 fw-bold text-primary text-center mb-5">Gallery</h2>
        
        {/* Category Navigation */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-lg-8">
            <div className="d-flex justify-content-center flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`btn ${activeCategory === category.id ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleCategoryChange(category.id)}
                  style={{ 
                    minWidth: '120px',
                    margin: '2px',
                    position: 'relative',
                    zIndex: 10
                  }}
                >
                  {category.name}
                </button>
              ))}
                          </div>
                          </div>
                        </div>

        {/* Gallery Carousel */}
        <div className="position-relative">
          <div className="row g-4">
            {groupedItems[activeCategory]?.slice(currentSlide * 3, (currentSlide + 1) * 3).map((item) => (
              <div key={item.id} className="col-12 col-md-6 col-lg-4">
                {item.type === 'video' ? (
                  // Video Item
                  <div className="card border-0 shadow-lg overflow-hidden h-100" style={{
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div className="position-relative">
                      <div className="ratio ratio-16x9">
                        <img 
                          src={item.poster ? import.meta.env.BASE_URL + item.poster.replace(/^\//, '') : item.src.startsWith('http') ? item.src : import.meta.env.BASE_URL + item.src.replace(/^\//, '')} 
                          className="w-100 h-100" 
                          alt={item.label} 
                          style={{ objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => openLightbox(item, 'video')}
                        />
                      </div>
                      {/* Play Button Overlay */}
                      <div className="position-absolute top-50 start-50 translate-middle text-center">
                        <div className="bg-dark bg-opacity-75 text-white rounded-circle d-flex align-items-center justify-content-center"
                             style={{ width: '60px', height: '60px', cursor: 'pointer' }}
                             onClick={() => openLightbox(item, 'video')}>
                          <span className="fs-4">▶</span>
                        </div>
                      </div>
                      {/* Duration Badge */}
                      {item.duration && (
                        <div className="position-absolute bottom-0 end-0 m-2">
                          <span className="badge bg-dark bg-opacity-75">{item.duration}</span>
                        </div>
                      )}
                    </div>
                    <div className="card-body">
                      <h5 className="card-title text-primary">{item.label}</h5>
                      <p className="card-text text-light" style={{ opacity: 0.9 }}>{item.description}</p>
                    </div>
                  </div>
                ) : (
                  // Image Item
                  <div className="card border-0 shadow-lg overflow-hidden h-100" style={{
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div className="position-relative">
                      <div className="ratio ratio-4x3">
                        <img 
                          src={item.thumb ? import.meta.env.BASE_URL + item.thumb.replace(/^\//, '') : item.src.startsWith('http') ? item.src : import.meta.env.BASE_URL + item.src.replace(/^\//, '')} 
                          loading="lazy"
                          className="w-100 h-100" 
                          alt={item.label} 
                          style={{ objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => openLightbox(item, 'single')}
                        />
                      </div>
                      <div className="position-absolute top-50 start-50 translate-middle text-center">
                        <div className="bg-dark bg-opacity-75 text-white py-1 px-3 rounded">
                          <small>Click to expand</small>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title text-primary">{item.label}</h5>
                      <p className="card-text text-light" style={{ opacity: 0.9 }}>{item.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Carousel Navigation */}
          {groupedItems[activeCategory] && groupedItems[activeCategory].length > 3 && (
            <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
              <button
                className="btn btn-outline-primary"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                style={{ minWidth: '50px' }}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <div className="d-flex gap-1">
                {Array.from({ length: Math.ceil((groupedItems[activeCategory]?.length || 0) / 3) }).map((_, index) => (
                  <button
                    key={index}
                    className={`btn btn-sm ${currentSlide === index ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setCurrentSlide(index)}
                    style={{ width: '12px', height: '12px', borderRadius: '50%', padding: 0 }}
                  >
                  </button>
                ))}
              </div>
              <button
                className="btn btn-outline-primary"
                onClick={nextSlide}
                disabled={currentSlide === Math.ceil((groupedItems[activeCategory]?.length || 0) / 3) - 1}
                style={{ minWidth: '50px' }}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </div>

        {/* Show message if no items in category */}
        {(!groupedItems[activeCategory] || groupedItems[activeCategory].length === 0) && (
          <div className="text-center py-5">
            <p className="text-muted">No items in this category yet.</p>
            <p className="text-muted small">Add some images or videos through the admin panel!</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ 
            zIndex: 1000,
            background: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(5px)'
          }}
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          ref={lightboxRef}
          onTouchStart={lightboxType !== 'video' ? handleTouchStart : undefined}
          onTouchEnd={lightboxType !== 'video' ? handleTouchEnd : undefined}
        >
          <div className="position-relative" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              className="position-absolute top-0 end-0 m-3"
              onClick={closeLightbox}
              style={{ 
                zIndex: 1001,
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(128,128,128,0.5)',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(220,53,69,0.8)';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.border = '1px solid rgba(128,128,128,0.7)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0,0,0,0.6)';
                e.target.style.transform = 'scale(1)';
                e.target.style.border = '1px solid rgba(128,128,128,0.5)';
              }}
            >
              ✕
            </button>
            {/* Left/Right Arrows for images */}
            {lightboxType !== 'video' && imagesInCategory.length > 1 && (
              <>
                <button
                  className="position-absolute top-50 start-0 translate-middle-y ms-3"
                  style={{ 
                    zIndex: 1001, 
                    fontSize: '2rem', 
                    padding: '1rem 0.75rem',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(128,128,128,0.5)',
                    borderRadius: '50%',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                  onClick={showPrevImage}
                  aria-label="Previous image"
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,81,47,0.8)';
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.border = '1px solid rgba(128,128,128,0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0,0,0,0.6)';
                    e.target.style.transform = 'scale(1)';
                    e.target.style.border = '1px solid rgba(128,128,128,0.5)';
                  }}
                >
                  &#8592;
                </button>
                <button
                  className="position-absolute top-50 end-0 translate-middle-y me-3"
                  style={{ 
                    zIndex: 1001, 
                    fontSize: '2rem', 
                    padding: '1rem 0.75rem',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(128,128,128,0.5)',
                    borderRadius: '50%',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                  onClick={showNextImage}
                  aria-label="Next image"
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,81,47,0.8)';
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.border = '1px solid rgba(128,128,128,0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0,0,0,0.6)';
                    e.target.style.transform = 'scale(1)';
                    e.target.style.border = '1px solid rgba(128,128,128,0.5)';
                  }}
                >
                  &#8594;
                </button>
              </>
            )}
            {/* Content */}
            <div className="text-center">
              {lightboxType === 'video' ? (
                <div>
                  <video 
                    controls 
                    autoPlay 
                    style={{ 
                      maxHeight: '80vh', 
                      maxWidth: '90vw',
                      borderRadius: '8px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}
                    poster={lightboxImage.poster}
                  >
                    <source src={lightboxImage.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="mt-3 text-white">
                    <h4 className="text-primary">{lightboxImage.label}</h4>
                    <p className="text-muted">{lightboxImage.description}</p>
                    {lightboxImage.duration && (
                      <span className="badge bg-primary">{lightboxImage.duration}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  maxHeight: '80vh',
                  maxWidth: '90vw'
                }}>
                  <img 
                    src={lightboxImage.src} 
                    loading="lazy"
                    alt={lightboxImage.label} 
                    style={{ 
                      maxHeight: '80vh', 
                      maxWidth: '90vw',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      border: 'none'
                    }}
                  />
                </div>
              )}
              
              {/* Image Info */}
              {lightboxType !== 'video' && (
                <div className="mt-4 text-white" style={{
                  background: 'rgba(0,0,0,0.7)',
                  padding: '1rem 1.5rem',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  <h4 className="text-primary mb-2" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    {lightboxImage.label}
                  </h4>
                  {lightboxImage.description && (
                    <p className="text-light mb-0" style={{ fontSize: '1rem', opacity: 0.9 }}>
                      {lightboxImage.description}
                    </p>
                  )}
              </div>
          )}
        </div>
      </div>
        </div>
      )}
    </section>
  );
} 