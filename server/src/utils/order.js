
const { fees: defaultFees, slots, flow } = require("../data/catalog");
const User = require("../models/User");

const km = (a, b) => {
  const R = 6371;
  const rad = (x) => (x * Math.PI) / 180;

  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) *
      Math.cos(rad(b.lat)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
};

const hasLoc = (a) =>
  a && Number.isFinite(a.lat) && Number.isFinite(a.lng);

// Prices and fees now come from MongoDB settings.
function priceOrder(cartItems, service, express, settings) {
  if (
    !settings ||
    !Array.isArray(settings.items) ||
    !settings.fees
  ) {
    return { error: "Store pricing settings are unavailable" };
  }

  const catalogItems = settings.items;
  const currentFees = settings.fees;

  let subtotal = 0;
  let count = 0;
  const lines = [];

  for (const it of cartItems || []) {
    const cat = catalogItems.find((x) => x.id === it.id);
    const qty = Math.floor(Number(it.qty));

    if (!cat || !Number.isFinite(qty) || qty < 1 || qty > 99) {
      return { error: "Invalid item" };
    }

    const price = cat.prices?.[service];

    if (price == null) {
      return {
        error: `${cat.name} is not available for this service`,
      };
    }

    if (!Number.isFinite(price) || price < 0) {
      return { error: "Invalid product pricing configuration" };
    }

    lines.push({
      id: cat.id,
      name: cat.name,
      qty,
      price,
    });

    subtotal += price * qty;
    count += qty;
  }

  if (!lines.length) {
    return { error: "Add at least one item" };
  }

  const freeAbove = Number(currentFees.freeAbove);
  const delivery = Number(currentFees.delivery);
  const expressPrice = Number(currentFees.express);

  if (
    !Number.isFinite(freeAbove) ||
    !Number.isFinite(delivery) ||
    !Number.isFinite(expressPrice) ||
    freeAbove < 0 ||
    delivery < 0 ||
    expressPrice < 0
  ) {
    return { error: "Invalid delivery or service fee configuration" };
  }

  const fee = subtotal >= freeAbove ? 0 : delivery;
  const expressFee = express ? expressPrice : 0;

  return {
    lines,
    count,
    subtotal,
    fee,
    expressFee,
    total: subtotal + fee + expressFee,
  };
}

function slotOk(date, slotId) {
  const slot = slots.find((s) => s.id === slotId);

  if (!slot || !/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
    return false;
  }

  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const picked = new Date(`${date}T00:00:00`);
  const diff = (picked - today) / 86400000;

  if (diff < 0 || diff > 3) return false;
  if (diff === 0 && slot.start <= now.getHours()) return false;

  return true;
}

async function orderView(o, viewer) {
  const base = {
    id: o.orderCode,
    status: o.status,
    service: o.service,
    items: o.items,
    count: o.count,
    subtotal: o.subtotal,
    fee: o.fee,
    expressFee: o.expressFee,
    total: o.total,
    payout: o.payout,
    date: o.date,
    slot: o.slot,
    notes: o.notes,
    createdAt: o.createdAt,
    history: o.history,
    rating: o.rating || null,
    paymentMethod: o.paymentMethod || "cod",
    paymentStatus: o.paymentStatus || "pending",
  };

  const partner = o.partnerId
    ? await User.findById(o.partnerId)
    : null;

  if (viewer.role === "customer") {
    base.address = o.address;

    if (
      o.status !== "cancelled" &&
      flow.indexOf(o.status) < flow.indexOf("picked_up")
    ) {
      base.pickupCode = o.pickupCode;
    }

    if (partner) {
      base.partner = {
        shopName: partner.shopName,
        name: partner.name,
        mobile: partner.mobile,
      };
    }
  } else {
    const mine =
      String(o.partnerId || "") === String(viewer._id);

    base.mine = mine;

    base.distanceKm = hasLoc(viewer.address)
      ? +km(viewer.address, o.address).toFixed(1)
      : null;

    if (mine) {
      base.address = o.address;
      base.customer = {
        name: o.customerName,
        mobile: o.customerMobile,
      };
    } else {
      base.address = {
        label: o.address.label,
        pincode: o.address.pincode,
        landmark: o.address.landmark || "",
      };
    }
  }

  return base;
}

module.exports = {
  km,
  hasLoc,
  priceOrder,
  slotOk,
  orderView,
  fees: defaultFees,
  flow,
};
