import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader'; // Ensure this matches your relative directory path

const PartnerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Partner' };
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://quickwash-l49a.onrender.com/orders/pending", {
        headers: { Authorization: token }
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      setLoading(false); // <-- Fixed empty function parameter logic bug
    }
  };

  const acceptOrder = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://quickwash-l49a.onrender.com/orders/accept/${id}`, {}, {
        headers: { Authorization: token }
      });
      fetchOrders();
    } catch (error) {
      console.error("Error accepting job profile item:", error);
    }
  };

  // <-- Integrated missing loader conditional layout validation check
  if (loading) {
    return <Loader text="Scanning your local map for pending orders..." />;
  }

  return (
    <div className="partner-dashboard">
      {/* Dynamic Profile Welcome Banner Block */}
      <div className="dashboard-header">
        <div className="header-text-side">
          <span className="dashboard-badge">Partner Dashboard</span>
          <h1>Welcome, {user.username} 👋</h1>
          <p className="dashboard-subtitle">Here are the available laundry pickup requests in your local area.</p>
        </div>
        <div className="dashboard-stats-side">
          <div className="stat-mini-pill">
            <span className="pill-dot glow"></span> Live Feed
          </div>
        </div>
      </div>

      <h2 className="section-title">Available Requests ({orders.length})</h2>

      {orders.length === 0 ? (
        <div className="empty-feed-card">
          <span className="empty-feed-icon">🎯</span>
          <h3>All Caught Up!</h3>
          <p>There are no open laundry jobs waiting in your territory right now. Check back shortly!</p>
        </div>
      ) : (
        <div className="partner-orders-grid">
          {orders.map((order) => (
            <div key={order._id} className="partner-order-card">
              
              {/* Top Earnings & Client Row */}
              <div className="partner-card-header">
                <div className="client-info">
                  <span className="meta-label">Customer</span>
                  <h3>{order.user?.username || "QuickWash Client"}</h3>
                </div>
                <div className="payout-info">
                  <span className="meta-label">Earnings</span>
                  <span className="payout-amount">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Address Body Section */}
              <div className="partner-card-body">
                <span className="meta-label">Pickup Address</span>
                <p className="pickup-address">📍 {order.pickupAddress}</p>
              </div>

              {/* Action Button Footer */}
              <div className="partner-card-footer">
                <button 
                  className="accept-job-btn"
                  onClick={() => acceptOrder(order._id)}
                >
                  Accept Pickup Job
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartnerDashboard;