require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const apiRoutes = require("./routes");

const app = express();
app.disable("x-powered-by");
if (process.env.NODE_ENV === "production" || process.env.TRUST_PROXY === "true")
  app.set("trust proxy", 1);
app.use(helmet());
const origins = (
  process.env.CLIENT_ORIGINS ||
  process.env.CLIENT_ORIGIN ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173")
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
if (process.env.NODE_ENV === "production" && origins.length === 0)
  throw new Error("CLIENT_ORIGINS is required in production");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  }),
);
app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    service: "QuickWash API",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  }),
);
app.use("/api", apiRoutes);
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, _req, res, _next) => {
  if (err.message === "Origin is not allowed by CORS")
    return res.status(403).json({ error: "Origin is not allowed" });
  console.error("API error:", err.message);
  const status =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 600
      ? err.status
      : 500;
  res
    .status(status)
    .json({
      error:
        status === 500
          ? "Internal server error"
          : err.message || "Request failed",
    });
});

function validateEnvironment() {
  const required = ["MONGO_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length)
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  if (process.env.NODE_ENV === "production") {
    const secret = String(process.env.JWT_SECRET);
    if (
      secret.length < 32 ||
      /replace_this|change_me|your_|example/i.test(secret)
    )
      throw new Error(
        "Set a unique, random JWT_SECRET of at least 32 characters in production",
      );
    if (/localhost|127\.0\.0\.1/i.test(process.env.MONGO_URI))
      throw new Error("Use a managed/remote MongoDB URI in production");
    if (!process.env.SMTP_USER || !process.env.SMTP_APP_PASSWORD)
      throw new Error(
        "SMTP_USER and SMTP_APP_PASSWORD are required in production",
      );
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
      throw new Error("Razorpay live keys are required in production");
  }
}

const PORT = Number(process.env.PORT || 5000);
validateEnvironment();
connectDB()
  .then(() => {
    const server = app.listen(PORT, () =>
      console.log(`QuickWash API listening on port ${PORT}`),
    );
    const shutdown = (signal) => {
      console.log(`${signal} received; closing server`);
      server.close(() =>
        mongoose.connection.close(false).finally(() => process.exit(0)),
      );
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((error) => {
    console.error("QuickWash API startup failed:", error.message);
    process.exit(1);
  });
