import React from 'react'

const About = () => {
  return (
    <div>
        {/* 4. ABOUT SECTION */}
      <section className="info-content-block about-panel">
        <div className="info-inner">
          <span className="section-mini-tag">Our Profile</span>
          <h2>About QuickWash</h2>
          <p className="lead-text">
            QuickWash is a convenient laundry pickup and delivery service
            designed to save customers time and effort. Our platform allows
            users to schedule laundry pickups, select washing services, track
            order progress, and receive freshly cleaned clothes at their
            doorstep.
          </p>
          <p>
            Our mission is to provide a reliable, affordable, and hassle-free
            laundry experience through technology and efficient delivery
            operations.
          </p>

          <div className="perks-box">
            <h3>With QuickWash, customers can:</h3>
            <ul className="styled-list">
              <li>Schedule laundry pickups online seamlessly</li>
              <li>Track order processing status in real time</li>
              <li>Choose safe, convenient payment methods</li>
              <li>Enjoy professional washing and premium garment care</li>
              <li>Receive timely, contactless doorstep delivery</li>
            </ul>
          </div>
          <p>
            We are committed to delivering quality service, absolute
            transparency, and complete customer satisfaction at every step of
            the laundry process.
          </p>
        </div>
      </section>
    </div>
  )
}

export default About