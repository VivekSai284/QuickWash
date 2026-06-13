import React, { useEffect, useState } from "react";
import axios from "axios";
import Popup from "../components/Popup";
import Loader from "../components/Loader";

const MyDeliveries = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/orders/partner-orders",
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setOrders(res.data);
    } catch (error) {
      setPopup({
        show: true,
        title: "Failed to load deliveries",
        message: error.response?.data?.message || "Check your backend server parameters.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/orders/status/${id}`,
        { status },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setPopup({
        show: true,
        title: "Status Updated! ✨",
        message: `Order successfully marked as "${status}".`,
        type: "success",
      });
      fetchOrders();
    } catch (error) {
      setPopup({
        show: true,
        title: "Failed to update status",
        message: error.response?.data?.message || "Please try again.",
        type: "error",
      });
    }
  };

  // Maps order status text to clean interactive execution buttons
  const getNextStatusButton = (order) => {
    const statusMap = {
      "Assigned": { text: "🚚 Mark Picked Up", next: "Picked Up", class: "btn-assigned" },
      "Picked Up": { text: "🧼 Start Washing", next: "Washing", class: "btn-wash" },
      "Washing": { text: "📦 Out For Delivery", next: "Out For Delivery", class: "btn-delivery" },
      "Out For Delivery": { text: "✅ Mark Delivered", next: "Delivered", class: "btn-success" }
    };

    const current = statusMap[order.orderStatus];

    if (order.orderStatus === "Delivered") {
      return (
        <div className="completed-order-banner">
          <span>🎉 Order Completed</span>
        </div>
      );
    }

    if (current) {
      return (
        <button
          className={`partner-action-btn ${current.class}`}
          onClick={() => updateStatus(order._id, current.next)}
        >
          {current.text}
        </button>
      );
    }

    return null;
  };

  if (loading) {
    return <Loader text="Loading your assignment logs..." />;
  }

  return (
    <div className="deliveries-container">
      <Popup
        show={popup.show}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, show: false })}
      />

      <header className="deliveries-header-block">
        <span className="partner-mini-badge">Fulfillment Hub</span>
        <h1 className="page-title">Active Partner Runs</h1>
        <p>Manage pickups, update garment care cycles, and log final route distribution parameters.</p>
      </header>

      {orders.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">💤</div>
          <h3>No Deliveries Assigned</h3>
          <p>Your queue is clear. New laundry requests from nearby addresses will stream here automatically.</p>
        </div>
      ) : (
        <div className="deliveries-grid">
          {orders.map((order) => (
            <div key={order._id} className="delivery-card">
              
              {/* Card Top Title Row */}
              <div className="delivery-card-header">
                <h3>ID: #{order._id.slice(-6).toUpperCase()}</h3>
                <span className={`status-badge ${order.orderStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                  {order.orderStatus}
                </span>
              </div>

              {/* Delivery Log Matrix */}
              <div className="delivery-card-body">
                <div className="meta-row">
                  <span className="meta-label">Customer</span>
                  <span className="meta-value name-value">{order.user?.username || "N/A"}</span>
                </div>

                <div className="meta-row">
                  <span className="meta-label">Contact</span>
                  <span className="meta-value highlight-phone">📞 {order.user?.phone || "N/A"}</span>
                </div>

                <div className="meta-row full-width">
                  <span className="meta-label">Address Mapping</span>
                  <span className="meta-value address-text">📍 {order.pickupAddress}</span>
                </div>

                <div className="meta-row full-width pricing-highlight-box">
                  <span className="meta-label">Total Cash Collection</span>
                  <span className="meta-value payout-text">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Collapsible/Sub-item List Panel */}
              <div className="delivery-items-panel">
                <h4>Manifest Item Logs ({order.items.length})</h4>
                <div className="items-mini-list">
                  {order.items.map((item, index) => (
                    <div key={index} className="mini-list-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity-badge">× {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Logic Button Control */}
              <div className="delivery-card-footer">
                {getNextStatusButton(order)}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDeliveries;