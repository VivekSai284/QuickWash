 
# QuickWash – Online Laundry Booking Platform

QuickWash is a full-stack laundry service web application built using the MERN stack. It allows customers to book laundry services online, manage their orders, and make payments conveniently.

The platform connects customers with delivery partners and provides an admin dashboard to manage operations, monitor orders, and oversee the laundry service workflow.

## Features

### Customer Features
- Register and log in using email OTP verification.
- Save mobile number for contact purposes.
- Browse available laundry services.
- Place laundry service orders.
- View order details and track order status.
- Choose Cash on Delivery (COD) or online payment.
- Make online payments through Razorpay.
- View order history.

### Delivery Partner Features
- Partner registration and login.
- Access the partner dashboard.
- View assigned orders.
- Manage order progress.
- Update order statuses throughout the delivery process.

### Admin Features
- Dedicated admin access.
- Manage and monitor orders.
- View platform order statistics.
- Oversee delivery operations.

### Authentication and Security
- Email-based OTP verification.
- JWT-based authentication.
- Protected API routes.
- Role-based access control.
- Environment variables for sensitive configuration.
- Backend request validation and error handling.
- CORS configuration and security middleware.

## Order Workflow

Orders move through the following stages:

1. Pending
2. Assigned
3. Picked Up
4. Washing
5. Out For Delivery
6. Delivered

This workflow helps customers and administrators track the progress of every laundry order.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, Email OTP |
| Email Service | Nodemailer, Gmail SMTP |
| Payment Gateway | Razorpay |
| API Testing | Postman |
| Deployment | Render, Vercel |

## Project Architecture

QuickWash follows a client-server architecture.

- **Frontend:** Provides the user interface for customers, delivery partners, and administrators.
- **Backend:** Handles authentication, business logic, order management, and payment-related APIs.
- **Database:** MongoDB stores user information, orders, and application data.
- **Email Service:** Sends OTP verification emails.
- **Payment Gateway:** Razorpay handles online payment processing.


## API Testing

Backend APIs can be tested using Postman.

The application includes APIs for:
- User authentication and OTP verification.
- Service catalog retrieval.
- Order creation and management.
- Order status updates.
- Payment operations.
- Role-based dashboard functionality.

## Deployment

QuickWash uses separate frontend and backend deployments.

- Frontend: Render
- Backend: Vercel / Render (depending on the active deployment)
Checkout the website here https://quickwash-new-frontend.onrender.com/

## Future Improvements

- Real-time order tracking.
- Push notifications for order updates.
- Improved admin analytics.
- Order scheduling.
- Customer reviews and ratings.
- Enhanced mobile responsiveness.
- Automated testing and CI/CD integration.

## Project Goal

The goal of QuickWash is to simplify the laundry booking process by providing a convenient online platform where customers can book services, delivery partners can manage assigned orders, and administrators can monitor the entire operation.

---

**QuickWash – Making Laundry Booking Simple and Convenient.**
