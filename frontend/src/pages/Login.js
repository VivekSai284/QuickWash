import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Popup from "../components/Popup";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "",
  });
  const [itemData, setItemData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await axios.post(
        "https://quickwash-l49a.onrender.com/auth/login",
        itemData,
      );
      localStorage.setItem("token", response.data.token);
      setPopup({
        show: true,
        title: "Login Successful",
        message: "Welcome back to QuickWash",
        type: "success",
      });

      setTimeout(() => {
        if (response.data.user?.role === "partner") {
        navigate("/partner-dashboard");
      } else {
        navigate("/dashboard");
      }
      }, 3000)
      localStorage.setItem("user", JSON.stringify(response.data.user));

      
    } catch (error) {
      setPopup({
        show: true,
        title: "Login Failed",
        message: error.response.data.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }

    setItemData({
      email: "",
      password: "",
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
      })} /><div className="login">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
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

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>


      </div></>
  );
};

export default Login;
