import { useState, useRef, useEffect } from 'react';

export default function LocalGalleryManager() {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('interiors');
  const [galleryItems, setGalleryItems] = useState([]);
  const fileInputRef = useRef(null);

  const categories = [
    { id: 'beforeAfter', name: 'Before & After' },
    { id: 'interiors', name: 'Interiors' },
    { id: 'exteriors', name: 'Exteriors' },
    { id: 'videos', name: 'Videos' }
  ];

  // Load items on component mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);
    
    try {
      for (let file of files) {
        await processFile(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
    
    setUploading(false);
  };

  const processFile = async (file) => {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    if (!isImage && !isVideo) {
      alert('Please upload only images or videos.');
      return;
    }

    // Create a preview URL for the file
    const previewURL = URL.createObjectURL(file);
    
    // Create gallery item
    const galleryItem = {
      id: Date.now() + Math.random(),
      src: previewURL,
      label: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      description: '',
      category: selectedCategory,
      type: isVideo ? 'video' : 'image',
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      file: file // Store the actual file for later use
    };

    // Add to local state
    setGalleryItems(prev => {
      const newItems = [...prev, galleryItem];
      saveToLocalStorage(newItems);
      return newItems;
    });
  };

  const saveToLocalStorage = (items) => {
    try {
      localStorage.setItem('galleryItems', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('galleryItems');
      if (saved) {
        setGalleryItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  const deleteItem = (item) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      // Remove from local state
      const updatedItems = galleryItems.filter(i => i.id !== item.id);
      setGalleryItems(updatedItems);
      
      // Update localStorage
      saveToLocalStorage(updatedItems);
      
      // Revoke the object URL to free memory
      if (item.src && item.src.startsWith('blob:')) {
        URL.revokeObjectURL(item.src);
      }
    }
  };

  return (
    <div className="container-fluid p-4">
      <h2 className="text-primary mb-4">Local Gallery Manager (Development Mode)</h2>
      <div className="alert alert-info">
        <strong>Note:</strong> This is a local version that stores files in your browser. 
        Files will be lost when you clear browser data. For permanent storage, we need to resolve the Firebase CORS issue.
      </div>
      
      {/* Category Selection */}
      <div className="row mb-4">
        <div className="col-12">
          <label className="form-label">Select Category:</label>
          <div className="d-flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category.id}
                className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            className={`border-2 border-dashed rounded p-5 text-center ${
              dragActive ? 'border-primary bg-primary-subtle' : 'border-secondary'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{ minHeight: '200px' }}
          >
            <div className="d-flex flex-column align-items-center justify-content-center h-100">
              <i className="bi bi-cloud-upload fs-1 text-muted mb-3"></i>
              <h4>Drag & Drop Files Here</h4>
              <p className="text-muted">or</p>
              <button
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Choose Files'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                style={{ display: 'none' }}
              />
              <small className="text-muted mt-2">
                Supported: JPG, PNG, GIF, MP4, WebM
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Items */}
      <div className="row">
        <div className="col-12">
          <h4>Current Items in {categories.find(c => c.id === selectedCategory)?.name}</h4>
          <div className="row g-3">
            {galleryItems
              .filter(item => item.category === selectedCategory)
              .map(item => (
                <div key={item.id} className="col-md-4 col-lg-3">
                  <div className="card h-100">
                    {item.type === 'video' ? (
                      <div className="ratio ratio-16x9">
                        <video
                          src={item.src}
                          className="card-img-top"
                          style={{ objectFit: 'cover' }}
                          muted
                        />
                      </div>
                    ) : (
                      <div className="ratio ratio-4x3">
                        <img
                          src={item.src}
                          className="card-img-top"
                          alt={item.label}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </div>
                    )}
                    <div className="card-body">
                      <h6 className="card-title">{item.label}</h6>
                      <p className="card-text small text-muted">
                        {new Date(item.uploadedAt).toLocaleDateString()}
                      </p>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteItem(item)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
} 