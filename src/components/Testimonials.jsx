import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Testimonials({ onLeaveReview }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const reviewsRef = collection(db, 'reviews');
      
      // Try the filtered query first
      try {
        const q = query(
          reviewsRef,
          where('approved', '==', true),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        
        const reviewsData = [];
        querySnapshot.forEach((doc) => {
          reviewsData.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('Fetched approved reviews:', reviewsData); // Debug log
        
        // Sort by date in JavaScript instead of Firestore
        reviewsData.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB - dateA; // Most recent first
        });
        
        setReviews(reviewsData);
      } catch (filterError) {
        console.log('Filtered query failed, trying to fetch all reviews:', filterError);
        
        // Fallback: fetch all reviews and filter in JavaScript
        const allReviewsQuery = query(reviewsRef, limit(20));
        const allReviewsSnapshot = await getDocs(allReviewsQuery);
        
        const allReviewsData = [];
        allReviewsSnapshot.forEach((doc) => {
          allReviewsData.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('All reviews:', allReviewsData); // Debug log
        
        // Filter approved reviews
        const approvedReviews = allReviewsData.filter(review => review.approved === true);
        console.log('Approved reviews after filtering:', approvedReviews); // Debug log
        
        // Sort by date
        approvedReviews.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB - dateA;
        });
        
        setReviews(approvedReviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="d-flex justify-content-center mb-3">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`fs-5 ${rating >= star ? 'text-warning' : 'text-muted'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Show loading state or fallback to fake testimonials if no real reviews
  if (loading) {
    return (
      <section className="py-5 bg-dark w-100">
        <div className="container-fluid px-4">
          <h2 className="display-6 fw-bold text-primary text-center mb-4">What Our Customers Say</h2>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If no approved reviews, show a message encouraging reviews
  if (reviews.length === 0) {
    return (
      <section className="py-5 bg-dark w-100">
        <div className="container-fluid px-4">
          <h2 className="display-6 fw-bold text-primary text-center mb-4">What Our Customers Say</h2>
          <div className="text-center">
            <p className="text-light mb-4">Be the first to leave a review!</p>
            <button className="btn btn-primary" onClick={onLeaveReview}>Leave a Review</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5 bg-dark w-100">
      <div className="container-fluid px-4">
        <h2 className="display-6 fw-bold text-primary text-center mb-4">What Our Customers Say</h2>
        <div id="testimonialCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            {reviews.map((review, index) => (
              <div key={review.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                <div className="row justify-content-center">
                  <div className="col-12 col-md-8 col-lg-6">
                    <div className="d-flex flex-column align-items-center text-center">
                      <div className="mb-3" style={{ minHeight: '72px' }}>
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                             style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                          {review.customerName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      {renderStars(review.rating)}
                      <blockquote className="blockquote w-100">
                        <p className="mb-3 text-light fs-5" style={{wordBreak: 'break-word'}}>
                          "{review.review}"
                        </p>
                      </blockquote>
                      <footer className="blockquote-footer text-light w-100" style={{marginTop: '-0.5rem'}}>
                        <strong>{review.customerName}</strong>
                        {review.service && (
                          <span className="text-muted ms-2">• {review.service}</span>
                        )}
                        {review.date && (
                          <span className="text-muted ms-2">• {formatDate(review.date)}</span>
                        )}
                      </footer>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {reviews.length > 1 && (
            <>
              <button className="carousel-control-prev" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </>
          )}
        </div>
        
        {/* Review CTA */}
        <div className="text-center mt-5">
          <p className="text-light mb-3">Had a great experience? Share it with others!</p>
          <button className="btn btn-outline-primary" onClick={onLeaveReview}>Leave a Review</button>
        </div>
      </div>
    </section>
  );
} 