
import { useEffect, useState } from "react";
import { api } from "./api";

const SERVICE_FIELDS = ["label", "desc", "eta"];

export default function AdminDashboard({ authRole = "customer", onLogout }) {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCatalog() {
    try {
      setLoading(true);
      setError("");
      const data = await api("/admin/catalog", authRole);
      setCatalog({
        services: data.services || [],
        items: data.items || [],
        fees: data.fees || {},
      });
    } catch (err) {
      setError(err.message || "Could not load pricing settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCatalog();
  }, []);

  function updateService(serviceIndex, field, value) {
    setCatalog((current) => ({
      ...current,
      services: current.services.map((service, index) =>
        index === serviceIndex
          ? { ...service, [field]: value }
          : service
      ),
    }));
  }

  function updateItemPrice(itemIndex, serviceId, value) {
    const price = value === "" ? null : Number(value);

    setCatalog((current) => ({
      ...current,
      items: current.items.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              prices: {
                ...item.prices,
                [serviceId]: price,
              },
            }
          : item
      ),
    }));
  }

  function updateFee(field, value) {
    setCatalog((current) => ({
      ...current,
      fees: {
        ...current.fees,
        [field]: value === "" ? "" : Number(value),
      },
    }));
  }

  async function saveCatalog() {
    if (!catalog) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        services: catalog.services,
        items: catalog.items,
        fees: {
          freeAbove: Number(catalog.fees.freeAbove),
          delivery: Number(catalog.fees.delivery),
          express: Number(catalog.fees.express),
          partnerShare: Number(catalog.fees.partnerShare),
        },
      };

      const result = await api(
        "/admin/catalog",
        authRole,
        "PUT",
        payload
      );

      setCatalog({
        services: result.services || payload.services,
        items: result.items || payload.items,
        fees: result.fees || payload.fees,
      });

      setMessage("Pricing settings saved successfully.");
    } catch (err) {
      setError(err.message || "Could not save pricing settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <span className="spinner" />
        <h2>Loading admin dashboard</h2>
        <p>Please wait while we load your store settings.</p>
      </div>
    );
  }

  if (error && !catalog) {
    return (
      <div className="admin-page">
        <div className="card">
          <h2>Unable to load admin dashboard</h2>
          <p className="admin-error">{error}</p>
          <button className="btn" onClick={loadCatalog}>
            Try again
          </button>
          <button className="textbtn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (!catalog) return null;

  return (
    <div className="layout">
      <header className="top">
        <div className="brand">QuickWash Admin</div>
        <nav>
          <button className="navactive">Pricing & Settings</button>
          <button onClick={onLogout}>Logout</button>
        </nav>
      </header>

      <main className="main admin-page page-enter">
        <section className="hero admin-hero">
          <div>
            <div className="eyebrow">STORE MANAGEMENT</div>
            <h1>Pricing Dashboard</h1>
            <p>
              Manage your laundry services, item prices and delivery fees.
              Changes will apply to new orders.
            </p>
          </div>
          <div className="heroicon">⚙️</div>
        </section>

        {error && <div className="admin-alert error">{error}</div>}
        {message && <div className="admin-alert success">{message}</div>}

        <div className="admin-section-heading">
          <div>
            <h2>Service settings</h2>
            <p className="muted small">
              Update the names, descriptions and estimated completion times.
            </p>
          </div>
        </div>

        <div className="admin-service-grid">
          {catalog.services.map((service, index) => (
            <section className="card admin-service-card" key={service.id}>
              <div className="between">
                <h3>{service.label || service.name || service.id}</h3>
                <span className="badge">{service.id}</span>
              </div>

              {SERVICE_FIELDS.map((field) => (
                <div key={field}>
                  <label>
                    {field === "label"
                      ? "Service name"
                      : field === "desc"
                      ? "Description"
                      : "Estimated time"}
                  </label>
                  <input
                    value={service[field] ?? ""}
                    onChange={(e) =>
                      updateService(index, field, e.target.value)
                    }
                    placeholder={`Enter ${field}`}
                  />
                </div>
              ))}
            </section>
          ))}
        </div>

        <div className="admin-section-heading">
          <div>
            <h2>Item prices</h2>
            <p className="muted small">
              Enter the price for each item and service. Leave a price blank
              if that service is unavailable for the item.
            </p>
          </div>
        </div>

        <div className="card admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-price-table">
              <thead>
                <tr>
                  <th>Item</th>
                  {catalog.services.map((service) => (
                    <th key={service.id}>
                      {service.label || service.name || service.id}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {catalog.items.map((item, itemIndex) => (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {item.emoji ? `${item.emoji} ` : ""}
                        {item.name || item.label || item.id}
                      </strong>
                      <small>{item.id}</small>
                    </td>

                    {catalog.services.map((service) => (
                      <td key={service.id}>
                        <div className="admin-price-input">
                          <span>₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.prices?.[service.id] ?? ""}
                            onChange={(e) =>
                              updateItemPrice(
                                itemIndex,
                                service.id,
                                e.target.value
                              )
                            }
                            placeholder="—"
                            aria-label={`${item.name || item.id} price for ${service.label || service.id}`}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-section-heading">
          <div>
            <h2>Delivery and service fees</h2>
            <p className="muted small">
              These settings are used when calculating new customer orders.
            </p>
          </div>
        </div>

        <div className="admin-fee-grid">
          <section className="card">
            <label>Free delivery above (₹)</label>
            <input
              type="number"
              min="0"
              value={catalog.fees.freeAbove ?? ""}
              onChange={(e) => updateFee("freeAbove", e.target.value)}
            />
            <small className="muted">
              Orders at or above this subtotal qualify for free delivery.
            </small>
          </section>

          <section className="card">
            <label>Standard delivery fee (₹)</label>
            <input
              type="number"
              min="0"
              value={catalog.fees.delivery ?? ""}
              onChange={(e) => updateFee("delivery", e.target.value)}
            />
          </section>

          <section className="card">
            <label>Express service fee (₹)</label>
            <input
              type="number"
              min="0"
              value={catalog.fees.express ?? ""}
              onChange={(e) => updateFee("express", e.target.value)}
            />
          </section>

          <section className="card">
            <label>Delivery partner share (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={
                catalog.fees.partnerShare === "" ||
                catalog.fees.partnerShare == null
                  ? ""
                  : Number(catalog.fees.partnerShare) * 100
              }
              onChange={(e) =>
                updateFee(
                  "partnerShare",
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value) / 100
                )
              }
            />
            <small className="muted">
              Example: enter 85 for an 85% partner share.
            </small>
          </section>
        </div>

        <div className="admin-save-bar">
          <p className="muted small">
            Review your changes before saving. Existing orders keep their
            original price.
          </p>
          <button
            className="btn"
            onClick={saveCatalog}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save all changes"}
          </button>
        </div>
      </main>
    </div>
  );
}
