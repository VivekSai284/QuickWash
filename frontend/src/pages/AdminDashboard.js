import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [topPartners, setTopPartners] = useState([]);
  const [loading, setLoading] = useState(true); // Added tracking state

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/admin/stats", {
        headers: { Authorization: token },
      });

      const partnerRes = await axios.get(
        "http://localhost:5000/admin/top-partners",
        {
          headers: { Authorization: token },
        },
      );

      setTopPartners(partnerRes.data);
      setStats(res.data);
    } catch (error) {
      console.error("Admin aggregation failure:", error);
    } finally {
      setLoading(false); // Fixed parameters bug
    }
  };

  if (loading) return <Loader text="Assembling global overview stats..." />;

  return (
    <div className="admin-container">
      <nav className="admin-sub-navbar">
        <div className="nav-brand-indicator">
          <span className="nav-pulse-dot"></span> System Directories
        </div>
        <div className="nav-links-wrapper">
          <Link to={"/admin/users"} className="admin-nav-tab">
            👥 Manage Users
          </Link>
          <Link to={"/admin/partners"} className="admin-nav-tab">
            🚚 Roster Partners
          </Link>
          <Link to={"/admin/orders"} className="admin-nav-tab">
            📦 Audit Invoices
          </Link>
        </div>
      </nav>
      <header className="admin-header-strip">
        <div>
          <span className="admin-pill-tag">System Terminal</span>
          <h1>Admin Command Control</h1>
          <p>Real-time analytics and management dashboard for operations.</p>
        </div>
      </header>

      {/* 4-COLUMN MACRO SUMMARY STATS METRICS GRID */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="card-deco blue-deco"></div>
          <span className="sc-label">Total Platform Users</span>
          <p className="sc-value">{stats.users || 0}</p>
        </div>
        <div className="stat-card">
          <div className="card-deco purple-deco"></div>
          <span className="sc-label">Active Fleet Partners</span>
          <p className="sc-value">{stats.partners || 0}</p>
        </div>
        <div className="stat-card">
          <div className="card-deco orange-deco"></div>
          <span className="sc-label">Processed Invoices</span>
          <p className="sc-value">{stats.orders || 0}</p>
        </div>
        <div className="stat-card">
          <div className="card-deco green-deco"></div>
          <span className="sc-label">Gross Platform Revenue</span>
          <p className="sc-value">₹{stats.revenue || 0}</p>
        </div>
      </section>

      {/* TWO COLUMN GRID DISPLAY PANEL */}
      <div className="admin-split-layout">
        {/* Left Column: Progress Metric Bars */}
        <section className="status-section panel-card">
          <h2>Order Distribution</h2>
          <div className="metric-bars-holder">
            {[
              {
                label: "Pending Requests",
                value: stats.pending,
                color: "#d97706",
              },
              {
                label: "Assigned Runs",
                value: stats.assigned,
                color: "#2563eb",
              },
              {
                label: "In Courier Custody",
                value: stats.pickedUp,
                color: "#0284c7",
              },
              {
                label: "Washing Operations",
                value: stats.washing,
                color: "#a855f7",
              },
              {
                label: "Out For Delivery",
                value: stats.outForDelivery,
                color: "#4f46e5",
              },
              {
                label: "Successfully Completed",
                value: stats.delivered,
                color: "#10b981",
              },
              {
                label: "Cancelled Tickets",
                value: stats.cancelled,
                color: "#ef4444",
              },
            ].map((item, idx) => (
              <div className="progress-row-wrapper" key={idx}>
                <div className="pr-info">
                  <span>{item.label}</span>
                  <strong>{item.value || 0}</strong>
                </div>
                <div className="pr-track">
                  <div
                    className="pr-fill"
                    style={{
                      width: `${Math.min(((item.value || 0) / (stats.orders || 1)) * 100, 100)}%`,
                      backgroundColor: item.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column Stack: Recent Logs & Leaderboard */}
        <div className="admin-right-stack">
          <section className="recent-orders panel-card">
            <h2>Recent Activity Logs</h2>
            <div className="row-items-container">
              {stats.recentOrders?.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div key={order._id} className="order-row-item">
                    <div className="or-user">
                      <span>👤</span>
                      <strong>{order.user?.username || "Guest Account"}</strong>
                    </div>
                    <span className="or-amt">₹{order.totalAmount}</span>
                    <span
                      className={`or-badge-pill ${order.orderStatus?.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                ))
              ) : (
                <p className="empty-table-prompt">
                  No invoices recorded inside active cycle cache.
                </p>
              )}
            </div>
          </section>

          <section className="top-partners panel-card">
            <h2>Top Performing Drivers</h2>
            <div className="row-items-container">
              {topPartners.map((partner, idx) => (
                <div key={partner._id} className="partner-leaderboard-row">
                  <div className="pl-identity">
                    <span className="rank-index">#{idx + 1}</span>
                    <strong>{partner.username}</strong>
                  </div>
                  <span className="delivery-count-badge">
                    📦 {partner.deliveries} Drops
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
