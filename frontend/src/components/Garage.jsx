import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./UserProvider";
import "./Garage.css";

const API_BASE = "http://localhost:8000/api";

const VEHICLE_TYPES = ["Car", "Moto"];

const emptyForm = {
  brand: "",
  model: "",
  year: "",
  type: "Car",
  color: "",
  description: "",
  image: null,
};

function getCSRFToken() {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1] || ""
  );
}

function VehicleCard({ vehicle, onEdit, onDelete, enrolledEventNames }) {
  const isEnrolled = enrolledEventNames.length > 0;

  return (
    <article className="garage-vehicle-card">
      <div className="garage-vehicle-card__image-wrap">
        {vehicle.image ? (
          <img
            src={
              vehicle.image.startsWith("http")
                ? vehicle.image
                : `http://localhost:8000${vehicle.image}`
            }
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="garage-vehicle-card__image"
          />
        ) : (
          <div className="garage-vehicle-card__no-image">
            <span>{vehicle.type === "Bike" ? "🏍️" : "🚗"}</span>
          </div>
        )}
        <span
          className={`garage-vehicle-card__badge garage-vehicle-card__badge--${vehicle.type?.toLowerCase()}`}
        >
          {vehicle.type}
        </span>
      </div>

      <div className="garage-vehicle-card__body">
        <h3 className="garage-vehicle-card__title">
          {vehicle.brand} {vehicle.model}
        </h3>
        <div className="garage-vehicle-card__meta">
          {vehicle.year && (
            <span className="garage-vehicle-card__chip">{vehicle.year}</span>
          )}
          {vehicle.color && (
            <span className="garage-vehicle-card__chip">{vehicle.color}</span>
          )}
        </div>
        {vehicle.description && (
          <p className="garage-vehicle-card__desc">{vehicle.description}</p>
        )}

        {/* Enrolled events indicator */}
        {isEnrolled && (
          <div className="garage-vehicle-card__enrolled-info">
            <span className="garage-vehicle-card__enrolled-label">
              ✓ Enrolled in:
            </span>
            <ul className="garage-vehicle-card__enrolled-list">
              {enrolledEventNames.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="garage-vehicle-card__actions">
        <button
          className="garage-btn garage-btn--secondary"
          onClick={() => onEdit(vehicle)}
        >
          ✏️ Edit
        </button>
        <button
          className={`garage-btn garage-btn--danger${isEnrolled ? " garage-btn--disabled" : ""}`}
          onClick={() => onDelete(vehicle)}
          disabled={isEnrolled}
          title={
            isEnrolled
              ? `Não podes apagar este veículo: está inscrito em ${enrolledEventNames.length === 1 ? "um evento" : `${enrolledEventNames.length} eventos`}.`
              : "Apagar veículo"
          }
        >
          🗑️ Delete
        </button>
      </div>
    </article>
  );
}

function VehicleFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [preview, setPreview] = useState(
    initial?.image
      ? initial.image.startsWith("http")
        ? initial.image
        : `http://localhost:8000${initial.image}`
      : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!initial?.id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("brand", form.brand);
      formData.append("model", form.model);
      formData.append("year", form.year);
      formData.append("type", form.type);
      formData.append("color", form.color);
      formData.append("description", form.description);
      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      const url = isEditing
        ? `${API_BASE}/car/${initial.id}/`
        : `${API_BASE}/cars/`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "X-CSRFToken": getCSRFToken() },
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.detail ||
            Object.values(data).flat().join(" ") ||
            "Failed to save vehicle."
        );
        return;
      }

      const saved = await res.json();
      onSaved(saved, isEditing);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="garage-modal-overlay" onClick={onClose}>
      <div
        className="garage-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? "Edit vehicle" : "Add vehicle"}
      >
        <div className="garage-modal__header">
          <h2>{isEditing ? "Edit vehicle" : "Add vehicle"}</h2>
          <button className="garage-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="garage-form" onSubmit={handleSubmit}>
          <div className="garage-form__grid">
            <label className="garage-form__field">
              <span>Make *</span>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                placeholder="e.g. BMW"
              />
            </label>

            <label className="garage-form__field">
              <span>Model *</span>
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                required
                placeholder="e.g. M3"
              />
            </label>

            <label className="garage-form__field">
              <span>Type *</span>
              <select name="type" value={form.type} onChange={handleChange}>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="garage-form__field">
              <span>Year</span>
              <input
                name="year"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={form.year}
                onChange={handleChange}
                placeholder="e.g. 2021"
              />
            </label>

            <label className="garage-form__field">
              <span>Colour</span>
              <input
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="e.g. Black"
              />
            </label>

            <label className="garage-form__field garage-form__field--full">
              <span>Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Notes about the vehicle..."
              />
            </label>

            <div className="garage-form__field garage-form__field--full">
              <span>Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="garage-form__file"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="garage-form__preview"
                />
              )}
            </div>
          </div>

          {error && <div className="garage-alert garage-alert--error">{error}</div>}

          <div className="garage-form__actions">
            <button
              type="button"
              className="garage-btn garage-btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="garage-btn garage-btn--primary"
              disabled={loading}
            >
              {loading ? "Saving…" : isEditing ? "Save changes" : "Add vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EnrollModal({ vehicle, events, onClose, onEnrolled }) {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  events = events.filter(ev => {
    // Verifica se o veículo já está inscrito
    const alreadyAdded = Array.isArray(ev.featured_vehicles)
        ? ev.featured_vehicles.some(fv => fv.id === vehicle.id)
        : false;

    // Meetup aceita tudo
    const validType =
        ev.type === 'Meet-up' ||
        ev.type === vehicle.type;

    // Só mantém eventos válidos e sem o veículo já inscrito
    return !alreadyAdded && validType;
  });
  const handleEnroll = async () => {
    if (!selectedEvent) {
      setError("Please select an event.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/event/${selectedEvent}/enroll/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify({ car_id: vehicle.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || "Failed to register for event.");
        return;
      }

      setSuccess("Successfully registered! 🎉");
      if (onEnrolled) onEnrolled(selectedEvent);
      setTimeout(onClose, 1800);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="garage-modal-overlay" onClick={onClose}>
      <div
        className="garage-modal garage-modal--enroll"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="garage-modal__header">
          <h2>Register for event</h2>
          <button className="garage-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="garage-enroll-vehicle">
          <span>{vehicle.type === "Bike" ? "🏍️" : "🚗"}</span>
          <strong>
            {vehicle.brand} {vehicle.model}
          </strong>
          {vehicle.year && <span className="garage-vehicle-card__chip">{vehicle.year}</span>}
        </div>

        <div className="garage-form__field">
          <label htmlFor="enroll-event-select">
            <span>Choose an event</span>
          </label>
          <select
            id="enroll-event-select"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="garage-enroll-select"
          >
            <option value="">— Select an event —</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}{" "}
                {ev.date
                  ? `· ${new Date(ev.date).toLocaleDateString("en-GB")}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="garage-alert garage-alert--error">{error}</div>}
        {success && <div className="garage-alert garage-alert--success">{success}</div>}

        {!success && (
          <div className="garage-form__actions">
            <button
              className="garage-btn garage-btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="garage-btn garage-btn--enroll"
              onClick={handleEnroll}
              disabled={loading}
            >
              {loading ? "Registering…" : "✅ Register"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Garage() {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [enrollVehicle, setEnrollVehicle] = useState(null);

  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [vehiclesRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE}/cars/`, { credentials: "include" }),
          fetch(`${API_BASE}/events/`, { credentials: "include" }),
        ]);

        if (vehiclesRes.ok) {
          const data = await vehiclesRes.json();
          setVehicles(Array.isArray(data) ? data : []);
        } else {
          setError("Could not load your vehicles.");
        }

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          const now = new Date();
          const upcoming = (Array.isArray(data) ? data : []).filter((ev) => {
            const d = new Date(ev.date);
            return !isNaN(d) && d >= now && ev.is_public !== false && ev.is_approved !== false;
          });
          setEvents(upcoming);
        }
      } catch {
        setError("Connection error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, navigate]);

  /** Returns the names of upcoming events that feature this vehicle */
  function getEnrolledEventNames(vehicleId) {
    return events
      .filter((ev) =>
        Array.isArray(ev.featured_vehicles) &&
        ev.featured_vehicles.some((fv) => fv.id === vehicleId)
      )
      .map((ev) => ev.name);
  }

  const handleSaved = (saved, isEditing) => {
    if (isEditing) {
      setVehicles((prev) => prev.map((v) => (v.id === saved.id ? saved : v)));
    } else {
      setVehicles((prev) => [...prev, saved]);
    }
    setShowForm(false);
    setEditingVehicle(null);
  };

  const handleDelete = async (vehicle) => {
    const enrolledNames = getEnrolledEventNames(vehicle.id);
    if (enrolledNames.length > 0) {
      alert(
        `You can't delete the ${vehicle.brand} ${vehicle.model} vehicle because it is enrolled on:\n\n• ${enrolledNames.join("\n• ")}\n\nPlease cancel your enrollments for these events before deleting the vehicle.`
      );
      return;
    }

    if (!window.confirm(`Apagar ${vehicle.brand} ${vehicle.model}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/car/${vehicle.id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": getCSRFToken() },
        credentials: "include",
      });
      if (res.ok || res.status === 204) {
        setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
      } else {
        alert("Failed to delete vehicle.");
      }
    } catch {
      alert("Connection error. Please try again.");
    }
  };

  const displayedVehicles =
    filterType === "All"
      ? vehicles
      : vehicles.filter((v) => v.type === filterType);

  if (loading) {
    return (
      <main className="garage-page">
        <div className="garage-status">A carregar garagem…</div>
      </main>
    );
  }

  return (
    <main className="garage-page">
      <section className="garage-hero">
        <div className="garage-hero__copy">
          <p className="garage-hero__eyebrow">My garage</p>
          <h1 className="garage-hero__title">My vehicles</h1>
          <p className="garage-hero__lead">
            Manage your cars and bikes and register them for upcoming community events.
          </p>
        </div>
        <div className="garage-hero__actions">
          <button
            className="garage-btn garage-btn--primary garage-btn--lg"
            onClick={() => {
              setEditingVehicle(null);
              setShowForm(true);
            }}
          >
            + Add vehicle
          </button>
        </div>
      </section>

      <section className="garage-content">
        <div className="garage-toolbar">
          <div className="garage-filter-tabs">
            {["All", "Car", "Bike"].map((t) => (
              <button
                key={t}
                className={`garage-filter-tab${filterType === t ? " garage-filter-tab--active" : ""}`}
                onClick={() => setFilterType(t)}
              >
                {t === "All" ? "All" : t === "Car" ? "🚗 Cars" : "🏍️ Bikes"}
                <span className="garage-filter-tab__count">
                  {t === "All"
                    ? vehicles.length
                    : vehicles.filter((v) => v.type === t).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="garage-alert garage-alert--error">{error}</div>
        )}

        {displayedVehicles.length === 0 ? (
          <div className="garage-empty">
            <div className="garage-empty__icon">
              {filterType === "Bike" ? "🏍️" : "🚗"}
            </div>
            <h3>
              {filterType === "All"
                ? "No vehicles yet"
                : `No ${filterType === "Bike" ? "bikes" : "cars"} yet`}
            </h3>
            <p>Add your first vehicle to register it for events!</p>
            <button
              className="garage-btn garage-btn--primary"
              onClick={() => {
                setEditingVehicle(null);
                setShowForm(true);
              }}
            >
              + Add vehicle
            </button>
          </div>
        ) : (
          <div className="garage-grid">
            {displayedVehicles.map((vehicle) => {
              const enrolledEventNames = getEnrolledEventNames(vehicle.id);
              return (
                <div key={vehicle.id} className="garage-grid__item">
                  <VehicleCard
                    vehicle={vehicle}
                    enrolledEventNames={enrolledEventNames}
                    onEdit={(v) => {
                      setEditingVehicle(v);
                      setShowForm(true);
                    }}
                    onDelete={handleDelete}
                  />
                  <button
                    className="garage-btn garage-btn--enroll garage-btn--enroll-main"
                    onClick={() => setEnrollVehicle(vehicle)}
                    disabled={events.length === 0}
                    title={
                      events.length === 0
                        ? "No events available"
                        : "Register for an event"
                    }
                  >
                    🏁 Register for an event
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showForm && (
        <VehicleFormModal
          initial={editingVehicle}
          onClose={() => {
            setShowForm(false);
            setEditingVehicle(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {enrollVehicle && (
        <EnrollModal
          vehicle={enrollVehicle}
          events={events}
          onClose={() => setEnrollVehicle(null)}
          onEnrolled={(eventId) => {
            setEvents((prev) =>
                prev.map((ev) =>
                    ev.id === Number(eventId)
                        ? {
                          ...ev,
                          featured_vehicles: [
                            ...(ev.featured_vehicles || []),
                            enrollVehicle,
                          ],
                        }
                        : ev
                )
            );
          }}
        />
      )}
    </main>
  );
}

export default Garage;
