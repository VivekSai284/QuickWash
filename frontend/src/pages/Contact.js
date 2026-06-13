import React from 'react'

const Contact = () => {
  return (
    <div>
        
      {/* 5. CONTACT SECTION */}
      <section className="info-content-block contact-panel">
        <div className="info-inner">
          <span className="section-mini-tag">Get In Touch</span>
          <h2>Contact Us</h2>
          <p className="lead-text">
            We'd love to hear from you. If you have questions about your order,
            service availability, payments, or any other concerns, please
            contact our support team.
          </p>

          <div className="contact-grid">
            <div className="contact-meta-card">
              <h4>Customer Support</h4>
              <p><strong>Email:</strong> <a href="mailto:support@quickwash.com">support@quickwash.com</a></p>
              <p><strong>Phone:</strong> +91 98765 43210</p>
              <p><strong>Business Hours:</strong> Mon – Sat: 8:00 AM – 8:00 PM</p>
            </div>

            <div className="contact-meta-card">
              <h4>Headquarters Office</h4>
              <p><strong>Corporate Address:</strong></p>
              <address>
                QuickWash Laundry Services Ltd,<br />
                Tech Hub Sector, 4th Floor,<br />
                Hyderabad, Telangana, India
              </address>
            </div>
          </div>
          <p className="form-notice">
            You can also use the contact form inside your user account console
            to submit verification inquiries or general feedback loops directly.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Contact