import React from 'react'
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
  <div className="footer-container">
    {/* Brand Section */}
    <div className="footer-brand">
      <div className="logo">QuickWash</div>
      <p>Premium laundry and dry cleaning services delivered right to your doorstep.</p>
    </div>

    {/* Quick Links Column */}
    <div className="footer-links">
      <h3>Services</h3>
      <Link to="/services">Dry Cleaning </Link>
      <a href="/services">Wash & Fold</a>
      <a href="/services">Steam Ironing</a>
    </div>

    {/* Support Column */}
    <div className="footer-links">
      <h3>Company</h3>
      <a href="/about">About Us</a>
      <a href="/contact">Contact Support</a>
      <a href="/privacy">Privacy Policy</a>
    </div>
  </div>

  {/* Copyright Bar */}
  <div className="footer-bottom">
    <p>&copy; {new Date().getFullYear()} QuickWash. All rights reserved.</p>
  </div>
</footer>
  )
}

export default Footer