import { useState, useRef } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';

export default function GalleryManager() {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('interiors');
  const [galleryItems, setGalleryItems] = useState([]);
  const fileInputRef = useRef(null);
  const storage = getStorage();
  const db = getFirestore();

  const categories = [
    { id: 'beforeAfter', name: 'Before & After' },
    { id: 'interiors', name: 'Interiors' },
    { id: 'exteriors', name: 'Exteriors' },
    { id: 'videos', name: 'Videos' }
  ];

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
        await uploadFile(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
    
    setUploading(false);
  };

  const uploadFile = async (file) => {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    if (!isImage && !isVideo) {
      alert('Please upload only images or videos.');
      return;
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;

    if (isImage) {
      // Compress/resize for full image
      const fullOptions = {
        maxWidthOrHeight: 1200,
        maxSizeMB: 1,
        useWebWorker: true,
      };
      const compressedFull = await imageCompression(file, fullOptions);

      // Compress/resize for thumbnail
      const thumbOptions = {
        maxWidthOrHeight: 300,
        maxSizeMB: 0.1,
        useWebWorker: true,
      };
      const compressedThumb = await imageCompression(file, thumbOptions);

      // Upload full image
      const fullRef = ref(storage, `gallery/full/${fileName}`);
      await uploadBytes(fullRef, compressedFull);
      const fullUrl = await getDownloadURL(fullRef);

      // Upload thumbnail
      const thumbRef = ref(storage, `gallery/thumbs/${fileName}`);
      await uploadBytes(thumbRef, compressedThumb);
      const thumbUrl = await getDownloadURL(thumbRef);

      // Create gallery item
      const galleryItem = {
        id: timestamp,
        src: fullUrl,
        thumb: thumbUrl,
        label: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        description: '',
        category: selectedCategory,
        type: 'image',
        fileName: fileName,
        uploadedAt: new Date().toISOString()
      };

      // Add to Firestore
      await addDoc(collection(db, 'gallery'), galleryItem);
      // Update local state
      setGalleryItems(prev => [...prev, galleryItem]);
      return;
    }

    // For videos, upload as before
    const storageRef = ref(storage, `gallery/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    const galleryItem = {
      id: timestamp,
      src: downloadURL,
      label: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      description: '',
      category: selectedCategory,
      type: 'video',
      fileName: fileName,
      uploadedAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'gallery'), galleryItem);
    setGalleryItems(prev => [...prev, galleryItem]);
  };

  const deleteItem = async (item) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // Delete from Firestore
        const querySnapshot = await getDocs(collection(db, 'gallery'));
        querySnapshot.forEach((doc) => {
          if (doc.data().id === item.id) {
            deleteDoc(doc.ref);
          }
        });
        
        // Update local state
        setGalleryItems(prev => prev.filter(i => i.id !== item.id));
      } catch (error) {
        console.error('Delete error:', error);
        alert('Delete failed. Please try again.');
      }
    }
  };

  const loadGalleryItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'gallery'));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });
      setGalleryItems(items);
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  return (
    <div className="container-fluid p-4">
      <h2 className="text-primary mb-4">Gallery Manager</h2>
      
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