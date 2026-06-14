import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Popup from "./Popup";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "",
  });

  const logout = () => {
    localStorage.clear();
    setPopup({
      show: true,
      title: "Logout Successful",
      message: "Come back to QuickWash",
      type: "info",
    });
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };

  const user = JSON.parse(localStorage.getItem("user") || "null");

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
      <nav className="navbar">
        <div className="logo">QuickWash</div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          {token && user?.role === "user" && (
            <Link to="/book-laundry">Book Laundry</Link>
          )}
          {token && user?.role === "partner" && (
            <Link to="/my-deliveries">My Deliveries</Link>
          )}
          {token && user?.role === "user" && (
            <Link to="/dashboard">Dashboard</Link>
          )}

          {token && user?.role === "partner" && (
            <Link to="/partner-dashboard">Deliveries</Link>
          )}

          {user?.role === "admin" && <Link to="/admin">Admin Panel</Link>}

          {token ? (
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
