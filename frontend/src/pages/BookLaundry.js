import React, { useEffect, useState } from "react";
import Popup from "../components/Popup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const BookLaundry = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
    const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "",
  });
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");

    return savedCart ? JSON.parse(savedCart) : {};
  });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const fetchItems = async () => {
    try {
      const response = await axios.get("https://quickwash-l49a.onrender.com/items");

      setItems(response.data);
    } catch (error) {
        setPopup({
        show: true,
        title: "Error",
        message: error.message,
        type: "error",
      });
    }finally{
      setLoading(false)
    }
  };

  const increaseQty = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decreaseQty = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }));
  };

  const total = items.reduce((sum, item) => {
    return sum + item.price * (cart[item._id] || 0);
  }, 0);

  const proceedToCheckout = () => {
    localStorage.setItem("laundryItems", JSON.stringify(items));

    navigate("/checkout");
  };


  if(loading){
    return <Loader text="Loading Laundry Items..."/>
  }

  return (
    <><Popup
      show={popup.show}
      title={popup.title}
      message={popup.message}
      type={popup.type}
      onClose={() => setPopup({
        ...popup,
        show: false,
      })} /><div className="book-laundry">
        <h1 className="page-title">Book Laundry Now</h1>

        <div className="booking-layout">
          {/* Left Side: Service Items List */}
          <div className="laundry-items-grid">
            {items.map((item) => (
              <div key={item._id} className="laundry-item-card">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="item-price">₹{item.price}</p>
                </div>

                <div className="quantity-controls">
                  <button
                    className="qty-btn"
                    onClick={() => decreaseQty(item._id)}
                  >
                    -
                  </button>
                  <span className="qty-count">{cart[item._id] || 0}</span>
                  <button
                    className="qty-btn"
                    onClick={() => increaseQty(item._id)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Cart Summary Sticky Panel */}
          <div className="cart-summary">
            <h2>Cart Summary</h2>
            <div className="cart-items-list">
              {items
                .filter((item) => cart[item._id] > 0)
                .map((item) => (
                  <div key={item._id} className="cart-summary-row">
                    <span className="summary-item-name">
                      {item.name} × {cart[item._id]}
                    </span>
                    <span className="summary-item-total">
                      ₹{item.price * cart[item._id]}
                    </span>
                  </div>
                ))}
            </div>

            <div className="total-section">
              <span>Total Amount</span>
              <span className="grand-total">₹{total}</span>
            </div>

            <button
              className="checkout-btn"
              disabled={total === 0}
              onClick={proceedToCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div></>
  );
};

export default BookLaundry;
