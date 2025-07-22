import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Services from './components/Services';
import Footer from './components/Footer';
import Admin from './components/Admin';
import ReviewForm from './components/ReviewForm';
import BookingModal from './components/BookingModal';
import './App.css';
import React, { useState } from 'react';

function HomePage({ onBookNow, onLeaveReview }) {
  return (
    <>
      <Hero onBookNow={onBookNow} />
      <Services onBookNow={onBookNow} />
      <Gallery />
      <Testimonials onLeaveReview={onLeaveReview} />
      <FAQ />
    </>
  );
}

function ReviewModal({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-dark text-light">
          <div className="modal-header border-0">
            <h5 className="modal-title text-primary">Leave a Review</h5>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <ReviewForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const openBookingModal = () => setShowBookingModal(true);
  const closeBookingModal = () => setShowBookingModal(false);
  const openReviewModal = () => setShowReviewModal(true);
  const closeReviewModal = () => setShowReviewModal(false);

  return (
    <Router>
      <div className="min-vh-100 d-flex flex-column font-sans bg-secondary text-light">
        <Header onLeaveReview={openReviewModal} />
        <BookingModal show={showBookingModal} onClose={closeBookingModal} />
        <ReviewModal show={showReviewModal} onClose={closeReviewModal} />
        <Routes>
          <Route path="/" element={<HomePage onBookNow={openBookingModal} onLeaveReview={openReviewModal} />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/reviews" element={<Testimonials onLeaveReview={openReviewModal} />} />
        </Routes>
        <Footer onLeaveReview={openReviewModal} />
      </div>
    </Router>
  );
}

export default App;
