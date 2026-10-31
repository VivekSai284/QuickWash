# FreshFold — MERN Stack

FreshFold is a laundry pickup platform with customer and laundry-partner experiences.

## Stack
- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Email OTP login (demo OTP is returned only when SMTP is not configured)

## Requirements
Node.js 20+ recommended, npm, and a MongoDB Atlas/local MongoDB database.

## Run on Windows PowerShell

### 1. Backend
```powershell
cd "C:\My Files\Projects\FreshFold-MERN\server"
Copy-Item .env.example .env
# Edit .env and set MONGO_URI and JWT_SECRET
npm install
npm run dev
```
Backend runs at `http://localhost:5000`.

### 2. Frontend (new terminal)
```powershell
cd "C:\My Files\Projects\FreshFold-MERN\client"
npm install
npm run dev
```
Open the Vite URL printed in the terminal, usually `http://localhost:5173`.

## Environment
`server/.env` should contain your MongoDB connection string, a strong `JWT_SECRET`, and the email SMTP settings below.

## Email OTP setup (Gmail)

The user enters both a mobile number and an email address. FreshFold sends the OTP to the email address; the mobile number remains saved for contacting the customer or laundry partner.

1. Sign in to the Gmail account you created for FreshFold.
2. Enable 2-Step Verification for that Google account.
3. Create a Google App Password for Mail. Use the 16-character app password, **not** your normal Gmail password.
4. In `server/.env`, fill in these settings (keep your existing `MONGO_URI` and `JWT_SECRET`):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-freshfold-sender@gmail.com
SMTP_APP_PASSWORD=your-16-character-app-password
EMAIL_FROM=FreshFold <your-freshfold-sender@gmail.com>
```

5. Install backend dependencies and restart the server:

```powershell
npm install
npm run dev
```

6. Test using an email inbox you can access. If SMTP settings are missing, local development returns a demo OTP in the API response instead of sending an email. Configure SMTP before deploying publicly. Never commit `.env` or share your app password.

## Included features
- Customer and partner role-based OTP login
- User profile and address/location setup
- Service and clothing catalog with original prices
- Create and list customer orders
- Nearby order discovery by partner service radius
- Accept order and progress through pickup/washing/delivery statuses
- Pickup code validation, cancellation, ratings, partner stats
- JWT-protected API routes

## Deployment checklist
- Deploy the API and web app behind HTTPS; configure exact CORS origins and production environment variables.
- Use a unique random JWT secret, managed MongoDB with backups, a production email provider, and Razorpay Live Mode keys only after end-to-end test-mode verification.
- Review data retention, privacy/terms, monitoring, logs, alerts, and incident response before accepting real customer data or payments.
- Frontend is a clean React implementation of the main flows; the original HTML/CSS files were not included in the uploaded source, so the interface has been recreated rather than pixel-for-pixel copied.


## Email OTP setup

OTP verification is sent to the email address entered by the user. The Indian mobile number is still stored for contact and pickup coordination.

1. Enable 2-Step Verification on the sender Gmail account.
2. Create a Google App Password for Mail. Use that 16-character app password, not your normal Gmail password.
3. In `server/.env`, configure `SMTP_USER`, `SMTP_APP_PASSWORD`, `SMTP_HOST=smtp.gmail.com`, and `SMTP_PORT=587`. Set `EMAIL_FROM` to the sender address.
4. Restart the backend. The API sends OTP email and verifies the code server-side.
5. Keep `.env` private and do not commit it to Git. When SMTP settings are missing, the local development fallback returns a demo OTP in the API response; configure SMTP before deployment.


## Razorpay checkout (Test Mode)

FreshFold supports Cash on Delivery and online payment through Razorpay. Online checkout creates a Razorpay order on the server, and the backend verifies the returned signature and confirms that the payment is captured before marking the FreshFold order as paid. Partners only see COD orders or online orders whose payment has been verified.

1. Create/sign in to your Razorpay account and switch to **Test Mode**.
2. Generate Test API keys in the Razorpay Dashboard (Account & Settings → API Keys).
3. In `server/.env`, add the keys (keep them server-side only):

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

4. Install the new backend dependency and restart:

```powershell
cd "C:\My Files\Projects\FreshFold-MERN\server"
npm install
npm run dev
```

5. Start the web client, select **Online · Razorpay**, and use Razorpay's test-mode payment details from its official test documentation. Never use live keys until you have tested success, failure, cancellation, and server-side verification. Do not commit `.env` or expose `RAZORPAY_KEY_SECRET` in frontend code.

COD works without Razorpay keys. Razorpay online checkout requires valid Test Mode keys and a working internet connection. The backend checks payment signature and captured status before marking the order paid.


## Loading states, motion and production hardening

- Web UI includes page entrance motion, loading indicators, disabled in-flight actions, and a reduced-motion accessibility setting. The Expo app includes a loading splash, an in-progress overlay, and subtle screen transitions.
- OTP challenges are stored in MongoDB with hashed OTP values, expiry and attempt counts, so they survive a process restart. MongoDB TTL cleanup removes expired challenges.
- OTP request/verification endpoints and the API have rate limits. Helmet security headers, an explicit CORS allow-list, a request body limit, a generic internal-server error response, health status, and graceful shutdown are configured.
- `NODE_ENV=production` requires a 32+ character JWT secret, MongoDB, SMTP credentials and an explicit `CLIENT_ORIGINS` list. Demo OTP is disabled in production.
- Configure `CLIENT_ORIGINS` to only the exact web app origins (comma-separated), `VITE_API_URL` to the HTTPS API URL, and `TRUST_PROXY=true` only when running behind your trusted hosting proxy.
- Use HTTPS, a managed MongoDB deployment with backups, a transactional email provider, monitored logs, alerts, automated tests, and Razorpay live keys only after end-to-end testing. Keep all secrets in your hosting provider's secret/environment manager.
- This is a production-hardening baseline, not a certification or substitute for a deployment security review. Before taking real customer payments, add and test Razorpay webhooks for reconciliation, persistent shared rate-limit storage for multi-instance deployment, automated integration tests, privacy/terms pages, and operational monitoring.

## Partner map navigation

After a partner accepts a pickup request, the assigned order card shows the customer's pickup address and a **Navigate to customer** button. The button opens Google Maps directions using the customer's saved GPS coordinates when available, or the saved address as a fallback. Customer coordinates are only exposed to the partner assigned to that order.
