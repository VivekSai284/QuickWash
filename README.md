# QuickWash - Laundry Pickup & Delivery Management System

## Overview

QuickWash is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application that allows customers to schedule laundry pickups, track orders, and receive cleaned clothes at their doorstep. The platform also includes dedicated dashboards for delivery partners and administrators.

The application streamlines the entire laundry workflow from booking and pickup to washing and delivery while providing real-time order status tracking.

---

## Features

### Customer Features

* User Registration and Login
* JWT Authentication
* Book Laundry Services
* Add Laundry Items to Cart
* Quantity Management
* Checkout and Order Placement
* Cash on Delivery (COD) Support
* Online Payment Ready (Razorpay Integration)
* View Order History
* Track Order Status
* Cancel Orders Before Pickup
* Responsive Mobile-Friendly Interface

### Delivery Partner Features

* Partner Registration and Login
* View Assigned Deliveries
* Accept Orders
* Update Delivery Status
* Mark Orders as:

  * Picked Up
  * Washing
  * Out For Delivery
  * Delivered
* Manage Active Deliveries

### Admin Features

* Secure Admin Dashboard
* View Platform Statistics
* View Total Users
* View Total Delivery Partners
* View Total Orders
* Revenue Tracking
* Order Status Analytics
* Recent Orders Monitoring
* User Management
* Delivery Partner Management
* Order Management
* Role-Based Access Control

---

## Technology Stack

### Frontend

* React.js
* React Router DOM
* Axios
* React Toastify
* CSS3

### Backend

* Node.js
* Express.js
* JWT Authentication
* bcryptjs

### Database

* MongoDB
* Mongoose

### Payment Gateway

* Razorpay (Integration Ready)

---

## User Roles

### Customer

Customers can:

* Register and Login
* Book Laundry Services
* Place Orders
* Track Orders
* Cancel Orders Before Pickup

### Delivery Partner

Partners can:

* Accept Orders
* Manage Deliveries
* Update Order Status
* Complete Deliveries

### Admin

Administrators can:

* Monitor Platform Activities
* Manage Users
* Manage Partners
* Manage Orders
* View Analytics and Revenue

---

## Order Lifecycle

```text
Pending
   ↓
Assigned
   ↓
Picked Up
   ↓
Washing
   ↓
Out For Delivery
   ↓
Delivered
```

### Cancellation Policy

Orders can only be cancelled while the status is:

* Pending
* Assigned

Orders cannot be cancelled after pickup.

---

## Project Structure

```text
QuickWash/

├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── App.js
│   │   └── index.js
│   │
│   └── public/
│
└── README.md
```

---

## Security Features

* JWT Authentication
* Password Hashing using bcrypt
* Protected Routes
* Role-Based Authorization
* Admin Access Control
* Partner Access Control

---

## Future Enhancements

* Razorpay Online Payments
* Email Notifications
* SMS Notifications
* Push Notifications
* Order Tracking Timeline
* Revenue Charts and Analytics
* Customer Reviews and Ratings
* Service Area Management
* Invoice Generation
* Export Reports to Excel/PDF

---

## Deployment

 - Frontend - Render(Static Site)
 - Backend - Render(Web Services)
 - DataBase - MongoDB

Checkout here https://quickwash-u9d0.onrender.com

It will take some time to load the render backend. If it is loading please wait some time.

---

## Author

Developed as a Full Stack MERN Project demonstrating authentication, role-based access control, order management, delivery workflow management, and administrative operations.
