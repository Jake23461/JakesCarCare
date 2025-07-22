import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function ReviewForm() {
  const [formData, setFormData] = useState({
    customerName: '',
    rating: 5,
    review: '',
    service: '',
    customerEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const services = ['Full Valet', 'Exterior Only', 'Interior Only', 'Iron Fallout & Tar Remover'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await addDoc(collection(db, 'reviews'), {
        ...formData,
        date: Timestamp.now(),
        approved: false // Reviews need admin approval
      });
      
      setSuccess('Thank you for your review! It will be published after approval.');
      setFormData({
        customerName: '',
        rating: 5,
        review: '',
        service: '',
        customerEmail: ''
      });
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating: rating
    }));
  };

  return (
    <section className="py-5 bg-dark w-100">
      <div className="container-fluid px-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card border-0 shadow-lg bg-secondary">
              <div className="card-body p-4">
                <h3 className="text-primary fw-bold text-center mb-4">Leave a Review</h3>
                <p className="text-light text-center mb-4">
                  We'd love to hear about your experience with Jake's Mobile Detail!
                </p>
                
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-light">Your Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                        placeholder="John Smith"
                      />
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-light">Email (Optional)</label>
                      <input
                        type="email"
                        className="form-control"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleChange}
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-light">Service Used</label>
                      <select
                        className="form-select"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                      >
                        <option value="">Select a service (optional)</option>
                        {services.map(service => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-light">Rating *</label>
                      <div className="d-flex gap-2 mb-3" style={{ minHeight: '48px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            className={`btn btn-outline-warning ${formData.rating >= star ? 'btn-warning' : ''}`}
                            onClick={() => handleRatingChange(star)}
                            style={{ width: '40px', height: '40px' }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <small className="text-light">Click to rate: {formData.rating} out of 5</small>
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label fw-semibold text-light">Your Review *</label>
                      <textarea
                        className="form-control"
                        name="review"
                        value={formData.review}
                        onChange={handleChange}
                        rows="4"
                        required
                        placeholder="Tell us about your experience..."
                        maxLength="500"
                      />
                      <small className="text-light">{formData.review.length}/500 characters</small>
                    </div>
                    
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary w-100 fw-semibold py-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        ) : null}
                        Submit Review
                      </button>
                    </div>
                    
                    {success && (
                      <div className="col-12">
                        <div className="alert alert-success mt-2 mb-0" role="alert">
                          {success}
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
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
