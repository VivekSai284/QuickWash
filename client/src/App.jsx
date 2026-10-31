import React, { useEffect, useState } from "react";
import { api, getToken } from "./api";
import AdminDashboard from "./AdminDashboard";

const FLOW = [
  "requested",
  "accepted",
  "picked_up",
  "washing",
  "ready",
  "out_for_delivery",
  "delivered",
];

const LABEL = {
  requested: "Requested",
  accepted: "Accepted",
  picked_up: "Picked up",
  washing: "Washing",
  ready: "Ready",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

const customerMapsUrl = (address) => {
  if (!address) return "";
  const hasCoords =
    Number.isFinite(Number(address.lat)) &&
    Number.isFinite(Number(address.lng)) &&
    address.lat !== null &&
    address.lng !== null;
  const destination = hasCoords
    ? `${address.lat},${address.lng}`
    : [address.line, address.landmark, address.pincode]
        .filter(Boolean)
        .join(", ");
  return destination
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`
    : "";
};

export default function App() {
  const [role, setRole] = useState(
    location.pathname === "/partner" ? "partner" : "customer",
  );
  const [token, setToken] = useState(
    getToken(location.pathname === "/partner" ? "partner" : "customer"),
  );

  const [user, setUser] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState("");
  const [orders, setOrders] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [stats, setStats] = useState(null);

  const [step, setStep] = useState("phone");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");

  const [tab, setTab] = useState("home");
  // Inside your App component:
  const [service, setService] = useState(
    () => localStorage.getItem("ff_service") || "wash_fold",
  );

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("ff_cart");
      return savedCart ? JSON.parse(savedCart) : {};
    } catch {
      return {};
    }
  });
  const [express, setExpress] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [busy, setBusy] = useState(false);
  const [line, setLine] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [label, setLabel] = useState("Home");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [message, setMessage] = useState("");

  // 1. Get today's date formatted as YYYY-MM-DD in local timezone
  const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // 2. Helper to check if a time slot has already passed for today
  const isSlotDisabled = (slot, selectedDate) => {
    if (!selectedDate) return false;

    const today = getTodayDate();
    if (selectedDate > today) return false; // Future dates have all slots enabled
    if (selectedDate < today) return true; // Past dates (should be blocked by min date anyway)

    // Extract starting hour from slot format (e.g., "08:00 - 10:00", "08:00 AM", or "8am-10am")
    const currentHour = new Date().getHours();

    // Example parsing logic: adapt based on how your backend catalog formats slot start times / IDs
    // Assuming slot.startHour (0–23) or slot.id like "slot_8_10" or parsing label:
    if (slot.startHour !== undefined) {
      return slot.startHour <= currentHour;
    }

    // Fallback parser if slot object only has a label like "08:00 AM - 10:00 AM" or "8 AM - 10 AM"
    const timeMatch = slot.label?.match(/(\d{1,2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1], 10);
      const period = timeMatch[2]?.toUpperCase();
      if (period === "PM" && hour < 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;

      // Disable slot if the start time has already passed
      return hour <= currentHour;
    }

    return false;
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);

    // If the currently selected slot is disabled for the new date, clear it
    if (slot) {
      const selectedSlotObj = catalog?.slots?.find((s) => s.id === slot);
      if (selectedSlotObj && isSlotDisabled(selectedSlotObj, newDate)) {
        setSlot("");
      }
    }
  };

  const say = (s) => {
    setMessage(s);
    setTimeout(() => setMessage(""), 3500);
  };

  const load = async () => {
    try {
      const base = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      ).replace(/\/$/, "");
      const response = await fetch(base + "/catalog");
      if (!response.ok) throw new Error("Could not load the service catalog");
      const c = await response.json();
      setCatalog(c);
      setCatalogError("");
    } catch (e) {
      setCatalogError(e.message || "Could not connect to QuickWash");
      throw e;
    }
  };

  const refresh = async (t = token, r = role) => {
    if (!t) return;
    const me = await api("/me", r);
    setUser(me.user);
    if (me.user.address) {
      setLine(me.user.address.line || "");
      setLandmark(me.user.address.landmark || "");
      setPincode(me.user.address.pincode || "");
      setLabel(me.user.address.label || "Home");
      setLat(me.user.address.lat);
      setLng(me.user.address.lng);
      setRadiusKm(me.user.radiusKm || 5);
    }
    if (r === "customer") {
      setOrders((await api("/orders", r)).orders);
    } else {
      const [n, m] = await Promise.all([
        api("/orders?view=nearby", r),
        api("/orders?view=mine", r),
      ]);
      setNearby(n.orders);
      setOrders(m.orders);
      setStats(m.stats);
    }
  };

  // Lock background scrolling when checkout modal is open
  useEffect(() => {
    if (checkoutOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    // Cleanup in case component unmounts while modal is open
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [checkoutOpen]);

  useEffect(() => {
    load().catch(() => {});
  }, []);

  useEffect(() => {
    if (token) {
      refresh().catch(() => logout(true));
    }
  }, [token, role]);

  // Add these right after your state declarations:
  useEffect(() => {
    localStorage.setItem("ff_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("ff_service", service);
  }, [service]);

  const logout = (silent = false) => {
    localStorage.removeItem(`ff_token_${role}`);
    localStorage.removeItem("ff_cart"); // Clear saved cart on logout
    setToken(null);
    setUser(null);
    setStep("phone");
    setCart({});
    if (!silent) say("Logged out");
  };

  const switchRole = (r) => {
    setRole(r);
    setToken(getToken(r));
    setUser(null);
    setTab(r === "partner" ? "nearby" : "home");
    history.replaceState({}, "", r === "partner" ? "/partner" : "/");
  };

  const sendOtp = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await api("/otp/request", role, "POST", {
        mobile,
        email,
        role,
      });
      setIsNew(r.isNew);
      setDevOtp(r.devOtp || "");
      setStep("otp");
      say(
        r.delivery === "development"
          ? "Demo OTP generated"
          : "OTP sent to your email",
      );
    } catch (e) {
      say(e.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await api("/otp/verify", role, "POST", {
        mobile,
        email,
        role,
        otp,
        name,
        shopName,
      });
      localStorage.setItem(`ff_token_${role}`, r.token);
      setToken(r.token);
      setUser(r.user);
      setTab(role === "partner" ? "nearby" : "home");
      say("Welcome to QuickWash");
    } catch (e) {
      say(e.message);
    } finally {
      setBusy(false);
    }
  };

  const saveAddress = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (lat == null || lng == null)
        throw new Error("Use GPS to pin your location first");
      const body = {
        address: {
          label: role === "partner" ? "Shop" : label,
          line,
          landmark,
          pincode,
          lat,
          lng,
        },
      };
      if (role === "partner") Object.assign(body, { shopName, radiusKm });
      const r = await api("/me", role, "PUT", body);
      setUser(r.user);
      await refresh();
      say("Address saved");
    } catch (e) {
      say(e.message);
    } finally {
      setBusy(false);
    }
  };

  const gps = () =>
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        setLat(p.coords.latitude);
        setLng(p.coords.longitude);
        say("Location pinned");
      },
      () => say("Could not get location. Allow browser location access."),
      { enableHighAccuracy: true, timeout: 12000 },
    ) || say("GPS is not supported");

  const totals = () => {
    let sub = 0,
      count = 0;
    for (const [id, q] of Object.entries(cart)) {
      const it = catalog?.items.find((i) => i.id === id),
        p = it?.prices[service];
      if (p != null) {
        sub += p * q;
        count += q;
      }
    }

    const fees = catalog?.fees || {
      freeAbove: 149,
      delivery: 5,
      express: 15,
    };

    const fee =
      sub >= Number(fees.freeAbove) || !sub
        ? 0
        : Number(fees.delivery);

    const exp = express && sub ? Number(fees.express) : 0;
    const total = sub + fee + exp;

    return { sub, count, fee, exp, total };
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const finishOrder = async (text) => {
    setCheckoutOpen(false);
    setCart({});
    localStorage.removeItem("ff_cart"); // Clear saved cart
    setTab("orders");
    await refresh();
    say(text);
  };

  const placeOrder = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!slot || !date) throw new Error("Choose a pickup date and time slot");
      if (paymentMethod === "razorpay" && !(await loadRazorpay()))
        throw new Error(
          "Could not load Razorpay Checkout. Check your internet connection.",
        );

      const items = Object.entries(cart).map(([id, qty]) => ({ id, qty }));
      const result = await api("/orders", role, "POST", {
        items,
        service,
        express,
        date,
        slot,
        notes,
        paymentMethod,
      });

      setCheckoutOpen(false);
      if (paymentMethod === "cod") {
        await finishOrder(
          "Pickup requested! Pay cash when the order is delivered.",
        );
        return;
      }

      const pay = result.payment;
      if (!pay?.keyId || !pay?.razorpayOrderId)
        throw new Error(
          "Razorpay checkout details were not returned by the server",
        );

      const checkout = new window.Razorpay({
        key: pay.keyId,
        amount: pay.amount,
        currency: pay.currency,
        name: "QuickWash",
        description: `Laundry order ${result.order.id}`,
        order_id: pay.razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.mobile || "",
        },
        notes: { freshfoldOrder: result.order.id },
        theme: { color: "#16845b" },
        handler: async (response) => {
          setBusy(true);
          try {
            await api("/payments/verify", role, "POST", {
              orderId: result.order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await finishOrder("Payment verified! Your pickup is requested.");
          } catch (e) {
            say(e.message);
            await refresh();
          } finally {
            setBusy(false);
          }
        },
      });

      checkout.on("payment.failed", (response) =>
        say(
          response?.error?.description ||
            "Payment failed. You can check your orders and retry.",
        ),
      );
      checkout.open();
    } catch (e) {
      say(e.message);
    } finally {
      setBusy(false);
    }
  };

  const act = async (path, method = "POST", body) => {
    if (busy) return;
    setBusy(true);
    try {
      await api(path, role, method, body);
      await refresh();
      say("Updated successfully");
    } catch (e) {
      say(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!catalog)
    return (
      <div className="loading-screen">
        <div className="loading-logo">🫧</div>
        {catalogError ? (
          <>
            <h2>Could not connect</h2>
            <p>{catalogError}</p>
            <button className="btn" onClick={() => load().catch(() => {})}>
              Try again
            </button>
          </>
        ) : (
          <>
            <div className="spinner" aria-label="Loading" />
            <h2>QuickWash</h2>
            <p>Getting things fresh and ready…</p>
          </>
        )}
      </div>
    );

  const addressReady = !!user?.address;

  const addressForm = (
    <section className="card address">
      <h2>{addressReady ? "Your location" : "Where should we pick up?"}</h2>
      {role === "partner" && (
        <>
          <label>Shop / business name</label>
          <input
            value={shopName || user?.shopName || ""}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Sparkle Dry Cleaners"
          />
        </>
      )}
      <label>
        {role === "partner" ? "Shop address" : "Full pickup address"}
      </label>
      <textarea
        value={line}
        onChange={(e) => setLine(e.target.value)}
        placeholder="House no., street, area"
      />
      <div className="grid2">
        <div>
          <label>Landmark</label>
          <input
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
          />
        </div>
        <div>
          <label>6-digit pincode</label>
          <input
            value={pincode}
            maxLength="6"
            onChange={(e) => setPincode(e.target.value)}
          />
        </div>
      </div>
      {role === "customer" && (
        <>
          <label>Save as</label>
          <select value={label} onChange={(e) => setLabel(e.target.value)}>
            <option>Home</option>
            <option>Work</option>
            <option>Other</option>
          </select>
        </>
      )}
      <div className="row">
        <button className="btn secondary" onClick={gps}>
          📍 Use my GPS
        </button>
        <span className="muted">
          {lat != null
            ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            : "Location not pinned"}
        </span>
      </div>
      {role === "partner" && (
        <>
          <label>Service radius</label>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
          >
            {[2, 3, 5, 8, 10, 15].map((n) => (
              <option key={n} value={n}>
                {n} km
              </option>
            ))}
          </select>
        </>
      )}
      <button className="btn" onClick={saveAddress} disabled={busy}>
        {busy ? (
          <>
            <span className="button-spinner" /> Saving…
          </>
        ) : (
          "Save address"
        )}
      </button>
    </section>
  );

  if (!token || !user)
    return (
      <div className="authpage">
        <div className="brand">🫧 QuickWash</div>
        <section className="authcard page-enter">
          <div className="eyebrow">LAUNDRY PICKUP PLATFORM</div>
          <h1>
            {step === "phone" ? "Laundry day, handled." : "Verify your email"}
          </h1>
          <p className="muted">
            {role === "partner"
              ? "Accept nearby pickup jobs and grow your laundry business."
              : "Schedule a pickup and get fresh clothes delivered."}
          </p>
          <div className="roleSwitch">
            <button
              className={role === "customer" ? "active" : ""}
              onClick={() => switchRole("customer")}
            >
              Customer
            </button>
            <button
              className={role === "partner" ? "active" : ""}
              onClick={() => switchRole("partner")}
            >
              Laundry partner
            </button>
          </div>
          {step === "phone" ? (
            <>
              <label>Indian mobile number (for contact)</label>
              <input
                value={mobile}
                maxLength="10"
                inputMode="numeric"
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                placeholder="9876543210"
              />
              <label>Email address (OTP will be sent here)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <button className="btn full" onClick={sendOtp} disabled={busy}>
                {busy ? (
                  <>
                    <span className="button-spinner" /> Sending OTP…
                  </>
                ) : (
                  "Send email OTP →"
                )}
              </button>
            </>
          ) : (
            <>
              <label>6-digit OTP</label>
              <input
                value={otp}
                maxLength="6"
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
              />
              {isNew && (
                <>
                  <label>Your name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                  />
                  {role === "partner" && (
                    <>
                      <label>Shop name</label>
                      <input
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="Your laundry shop"
                      />
                    </>
                  )}
                </>
              )}
              {devOtp && (
                <p className="demo">
                  Demo OTP: <b>{devOtp}</b>{" "}
                  <button className="textbtn" onClick={() => setOtp(devOtp)}>
                    Fill OTP
                  </button>
                </p>
              )}
              <button className="btn full" onClick={verify} disabled={busy}>
                {busy ? (
                  <>
                    <span className="button-spinner" /> Verifying…
                  </>
                ) : isNew ? (
                  "Create account"
                ) : (
                  "Log in"
                )}
              </button>
              <button className="textbtn" onClick={() => setStep("phone")}>
                Change mobile or email
              </button>
            </>
          )}
        </section>
        {message && <div className="toast">{message}</div>}
      </div>
    );

  // Admin dashboard — check before the customer address requirement
if (user?.role === "admin") {
  return (
    <AdminDashboard
      authRole={role}
      onLogout={logout}
    />
  );
}  

  if (!addressReady)
    return (
      <div className="layout">
        <header className="top">
          <div className="brand">🫧 QuickWash</div>
          <button className="textbtn" onClick={() => logout()}>
            Log out
          </button>
        </header>
        <main className="main page-enter">{addressForm}</main>
        {busy && (
          <div className="web-loading-overlay" role="status" aria-live="polite">
            <span className="spinner" />
            <span>Working on it…</span>
          </div>
        )}
        {message && <div className="toast">{message}</div>}
      </div>
    );

  const nav =
    role === "customer"
      ? [
          ["home", "Home"],
          ["orders", "My orders"],
          ["profile", "Profile"],
        ]
      : [
          ["nearby", "Nearby jobs"],
          ["active", "My jobs"],
          ["profile", "Shop profile"],
        ];

  const statusTimeline = (o) => (
    <div className="timeline">
      {FLOW.map((s, i) => (
        <span key={s} className={i <= FLOW.indexOf(o.status) ? "done" : ""}>
          {LABEL[s]}
        </span>
      ))}
    </div>
  );

  const orderCard = (o) => (
    <article className="card order" key={o.id}>
      <div className="between">
        <div>
          <div className="orderid">{o.id}</div>
          <p className="muted small">
            {catalog.services.find((s) => s.id === o.service)?.label} ·{" "}
            {o.count} items · {money(o.total)}
          </p>
        </div>
        <span className={`badge ${o.status}`}>{LABEL[o.status]}</span>
      </div>
      {statusTimeline(o)}
      <p>{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</p>
      <p className="muted small">
        Pickup: {o.date} ·{" "}
        {catalog.slots.find((s) => s.id === o.slot)?.label || o.slot}
      </p>
      <p className="muted small">
        Payment:{" "}
        {o.paymentMethod === "razorpay" ? "Razorpay" : "Cash on Delivery"} ·{" "}
        {o.paymentStatus === "paid" ? "Paid" : "Pending"}
      </p>
      {o.pickupCode && (
        <p className="pickup">
          🔐 Pickup code: <b>{o.pickupCode}</b> — share only when handing over.
        </p>
      )}
      {role === "partner" && o.mine && o.address && (
        <p className="muted small">
          📍 Customer: {o.address.line}
          {o.address.landmark ? `, ${o.address.landmark}` : ""}
          {o.address.pincode ? `, ${o.address.pincode}` : ""}
        </p>
      )}
      {role === "customer" && o.partner && (
        <p>
          Partner: {o.partner.shopName} ·{" "}
          <a href={`tel:+91${o.partner.mobile}`}>Call</a>
        </p>
      )}
      {role === "customer" && ["requested", "accepted"].includes(o.status) && (
        <button
          className="btn secondary"
          onClick={() => act(`/orders/${o.id}/cancel`)}
        >
          Cancel order
        </button>
      )}
      {role === "customer" && o.status === "delivered" && !o.rating && (
        <div className="row">
          Rate:{" "}
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              className="star"
              key={n}
              onClick={() => act(`/orders/${o.id}/rate`, "POST", { rating: n })}
            >
              ⭐
            </button>
          ))}
        </div>
      )}
      {role === "partner" && o.mine && (
        <>
          {customerMapsUrl(o.address) && (
            <a
              className="btn secondary map-button"
              href={customerMapsUrl(o.address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              🧭 Navigate to customer
            </a>
          )}
          {o.status === "accepted" && (
            <div className="row">
              <input
                id={`code-${o.id}`}
                placeholder="4-digit pickup code"
                maxLength="4"
              />
              <button
                className="btn"
                onClick={() =>
                  act(`/orders/${o.id}/status`, "POST", {
                    code: document.getElementById(`code-${o.id}`).value,
                  })
                }
              >
                Verify pickup
              </button>
            </div>
          )}
          {FLOW.indexOf(o.status) > 0 &&
            FLOW.indexOf(o.status) < FLOW.length - 1 &&
            o.status !== "accepted" && (
              <button
                className="btn"
                onClick={() => act(`/orders/${o.id}/status`)}
              >
                Next: {LABEL[FLOW[FLOW.indexOf(o.status) + 1]]}
              </button>
            )}
        </>
      )}
      {role === "partner" && !o.mine && o.status === "requested" && (
        <button className="btn" onClick={() => act(`/orders/${o.id}/accept`)}>
          ✓ Accept order
        </button>
      )}
    </article>
  );

  return (
    <div className="layout">
      <header className="top">
        <div className="brand">🫧 QuickWash</div>
        <nav>
          {nav.map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? "navactive" : ""}
              onClick={() => {
                setTab(id);
                refresh().catch((e) => say(e.message));
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <button className="textbtn" onClick={() => logout()}>
          Log out
        </button>
      </header>

      <main className="main page-enter" key={`${role}-${tab}`}>
        <section className="hero">
          <div>
            <div className="eyebrow">
              {role === "partner"
                ? "PARTNER DASHBOARD"
                : "FRESH CLOTHES. ZERO HASSLE."}
            </div>
            <h1>
              {role === "partner"
                ? `Welcome, ${user.name}`
                : `Good to see you, ${user.name.split(" ")[0]}`}
            </h1>
            <p>
              {role === "partner"
                ? "Manage nearby pickup requests and your active jobs."
                : "Choose a service, add your clothes, and schedule a convenient pickup."}
            </p>
          </div>
          <div className="heroicon">🧺</div>
        </section>

        {tab === "profile" && addressForm}

        {role === "customer" && tab === "home" && (
          <>
            <h2 className="sectiontitle">1. Choose a service</h2>
            <div className="servicegrid">
              {catalog.services.map((s) => (
                <button
                  key={s.id}
                  className={`service ${service === s.id ? "selected" : ""}`}
                  onClick={() => {
                    setService(s.id);
                    setCart((c) =>
                      Object.fromEntries(
                        Object.entries(c).filter(
                          ([id]) =>
                            catalog.items.find((i) => i.id === id).prices[
                              s.id
                            ] != null,
                        ),
                      ),
                    );
                  }}
                >
                  <span>{s.eta}</span>
                  <b>{s.label}</b>
                  <small>{s.desc}</small>
                </button>
              ))}
            </div>

            <h2 className="sectiontitle">2. Add your laundry</h2>
            <div className="itemgrid">
              {catalog.items.map((i) => {
                const p = i.prices[service],
                  q = cart[i.id] || 0;
                return (
                  <article
                    className={`item ${p == null ? "disabled" : ""}`}
                    key={i.id}
                  >
                    <div className="emoji">{i.emoji}</div>
                    <b>{i.name}</b>
                    <span>
                      {p == null ? "Unavailable" : `${money(p)} / piece`}
                    </span>
                    {p != null && (
                      <div className="row center">
                        {q > 0 && (
                          <button
                            className="qty"
                            onClick={() =>
                              setCart((c) => ({
                                ...c,
                                [i.id]: Math.max(0, (c[i.id] || 0) - 1),
                              }))
                            }
                          >
                            −
                          </button>
                        )}
                        <b>{q}</b>
                        <button
                          className="qty"
                          onClick={() =>
                            setCart((c) => ({
                              ...c,
                              [i.id]: Math.min(99, (c[i.id] || 0) + 1),
                            }))
                          }
                        >
                          +
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {totals().count > 0 && (
              <div className="cart-bar">
                {/* ❌ Small Close Cross in Top Right */}
                <button
                  className="cart-close-btn"
                  onClick={() => setCart({})}
                  title="Clear cart"
                  aria-label="Close cart"
                >
                  ×
                </button>

                <div>
                  <b>{totals().count} items</b>
                  <strong>{money(totals().sub)}</strong>
                  <small>Taxes/fees included in estimate</small>
                </div>

                <button
                  className="btn"
                  onClick={() => {
                    setTab("checkout");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Schedule items
                </button>
              </div>
            )}
          </>
        )}

        {role === "customer" && tab === "checkout" && (
          <section className="card checkout-page-view page-enter">
            <div className="checkout-page-header">
              <div>
                <span className="eyebrow">ALMOST THERE</span>
                <h2>Schedule your pickup</h2>
                <p className="muted small">
                  Review your pickup details and payment before confirming.
                </p>
              </div>
              <button className="btn secondary" onClick={() => setTab("home")}>
                ← Back to items
              </button>
            </div>

            {/* Pickup Address Box */}
            <div className="checkout-address-box">
              <div>
                <b>📍 Pickup address</b>
                <p>
                  {user?.address?.line || "Add your pickup address"}
                  {user?.address?.landmark ? `, ${user.address.landmark}` : ""}
                  {user?.address?.pincode ? ` · ${user.address.pincode}` : ""}
                </p>
              </div>
              <button className="textbtn" onClick={() => setTab("profile")}>
                Change
              </button>
            </div>

            {/* Date Selector Chips */}
            <div className="slot-section">
              <label className="section-label">Select Pickup Date</label>
              <div className="date-chips-container">
                {[0, 1, 2, 3].map((offset) => {
                  const d = new Date();
                  d.setDate(d.getDate() + offset);
                  const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  const dayName =
                    offset === 0
                      ? "Today"
                      : offset === 1
                        ? "Tomorrow"
                        : d.toLocaleDateString("en-US", { weekday: "short" });
                  const displayDate = d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <button
                      key={isoDate}
                      type="button"
                      className={`date-chip ${date === isoDate ? "selected" : ""}`}
                      onClick={() => handleDateChange(isoDate)}
                    >
                      <span className="day">{dayName}</span>
                      <span className="date">{displayDate}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots Grid */}
            <div className="slot-section">
              <label className="section-label">Select Pickup Time Slot</label>
              {!date ? (
                <p className="muted small">
                  Please select a pickup date first.
                </p>
              ) : (
                <div className="slots-grid">
                  {catalog?.slots?.map((s) => {
                    const disabled = isSlotDisabled(s, date);
                    const isSelected = slot === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={disabled}
                        className={`slot-card ${isSelected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                        onClick={() => setSlot(s.id)}
                      >
                        <span className="slot-time">{s.label}</span>
                        {disabled && <span className="slot-tag">Passed</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Express Checkbox */}
            <label className="check" style={{ margin: "1.25rem 0" }}>
              <input
                type="checkbox"
                checked={express}
                onChange={(e) => setExpress(e.target.checked)}
              />{" "}
              Express pickup (+₹{catalog?.fees?.express ?? 15})
            </label>

            {/* Instructions */}
            <div className="slot-section">
              <label className="section-label">
                Instructions for the laundry partner (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Gate code, preferred pickup instructions…"
                rows="3"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            {/* Bill Breakdown */}
            <div className="checkout-breakdown-box">
              <div className="breakdown-row">
                <span>Items ({totals().count})</span>
                <b>{money(totals().sub)}</b>
              </div>
              <div className="breakdown-row">
                <span>Delivery fee</span>
                <b>{totals().fee ? money(totals().fee) : "FREE"}</b>
              </div>
              {!!totals().exp && (
                <div className="breakdown-row">
                  <span>Express service</span>
                  <b>{money(totals().exp)}</b>
                </div>
              )}
              <div className="breakdown-row total">
                <span>Total Amount</span>
                <strong>{money(totals().total)}</strong>
              </div>
            </div>

            {/* Payment Options */}
            <div className="slot-section">
              <label className="section-label">Payment method</label>
              <div className="payment-options-grid">
                <button
                  type="button"
                  className={
                    paymentMethod === "cod"
                      ? "payment-option selected"
                      : "payment-option"
                  }
                  onClick={() => setPaymentMethod("cod")}
                >
                  <span>💵</span>
                  <div>
                    <b>Cash on Delivery</b>
                    <small>Pay after delivery</small>
                  </div>
                </button>
                <button
                  type="button"
                  className={
                    paymentMethod === "razorpay"
                      ? "payment-option selected"
                      : "payment-option"
                  }
                  onClick={() => setPaymentMethod("razorpay")}
                >
                  <span>🔒</span>
                  <div>
                    <b>Online payment</b>
                    <small>UPI, cards & more</small>
                  </div>
                </button>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              className="btn full checkout-confirm-btn"
              onClick={placeOrder}
              disabled={busy || !date || !slot}
            >
              {busy ? (
                <>
                  <span className="button-spinner" /> Processing…
                </>
              ) : paymentMethod === "razorpay" ? (
                "Pay " + money(totals().total) + " securely"
              ) : (
                "Confirm pickup · " + money(totals().total)
              )}
            </button>
            <p
              className="muted small checkout-footnote"
              style={{ textAlign: "center", marginTop: "0.75rem" }}
            >
              Your pickup is only confirmed after the order is successfully
              placed.
            </p>
          </section>
        )}

        {role === "customer" && tab === "orders" && (
          <>
            <h2 className="sectiontitle">Your orders</h2>
            {orders.length ? (
              orders.map(orderCard)
            ) : (
              <div className="empty">
                No orders yet. Start by choosing your laundry service.
              </div>
            )}
          </>
        )}

        {role === "partner" && tab === "nearby" && (
          <>
            <section className="card between">
              <div>
                <b>
                  {user.online ? "🟢 You are online" : "⚪ You are offline"}
                </b>
                <p className="muted small">
                  Service radius: {user.radiusKm} km
                </p>
              </div>
              <button
                className="btn"
                onClick={() => act("/me", "PUT", { online: !user.online })}
              >
                {user.online ? "Go offline" : "Go online"}
              </button>
            </section>
            <h2 className="sectiontitle">Nearby pickup requests</h2>
            {nearby.length ? (
              nearby.map(orderCard)
            ) : (
              <div className="empty">
                No nearby requests. Go online and refresh later.
              </div>
            )}
          </>
        )}

        {role === "partner" && tab === "active" && (
          <>
            <div className="stats">
              <div className="card">
                <b>{stats?.active || 0}</b>
                <span>Active jobs</span>
              </div>
              <div className="card">
                <b>{stats?.completed || 0}</b>
                <span>Completed</span>
              </div>
              <div className="card">
                <b>{money(stats?.earned || 0)}</b>
                <span>Total earned</span>
              </div>
              <div className="card">
                <b>{user.rating ?? "—"}</b>
                <span>Rating</span>
              </div>
            </div>
            <h2 className="sectiontitle">Your jobs</h2>
            {orders.length ? (
              orders.map(orderCard)
            ) : (
              <div className="empty">No accepted jobs yet.</div>
            )}
          </>
        )}
      </main>

      {busy && (
        <div className="web-loading-overlay" role="status" aria-live="polite">
          <span className="spinner" />
          <span>Working on it…</span>
        </div>
      )}
      {message && <div className="toast">{message}</div>}
    </div>
  );
}
