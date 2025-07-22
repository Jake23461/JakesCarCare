import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('beforeAfter');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxType, setLightboxType] = useState('single'); // 'single' or 'beforeAfter'
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const openLightbox = (image, type = 'single') => {
    setLightboxImage(image);
    setLightboxType(type);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxType('single');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  };

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // Load gallery items from Firebase
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

  // Group items by category
  const groupedItems = galleryItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

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

        {/* Gallery Grid */}
        <div className="row g-4">
          {groupedItems[activeCategory]?.map((item) => (
            <div key={item.id} className="col-12 col-md-6 col-lg-4">
              {item.type === 'video' ? (
                // Video Item
                <div className="card border-0 shadow-lg bg-secondary-subtle overflow-hidden h-100">
                  <div className="position-relative">
                    <div className="ratio ratio-16x9">
                      <img 
                        src={item.poster || item.src} 
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
                    <p className="card-text text-muted">{item.description}</p>
                  </div>
                </div>
              ) : (
                // Image Item
                <div className="card border-0 shadow-lg bg-secondary-subtle overflow-hidden h-100">
                  <div className="position-relative">
                    <div className="ratio ratio-4x3">
                      <img 
                        src={item.thumb || item.src} 
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
                    <p className="card-text text-muted">{item.description}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
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
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-90 d-flex align-items-center justify-content-center"
          style={{ zIndex: 1000 }}
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="position-relative" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
                  <button
              className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
              onClick={closeLightbox}
              style={{ zIndex: 1001 }}
            ></button>
            
            {/* Content */}
            <div className="text-center">
              {lightboxType === 'video' ? (
                <div>
                  <video 
                    controls 
                    autoPlay 
                    style={{ maxHeight: '80vh', maxWidth: '90vw' }}
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
                <img 
                  src={lightboxImage.src} 
                  loading="lazy"
                  className="img-fluid" 
                  alt={lightboxImage.label} 
                  style={{ maxHeight: '80vh', objectFit: 'contain' }}
                />
              )}
              
              {/* Image Info */}
              {lightboxType !== 'video' && (
                <div className="mt-3 text-white">
                  <h4 className="text-primary">{lightboxImage.label}</h4>
                  <p className="text-muted">{lightboxImage.description}</p>
              </div>
          )}
        </div>
      </div>
        </div>
      )}
    </section>
  );
} 