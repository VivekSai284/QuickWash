import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Popup from "../components/Popup";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "",
  });
  const [itemData, setItemData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await axios.post(
        "https://quickwash-l49a.onrender.com/auth/register",
        itemData,
      );
      setPopup({
        show: true,
        title: "Registered Successful",
        message: "Welcome to QuickWash",
        type: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 3000)
    } catch (error) {
      setPopup({
        show: true,
        title: "Registered Failed",
        message: error.response.data.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }

    setItemData({
      username: "",
      email: "",
      password: "",
      phone: "",
      role: "",
    });
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
      })} /><div className="register">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            placeholder="Username"
            required
            value={itemData.username}
            onChange={(e) => {
              setItemData({
                ...itemData,
                username: e.target.value,
              });
            } } />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            placeholder="Email"
            required
            value={itemData.email}
            onChange={(e) => {
              setItemData({
                ...itemData,
                email: e.target.value,
              });
            } } />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            placeholder="Password"
            required
            value={itemData.password}
            onChange={(e) => {
              setItemData({
                ...itemData,
                password: e.target.value,
              });
            } } />

          <label htmlFor="phone">Phone:</label>
          <input
            type="text"
            placeholder="Phone"
            required
            value={itemData.phone}
            onChange={(e) => {
              setItemData({
                ...itemData,
                phone: e.target.value,
              });
            } } />

          <select
            value={itemData.role}
            onChange={(e) => {
              setItemData({
                ...itemData,
                role: e.target.value,
              });
            } }
            required
            placeholder="Select Role"
          >
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="partner">Partner</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
      </div></>
  );
};

export default Register;
