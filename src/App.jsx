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
import BlogList from './blog/BlogList';
import BlogPost from './blog/BlogPost';

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

function ServiceAreas() {
  return (
    <section className="py-5 bg-dark text-light w-100">
      <div className="container-fluid px-4">
        <h1 className="display-5 fw-bold text-primary mb-4">Service Areas</h1>
        <p className="lead">Jake's Car Care provides mobile car valeting and detailing within a 30-40 minute drive from Strokestown, covering Roscommon, Longford, and nearby towns and villages. If you're in or near any of the following locations, we can come to you!</p>
        <div className="row">
          <div className="col-md-6">
            <h3 className="h5 text-info">Roscommon</h3>
            <ul>
              <li>Roscommon Town</li>
              <li>Castlerea</li>
              <li>Boyle</li>
              <li>Strokestown</li>
              <li>Ballaghaderreen</li>
              <li>Elphin</li>
              <li>Ballinlough</li>
              <li>Frenchpark</li>
              <li>Other surrounding villages</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h3 className="h5 text-info">Longford</h3>
            <ul>
              <li>Longford Town</li>
              <li>Ballymahon</li>
              <li>Edgeworthstown</li>
              <li>Granard</li>
              <li>Lanesborough</li>
              <li>Drumlish</li>
              <li>Newtownforbes</li>
              <li>Other surrounding villages</li>
            </ul>
          </div>
        </div>
        <p className="mt-4">If you're unsure if we cover your area, just ask! <a href="tel:0877665058" className="text-info">Call us</a> for a quick answer.</p>
      </div>
    </section>
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
        <BookingModal show={showBookingModal} onClose={closeBookingModal} onLeaveReview={openReviewModal} />
        <ReviewModal show={showReviewModal} onClose={closeReviewModal} />
        <Routes>
          <Route path="/" element={<HomePage onBookNow={openBookingModal} onLeaveReview={openReviewModal} />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/adminjake2005" element={<Admin />} />
          <Route path="/reviews" element={<Testimonials onLeaveReview={openReviewModal} />} />
          <Route path="/service-areas" element={<ServiceAreas />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
        <Footer onLeaveReview={openReviewModal} />
      </div>
    </Router>
  );
}

export default App;
