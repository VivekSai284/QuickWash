import React from "react";
import { Link } from "react-router-dom";

const Home = ({ token }) => {
  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Sparkling Clean, Delivered Fast</span>
          <h1>Premium Laundry Services Right To Your Doorstep</h1>
          <p>
            QuickWash takes the hassle out of chores. Book a pickup in seconds,
            track your order status, and enjoy pristine laundry delivered back
            to you.
          </p>
          <div className="hero-cta-group">
            <Link to="/book-laundry" className="btn btn-primary">
              Book a Wash Now
            </Link>
            {!token && (
              <Link to="/register" className="btn btn-secondary">
                Become a Partner
              </Link>
            )}
          </div>
        </div>
        <div className="hero-graphic animated-laundry-hub">
          {/* Rising Ambient Bubbles */}
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
          <div className="bubble bubble-4"></div>

          {/* CSS Washing Machine Appliance */}
          <div className="washing-machine">
            <div className="control-panel">
              <div className="led-display">00:24</div>
              <div className="dial"></div>
            </div>

            <div className="washer-door">
              {/* The interior rotating water/clothing mix */}
              <div className="washer-drum">
                <div className="water-swirl"></div>
                <div className="clothing-item clothing-1">👕</div>
                <div className="clothing-item clothing-2">🧦</div>
                <div className="bubble bubble-5"></div>
                <div className="bubble bubble-6"></div>
                <div className="bubble bubble-7"></div>
                <div className="bubble bubble-8"></div>
                <div className="bubble bubble-5"></div>
                <div className="bubble bubble-6"></div>
                <div className="bubble bubble-7"></div>
                <div className="bubble bubble-8"></div>
                <div className="bubble bubble-5"></div>
                <div className="bubble bubble-6"></div>
                <div className="bubble bubble-7"></div>
                <div className="bubble bubble-8"></div>
              </div>
            </div>
          </div>

          {/* Pop floating stats label */}
          <div className="live-status-badge">
            <span className="pulse-dot"></span>
            <p>Processing Orders Live</p>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="steps-section">
        <h2 className="section-title">How QuickWash Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Select Services</h3>
            <p>
              Choose from Wash & Fold, Dry Cleaning, or Steam Ironing items from
              our menu.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Schedule Pickup</h3>
            <p>
              Provide your home address and choose a pickup date that fits your
              calendar.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Partner Fulfill</h3>
            <p>
              Our trusted local driver partners collect, process, and return
              your clothes clean.
            </p>
          </div>
        </div>
      </section>

      {/* 3. DUAL-USER PORTAL FEATURES */}
      <section className="portals-section">
        <div className="portal-card client-portal">
          <h2>Looking for Laundry Services?</h2>
          <p>
            Track live updates, review your historic orders, and book premium
            handling on-demand.
          </p>
          <Link to="/dashboard" className="portal-link">
            Go to Customer Console →
          </Link>
        </div>

        <div className="portal-card partner-portal">
          <h2>Earn Money as a Partner</h2>
          <p>
            Accept nearby pickup requests, handle local deliveries, and monitor
            your earnings dynamically.
          </p>
          <Link to="/partner-dashboard" className="portal-link partner-text">
            Open Partner Console →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
