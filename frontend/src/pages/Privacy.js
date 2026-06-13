import React from 'react'

const Privacy = () => {
  return (
    <div>
              {/* 6. PRIVACY POLICY SECTION */}
      <section className="info-content-block privacy-panel">
        <div className="info-inner">
          <span className="section-mini-tag">Legal Framework</span>
          <h2>Privacy Policy</h2>
          <p className="last-updated">Last Updated: June 2026</p>
          <p>
            QuickWash respects your privacy and is committed to protecting your
            personal information. This policy describes how we collect, store,
            and utilize data metrics safely across operations.
          </p>

          <div className="policy-group">
            <h3>Information We Collect</h3>
            <p>
              We may collect and retain: Name, Email address, verified Phone
              number, Pickup and delivery addresses, detailed Transactional
              Order history, and encrypted Payment-related secure tokens.
            </p>
          </div>

          <div className="policy-group">
            <h3>How We Use Information</h3>
            <p>
              We use collected data maps to process laundry logs, safely route
              assignment schedules to delivery partners, communicate text
              updates, and optimize continuous customer support diagnostics.
            </p>
          </div>

          <div className="policy-group">
            <h3>Data Security & Third-Party Actions</h3>
            <p>
              We implement strict firewall layers to safeguard information
              profiles. QuickWash coordinates with verified banking systems and
              secure maps mapping extensions only to handle fulfillment
              necessities.
            </p>
          </div>

          <div className="policy-group">
            <h3>Cookies & User Rights</h3>
            <p>
              We utilize operational cookies to maintain secure sessions. Users
              hold complete authority to modify profile fields or request
              erasure of specific log items by contacting our legal support desk
              at <a href="mailto:privacy@quickwash.com">privacy@quickwash.com</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Privacy