const router = require("express").Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const adminRoutes = require("./admin");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const User = require("../models/User");
const Order = require("../models/Order");
const OtpChallenge = require("../models/OtpChallenge");
const auth = require("../middleware/auth");
const { rateLimit } = require("express-rate-limit");
const otpRequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many OTP requests. Try again in 15 minutes." },
});
const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many OTP verification attempts. Try again in 15 minutes.",
  },
});
const { slots, flow } = require("../data/catalog");
const getStoreSettings = require("../utils/storeSettings");
const { km, hasLoc, priceOrder, slotOk, orderView } = require("../utils/order");
const otpHash = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");
const challengeKey = (role, mobile, email) =>
  crypto
    .createHash("sha256")
    .update(`${role}:${mobile}:${email}`)
    .digest("hex");
const validMobile = (m) => /^[6-9]\d{9}$/.test(m || "");
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");
const publicUser = (u) => ({
  id: u._id,
  role: u.role,
  mobile: u.mobile,
  email: u.email || null,
  name: u.name,
  address: u.address || null,
  shopName: u.shopName || null,
  radiusKm: u.radiusKm || 5,
  online: !!u.online,
  rating: u.ratingCount ? +(u.ratingSum / u.ratingCount).toFixed(1) : null,
  ratingCount: u.ratingCount || 0,
});

router.use("/admin", adminRoutes);
router.get("/catalog", async (req, res) => {
  try {
    const settings = await getStoreSettings();

    res.json({
      services: settings.services,
      items: settings.items,
      slots,
      fees: settings.fees,
    });
  } catch (error) {
    console.error("Catalog loading error:", error);
    res.status(500).json({
      error: "Could not load store catalog",
    });
  }
});

router.post("/otp/request", otpRequestLimiter, async (req, res) => {
  const mobile = String(req.body.mobile || "").trim();
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const role = req.body.role;
  if (!validMobile(mobile))
    return res
      .status(400)
      .json({ error: "Enter a valid 10-digit Indian mobile number" });
  if (!validEmail(email))
    return res.status(400).json({ error: "Enter a valid email address" });
  if (!["customer", "partner"].includes(role))
    return res.status(400).json({ error: "Invalid role" });
  const key = challengeKey(role, mobile, email),
    now = new Date();
  const previous = await OtpChallenge.findOne({ challengeKey: key });
  if (previous && now.getTime() - previous.sentAt.getTime() < 30000)
    return res
      .status(429)
      .json({ error: "Please wait 30 seconds before requesting another OTP" });
  const user = await User.findOne({ role, mobile });
  const emailOwner = await User.findOne({
    role,
    email,
    mobile: { $ne: mobile },
  });
  if (emailOwner)
    return res.status(409).json({
      error: "This email is already linked to another account for this role.",
    });
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_APP_PASSWORD;
  if (process.env.NODE_ENV === "production" && (!smtpUser || !smtpPassword))
    return res
      .status(503)
      .json({ error: "Email OTP is not configured. Please try again later." });
  const otp = String(crypto.randomInt(100000, 1000000));
  let delivery = "development";
  if (smtpUser && smtpPassword) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPassword },
      });
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `QuickWash <${smtpUser}>`,
        to: email,
        subject: "Your QuickWash verification code",
        text: `Your QuickWash OTP is ${otp}. It expires in 5 minutes. Do not share this code with anyone. If you did not request it, you can ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#18352a"><h2>🧺 QuickWash</h2><p>Use this code to verify your email address:</p><div style="font-size:32px;letter-spacing:8px;font-weight:bold;padding:16px 0">${otp}</div><p>This code expires in 5 minutes. Never share it with anyone.</p><p style="color:#6b7d74;font-size:12px">If you did not request this code, ignore this email.</p></div>`,
      });
      delivery = "email";
    } catch (e) {
      console.error("Email OTP send failed:", e.message);
      return res.status(502).json({
        error:
          "Could not send the email OTP. Check SMTP settings and try again.",
      });
    }
  } else if (process.env.NODE_ENV === "production") {
    return res
      .status(503)
      .json({ error: "Email OTP is not configured. Please try again later." });
  }
  await OtpChallenge.findOneAndUpdate(
    { challengeKey: key },
    {
      $set: {
        otpHash: otpHash(otp),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        sentAt: now,
        attempts: 0,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const payload = { ok: true, isNew: !user, delivery };
  if (delivery === "development") payload.devOtp = otp;
  return res.json(payload);
});
router.post("/otp/verify", otpVerifyLimiter, async (req, res) => {
  try {
    const mobile = String(req.body.mobile || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const { role, name, shopName } = req.body;
    const otp = String(req.body.otp || "").trim();
    if (
      !validMobile(mobile) ||
      !validEmail(email) ||
      !["customer", "partner"].includes(role)
    )
      return res
        .status(400)
        .json({ error: "Invalid mobile number, email address or role" });
    if (!/^\d{6}$/.test(otp))
      return res.status(400).json({ error: "Enter the 6-digit OTP" });
    const key = challengeKey(role, mobile, email),
      rec = await OtpChallenge.findOne({ challengeKey: key });
    if (!rec || rec.expiresAt.getTime() < Date.now())
      return res
        .status(400)
        .json({ error: "OTP expired or not requested. Request a new OTP." });
    if (rec.attempts >= 5) {
      await OtpChallenge.deleteOne({ _id: rec._id });
      return res
        .status(429)
        .json({ error: "Too many attempts. Request a new OTP." });
    }
    rec.attempts += 1;
    const expected = Buffer.from(rec.otpHash, "hex"),
      supplied = Buffer.from(otpHash(otp), "hex");
    const valid =
      expected.length === supplied.length &&
      crypto.timingSafeEqual(expected, supplied);
    if (!valid) {
      await rec.save();
      return res.status(400).json({ error: "Incorrect OTP" });
    }
    let user = await User.findOne({ role, mobile });
    const emailOwner = await User.findOne({
      role,
      email,
      mobile: { $ne: mobile },
    });
    if (emailOwner)
      return res
        .status(409)
        .json({
          error:
            "This email is already linked to another account for this role.",
        });
    if (!user) {
      if (!name || name.trim().length < 2)
        return res.status(400).json({ error: "Please enter your name" });
      if (role === "partner" && (!shopName || shopName.trim().length < 2))
        return res
          .status(400)
          .json({ error: "Please enter your shop / business name" });
      user = await User.create({
        role,
        mobile,
        email,
        name: name.trim().slice(0, 60),
        ...(role === "partner"
          ? { shopName: shopName.trim().slice(0, 80) }
          : {}),
      });
    } else {
      user.email = email;
      if (name && name.trim().length >= 2) user.name = name.trim().slice(0, 60);
      if (role === "partner" && shopName && shopName.trim().length >= 2)
        user.shopName = shopName.trim().slice(0, 80);
      await user.save();
    }
    await OtpChallenge.deleteOne({ _id: rec._id });
    const token = jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    if (e.code === 11000)
      return res
        .status(409)
        .json({ error: "Account already exists. Please log in." });
    throw e;
  }
});
router.use(auth);
router.post("/logout", (_req, res) => res.json({ ok: true }));
router.get("/me", (req, res) => res.json({ user: publicUser(req.user) }));
router.put("/me", async (req, res) => {
  const u = req.user,
    b = req.body;
  if (b.name) u.name = String(b.name).trim().slice(0, 60);
  if (b.address) {
    const a = b.address;
    if (!a.line || String(a.line).trim().length < 5)
      return res.status(400).json({ error: "Enter your full address" });
    if (!/^\d{6}$/.test(a.pincode || ""))
      return res.status(400).json({ error: "Enter a valid 6-digit pincode" });
    if (!Number.isFinite(a.lat) || !Number.isFinite(a.lng))
      return res
        .status(400)
        .json({ error: "Pin your location using GPS or Find on map" });
    u.address = {
      label: String(a.label || "Home").slice(0, 20),
      line: String(a.line).trim().slice(0, 200),
      landmark: String(a.landmark || "").slice(0, 80),
      pincode: a.pincode,
      lat: a.lat,
      lng: a.lng,
    };
  }
  if (u.role === "partner") {
    if (b.shopName) u.shopName = String(b.shopName).trim().slice(0, 80);
    if ([2, 3, 5, 8, 10, 15].includes(Number(b.radiusKm)))
      u.radiusKm = Number(b.radiusKm);
    if (typeof b.online === "boolean") {
      if (b.online && !hasLoc(u.address))
        return res
          .status(400)
          .json({ error: "Set your shop location before going online" });
      u.online = b.online;
    }
  }
  await u.save();
  res.json({ user: publicUser(u) });
});
function razorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID,
    key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret)
    throw new Error(
      "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env.",
    );
  return new Razorpay({ key_id, key_secret });
}

router.use(auth);
router.post("/orders", async (req, res) => {
  const u = req.user;
  const b = req.body;

  if (u.role !== "customer") {
    return res.status(403).json({ error: "Customers only" });
  }

  if (!hasLoc(u.address)) {
    return res.status(400).json({
      error: "Add your pickup address first",
    });
  }

  const settings = await getStoreSettings();

  if (!settings.services.some((s) => s.id === b.service)) {
    return res.status(400).json({ error: "Choose a service" });
  }

  if (!slotOk(b.date, b.slot)) {
    return res.status(400).json({
      error: "That pickup slot is not available. Pick another.",
    });
  }

  const paymentMethod = b.paymentMethod || "cod";

  if (!["cod", "razorpay"].includes(paymentMethod)) {
    return res.status(400).json({
      error: "Choose Cash on Delivery or Razorpay",
    });
  }

  const pr = priceOrder(b.items, b.service, !!b.express, settings);

  if (pr.error) {
    return res.status(400).json({ error: pr.error });
  }

  if (
    (await Order.countDocuments({
      customerId: u._id,
      status: "requested",
      $or: [
        { paymentMethod: "cod" },
        { paymentStatus: "paid" },
        { paymentMethod: { $exists: false } },
      ],
    })) >= 3
  ) {
    return res.status(400).json({
      error: "You already have 3 pending requests",
    });
  }

  const orderCode =
    `FF${Date.now().toString(36).toUpperCase()}` +
    `${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  let providerOrder = null;

  if (paymentMethod === "razorpay") {
    try {
      providerOrder = await razorpayClient().orders.create({
        amount: Math.round(pr.total * 100),
        currency: "INR",
        receipt: orderCode,
        notes: {
          freshfoldOrder: orderCode,
          customerId: String(u._id),
        },
      });
    } catch (e) {
      console.error("Razorpay order creation failed:", e.message);

      return res.status(502).json({
        error: e.message.includes("not configured")
          ? e.message
          : "Could not start Razorpay checkout. Check your Test Mode API keys and try again.",
      });
    }
  }

  const order = await Order.create({
    orderCode,
    customerId: u._id,
    customerName: u.name,
    customerMobile: u.mobile,
    status: "requested",
    paymentMethod,
    paymentStatus: "pending",
    razorpayOrderId: providerOrder?.id || null,

    service: b.service,
    items: pr.lines,
    count: pr.count,
    subtotal: pr.subtotal,
    fee: pr.fee,
    expressFee: pr.expressFee,
    total: pr.total,

    // Use the partner share configured in MongoDB.
    payout: Math.round(pr.subtotal * settings.fees.partnerShare),

    date: b.date,
    slot: b.slot,
    notes: String(b.notes || "").slice(0, 200),
    address: u.address.toObject(),
    pickupCode: String(crypto.randomInt(1000, 10000)),
    history: [{ s: "requested", t: new Date() }],
  });

  const response = {
    order: await orderView(order, u),
  };

  if (providerOrder) {
    response.payment = {
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: providerOrder.id,
      amount: providerOrder.amount,
      currency: providerOrder.currency,
    };
  }

  res.status(201).json(response);
});

router.post("/payments/verify", async (req, res) => {
  const u = req.user;
  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;
  if (u.role !== "customer")
    return res.status(403).json({ error: "Customers only" });
  if (
    !orderId ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  )
    return res.status(400).json({ error: "Missing Razorpay payment details" });
  const order = await Order.findOne({
    orderCode: String(orderId),
    customerId: u._id,
  });
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.paymentMethod !== "razorpay" || !order.razorpayOrderId)
    return res
      .status(400)
      .json({ error: "This order is not an online payment order" });
  if (
    order.paymentStatus === "paid" &&
    order.razorpayPaymentId === razorpay_payment_id
  )
    return res.json({ ok: true, order: await orderView(order, u) });
  if (order.paymentStatus === "paid")
    return res.status(409).json({ error: "This order has already been paid" });
  if (order.razorpayOrderId !== razorpay_order_id)
    return res
      .status(400)
      .json({ error: "Razorpay order ID does not match QuickWash order" });
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret)
    return res
      .status(503)
      .json({ error: "Razorpay secret is not configured on the server" });
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
    .digest("hex");
  const supplied = String(razorpay_signature);
  const a = Buffer.from(expected, "hex"),
    b = Buffer.from(supplied, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
    return res
      .status(400)
      .json({ error: "Payment signature verification failed" });
  try {
    const payment = await razorpayClient().payments.fetch(razorpay_payment_id);
    if (payment.order_id !== order.razorpayOrderId)
      return res
        .status(400)
        .json({ error: "Payment does not belong to this Razorpay order" });
    if (payment.status !== "captured")
      return res
        .status(409)
        .json({
          error: `Payment status is ${payment.status}. Confirm automatic capture is enabled in Razorpay Test Mode, then retry verification.`,
        });
    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    return res.json({ ok: true, order: await orderView(order, u) });
  } catch (e) {
    console.error("Razorpay verification failed:", e.message);
    return res
      .status(502)
      .json({
        error:
          "Could not confirm payment status with Razorpay. Please refresh orders before trying again.",
      });
  }
});
router.get("/orders", async (req, res) => {
  const u = req.user,
    view = req.query.view;
  if (u.role === "customer") {
    const orders = await Order.find({ customerId: u._id }).sort({
      createdAt: -1,
    });
    return res.json({
      orders: await Promise.all(orders.map((o) => orderView(o, u))),
    });
  }
  if (view === "nearby") {
    if (!u.online || !hasLoc(u.address))
      return res.json({ orders: [], offline: true });
    const list = await Order.find({
      status: "requested",
      $or: [
        { paymentMethod: "cod" },
        { paymentStatus: "paid" },
        { paymentMethod: { $exists: false } },
      ],
    });
    const nearby = list
      .filter((o) => km(u.address, o.address) <= u.radiusKm)
      .sort((a, b) => km(u.address, a.address) - km(u.address, b.address));
    return res.json({
      orders: await Promise.all(nearby.map((o) => orderView(o, u))),
    });
  }
  const orders = await Order.find({ partnerId: u._id }).sort({ createdAt: -1 }),
    done = orders.filter((o) => o.status === "delivered");
  return res.json({
    orders: await Promise.all(orders.map((o) => orderView(o, u))),
    stats: {
      completed: done.length,
      earned: done.reduce((s, o) => s + o.payout, 0),
      active: orders.filter(
        (o) => !["delivered", "cancelled"].includes(o.status),
      ).length,
    },
  });
});
router.post("/orders/:id/:action", async (req, res) => {
  const { id, action } = req.params;
  const o = await Order.findOne({ orderCode: id });
  if (!o) return res.status(404).json({ error: "Order not found" });
  const u = req.user;
  const log = (s) => {
    o.status = s;
    o.history.push({ s, t: new Date() });
  };
  if (action === "accept") {
    if (u.role !== "partner")
      return res.status(403).json({ error: "Partners only" });
    if (!u.online)
      return res.status(400).json({ error: "Go online to accept orders" });
    if (o.status !== "requested")
      return res.status(409).json({ error: "Order was taken or cancelled" });
    if (!hasLoc(u.address) || km(u.address, o.address) > u.radiusKm)
      return res
        .status(403)
        .json({ error: "This order is outside your service radius" });
    if (
      (await Order.countDocuments({
        partnerId: u._id,
        status: { $nin: ["delivered", "cancelled"] },
      })) >= 10
    )
      return res
        .status(400)
        .json({ error: "Finish some active orders first (max 10)" });
    const claimed = await Order.findOneAndUpdate(
      { _id: o._id, status: "requested" },
      {
        $set: { partnerId: u._id, status: "accepted" },
        $push: { history: { s: "accepted", t: new Date() } },
      },
      { new: true },
    );
    if (!claimed)
      return res.status(409).json({ error: "Order was just taken" });
    return res.json({ order: await orderView(claimed, u) });
  }
  if (action === "status") {
    if (u.role !== "partner" || String(o.partnerId) !== String(u._id))
      return res.status(403).json({ error: "Not your order" });
    const i = flow.indexOf(o.status);
    if (i < 1 || i >= flow.length - 1)
      return res.status(400).json({ error: "Cannot update this order" });
    const next = flow[i + 1];
    if (next === "picked_up" && String(req.body.code) !== o.pickupCode)
      return res
        .status(400)
        .json({
          error: "Wrong pickup code. Ask the customer for the 4-digit code.",
        });
    log(next);
    await o.save();
    return res.json({ order: await orderView(o, u) });
  }
  if (action === "cancel") {
    if (u.role !== "customer" || String(o.customerId) !== String(u._id))
      return res.status(403).json({ error: "Not your order" });
    if (!["requested", "accepted"].includes(o.status))
      return res
        .status(400)
        .json({ error: "Too late to cancel – clothes are already picked up" });
    log("cancelled");
    await o.save();
    return res.json({ order: await orderView(o, u) });
  }
  if (action === "rate") {
    if (u.role !== "customer" || String(o.customerId) !== String(u._id))
      return res.status(403).json({ error: "Not your order" });
    const rating = Math.round(Number(req.body.rating));
    if (o.status !== "delivered" || o.rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: "Cannot rate this order" });
    o.rating = rating;
    await o.save();
    const partner = await User.findById(o.partnerId);
    if (partner) {
      partner.ratingSum += rating;
      partner.ratingCount++;
      await partner.save();
    }
    return res.json({ order: await orderView(o, u) });
  }
  return res.status(404).json({ error: "Not found" });
});
module.exports = router;
