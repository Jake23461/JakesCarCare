import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp, query, orderBy, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ConfirmModal } from './BookingModal';

export default function Admin() {
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'reviews' or 'gallery'
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    name: '',
    phone: '',
    email: '',
    eircode: '',
    service: '',
    date: '',
    time: '',
    message: '',
    ironFalloutAddon: false
  });
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  const [updatingBooking, setUpdatingBooking] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [useLocalStorage, setUseLocalStorage] = useState(true); // Toggle for local vs Firebase storage

  // Gallery management states
  const [newItem, setNewItem] = useState({
    category: 'interiors',
    label: '',
    description: '',
    type: 'single' // 'single', 'beforeAfter', 'video'
  });

  // Enhanced gallery management states
  const [editingItem, setEditingItem] = useState(null);
  const [editingBookingPrice, setEditingBookingPrice] = useState(null);

  const SERVICES = ['Full Valet', 'Exterior Only', 'Interior Only'];
  const AVAILABLE_TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  // State for confirmation modal
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    action: null, // 'deleteBooking', 'deleteReview', 'deleteGalleryItem'
    id: null,
    extra: null, // for gallery: fileName
    message: '',
  });

  useEffect(() => {
    fetchBookings();
    fetchReviews();
    fetchGalleryItems();
  }, []);

  const fetchBookings = async () => {
    try {
      console.log('Fetching bookings...');
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, orderBy('created', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const bookingsData = [];
      querySnapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('Fetched bookings:', bookingsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const reviewsData = [];
      querySnapshot.forEach((doc) => {
        reviewsData.push({ id: doc.id, ...doc.data() });
      });
      
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'gallery'));
      const itemsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGalleryItems(itemsData);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'bookings'), {
        ...newBooking,
        created: Timestamp.now(),
        adminCreated: true
      });
      setNewBooking({
        name: '',
        phone: '',
        email: '',
        eircode: '',
        service: '',
        date: '',
        time: '',
        message: '',
        ironFalloutAddon: false
      });
      setShowCreateForm(false);
      fetchBookings();
    } catch (err) {
      console.error('Error creating booking:', err);
    }
  };

  const handleCancelBooking = (bookingId) => {
    setConfirmModal({
      show: true,
      action: 'deleteBooking',
      id: bookingId,
      message: 'Are you sure you want to delete this booking? This cannot be undone.',
    });
  };

  const handleApproveReview = async (reviewId) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        approved: true
      });
      fetchReviews();
    } catch (err) {
      console.error('Error approving review:', err);
    }
  };

  const handleRejectReview = (reviewId) => {
    setConfirmModal({
      show: true,
      action: 'deleteReview',
      id: reviewId,
      message: 'Are you sure you want to delete this review? This cannot be undone.',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB');
  };

  const getServicePrice = (service, ironFalloutAddon, customPrice = null) => {
    if (customPrice !== null) {
      return `€${customPrice}`;
    }
    const prices = {
      'Full Valet': '€90–€100',
      'Exterior Only': '€40',
      'Interior Only': '€60'
    };
    let price = prices[service] || '';
    if (ironFalloutAddon) {
      price += ' + €20';
    }
    return price;
  };

  const getServicePriceValue = (service, ironFalloutAddon) => {
    const prices = {
      'Full Valet': 95,
      'Exterior Only': 40,
      'Interior Only': 60
    };
    let price = prices[service] || 0;
    if (ironFalloutAddon) price += 20;
    return price;
  };

  const renderStars = (rating) => {
    return (
      <div className="d-flex">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`fs-6 ${rating >= star ? 'text-warning' : 'text-muted'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getWeeklyBookings = () => {
    console.log('getWeeklyBookings called with bookings:', bookings);
    
    if (!bookings.length) {
      console.log('No bookings found, returning empty weeks array');
      return [];
    }
    
    // Normalize dates to ensure consistent format
    const normalizedBookings = bookings.map(booking => {
      let normalizedDate;
      if (typeof booking.date === 'string') {
        normalizedDate = booking.date;
      } else if (booking.date && booking.date.toISOString) {
        normalizedDate = booking.date.toISOString().split('T')[0];
      } else {
        console.warn('Invalid date format for booking:', booking);
        return null;
      }
      
      return {
        ...booking,
        date: normalizedDate
      };
    }).filter(booking => booking !== null);
    
    console.log('Normalized bookings:', normalizedBookings);
    
    const sorted = [...normalizedBookings].sort((a, b) => new Date(a.date) - new Date(b.date));
    console.log('Sorted bookings:', sorted);
    
    const weeks = [];
    let week = Array(7).fill(null).map(() => []);
    let weekStart = null;
    
    sorted.forEach(booking => {
      const date = new Date(booking.date);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date found:', booking.date);
        return;
      }
      
      const dayOfWeek = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
      
      if (!weekStart || date < weekStart || date >= new Date(weekStart.getTime() + 7*86400000)) {
        weekStart = new Date(date);
        weekStart.setDate(date.getDate() - dayOfWeek);
        week = Array(7).fill(null).map(() => []);
        weeks.push({ weekStart: new Date(weekStart), days: week });
      }
      week[dayOfWeek].push(booking);
    });
    
    console.log('Generated weeks:', weeks);
    return weeks;
  };

  const getTotalEarnings = () => {
    return bookings.reduce((sum, b) => {
      const price = b.customPrice !== null ? b.customPrice : getServicePriceValue(b.service, b.ironFalloutAddon);
      return sum + price;
    }, 0);
  };

  const getActualTotalEarned = () => {
    return bookings.filter(b => b.completed).reduce((sum, b) => {
      const price = b.customPrice !== null ? b.customPrice : getServicePriceValue(b.service, b.ironFalloutAddon);
      return sum + price;
    }, 0);
  };

  const handleToggleCompleted = async (booking) => {
    setUpdatingBooking(booking.id);
    try {
      await updateDoc(doc(db, 'bookings', booking.id), { completed: !booking.completed });
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, completed: !b.completed } : b));
    } catch (err) {
      alert('Error updating booking status.');
    }
    setUpdatingBooking(null);
  };

  const handleFileDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleFileDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    
    try {
      console.log('Starting upload process...');
      console.log('Files to upload:', files);
      
      for (const file of files) {
        console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        // File size optimization suggestion
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        if (file.size > 5 * 1024 * 1024) { // 5MB
          console.warn(`Large file detected (${fileSizeMB}MB). Consider compressing for faster upload.`);
        }
        
        // Create unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `gallery/${fileName}`);
        
        console.log('Storage reference created:', storageRef.fullPath);
        
        // Upload file
        console.log('Starting file upload...');
        const uploadResult = await uploadBytes(storageRef, file);
        console.log('File uploaded successfully:', uploadResult);
        
        // Reduced wait time for file processing
        console.log('Waiting for file processing...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get download URL with faster retry logic
        console.log('Getting download URL...');
        let downloadURL;
        let retryCount = 0;
        const maxRetries = 2; // Reduced from 3
        
        while (retryCount < maxRetries) {
          try {
            downloadURL = await getDownloadURL(storageRef);
        console.log('Download URL obtained:', downloadURL);
            break;
          } catch (downloadError) {
            retryCount++;
            console.log(`Download URL attempt ${retryCount} failed:`, downloadError);
            
            if (retryCount >= maxRetries) {
              throw new Error(`Failed to get download URL after ${maxRetries} attempts: ${downloadError.message}`);
            }
            
            // Shorter delays between retries
            await new Promise(resolve => setTimeout(resolve, 1500 * retryCount));
          }
        }
        
        // Determine file type
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        
        if (!isImage && !isVideo) {
          alert(`${file.name} is not a supported file type. Please use images or videos.`);
          continue;
        }
        
        // Create gallery item
        const galleryItem = {
          category: newItem.category,
          label: newItem.label || file.name.split('.')[0],
          description: newItem.description || '',
          type: isVideo ? 'video' : 'single',
          src: downloadURL,
          fileName: fileName,
          uploadedAt: new Date().toISOString(),
          duration: isVideo ? '0:00' : null
        };
        
        console.log('Gallery item created:', galleryItem);
        
        // Add to Firestore
        console.log('Adding to Firestore...');
        const docRef = await addDoc(collection(db, 'gallery'), galleryItem);
        console.log('Added to Firestore with ID:', docRef.id);
      }
      
      // Refresh gallery items
      console.log('Refreshing gallery items...');
      await fetchGalleryItems();
      
      // Reset form
      setNewItem({
        category: 'interiors',
        label: '',
        description: '',
        type: 'single'
      });
      
      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Error uploading files:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // More specific error messages
      if (error.code === 'storage/unauthorized') {
        alert('Upload failed: Unauthorized. Please check Firebase security rules.');
      } else if (error.code === 'storage/quota-exceeded') {
        alert('Upload failed: Storage quota exceeded.');
      } else if (error.code === 'storage/unauthenticated') {
        alert('Upload failed: Not authenticated. Please log in.');
      } else {
        alert(`Error uploading files: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const deleteGalleryItem = (itemId, fileName) => {
    setConfirmModal({
      show: true,
      action: 'deleteGalleryItem',
      id: itemId,
      extra: fileName,
      message: 'Are you sure you want to delete this gallery item? This cannot be undone.',
    });
  };

  // Handler for confirming destructive actions
  const handleConfirm = async () => {
    const { action, id, extra } = confirmModal;
    setConfirmModal({ ...confirmModal, show: false });
    try {
      if (action === 'deleteBooking') {
        await deleteDoc(doc(db, 'bookings', id));
        await fetchBookings();
        alert('Booking deleted successfully!');
      } else if (action === 'deleteReview') {
        await deleteDoc(doc(db, 'reviews', id));
        await fetchReviews();
        alert('Review deleted successfully!');
      } else if (action === 'deleteGalleryItem') {
        await deleteDoc(doc(db, 'gallery', id));
        if (extra) {
          const storageRef = ref(storage, `gallery/${extra}`);
          try { await deleteObject(storageRef); } catch {}
        }
        await fetchGalleryItems();
        alert('Gallery item deleted successfully!');
      }
    } catch (error) {
      alert('Error deleting item. Please try again.');
    }
  };

  const updateGalleryItem = async (itemId, updates) => {
    try {
      await updateDoc(doc(db, 'gallery', itemId), updates);
      await fetchGalleryItems();
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item. Please try again.');
    }
  };

  // Enhanced gallery management functions
  const updateItemOrder = async (itemId, newOrder) => {
    try {
      await updateDoc(doc(db, 'gallery', itemId), {
        order: parseInt(newOrder)
      });
      await fetchGalleryItems();
      console.log(`Updated item ${itemId} order to ${newOrder}`);
    } catch (error) {
      console.error('Error updating item order:', error);
      alert('Error updating item order. Please try again.');
    }
  };

  const reorderCategory = async (category) => {
    try {
      const categoryItems = galleryItems.filter(item => item.category === category);
      if (categoryItems.length === 0) return;

      // Assign sequential order numbers
      for (let i = 0; i < categoryItems.length; i++) {
        await updateDoc(doc(db, 'gallery', categoryItems[i].id), {
          order: i + 1
        });
      }
      
      await fetchGalleryItems();
      alert(`${category} items reordered successfully!`);
    } catch (error) {
      console.error('Error reordering category:', error);
      alert('Error reordering category. Please try again.');
    }
  };

  const startEditing = (item) => {
    setEditingItem({
      id: item.id,
      label: item.label,
      description: item.description,
      category: item.category
    });
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    
    try {
      await updateDoc(doc(db, 'gallery', editingItem.id), {
        label: editingItem.label,
        description: editingItem.description,
        category: editingItem.category
      });
      await fetchGalleryItems();
      setEditingItem(null);
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item. Please try again.');
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  const startEditingBookingPrice = (booking) => {
    setEditingBookingPrice({
      id: booking.id,
      price: booking.customPrice || getServicePriceValue(booking.service, booking.ironFalloutAddon)
    });
  };

  const saveBookingPrice = async () => {
    if (!editingBookingPrice) return;
    
    try {
      await updateDoc(doc(db, 'bookings', editingBookingPrice.id), {
        customPrice: editingBookingPrice.price
      });
      await fetchBookings();
      setEditingBookingPrice(null);
      alert('Price updated successfully!');
    } catch (error) {
      console.error('Error updating booking price:', error);
      alert('Error updating price. Please try again.');
    }
  };

  const cancelBookingPriceEdit = () => {
    setEditingBookingPrice(null);
  };

  const deleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteDoc(doc(db, 'bookings', bookingId));
        await fetchBookings();
        alert('Booking deleted successfully!');
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <section className="py-5 bg-dark text-light w-100">
        <div className="container-fluid px-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5 bg-dark text-light w-100 admin-page">
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="display-6 fw-bold text-primary">Admin Panel</h2>
          <div className="d-flex gap-2">
            <Link to="/" className="btn btn-outline-primary">
              Back to Home
            </Link>
            {activeTab === 'bookings' && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? 'Cancel' : 'Create New Booking'}
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="nav nav-tabs mb-4" role="tablist">
          <button
            className={`nav-link ${activeTab === 'bookings' ? 'active bg-primary text-white' : 'text-light'}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings ({bookings.length})
          </button>
          <button
            className={`nav-link ${activeTab === 'reviews' ? 'active bg-primary text-white' : 'text-light'}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
            {reviews.filter(r => !r.approved).length > 0 && (
              <span className="badge bg-warning text-dark ms-2">
                {reviews.filter(r => !r.approved).length} Pending
              </span>
            )}
          </button>
          <button
            className={`nav-link ${activeTab === 'gallery' ? 'active bg-primary text-white' : 'text-light'}`}
            onClick={() => setActiveTab('gallery')}
          >
            Gallery Management
          </button>
        </div>

        <div className="mb-4">
          <button className="btn btn-outline-info" onClick={() => setShowBookingCalendar(v => !v)}>
            {showBookingCalendar ? 'Hide' : 'Show'} Booking Calendar & Weekly Summary
          </button>
        </div>
        {showBookingCalendar && (
          <div className="card bg-dark mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-end align-items-center mb-2 gap-4">
                <span className="fw-bold text-success fs-5">Estimated Total Earnings: €{getTotalEarnings()}</span>
                <span className="fw-bold text-info fs-5">Actual Total Earned: €{getActualTotalEarned()}</span>
              </div>
              <h5 className="card-title text-info mb-3">Booking Calendar & Weekly Summary</h5>
              
              {bookings.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No bookings found. The calendar will appear here once you have bookings.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-dark align-middle">
                    <thead>
                      <tr>
                        <th>Week (Mon-Sun)</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                        <th>Sun</th>
                        <th>Total (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getWeeklyBookings().map(({ weekStart, days }, i) => {
                        const weekTotal = days.flat().reduce((sum, b) => {
                          const price = b.customPrice !== null ? b.customPrice : getServicePriceValue(b.service, b.ironFalloutAddon);
                          return sum + price;
                        }, 0);
                        return (
                          <tr key={i}>
                            <td className="fw-bold">{weekStart.toLocaleDateString('en-GB')}</td>
                            {days.map((dayBookings, dIdx) => (
                              <td key={dIdx}>
                                {dayBookings.length === 0 ? (
                                  <span className="text-muted small">-</span>
                                ) : (
                                  dayBookings.map((b, j) => (
                                    <div key={j} className="mb-2">
                                      <div className="d-flex align-items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={!!b.completed}
                                          disabled={updatingBooking === b.id}
                                          onChange={() => handleToggleCompleted(b)}
                                          title="Mark as completed"
                                        />
                                        <strong>{b.name}</strong>
                                        <span className="badge bg-secondary ms-1">{b.service}</span>
                                      </div>
                                      <div className="small">
                                        {b.time} | 
                                        <span className={b.customPrice !== null ? 'text-warning fw-bold' : ''}>
                                          €{b.customPrice !== null ? b.customPrice : getServicePriceValue(b.service, b.ironFalloutAddon)}
                                        </span>
                                        {b.customPrice !== null && <span className="text-info ms-1">(custom)</span>}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </td>
                            ))}
                            <td className="fw-bold text-success">€{weekTotal}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <>
            {/* Create New Booking Form */}
            {showCreateForm && (
              <div className="card bg-secondary mb-4">
                <div className="card-body">
                  <h5 className="card-title text-primary mb-3">Create New Booking</h5>
                  <form onSubmit={handleCreateBooking} className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-light">Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newBooking.name}
                        onChange={(e) => setNewBooking({...newBooking, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-light">Phone *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={newBooking.phone}
                        onChange={(e) => setNewBooking({...newBooking, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-light">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={newBooking.email}
                        onChange={(e) => setNewBooking({...newBooking, email: e.target.value})}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-light">Eircode</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newBooking.eircode}
                        onChange={(e) => setNewBooking({...newBooking, eircode: e.target.value})}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-light">Service *</label>
                      <select
                        className="form-select"
                        value={newBooking.service}
                        onChange={(e) => setNewBooking({...newBooking, service: e.target.value})}
                        required
                      >
                        <option value="">Select a service</option>
                        {SERVICES.map(service => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-light">Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newBooking.date}
                        onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-light">Time *</label>
                      <select
                        className="form-select"
                        value={newBooking.time}
                        onChange={(e) => setNewBooking({...newBooking, time: e.target.value})}
                        required
                      >
                        <option value="">Select a time</option>
                        {AVAILABLE_TIMES.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    {(newBooking.service === 'Exterior Only' || newBooking.service === 'Full Valet') && (
                      <div className="col-12">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="ironFalloutAddon"
                            checked={newBooking.ironFalloutAddon}
                            onChange={(e) => setNewBooking({...newBooking, ironFalloutAddon: e.target.checked})}
                          />
                          <label className="form-check-label text-light" htmlFor="ironFalloutAddon">
                            Iron Fallout & Tar Remover (+€20)
                          </label>
                        </div>
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-light">Message</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newBooking.message}
                        onChange={(e) => setNewBooking({...newBooking, message: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">Create Booking</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Bookings List */}
            <div className="card bg-secondary">
              <div className="card-body">
                <h5 className="card-title text-primary mb-3">All Bookings ({bookings.length})</h5>
                {bookings.length === 0 ? (
                  <p className="text-light">No bookings found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Eircode</th>
                          <th>Service</th>
                          <th>Price</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>{formatDate(booking.date)}</td>
                            <td>{booking.time}</td>
                            <td>{booking.name}</td>
                            <td>{booking.phone}</td>
                            <td>{booking.eircode || 'N/A'}</td>
                            <td>
                              {booking.service}
                              {booking.ironFalloutAddon && (
                                <span className="badge bg-warning text-dark ms-1">+ Iron Fallout</span>
                              )}
                            </td>
                            <td>
                              {editingBookingPrice?.id === booking.id ? (
                                <div className="d-flex align-items-center gap-2">
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    style={{ width: '80px' }}
                                    value={editingBookingPrice.price}
                                    onChange={(e) => setEditingBookingPrice({
                                      ...editingBookingPrice,
                                      price: parseFloat(e.target.value) || 0
                                    })}
                                    min="0"
                                    step="0.01"
                                  />
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={saveBookingPrice}
                                    style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={cancelBookingPriceEdit}
                                    style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <div className="d-flex align-items-center gap-2">
                                  <span className={booking.customPrice ? 'text-warning fw-bold' : ''}>
                                    {getServicePrice(booking.service, booking.ironFalloutAddon, booking.customPrice)}
                                  </span>
                                  <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => startEditingBookingPrice(booking)}
                                    style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                                    title="Edit price"
                                  >
                                    ✏️
                                  </button>
                                </div>
                              )}
                            </td>
                            <td>
                              {booking.created?.toDate ? 
                                booking.created.toDate().toLocaleDateString('en-GB') : 
                                'N/A'
                              }
                              {booking.adminCreated && (
                                <span className="badge bg-info ms-1">Admin</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="card bg-secondary">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">All Reviews ({reviews.length})</h5>
              {reviews.length === 0 ? (
                <p className="text-light">No reviews found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr key={review.id}>
                          <td>
                            <div>
                              <strong>{review.customerName}</strong>
                              {review.customerEmail && (
                                <div className="small text-muted">{review.customerEmail}</div>
                              )}
                            </div>
                          </td>
                          <td>{renderStars(review.rating)}</td>
                          <td>
                            <div style={{ maxWidth: '300px' }}>
                              <p className="mb-0 small">"{review.review}"</p>
                            </div>
                          </td>
                          <td>
                            {review.service ? (
                              <span className="badge bg-info">{review.service}</span>
                            ) : (
                              <span className="text-muted">Not specified</span>
                            )}
                          </td>
                          <td>{formatTimestamp(review.date)}</td>
                          <td>
                            {review.approved ? (
                              <span className="badge bg-success">Approved</span>
                            ) : (
                              <span className="badge bg-warning text-dark">Pending</span>
                            )}
                          </td>
                          <td>
                            {!review.approved ? (
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleApproveReview(review.id)}
                                  title="Approve Review"
                                >
                                  ✓
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRejectReview(review.id)}
                                  title="Reject Review"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRejectReview(review.id)}
                                title="Delete Review"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gallery Management Tab */}
        {activeTab === 'gallery' && (
          
          <div className="tab-pane fade show active">
            <h2 className="h3 mb-4">Gallery Management</h2>
            {/* Upload Section */}
            <div className="card bg-secondary mb-4">
              <div className="card-body">
                <h4 className="card-title text-primary">Upload New Media</h4>
                {/* Form for item details */}
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    >
                      <option value="beforeAfter">Before & After</option>
                      <option value="interiors">Interiors</option>
                      <option value="exteriors">Exteriors</option>
                      <option value="videos">Videos</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Image/Video title"
                      value={newItem.label}
                      onChange={(e) => setNewItem({...newItem, label: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    />
                  </div>
                </div>
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded p-5 text-center ${
                    dragOver ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
                  }`}
                  onDragOver={handleFileDragOver}
                  onDragLeave={handleFileDragLeave}
                  onDrop={handleFileDrop}
                >
                  <div className="mb-3">
                    <i className="bi bi-cloud-upload fs-1 text-primary"></i>
                  </div>
                  <h5>Drag & Drop Files Here</h5>
                  <p className="text-light" style={{ opacity: 0.9 }}>or</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="form-control"
                    style={{ display: 'none' }}
                    id="fileInput"
                  />
                  <label htmlFor="fileInput" className="btn btn-primary">
                    Choose Files
                  </label>
                  <p className="text-light mt-2" style={{ opacity: 0.9 }}>
                    Supported: Images (JPG, PNG, GIF) and Videos (MP4, WebM)
                  </p>
                  {uploading && (
                    <div className="mt-3">
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      Uploading...
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Gallery Management Tools */}
            <div className="card bg-secondary mb-4">
              <div className="card-body">
                <h5 className="card-title text-primary mb-3">Gallery Management Tools</h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="d-flex gap-2 mb-2">
                      <button 
                        className="btn btn-outline-info btn-sm"
                        onClick={() => {
                          const items = galleryItems.filter(item => item.category === 'beforeAfter');
                          console.log('Before & After items:', items);
                        }}
                      >
                        <i className="bi bi-list"></i> View Before & After ({galleryItems.filter(item => item.category === 'beforeAfter').length})
                      </button>
                      <button 
                        className="btn btn-outline-info btn-sm"
                        onClick={() => {
                          const items = galleryItems.filter(item => item.category === 'interiors');
                          console.log('Interior items:', items);
                        }}
                      >
                        <i className="bi bi-list"></i> View Interiors ({galleryItems.filter(item => item.category === 'interiors').length})
                      </button>
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-outline-info btn-sm"
                        onClick={() => {
                          const items = galleryItems.filter(item => item.category === 'exteriors');
                          console.log('Exterior items:', items);
                        }}
                      >
                        <i className="bi bi-list"></i> View Exteriors ({galleryItems.filter(item => item.category === 'exteriors').length})
                      </button>
                      <button 
                        className="btn btn-outline-info btn-sm"
                        onClick={() => {
                          const items = galleryItems.filter(item => item.category === 'videos');
                          console.log('Video items:', items);
                        }}
                      >
                        <i className="bi bi-list"></i> View Videos ({galleryItems.filter(item => item.category === 'videos').length})
                      </button>
                    </div>
                  </div>
                                     <div className="col-md-6">
                     <div className="text-end">
                       <small className="text-light" style={{ opacity: 0.9 }}>
                         💡 <strong>Tip:</strong> Change the order number in the top-left corner of each item to reorder.
                       </small>
                       <br />
                       <small className="text-light" style={{ opacity: 0.9 }}>
                         📝 <strong>Note:</strong> Lower numbers appear first. Use "Reorder" button to auto-assign sequential numbers.
                       </small>
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Gallery Items Display */}
            <div className="row">
              {['beforeAfter', 'interiors', 'exteriors', 'videos'].map((category) => (
                <div key={category} className="col-12 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="text-primary text-capitalize mb-0">{category.replace(/([A-Z])/g, ' $1')}</h4>
                    <div className="d-flex align-items-center gap-2">
                                            <button
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => reorderCategory(category)}
                        title="Reorder items sequentially"
                      >
                        <i className="bi bi-arrow-clockwise"></i> Reorder
                      </button>
                      <span className="badge bg-secondary">
                        {galleryItems.filter(item => item.category === category).length} items
                      </span>
                    </div>
                  </div>
                  <div className="row g-3">
                                          {galleryItems
                        .filter(item => item.category === category)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((item, index) => (
                          <div key={item.id} className="col-md-4 col-lg-3">
                          <div className="card bg-secondary h-100">
                            <div className="position-relative">
                              {item.type === 'video' ? (
                                <div className="ratio ratio-16x9">
                                  <video
                                    src={item.src}
                                    className="card-img-top"
                                    style={{ objectFit: 'cover' }}
                                  />
                                  <div className="position-absolute top-50 start-50 translate-middle">
                                    <i className="bi bi-play-circle text-white fs-1"></i>
                                  </div>
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
                              <div className="position-absolute top-0 end-0 m-2 d-flex gap-1">
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => startEditing(item)}
                                  title="Edit Item"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => deleteGalleryItem(item.id, item.fileName)}
                                  title="Delete Item"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                              <div className="position-absolute top-0 start-0 m-2">
                                <input
                                  type="number"
                                  min="1"
                                  className="form-control form-control-sm"
                                  style={{
                                    width: '50px',
                                    height: '25px',
                                    fontSize: '0.75rem',
                                    textAlign: 'center',
                                    background: 'rgba(0,0,0,0.8)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '4px'
                                  }}
                                  value={item.order || index + 1}
                                  onChange={(e) => updateItemOrder(item.id, e.target.value)}
                                  title="Change order number"
                                />
                              </div>
                            </div>
                            <div className="card-body">
                              {editingItem && editingItem.id === item.id ? (
                                <div>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm mb-2"
                                    value={editingItem.label}
                                    onChange={(e) => setEditingItem({...editingItem, label: e.target.value})}
                                    placeholder="Title"
                                  />
                                  <textarea
                                    className="form-control form-control-sm mb-2"
                                    value={editingItem.description}
                                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                                    placeholder="Description"
                                    rows="2"
                                  />
                                  <select
                                    className="form-select form-select-sm mb-2"
                                    value={editingItem.category}
                                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                                  >
                                    <option value="beforeAfter">Before & After</option>
                                    <option value="interiors">Interiors</option>
                                    <option value="exteriors">Exteriors</option>
                                    <option value="videos">Videos</option>
                                  </select>
                                  <div className="d-flex gap-1">
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={saveEdit}
                                    >
                                      <i className="bi bi-check"></i> Save
                                    </button>
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={cancelEdit}
                                    >
                                      <i className="bi bi-x"></i> Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h6 className="card-title">{item.label}</h6>
                                                      <p className="card-text small text-light" style={{ opacity: 0.9 }}>{item.description}</p>
                    <small className="text-light" style={{ opacity: 0.8 }}>
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </small>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {galleryItems.filter(item => item.category === category).length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-light" style={{ opacity: 0.9 }}>No items in this category yet.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Confirmation Modal */}
      <ConfirmModal
        show={confirmModal.show}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, show: false })}
        title="Confirm Deletion"
        message={confirmModal.message}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </section>
  );
}
