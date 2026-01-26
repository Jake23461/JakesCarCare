import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const GOOGLE_REVIEWS_URL = 'https://www.google.com/search?sca_esv=292c8ab72c42bfbf&rlz=1C1GCEA_enIE1198IE1198&sxsrf=ANbL-n7l6BGYGdoqB2Ejg-UNd6qGsppZeg:1769433943491&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOcL2hPhyDCj2WatxjR07w9UyZAFf-44-1p-BScN3hw1AEBij0rBrTO3oEmena5yBWvQizPx4jrkS0yAfl4abeZMJZN84&q=Jakes+Car+Care+Reviews&sa=X&ved=2ahUKEwiB4p6Np6mSAxWjUUEAHZXHKOMQ0bkNegQIIBAH&biw=1536&bih=826&dpr=1.25&aic=0https://www.google.com/maps/place/Jakes+Car+Care/@53.9126731,-8.585352,8.5z/data=!4m12!1m2!2m1!1sjakes+car+care!3m8!1s0x485c29e5619693d3:0x3dc233c4442711a8!8m2!3d53.8028218!4d-8.0653568!9m1!1b1!15sCg5qYWtlcyBjYXIgY2FyZZIBCGNhcl93YXNo4AEA!16s%2Fg%2F11xm6ytsvd?entry=ttu&g_ep=EgoyMDI2MDEyMS4wIKXMDSoASAFQAw%3D%3D';

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
            <a 
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              ⭐ Leave a Review on Google
            </a>
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
          <a 
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary"
          >
            ⭐ Leave a Review on Google
          </a>
        </div>
      </div>
    </section>
  );
} 