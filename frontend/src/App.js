import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useState } from 'react';
import PartnerDashboard from './pages/PartnerDashboard';
import BookLaundry from './pages/BookLaundry'
import ProtectedRoute from './components/ProtectedRoute';
import PartnerRoute from './components/PartnerRoute';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import CheckoutRoute from './components/CheckoutRoute';
import MyDeliveries from './pages/MyDeliveries';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Service from './components/Service';

function App() {
  return (
    <div>
        <BrowserRouter>
        <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/partner-dashboard" element={<PartnerRoute><PartnerDashboard /></PartnerRoute>} />
            <Route path="/book-laundry" element={<ProtectedRoute><BookLaundry /></ProtectedRoute>} />
            <Route path='/checkout' element = {<CheckoutRoute><Checkout/></CheckoutRoute>} />
            <Route path='/my-orders' element = {<ProtectedRoute><MyOrders/></ProtectedRoute>}/>
            <Route path = '/my-deliveries' element = {<MyDeliveries/>}/>
            <Route path='/about' element = {<About/>}/>
            <Route path='/contact' element = {<Contact/>}/>
            <Route path='/privacy' element = {<Privacy/>}/>
            <Route path='/services' element = {<Service/>} />
          </Routes>
          <Footer/>
      </BrowserRouter>
      {/* Styled Notification Layer */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
