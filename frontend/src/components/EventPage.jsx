import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "./UserProvider";
import "./EventPage.css";

const EVENT_DETAIL_ENDPOINT = "http://localhost:8000/carmeetsApp/api/event/";

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

  const handleCancelEvent = async () => {
    const confirmed = window.confirm("Are you sure you want to cancel this event? This action cannot be undone.");
    if (!confirmed) return;

    setCancelLoading(true);
    setError("");

    try {
      const response = await fetch(`${EVENT_DETAIL_ENDPOINT}${eventId}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.detail || "Error cancelling the event.");
        return;
      }

      navigate("/");
    } catch (cancelError) {
      void cancelError;
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
      <header className="event-page__header">
        <div className="event-page__header-top">
          <p className="event-page__eyebrow">Event details</p>
          <h1>{event.name}</h1>
        </div>
        <div className="event-page__header-bottom">
          <p className="event-page__subtitle">{event.event_type || "Meet-up"} · {event.location || "Location to be defined"}</p>

          <div className="event-page__header-actions">
            {!editMode && event.owner && user && event.owner.username === user.username ? (
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
            <Link to="/" className="event-page__back-link">← Back to meetups</Link>
          </div>
        </div>
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
              <p>{Array.isArray(event.participants) ? event.participants.length : 0} joined</p>
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
                  <img src={`http://127.0.0.1:8000/carmeetsApp${vehicle.image}`} alt={`${vehicle.brand} ${vehicle.model}`} />
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
              <li key={participant.id}>{participant.username}</li>
            ))}
          </ul>
        ) : (
          <div className="event-page__status">No participants joined yet.</div>
        )}
      </section>

      {user?.profile === "admin" ? (
        <div className="event-page__admin-card">
          <a
            href={`/admin/carmeetsApp/event/${event.id}/change/`}
            target="_blank"
            rel="noreferrer"
            className="event-page__admin-link"
          >
            Open admin event page
          </a>
        </div>
      ) : null}
    </main>
  );
}

export default EventPage;
