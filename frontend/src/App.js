import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useState } from "react";
import PartnerDashboard from "./pages/PartnerDashboard";
import BookLaundry from "./pages/BookLaundry";
import ProtectedRoute from "./components/ProtectedRoute";
import PartnerRoute from "./components/PartnerRoute";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import CheckoutRoute from "./components/CheckoutRoute";
import MyDeliveries from "./pages/MyDeliveries";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Service from "./components/Service";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminPartners from "./pages/AdminPartners";
import AdminUsers from "./pages/AdminUser";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner-dashboard"
            element={
              <PartnerRoute>
                <PartnerDashboard />
              </PartnerRoute>
            }
          />
          <Route
            path="/book-laundry"
            element={
              <ProtectedRoute>
                <BookLaundry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutRoute>
                <Checkout />
              </CheckoutRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route path="/my-deliveries" element={<MyDeliveries />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/services" element={<Service />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />

          <Route path="/admin/orders" element={<AdminOrders />} />

          <Route path="/admin/partners" element={<AdminPartners />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
