import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
    return "Data por confirmar";
  }
  return dateFormatter.format(date);
}

function EventPage() {
  const { eventId } = useParams();
  const { user } = useUserContext();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError("Não foi possível carregar os detalhes do evento.");
          setEvent(null);
          return;
        }

        const data = await response.json();
        setEvent(data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError("Não foi possível carregar os detalhes do evento.");
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
    return <div className="event-page">Carregando evento...</div>;
  }

  if (error) {
    return <div className="event-page event-page__status--error">{error}</div>;
  }

  if (!event) {
    return <div className="event-page">Evento não encontrado.</div>;
  }

  return (
    <main className="event-page">
      <header className="event-page__header">
        <div>
          <p className="event-page__eyebrow">Event details</p>
          <h1>{event.name}</h1>
          <p className="event-page__subtitle">
            {event.event_type || "Meet-up"} · {event.location || "Local a definir"}
          </p>
        </div>
        <Link to="/" className="event-page__back-link">
          ← Back to meetups
        </Link>
      </header>

      <section className="event-page__summary">
        <div className="event-page__meta-card">
          <h2>When</h2>
          <p>{formatDateTime(event.date)}</p>
        </div>
        <div className="event-page__meta-card">
          <h2>Where</h2>
          <p>{event.location || "Local a definir"}</p>
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
