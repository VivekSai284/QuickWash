import React from 'react';
import MyOrders from './MyOrders';

const Dashboard = () => {
  // Safe extraction with a fallback value to prevent null pointer crashes
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Customer' };

  return (
    <div className="dashboard-wrapper">
      {/* 1. WELCOME PROFILE BANNER */}
      <header className="dashboard-hero-card">
        <div className="hero-profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="hero-welcome-text">
          <span className="dashboard-mini-badge">Customer Console</span>
          <h1>Welcome Back, {user.username}! 👋</h1>
          <p>Monitor your active laundry processing tickets, track drivers, and review past clean orders below.</p>
        </div>
      </header>

      {/* 2. MAIN HUB CONTENT CONTAINER */}
      <main className="dashboard-content-grid">
        <div className="orders-panel-card">
          <div className="panel-header-row">
            <h2>Your Laundry Orders</h2>
            <span className="live-pulse-indicator">
              <span className="pulse-core"></span>
              Live Tracking Enabled
            </span>
          </div>
          
          {/* Your orders subsystem renders seamlessly here inside the framed layout container */}
          <MyOrders />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;