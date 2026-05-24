import { useEffect, useMemo, useState } from "react";
import { useUserContext } from "./UserProvider";
import { Link } from "react-router-dom";
import "./MainPage.css";

const EVENTS_ENDPOINT = "http://localhost:8000/carmeetsApp/api/events/";

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

function getMeetingType(event) {
  const haystack = `${event?.name ?? ""} ${event?.description ?? ""}`.toLowerCase();

  if (/(bike|bicycle|moto|motorbike|scooter)/.test(haystack)) {
    return "Bike";
  }

  if (/(car|auto|drive|garage|road trip|track|classic)/.test(haystack)) {
    return "Car";
  }

  return "Meet-up";
}

function getAvailableSpots(event) {
  const limit = Number(event?.participant_limit ?? 0);
  const participants = Array.isArray(event?.participants) ? event.participants.length : 0;
  return Math.max(limit - participants, 0);
}

function MainPage() {
  const { user } = useUserContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(EVENTS_ENDPOINT, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setError("Não foi possível carregar os eventos.");
          setEvents([]);
          return;
        }

        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError("Não foi possível carregar os eventos.");
          setEvents([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => controller.abort();
  }, []);

  const { meetings } = useMemo(() => {
    const now = new Date();
    const upcoming = events
      .filter((event) => {
        const eventDate = new Date(event.date);
        return (
          !Number.isNaN(eventDate.valueOf()) &&
          eventDate >= now &&
          event.is_public !== false &&
          event.is_approved !== false
        );
      })
      .sort((left, right) => new Date(left.date) - new Date(right.date));

    return { meetings: upcoming };
  }, [events]);

  // Filters state (client-side)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterDate, setFilterDate] = useState(""); // yyyy-mm-dd
  const [filterLocation, setFilterLocation] = useState("");
  const [filterHost, setFilterHost] = useState("");

  // apply client-side filters to meetings
  const filteredMeetings = useMemo(() => {
    if (loading) return [];
    const term = searchTerm.trim().toLowerCase();

    return meetings.filter((event) => {
      // type filter
      const type = getMeetingType(event);
      if (filterType !== "All" && type !== filterType) return false;

      // date filter (match same calendar day)
      if (filterDate) {
        const evDate = new Date(event.date);
        if (Number.isNaN(evDate.valueOf())) return false;
        const evIso = evDate.toISOString().slice(0, 10);
        if (evIso !== filterDate) return false;
      }

      // location filter
      if (filterLocation) {
        const loc = (event.location || "").toLowerCase();
        if (!loc.includes(filterLocation.trim().toLowerCase())) return false;
      }

      // host filter
      if (filterHost) {
        const host = (event.owner?.username || "").toLowerCase();
        if (!host.includes(filterHost.trim().toLowerCase())) return false;
      }

      // search term across name/description/location/host
      if (term) {
        const hay = `${event.name ?? ""} ${event.description ?? ""} ${event.location ?? ""} ${event.owner?.username ?? ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }

      return true;
    });
  }, [meetings, loading, searchTerm, filterType, filterDate, filterLocation, filterHost]);

  const displayedMeetings = loading ? [] : filteredMeetings;
  const totalCount = loading ? "—" : displayedMeetings.length;
  const carCount = loading
    ? "—"
    : displayedMeetings.filter((event) => getMeetingType(event) === "Car").length;
  const bikeCount = loading
    ? "—"
    : displayedMeetings.filter((event) => getMeetingType(event) === "Bike").length;
  const cityAreas = loading
    ? "—"
    : new Set(displayedMeetings.map((event) => event.location || "Cidade toda")).size;
  const currentTime = new Date().toUTCString();

  const scrollToMeetings = () => {
    document.getElementById("meetings-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="homepage">

      <section className="homepage__hero">
        <div className="homepage__hero-copy">
          <p className="homepage__eyebrow">Scheduled meets across the city</p>
          <h1 style={{color: 'var(--text-h)'}}>Find the next car and bike meetings near you</h1>
          <p className="homepage__lead">
            Discover upcoming public meetings, check where they are happening, and pick the ride
            that fits your neighbourhood and your schedule.
          </p>

          <div className="homepage__actions">
            <button className="homepage__cta" type="button" onClick={scrollToMeetings}>
              Browse upcoming meetings
            </button>
            <span className="homepage__support-text">
              {user
                ? `Welcome back, ${user.username}.`
                : "Join the community to save your favorite meetings."}
            </span>
          </div>
        </div>
      </section>

      <section className="homepage__stats-row">
        <div className="homepage__stats" aria-label="Meeting summary">
          <article className="stat-card">
            <span className="stat-card__label">Upcoming</span>
            <strong className="stat-card__value">{totalCount}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Car meets</span>
            <strong className="stat-card__value">{carCount}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Bike rides</span>
            <strong className="stat-card__value">{bikeCount}</strong>
          </article>
          <article className="stat-card stat-card--wide">
            <span className="stat-card__label">City areas covered</span>
            <strong className="stat-card__value">{cityAreas}</strong>
          </article>
        </div>
      </section>
      <section className="homepage__content" aria-labelledby="meetings-heading">
        <div className="homepage__section-header">
          <div>
            <p className="homepage__eyebrow" >This week</p>
            <h2 id="meetings-heading" style={{color: 'var(--text-h)'}}>Scheduled car and bike meetings</h2>
          </div>
          <p className="homepage__section-note">
            {loading
              ? "Loading..."
                : "Last updated: " + currentTime }
          </p>
        </div>

        {/* Filters bar */}
        <div className="filters-bar">
          <input
            type="search"
            placeholder="Pesquisar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filters-bar__input"
            aria-label="Pesquisar eventos"
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filters-bar__select"
            aria-label="Filtrar por tipo"
          >
            <option value="All">Todos</option>
            <option value="Car">Carros</option>
            <option value="Bike">Motas</option>
            <option value="Meet-up">Meet-ups</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filters-bar__input"
            aria-label="Filtrar por data"
          />

          <input
            type="text"
            placeholder="Localização"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="filters-bar__input"
            aria-label="Filtrar por localização"
          />

          <input
            type="text"
            placeholder="Host"
            value={filterHost}
            onChange={(e) => setFilterHost(e.target.value)}
            className="filters-bar__input"
            aria-label="Filtrar por host"
          />

          <button
            type="button"
            className="filters-bar__clear"
            onClick={() => {
              setSearchTerm("");
              setFilterType("All");
              setFilterDate("");
              setFilterLocation("");
              setFilterHost("");
            }}
          >
            Limpar
          </button>
        </div>

        {error ? <div className="homepage__status homepage__status--error">{error}</div> : null}

        {!loading && displayedMeetings.length === 0 ? (
          <div className="homepage__status homepage__status--empty">No upcoming meetings were found for now.</div>
        ) : null}

        <div id="meetings-grid" className="meetings-grid">
          {displayedMeetings.map((event) => {
            const type = getMeetingType(event);
            const spotsLeft = getAvailableSpots(event);
            const participants = Array.isArray(event.participants) ? event.participants.length : 0;

            return (
              <article key={event.id ?? `${event.name}-${event.date}`} className="meeting-card">
                <div className="meeting-card__top">
                  <span className={`meeting-card__badge meeting-card__badge--${type.toLowerCase()}`}>
                    {type}
                  </span>
                  <span className="meeting-card__date">{formatDateTime(event.date)}</span>
                </div>

                <div className="meeting-card__body">
                  <h3 className="meeting-card__title" style={{color: 'var(--text-h)'}}>{event.name}</h3>
                  <p className="meeting-card__description">
                    {event.description || "A community meet-up with riders and drivers from all over the city."}
                  </p>
                </div>

                <dl className="meeting-card__meta">
                  <div>
                    <dt>Location</dt>
                    <dd>{event.location || "Cidade toda"}</dd>
                  </div>
                  <div>
                    <dt>Host</dt>
                    <dd>{event.owner?.username || "City community"}</dd>
                  </div>
                  <div>
                    <dt>Participants</dt>
                    <dd>
                      {participants} joined · {spotsLeft} spots left
                    </dd>
                  </div>
                </dl>

                <div className="meeting-card__footer">
                  <span>{event.is_public ? "Public event" : "Private event"}</span>
                  <span>{event.is_approved ? "Approved" : "Pending approval"}</span>
                </div>
                <div className="meeting-card__actions">
                  <Link to={`/events/${event.id}`} className="meeting-card__details-button">
                    View details
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default MainPage;