import React,
{
  useEffect,
  useState,
} from "react";

import axios from "axios";

const AdminOrders = () => {
  const [orders, setOrders] =
    useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders =
    async () => {
      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await axios.get(
          "https://quickwash-l49a.onrender.com/admin/orders",
          {
            headers: {
              Authorization:
                token,
            },
          }
        );

      setOrders(res.data);
    };

 return (
  <div className="admin-container">
    <header className="admin-header-strip">
      <div>
        <span className="admin-pill-tag">System Data Ledger</span>
        <h1>Platform Transaction Vault</h1>
        <p>Comprehensive audit record of all consumer orders placed on the system network.</p>
      </div>
    </header>

    <div className="table-responsive-wrapper panel-card">
      <table className="admin-native-table">
        <thead>
          <tr>
            <th>Customer Account</th>
            <th>Invoice Value</th>
            <th>Fulfillment Status</th>
            <th>Payment Mechanism</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="bold-cell">👤 {order.user?.username || "Deleted User"}</td>
              <td className="currency-cell">₹{order.totalAmount}</td>
              <td>
                <span className={`or-badge-pill ${order.orderStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {order.orderStatus}
                </span>
              </td>
              <td className="payment-type-cell">💳 {order.paymentMethod}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

export default AdminOrders;