const mongoose = require("mongoose");
const lineSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    qty: { type: Number, min: 1, max: 99 },
    price: { type: Number, min: 0 },
  },
  { _id: false },
);
const historySchema = new mongoose.Schema(
  { s: String, t: { type: Date, default: Date.now } },
  { _id: false },
);
const addressSchema = new mongoose.Schema(
  {
    label: String,
    line: String,
    landmark: String,
    pincode: String,
    lat: Number,
    lng: Number,
  },
  { _id: false },
);
const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, unique: true, index: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: String,
    customerMobile: String,
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      default: "requested",
      enum: [
        "requested",
        "accepted",
        "picked_up",
        "washing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
    },
    paymentMethod: { type: String, enum: ["cod", "razorpay"], default: "cod" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    service: { type: String, required: true },
    items: [lineSchema],
    count: {
  type: Number,
  min: 1,
},

subtotal: {
  type: Number,
  min: 0,
},

fee: {
  type: Number,
  min: 0,
},

expressFee: {
  type: Number,
  min: 0,
},

total: {
  type: Number,
  min: 0,
},

payout: {
  type: Number,
  min: 0,
},
    date: { type: String, required: true },
    slot: { type: String, required: true },
    notes: { type: String, maxlength: 200 },
    address: { type: addressSchema, required: true },
    pickupCode: String,
    rating: { type: Number, min: 1, max: 5 },
    history: [historySchema],
  },
  { timestamps: true },
);
module.exports = mongoose.model("Order", orderSchema);
