import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "./UserProvider";
import "./EventPage.css";

const EVENT_DETAIL_ENDPOINT = "http://localhost:8000/api/event/";
const CARS_ENDPOINT = "http://localhost:8000/api/cars/";

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return "Date to be confirmed";
  }
  return dateFormatter.format(date);
}

/** Returns the vehicle types that are eligible for an event type.
 *  Meet-up → any vehicle accepted
 *  Car     → only Car vehicles
 *  Bike    → only Bike vehicles
 */
function eligibleVehicleTypes(eventType) {
  if (eventType === "Car") return ["Car"];
  if (eventType === "Bike") return ["Bike"];
  return ["Car", "Bike"]; // Meet-up
}

function VehiclePickerModal({ vehicles, eventType, onConfirm, onCancel, loading }) {
  const eligible = eligibleVehicleTypes(eventType);
  const available = vehicles.filter((v) => eligible.includes(v.type));
  const [selected, setSelected] = useState(null);

  return (
    <div className="enroll-modal-overlay" onClick={onCancel}>
      <div className="enroll-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="enroll-modal__title">Escolhe o teu veículo</h2>
        <p className="enroll-modal__subtitle">
          {eventType === "Meet-up"
            ? "Qualquer veículo é bem-vindo neste encontro."
            : `Este evento é para veículos do tipo "${eventType}".`}
        </p>

        {available.length === 0 ? (
          <div className="enroll-modal__empty">
            Não tens nenhum veículo do tipo <strong>{eventType}</strong> na garagem.{" "}
            <Link to="/garage">Adiciona um na garagem</Link> e volta a tentar.
          </div>
        ) : (
          <ul className="enroll-modal__list">
            {available.map((v) => (
              <li key={v.id}>
                <label className={`enroll-modal__option${selected === v.id ? " enroll-modal__option--selected" : ""}`}>
                  <input
                    type="radio"
                    name="vehicle"
                    value={v.id}
                    checked={selected === v.id}
                    onChange={() => setSelected(v.id)}
                  />
                  <span className="enroll-modal__vehicle-info">
                    <span className="enroll-modal__vehicle-name">
                      {v.brand} {v.model}
                    </span>
                    <span className="enroll-modal__vehicle-meta">
                      {v.type}{v.year ? ` · ${v.year}` : ""}{v.color ? ` · ${v.color}` : ""}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="enroll-modal__actions">
          <button
            className="enroll-modal__confirm"
            type="button"
            disabled={!selected || loading}
            onClick={() => onConfirm(selected)}
          >
            {loading ? "A inscrever..." : "Confirmar inscrição"}
          </button>
          <button
            className="enroll-modal__cancel"
            type="button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function EventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Enroll state
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [userVehicles, setUserVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  const getCSRFToken = () => {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='))
      ?.split('=')[1] || '';
  };

  const toLocalInput = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const fromLocalInput = (localValue) => {
    if (!localValue) return null;
    const d = new Date(localValue);
    return d.toISOString();
  };

  // Derived state
  const isEnrolled =
    user &&
    Array.isArray(event?.participants) &&
    event.participants.some((p) => p.username === user.username);

  const isFull =
    event &&
    Array.isArray(event.participants) &&
    event.participants.length >= event.participant_limit;

  const isOwner =
    event?.owner && user && event.owner.username === user.username;

  const canEnroll =
    user &&
    event?.is_approved &&
    event?.is_public;

  // Open vehicle picker: load user's vehicles first
  const handleOpenEnroll = async () => {
    setEnrollError("");
    setVehiclesLoading(true);
    setShowVehiclePicker(true);
    try {
      const res = await fetch(CARS_ENDPOINT, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUserVehicles(Array.isArray(data) ? data : []);
      } else {
        setUserVehicles([]);
      }
    } catch {
      setUserVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleConfirmEnroll = async (carId) => {
    setEnrollLoading(true);
    setEnrollError("");
    try {
      const response = await fetch(`${EVENT_DETAIL_ENDPOINT}${eventId}/enroll/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ car_id: carId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setEnrollError(data.detail || "Erro ao inscrever no evento.");
        setShowVehiclePicker(false);
        return;
      }

      const updated = await response.json();
      setEvent(updated);
      setShowVehiclePicker(false);
    } catch {
      setEnrollError("Erro ao ligar ao servidor.");
      setShowVehiclePicker(false);
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleUnenroll = async () => {
    const confirmed = window.confirm("Tens a certeza que queres cancelar a tua inscrição?");
    if (!confirmed) return;

    setEnrollLoading(true);
    setEnrollError("");
    try {
      const response = await fetch(`${EVENT_DETAIL_ENDPOINT}${eventId}/unenroll/`, {
        method: "DELETE",
        credentials: "include",
        headers: { "X-CSRFToken": getCSRFToken() },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setEnrollError(data.detail || "Erro ao cancelar inscrição.");
        return;
      }

      const refreshRes = await fetch(`${EVENT_DETAIL_ENDPOINT}${eventId}/`, {
        credentials: "include",
      });
      if (refreshRes.ok) {
        setEvent(await refreshRes.json());
      }
    } catch {
      setEnrollError("Erro ao ligar ao servidor.");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleCancelEvent = async () => {
    const confirmed = window.confirm("Are you sure you want to cancel this event? This action cannot be undone.");
    if (!confirmed) return;

    setCancelLoading(true);
    setError("");

    try {
      const response = await fetch(`${EVENT_DETAIL_ENDPOINT}${eventId}/`, {
        method: "DELETE",
        credentials: "include",
        headers: { "X-CSRFToken": getCSRFToken() },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.detail || "Error cancelling the event.");
        return;
      }

      navigate("/");
    } catch {
      setError("Error connecting to the server.");
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvent() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${EVENT_DETAIL_ENDPOINT}${eventId}/`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          setError("Could not load the event details.");
          setEvent(null);
          return;
        }

        const data = await response.json();
        setEvent(data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError("Could not load the event details.");
          setEvent(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadEvent();
    return () => controller.abort();
  }, [eventId]);

  if (loading) {
    return <div className="event-page">Loading event...</div>;
  }

  if (error) {
    return <div className="event-page event-page__status--error">{error}</div>;
  }

  if (!event) {
    return <div className="event-page">Event not found.</div>;
  }

  return (
    <main className="event-page">
      {/* Vehicle picker modal */}
      {showVehiclePicker && (
        <VehiclePickerModal
          vehicles={userVehicles}
          eventType={event.type || "Meet-up"}
          onConfirm={handleConfirmEnroll}
          onCancel={() => setShowVehiclePicker(false)}
          loading={enrollLoading || vehiclesLoading}
        />
      )}

      <header className="event-page__header">
        <div className="event-page__header-top">
          <p className="event-page__eyebrow">Event details</p>
          <h1>{event.name}</h1>
        </div>
        <div className="event-page__header-bottom">
          <p className="event-page__subtitle">{event.event_type || "Meet-up"} · {event.location || "Location to be defined"}</p>

          <div className="event-page__header-actions">
            {!editMode && isOwner ? (
              <>
                <button
                  className="event-page__cancel-button"
                  type="button"
                  onClick={handleCancelEvent}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? "Cancelling..." : "Cancel event"}
                </button>
                <button
                  className="event-page__edit-button"
                  onClick={() => {
                    setEditMode(true);
                    setEditData({
                      name: event.name || '',
                      description: event.description || '',
                      type: event.type || 'Meet-up',
                      date: toLocalInput(event.date),
                      location: event.location || '',
                      participant_limit: event.participant_limit || 1,
                      is_public: !!event.is_public,
                    });
                  }}
                >
                  Edit
                </button>
              </>
            ) : null}

            {/* Enroll / Unenroll */}
            {canEnroll && !editMode ? (
              isEnrolled ? (
                <button
                  className="event-page__unenroll-button"
                  type="button"
                  onClick={handleUnenroll}
                  disabled={enrollLoading}
                >
                  {enrollLoading ? "A processar..." : "Cancelar inscrição"}
                </button>
              ) : (
                <button
                  className="event-page__enroll-button"
                  type="button"
                  onClick={handleOpenEnroll}
                  disabled={enrollLoading || isFull}
                >
                  {enrollLoading ? "A processar..." : isFull ? "Evento cheio" : "Inscrever-me"}
                </button>
              )
            ) : null}

            <Link to="/" className="event-page__back-link">← Back to meetups</Link>
          </div>
        </div>

        {enrollError && (
          <div className="event-page__status event-page__status--error">{enrollError}</div>
        )}
        {isEnrolled && !editMode && (
          <div className="event-page__enroll-badge">✓ Estás inscrito neste evento</div>
        )}
      </header>

      {editMode && editData ? (
        <section className="event-page__edit">
          <form
            className="event-edit-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              try {
                const payload = {
                  name: editData.name,
                  description: editData.description,
                  type: editData.type,
                  date: fromLocalInput(editData.date),
                  location: editData.location,
                  participant_limit: Number(editData.participant_limit),
                  is_public: !!editData.is_public,
                };

                const res = await fetch(`${EVENT_DETAIL_ENDPOINT}${eventId}/`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                  },
                  credentials: 'include',
                  body: JSON.stringify(payload),
                });

                if (!res.ok) {
                  const data = await res.json();
                  setError(data.detail || 'Error updating the event.');
                  return;
                }

                const updated = await res.json();
                setEvent(updated);
                setEditMode(false);
              } catch (e) {
                void e;
                setError('Error connecting to the server.');
              }
            }}
          >
            <div className="event-edit-grid">
              <label>
                Name
                <input value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
              </label>
              <label>
                Type
                <select value={editData.type} onChange={(e) => setEditData({...editData, type: e.target.value})}>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Meet-up">Meet-up</option>
                </select>
              </label>
              <label>
                Date and time
                <input type="datetime-local" value={editData.date} onChange={(e) => setEditData({...editData, date: e.target.value})} />
              </label>
              <label>
                Location
                <input className="event-edit-input" value={editData.location} onChange={(e) => setEditData({...editData, location: e.target.value})} />
              </label>
              <label>
                Limit
                <input type="number" min={1} value={editData.participant_limit} onChange={(e) => setEditData({...editData, participant_limit: e.target.value})} />
              </label>
              <label className="event-edit-checkbox-field">
                Public
                <input type="checkbox" checked={editData.is_public} onChange={(e) => setEditData({...editData, is_public: e.target.checked})} />
              </label>
              <label className="event-edit-full">
                Description
                <textarea value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} />
              </label>
            </div>

            <div className="event-edit-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
            {error && <div className="event-page__status event-page__status--error">{error}</div>}
          </form>
        </section>
      ) : (
        <>
          <section className="event-page__summary">
            <div className="event-page__meta-card">
              <h2>When</h2>
              <p>{formatDateTime(event.date)}</p>
            </div>
            <div className="event-page__meta-card">
              <h2>Where</h2>
              <p>{event.location || "Location to be defined"}</p>
            </div>
            <div className="event-page__meta-card">
              <h2>Organizer</h2>
              <p>{event.owner?.username || "Community"}</p>
            </div>
            <div className="event-page__meta-card">
              <h2>Participants</h2>
              <p>{Array.isArray(event.participants) ? event.participants.length : 0} / {event.participant_limit} joined</p>
            </div>
          </section>

          <section className="event-page__details">
            <div className="event-page__block">
              <h2>About this event</h2>
              <p>{event.description || "No additional description is available for this event."}</p>
            </div>

            <div className="event-page__block">
              <h2>Event information</h2>
              <dl>
                <div>
                  <dt>Type</dt>
                  <dd>{event.event_type || "Meet-up"}</dd>
                </div>
                <div>
                  <dt>Public</dt>
                  <dd>{event.is_public ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt>Approved</dt>
                  <dd>{event.is_approved ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt>Participant limit</dt>
                  <dd>{event.participant_limit}</dd>
                </div>
              </dl>
            </div>
          </section>
        </>
      )}

      <section className="event-page__section">
        <h2>Featured vehicles</h2>
        {Array.isArray(event.featured_vehicles) && event.featured_vehicles.length > 0 ? (
          <div className="event-page__vehicles-grid">
            {event.featured_vehicles.map((vehicle) => (
              <article key={vehicle.id} className="event-page__vehicle-card">
                {vehicle.image ? (
                  <img src={`http://127.0.0.1:8000/${vehicle.image}`} alt={`${vehicle.brand} ${vehicle.model}`} />
                ) : (
                  <div className="event-page__vehicle-placeholder">No image</div>
                )}
                <div>
                  <strong>{vehicle.brand} {vehicle.model}</strong>
                  <p>{vehicle.year}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="event-page__status">No featured vehicles have been added yet.</div>
        )}
      </section>

      <section className="event-page__section">
        <h2>People attending</h2>
        {Array.isArray(event.participants) && event.participants.length > 0 ? (
          <ul className="event-page__participants-list">
            {event.participants.map((participant) => (
              <li key={participant.id}>
                {participant.username}
                {user && participant.username === user.username && (
                  <span className="event-page__you-badge"> (tu)</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="event-page__status">No participants joined yet.</div>
        )}
      </section>
    </main>
  );
}

export default EventPage;
