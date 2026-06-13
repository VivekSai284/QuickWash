import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  const serviceList = [
    {
      id: 'wash-fold',
      title: 'Wash & Fold',
      icon: '🧺',
      description: 'Everyday laundry sorted, washed, cleanly dried, and perfectly folded. Ideal for t-shirts, jeans, bed sheets, and casual wear.',
      turnaround: '24 Hours',
      price: '₹99 / kg'
    },
    {
      id: 'dry-cleaning',
      title: 'Dry Cleaning',
      icon: '🧥',
      description: 'Premium care for delicate garments. Specialized solvent treatment to remove stains and protect fabrics like silk, wool, and suits.',
      turnaround: '48 Hours',
      price: 'From ₹149 / item'
    },
    {
      id: 'steam-ironing',
      title: 'Steam Ironing',
      icon: '💨',
      description: 'Crisp, wrinkle-free perfection using advanced temperature-controlled steam press systems. Delivered ready-to-wear on hangers.',
      turnaround: '24 Hours',
      price: '₹19 / item'
    }
  ];

  return (
    <div className="services-page">
      {/* Services Header */}
      <header className="services-header">
        <span className="services-tag">Our Menu</span>
        <h1>Professional Garment Care</h1>
        <p>Select from our range of specialized laundry treatments. Book online and let our partners handle the rest.</p>
      </header>

      {/* Services Grid Layout */}
      <section className="services-main-grid">
        {serviceList.map((service) => (
          <div key={service.id} className="service-detail-card" id={service.id}>
            <div className="service-icon-header">
              <span className="s-emoji">{service.icon}</span>
              <span className="s-time">⏱ {service.turnaround}</span>
            </div>
            <h2>{service.title}</h2>
            <p>{service.description}</p>
            
            <div className="service-pricing-row">
              <div className="price-box">
                <span className="price-label">Rate</span>
                <span className="price-amount">{service.price}</span>
              </div>
              <Link to="/book-laundry" className="service-card-btn">
                Select Service
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Trust Banner Callout */}
      <section className="services-trust-banner">
        <h2>The QuickWash Quality Guarantee</h2>
        <p>Every item is processed individually using eco-friendly detergents and sanitized processing cycles.</p>
        <div className="trust-badges-row">
          <div className="t-badge">✨ 100% Premium Care</div>
          <div className="t-badge">🧼 Sanitized Drums</div>
          <div className="t-badge">🚚 Secure Doorstep Delivery</div>
        </div>
      </section>
    </div>
  );
};

export default Services;