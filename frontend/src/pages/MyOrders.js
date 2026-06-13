import React, { useEffect, useState } from "react";

import axios from "axios";
import Loader from "../components/Loader";
import Popup from "../components/Popup";

const MyOrders = () => {
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

      const res = await axios.get("http://localhost:5000/orders/my-orders", {
        headers: {
          Authorization: token,
        },
      });

      setOrders(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/orders/cancel/${id}`,
        {},
        {
          headers: {
            Authorization: token,
          },
        },
      );

      setPopup({
        show: true,
        title: "Order cancelled successfully",
        message: "",
        type: "success",
      });

      fetchOrders();
    } catch (error) {
      setPopup({
        show: true,
        title: "Order cancelled failed",
        message: error.response?.data?.message,
        type: "error",
      });
    }
  };

  const confirmCancel = (id) => {
    const ok = window.confirm("Are you sure you want to cancel this order?");

    if (ok) {
      cancelOrder(id);
    }
  };

  if (loading) {
    return <Loader text="Loading Orders..." />;
  }

  return (
    <>
      <Popup
        show={popup.show}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() =>
          setPopup({
            ...popup,
            show: false,
          })
        }
      />
      <div className="orders-page">
        <h1 className="page-title">My Orders</h1>

        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              {/* Top Header Row of the Card */}
              <div className="order-header">
                <div className="order-meta">
                  <span className="meta-label">Pickup Date</span>
                  <span className="meta-value">
                    {new Date(order.pickupDate).toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Status badge that changes color based on string content */}
                <span
                  className={`status-badge ${order.orderStatus.toLowerCase()}`}
                >
                  {order.orderStatus}
                </span>
              </div>

              {/* Bottom Details Row of the Card */}
              <div className="order-details">
                <div className="detail-item">
                  <span className="detail-label">Payment Mode</span>
                  <span className="detail-value">{order.paymentMethod}</span>
                </div>

                <div className="detail-item price-item">
                  <span className="detail-label">Total Amount</span>
                  <span className="detail-value amount">
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>
                              <div className="order-cancellation-control-zone">
                  {order.orderStatus === "Pending" ||
                  order.orderStatus === "Assigned" ? (
                    /* active cancellation track allowed */
                    <button
                      className="client-cancel-order-btn"
                      onClick={() => confirmCancel(order._id)}
                    >
                      🛑 Cancel Order
                    </button>
                  ) : (
                    /* lock state warning alert message box */
                    <div className="cancellation-locked-notice">
                      <span className="lock-icon">🔒</span>
                      <div className="notice-content-text">
                        <h5>Cancellation Locked</h5>
                        <p>
                          This order has already been picked up or is currently
                          undergoing cleaning diagnostics. Processed shipments
                          cannot be modified.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MyOrders;
