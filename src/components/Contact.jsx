import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp, query, where, getDocs, runTransaction, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SERVICES = ['Full Valet', 'Exterior Only', 'Interior Only'];
const AVAILABLE_TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

// Service duration in hours (including travel time)
const SERVICE_DURATIONS = {
  'Full Valet': 4,       // 3-4 hours service + 1 hour travel
  'Exterior Only': 2,    // 1-2 hours service + 1 hour travel
  'Interior Only': 3,    // 2-3 hours service + 1 hour travel
  'Iron Fallout & Tar Remover': 1.5 // 30 min service + 1 hour travel
};

export default function Contact({ isModal = false, onClose, onLeaveReview }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    eircode: '',
    service: '',
    date: null,
    time: '',
    message: '',
    ironFalloutAddon: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const [existingBookings, setExistingBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Calendar state
  const today = new Date();

  // Fetch existing bookings on component mount and refresh periodically
  useEffect(() => {
    fetchExistingBookings();
    
    // Refresh bookings every 30 seconds to keep availability current
    const interval = setInterval(() => {
      fetchExistingBookings();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchExistingBookings = async () => {
    try {
      setLoadingBookings(true);
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('date', '>=', getTomorrowDate()));
      const querySnapshot = await getDocs(q);
      
      const bookings = [];
      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      
      setExistingBookings(bookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Convert time string to minutes for easier calculations
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes back to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Get all blocked time slots for a specific date
  const getBlockedTimesForDate = (date) => {
    const blockedTimes = new Set();
    
    existingBookings
      .filter(booking => booking.date === date)
      .forEach(booking => {
        const startTime = timeToMinutes(booking.time);
        const serviceDuration = SERVICE_DURATIONS[booking.service] || 3; // Default 3 hours
        const endTime = startTime + (serviceDuration * 60);
        
        // Block out all time slots that overlap with this booking
        for (let time = startTime; time < endTime; time += 60) { // 60 minutes = 1 hour slots
          const timeStr = minutesToTime(time);
          if (AVAILABLE_TIMES.includes(timeStr)) {
            blockedTimes.add(timeStr);
          }
        }
      });
    
    return Array.from(blockedTimes);
  };

  // Get available times for selected date and service
  const getAvailableTimes = (date, service) => {
    if (!date) return AVAILABLE_TIMES;
    
    const dateStr = date.toISOString().split('T')[0];
    const blockedTimes = getBlockedTimesForDate(dateStr);
    const availableTimes = AVAILABLE_TIMES.filter(time => !blockedTimes.includes(time));
    
    // If a service is selected, also check if there's enough time left in the day
    if (service) {
      let serviceDuration = SERVICE_DURATIONS[service];
      // Add Iron Fallout time if selected
      if (formData.ironFalloutAddon) {
        serviceDuration += SERVICE_DURATIONS['Iron Fallout & Tar Remover'];
      }
      
      return availableTimes.filter(time => {
        const startTime = timeToMinutes(time);
        const endTime = startTime + (serviceDuration * 60);
        const lastPossibleTime = timeToMinutes('16:00') + 60; // 17:00
        
        return endTime <= lastPossibleTime;
      });
    }
    
    return availableTimes;
  };

  // Check if a date has any available slots
  const isDateAvailable = (date) => {
    const blockedTimes = getBlockedTimesForDate(date);
    return blockedTimes.length < AVAILABLE_TIMES.length;
  };

  // More strict check for DatePicker filtering - check if there are enough slots for any service
  const isDateSelectable = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const blockedTimes = getBlockedTimesForDate(dateStr);
    
    // Check if there are enough available slots for the shortest service (1.5 hours)
    const availableSlots = AVAILABLE_TIMES.length - blockedTimes.length;
    const shortestServiceDuration = Math.min(...Object.values(SERVICE_DURATIONS));
    
    // Need at least enough slots for the shortest service
    return availableSlots >= Math.ceil(shortestServiceDuration);
  };

  // Check if Iron Fallout add-on should be shown
  const shouldShowIronFalloutAddon = () => {
    return formData.service === 'Exterior Only' || formData.service === 'Full Valet';
  };

  // Get total service duration including add-ons
  const getTotalServiceDuration = () => {
    if (!formData.service) return 0;
    let duration = SERVICE_DURATIONS[formData.service];
    if (formData.ironFalloutAddon) {
      duration += SERVICE_DURATIONS['Iron Fallout & Tar Remover'];
    }
    return duration;
  };

  // Only allow booking from tomorrow onwards
  const minDate = (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  })();

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.service) errors.service = 'Please select a service';
    if (!formData.date) errors.date = 'Please select a date';
    if (!formData.time) errors.time = 'Please select a time';
    if (!formData.eircode) errors.eircode = 'Eircode is required';
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear time selection when date or service changes
    if (name === 'date' || name === 'service') {
      setFormData(prev => ({ 
        ...prev, 
        time: '',
        // Clear Iron Fallout add-on if service doesn't support it
        ironFalloutAddon: name === 'service' && value !== 'Exterior Only' && value !== 'Full Valet' ? false : prev.ironFalloutAddon
      }));
    }
    
    // Check time slot availability when time is selected
    if (name === 'time' && value && formData.date) {
      const dateStr = formData.date.toISOString().split('T')[0];
      const blockedTimes = getBlockedTimesForDate(dateStr);
      
      if (blockedTimes.includes(value)) {
        setError('This time slot is no longer available. Please select another time.');
        return;
      }
      
      // Check if there's enough time for the service
      const serviceDuration = getTotalServiceDuration();
      const startTime = timeToMinutes(value);
      const endTime = startTime + (serviceDuration * 60);
      
      // Check if any time slots during the service duration are blocked
      for (let time = startTime; time < endTime; time += 60) {
        const timeStr = minutesToTime(time);
        if (blockedTimes.includes(timeStr)) {
          setError('This time slot conflicts with an existing booking. Please select another time.');
          return;
        }
      }
      
      // Clear error if time slot is available
      if (error) setError('');
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date, time: '' }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      setError('Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      // Real-time check against database before booking
      const dateStr = formData.date.toISOString().split('T')[0];
      
      // Fetch the latest bookings for this date from the database
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('date', '==', dateStr));
      const querySnapshot = await getDocs(q);
      
      const latestBookings = [];
      querySnapshot.forEach((doc) => {
        latestBookings.push({ id: doc.id, ...doc.data() });
      });
      
      // Check for conflicts with the latest data
      const blockedTimes = new Set();
      latestBookings.forEach(booking => {
        const startTime = timeToMinutes(booking.time);
        const serviceDuration = SERVICE_DURATIONS[booking.service] || 3;
        const endTime = startTime + (serviceDuration * 60);
        
        for (let time = startTime; time < endTime; time += 60) {
          const timeStr = minutesToTime(time);
          if (AVAILABLE_TIMES.includes(timeStr)) {
            blockedTimes.add(timeStr);
          }
        }
      });
      
      // Additional check: ensure no exact duplicate bookings
      const exactDuplicate = latestBookings.find(booking => 
        booking.date === dateStr && 
        booking.time === formData.time &&
        booking.service === formData.service
      );
      
      if (exactDuplicate) {
        setError('A booking already exists for this exact time and service. Please select another time.');
        setLoading(false);
        return;
      }
      
      // Check if the selected time is blocked
      if (blockedTimes.has(formData.time)) {
        setError('This time slot is no longer available. Please select another time.');
        setLoading(false);
        return;
      }
      
      // Check if there's enough time for the service
      const serviceDuration = getTotalServiceDuration();
      const startTime = timeToMinutes(formData.time);
      const endTime = startTime + (serviceDuration * 60);
      
      // Check if any time slots during the service duration are blocked
      for (let time = startTime; time < endTime; time += 60) {
        const timeStr = minutesToTime(time);
        if (blockedTimes.has(timeStr)) {
          setError('This time slot conflicts with an existing booking. Please select another time.');
          setLoading(false);
          return;
        }
      }

      // If we get here, the slot is available - proceed with booking using a transaction
      const bookingData = {
        ...formData,
        date: dateStr, // Ensure date is stored as string for consistency
        created: Timestamp.now(),
      };
      
      // Use a transaction to ensure atomic booking creation
      await runTransaction(db, async (transaction) => {
        // Double-check availability within the transaction
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('date', '==', dateStr));
        const querySnapshot = await getDocs(q);
        
        const transactionBookings = [];
        querySnapshot.forEach((doc) => {
          transactionBookings.push({ id: doc.id, ...doc.data() });
        });
        
        // Check for conflicts again within the transaction
        const transactionBlockedTimes = new Set();
        transactionBookings.forEach(booking => {
          const startTime = timeToMinutes(booking.time);
          const serviceDuration = SERVICE_DURATIONS[booking.service] || 3;
          const endTime = startTime + (serviceDuration * 60);
          
          for (let time = startTime; time < endTime; time += 60) {
            const timeStr = minutesToTime(time);
            if (AVAILABLE_TIMES.includes(timeStr)) {
              transactionBlockedTimes.add(timeStr);
            }
          }
        });
        
        if (transactionBlockedTimes.has(formData.time)) {
          throw new Error('This time slot is no longer available. Please select another time.');
        }
        
        // Check service duration overlap
        const serviceDuration = getTotalServiceDuration();
        const startTime = timeToMinutes(formData.time);
        const endTime = startTime + (serviceDuration * 60);
        
        for (let time = startTime; time < endTime; time += 60) {
          const timeStr = minutesToTime(time);
          if (transactionBlockedTimes.has(timeStr)) {
            throw new Error('This time slot conflicts with an existing booking. Please select another time.');
          }
        }
        
        // If we get here, the slot is definitely available - create the booking
        const newBookingRef = doc(collection(db, 'bookings'));
        transaction.set(newBookingRef, bookingData);
      });
      
      setSuccess('Booking received! We\'ll contact you shortly to confirm your appointment.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        eircode: '',
        service: '',
        date: null,
        time: '',
        message: '',
        ironFalloutAddon: false
      });
      setTouched({});
      
      // Immediately update local state with the new booking
      const newBooking = {
        id: 'temp-' + Date.now(),
        ...formData,
        date: dateStr,
        created: Timestamp.now(),
      };
      setExistingBookings(prev => [...prev, newBooking]);
      
      // Also refresh from database to ensure consistency
      await fetchExistingBookings();
    } catch (err) {
      if (err.message.includes('time slot') || err.message.includes('conflicts')) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again or contact us directly.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    if (touched[fieldName]) {
      const errors = validateForm();
      return errors[fieldName];
    }
    return '';
  };

  const availableTimes = getAvailableTimes(formData.date, formData.service);

  if (isModal) {
    return (
      <div className="calendar-card">
        <div className="text-center mb-4">
          <h2 className="h3 fw-bold text-primary mb-2">Book Your Valet</h2>
          <p className="text-light mb-0">
            Schedule your car valeting service at a time that suits you. We'll confirm your booking within 24 hours.
          </p>
        </div>
        
        {/* 1. Calendar Section - First */}
        <div className="mb-4">
          <label className="form-label fw-semibold text-light mb-3">Select Date</label>
          <div className="d-flex justify-content-center">
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              minDate={new Date(today.getTime() + 24 * 60 * 60 * 1000)} // Tomorrow
              maxDate={new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)} // 90 days from now
              filterDate={isDateSelectable}
              placeholderText="Select a date"
              className={`form-control${getFieldError('date') ? ' is-invalid' : ''}`}
              dateFormat="dd/MM/yyyy"
              showDisabledMonthNavigation
              inline
              calendarClassName="bg-dark text-light"
              dayClassName={(date) => {
                const dateStr = date.toISOString().split('T')[0];
                const isAvailable = isDateSelectable(date);
                const isSelected = formData.date && date.toISOString().split('T')[0] === formData.date.toISOString().split('T')[0];
                return isSelected ? 'selected' : isAvailable ? 'available' : 'disabled';
              }}
            />
          </div>
          {getFieldError('date') && (
            <div className="invalid-feedback">{getFieldError('date')}</div>
          )}
        </div>
        
        {/* 2. Service Selection - Second */}
        <div className="mb-4">
          <label className="form-label fw-semibold text-light" htmlFor="service">Service *</label>
          <select
            id="service"
            name="service"
            className={`form-select${getFieldError('service') ? ' is-invalid' : ''}`}
            value={formData.service}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Select a service</option>
            {SERVICES.map(service => (
              <option key={service} value={service}>
                {service} ({SERVICE_DURATIONS[service]} hours)
              </option>
            ))}
          </select>
          {getFieldError('service') && (
            <div className="invalid-feedback">{getFieldError('service')}</div>
          )}
          
          {/* Iron Fallout Add-on */}
          {shouldShowIronFalloutAddon() && (
            <div className="mt-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="ironFalloutAddon"
                  name="ironFalloutAddon"
                  checked={formData.ironFalloutAddon}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      ironFalloutAddon: e.target.checked,
                      time: '' // Clear time when add-on changes
                    }));
                  }}
                />
                <label className="form-check-label text-light" htmlFor="ironFalloutAddon">
                  <strong>Add Iron Fallout & Tar Remover (+€20)</strong> - Removes embedded iron particles and tar for a smoother finish
                </label>
              </div>
            </div>
          )}
        </div>
        
        {/* 3. Time Selection - Third */}
        <div className="mb-4">
          <label className="form-label fw-semibold text-light" htmlFor="time">Time *</label>
          <select
            id="time"
            name="time"
            className={`form-select${getFieldError('time') ? ' is-invalid' : ''}`}
            value={formData.time}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={!formData.date || !formData.service || availableTimes.length === 0}
          >
            <option value="">
              {!formData.date ? 'Select a date first' : 
               !formData.service ? 'Select a service first' :
               availableTimes.length === 0 ? 'No available times' : 'Select a time'}
            </option>
            {availableTimes.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          {getFieldError('time') && (
            <div className="invalid-feedback">{getFieldError('time')}</div>
          )}
          {formData.date && formData.service && availableTimes.length === 0 && (
            <div className="form-text text-warning">
              No available times for {formData.service} on this date. Please select another date or service.
            </div>
          )}
          {formData.service && (
            <div className="form-text text-light">
              {formData.service} takes approximately {getTotalServiceDuration()} hours (including travel time).
              {formData.ironFalloutAddon && (
                <span className="d-block mt-1">
                  <strong>Total with Iron Fallout add-on: {getTotalServiceDuration()} hours</strong>
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* 4. Form Fields - Fourth */}
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold text-light" htmlFor="name">Name *</label>
            <input
              id="name"
              name="name"
              className={`form-control${getFieldError('name') ? ' is-invalid' : ''}`}
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {getFieldError('name') && (
              <div className="invalid-feedback">{getFieldError('name')}</div>
            )}
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold text-light" htmlFor="phone">Phone *</label>
            <input
              id="phone"
              name="phone"
              className={`form-control${getFieldError('phone') ? ' is-invalid' : ''}`}
              type="tel"
              placeholder="087 123 4567"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {getFieldError('phone') && (
              <div className="invalid-feedback">{getFieldError('phone')}</div>
            )}
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold text-light" htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              className={`form-control${getFieldError('email') ? ' is-invalid' : ''}`}
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {getFieldError('email') && (
              <div className="invalid-feedback">{getFieldError('email')}</div>
            )}
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold text-light" htmlFor="eircode">Eircode *</label>
            <input
              id="eircode"
              name="eircode"
              className={`form-control${getFieldError('eircode') ? ' is-invalid' : ''}`}
              type="text"
              placeholder="A65 F4E2"
              value={formData.eircode}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {getFieldError('eircode') && (
              <div className="invalid-feedback">{getFieldError('eircode')}</div>
            )}
          </div>
          
          <div className="col-12">
            <label className="form-label fw-semibold text-light" htmlFor="message">Special Requests</label>
            <textarea
              id="message"
              name="message"
              className="form-control"
              rows="3"
              placeholder="Any special requirements or requests?"
              value={formData.message}
              onChange={handleChange}
            />
          </div>
          <div className="col-12">
            <button
              type="submit"
              className="btn btn-primary w-100 fw-semibold py-3"
              disabled={loading || !formData.date || !formData.service || availableTimes.length === 0}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              Book Now
            </button>
          </div>
          {success && (
            <div className="col-12">
              <div className="alert alert-success mt-2 mb-0" role="alert">
                <div className="mb-2">{success}</div>
                <div className="small">
                  After your service is completed, we'd love to hear about your experience!
                  <button type="button" className="btn btn-link text-decoration-none ms-1 p-0 align-baseline" style={{color: '#0d6efd'}} onClick={onLeaveReview}>
                    <strong>Leave a review →</strong>
                  </button>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="col-12">
              <div className="alert alert-danger mt-2 mb-0" role="alert">
                {error}
              </div>
            </div>
          )}
        </form>
      </div>
    );
  }

  // Default: full page section
  return (
    <section id="contact" className="py-5 w-100" style={{ background: "linear-gradient(135deg, #1a1a1a 60%, #2d2d2d 100%)" }}>
      <div className="container-fluid px-4 d-flex justify-content-center">
        <div className="calendar-card">
          <div className="text-center mb-4">
            <h2 className="h3 fw-bold text-primary mb-2">Book Your Valet</h2>
            <p className="text-light mb-0">
              Schedule your car valeting service at a time that suits you. We'll confirm your booking within 24 hours.
            </p>
          </div>
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-light" htmlFor="name">Name *</label>
              <input
                id="name"
                name="name"
                className={`form-control${getFieldError('name') ? ' is-invalid' : ''}`}
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {getFieldError('name') && (
                <div className="invalid-feedback">{getFieldError('name')}</div>
              )}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-light" htmlFor="phone">Phone *</label>
              <input
                id="phone"
                name="phone"
                className={`form-control${getFieldError('phone') ? ' is-invalid' : ''}`}
                type="tel"
                placeholder="087 123 4567"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {getFieldError('phone') && (
                <div className="invalid-feedback">{getFieldError('phone')}</div>
              )}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-light" htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                className={`form-control${getFieldError('email') ? ' is-invalid' : ''}`}
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {getFieldError('email') && (
                <div className="invalid-feedback">{getFieldError('email')}</div>
              )}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-light" htmlFor="eircode">Eircode *</label>
              <input
                id="eircode"
                name="eircode"
                className={`form-control${getFieldError('eircode') ? ' is-invalid' : ''}`}
                type="text"
                placeholder="A65 F4E2"
                value={formData.eircode}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {getFieldError('eircode') && (
                <div className="invalid-feedback">{getFieldError('eircode')}</div>
              )}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-light" htmlFor="service">Service *</label>
              <select
                id="service"
                name="service"
                className={`form-select${getFieldError('service') ? ' is-invalid' : ''}`}
                value={formData.service}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Select a service</option>
                {SERVICES.map(service => (
                  <option key={service} value={service}>
                    {service} ({SERVICE_DURATIONS[service]} hours)
                  </option>
                ))}
              </select>
              {getFieldError('service') && (
                <div className="invalid-feedback">{getFieldError('service')}</div>
              )}
            </div>
            
            {/* Iron Fallout Add-on */}
            {shouldShowIronFalloutAddon() && (
              <div className="col-12">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="ironFalloutAddon"
                    name="ironFalloutAddon"
                    checked={formData.ironFalloutAddon}
                    onChange={(e) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        ironFalloutAddon: e.target.checked,
                        time: '' // Clear time when add-on changes
                      }));
                    }}
                  />
                  <label className="form-check-label text-light" htmlFor="ironFalloutAddon">
                    <strong>Add Iron Fallout & Tar Remover (+€20)</strong> - Removes embedded iron particles and tar for a smoother finish
                  </label>
                </div>
              </div>
            )}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-light" htmlFor="date">Date *</label>
              <input
                id="date"
                name="date"
                className={`form-control${getFieldError('date') ? ' is-invalid' : ''}`}
                type="date"
                min={minDate}
                value={formData.date ? formData.date.toISOString().split('T')[0] : ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {getFieldError('date') && (
                <div className="invalid-feedback">{getFieldError('date')}</div>
              )}
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-light" htmlFor="time">Time *</label>
              <select
                id="time"
                name="time"
                className={`form-select${getFieldError('time') ? ' is-invalid' : ''}`}
                value={formData.time}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!formData.date || !formData.service || availableTimes.length === 0}
              >
                <option value="">
                  {!formData.date ? 'Select a date first' : 
                   !formData.service ? 'Select a service first' :
                   availableTimes.length === 0 ? 'No available times' : 'Select a time'}
                </option>
                {availableTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {getFieldError('time') && (
                <div className="invalid-feedback">{getFieldError('time')}</div>
              )}
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold text-light" htmlFor="message">Special Requests</label>
              <textarea
                id="message"
                name="message"
                className="form-control"
                rows="3"
                placeholder="Any special requirements or requests?"
                value={formData.message}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <button
                type="submit"
                className="btn btn-primary w-100 fw-semibold py-3"
                disabled={loading || !formData.date || !formData.service || availableTimes.length === 0}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                Book Now
              </button>
            </div>
            {success && (
              <div className="col-12">
                <div className="alert alert-success mt-2 mb-0" role="alert">
                  <div className="mb-2">{success}</div>
                  <div className="small">
                    After your service is completed, we'd love to hear about your experience!
                    <button type="button" className="btn btn-link text-decoration-none ms-1 p-0 align-baseline" style={{color: '#0d6efd'}} onClick={onLeaveReview}>
                      <strong>Leave a review →</strong>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="col-12">
                <div className="alert alert-danger mt-2 mb-0" role="alert">
                  {error}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}  
