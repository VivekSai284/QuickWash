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
      <Link to="/services">Wash & Fold</Link>
      <Link to="/services">Steam Ironing</Link>
    </div>

    {/* Support Column */}
    <div className="footer-links">
      <h3>Company</h3>
      <Link to>About Us</Link>
      <Link to="/contact">Contact Support</Link>
      <Link to="/privacy">Privacy Policy</Link>
    </div>
  </div>

  {/* Copyright Bar */}
  <div className="footer-bottom">
    <p>Made with ❤️ by Vivek.</p>
    <p>&copy; {new Date().getFullYear()} QuickWash. All rights reserved.</p>
  </div>
</footer>
  )
}

export default Footer