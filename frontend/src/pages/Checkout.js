import React, { useState } from "react";
import axios from "axios";
import Popup from "../components/Popup";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "",
  });
  const [address, setAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const items = JSON.parse(localStorage.getItem("laundryItems")) || [];

  const cart = JSON.parse(localStorage.getItem("cart")) || {};

  const total = items.reduce(
    (sum, item) => sum + item.price * (cart[item._id] || 0),
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true)
      const token = localStorage.getItem("token");
      const cart = JSON.parse(localStorage.getItem("cart")) || {};

      const orderItems = items
        .filter((item) => cart[item._id] > 0)
        .map((item) => ({
          itemId: item._id,
          name: item.name,
          price: item.price,
          quantity: cart[item._id],
        }));

      await axios.post(
        "https://quickwash-l49a.onrender.com/orders",
        {
          items: orderItems,
          totalAmount: total,
          pickupAddress: address,
          pickupDate,
          paymentMethod,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      localStorage.removeItem("cart");
      localStorage.removeItem("laundryItems");

            setPopup({
        show: true,
        title: "Order Placed Successfully",
        message: "Go on with your Ordering",
        type: "success",
      });
      setTimeout(() => {
        navigate("/my-orders");
      }, 3000)
      
    } catch (error) {
            setPopup({
        show: true,
        title: "Order Failed",
        message: error.response?.data?.message,
        type: "error",
      });
    }finally{
      setLoading(false)
    }
  };
  return (

    <><Popup
      show={popup.show}
      title={popup.title}
      message={popup.message}
      type={popup.type}
      onClose={() => setPopup({
        ...popup,
        show: false,
      })} /><div className="checkout-page">
        <h1 className="page-title">Checkout</h1>

        <div className="checkout-layout">
          {/* Left Side: Order Details Summary Box */}
          <div className="checkout-summary-card">
            <h2>Order Summary</h2>

            <div className="checkout-items-list">
              {items
                .filter((item) => cart[item._id] > 0)
                .map((item) => (
                  <div key={item._id} className="checkout-item-row">
                    <span className="item-meta">{item.name} <span className="item-qty">× {cart[item._id]}</span></span>
                    <span className="item-subtotal">₹{item.price * cart[item._id]}</span>
                  </div>
                ))}
            </div>

            <div className="checkout-total-bar">
              <span>Grand Total</span>
              <span className="total-amount">₹{total}</span>
            </div>
          </div>

          {/* Right Side: Delivery & Logistics Form */}
          <div className="checkout-form-card">
            <h2>Logistics & Payment</h2>

            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label>Pickup Address</label>
                <textarea
                  placeholder="Enter your complete street address, apartment number, and landmark..."
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Pickup Date</label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="COD">Cash On Delivery (COD)</option>
                  <option value="ONLINE">Online Payment (UPI / Cards)</option>
                </select>
              </div>

              <button type="submit" className="place-order-btn" disabled={loading}>
                {loading ? "Placing Order..." : "Place Secure Order"}
              </button>
            </form>
          </div>
        </div>
      </div></>
  );
};

export default Checkout;
