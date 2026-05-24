import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./UserProvider";
import "./CreateMeeting.css";

const EVENTS_ENDPOINT = "http://localhost:8000/carmeetsApp/api/events/";

function CreateMeeting() {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const getCSRFToken = () => {
    const token = document.cookie.split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
    return token || "";
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Meet-up",
    date: "",
    location: "",
    participant_limit: 20,
    is_public: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ensure CSRF token is created by making an initial GET request
  useEffect(() => {
    fetch(EVENTS_ENDPOINT, { credentials: "include" })
      .catch(() => {
        // We don't care if this fails; we just need to trigger CSRF token creation
      });
  }, []);

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setError("Event name is required.");
      setLoading(false);
      return;
    }
    if (!formData.date) {
      setError("Event date is required.");
      setLoading(false);
      return;
    }
    if (!formData.location.trim()) {
      setError("Location is required.");
      setLoading(false);
      return;
    }
    if (formData.participant_limit <= 0) {
      setError("Participant limit must be greater than 0.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(EVENTS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          date: formData.date,
          location: formData.location,
          participant_limit: parseInt(formData.participant_limit, 10),
          is_public: formData.is_public,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || "Error creating the event. Please try again.");
        setLoading(false);
        return;
      }

      // Success — redirect to home
      navigate("/");
      // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      setError("Error connecting to the server.");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <main className="create-meeting">
      <div className="create-meeting__container">
        <header className="create-meeting__header">
          <h1 className="create-meeting__title">Create new meeting</h1>
          <p className="create-meeting__subtitle">Organize your own meeting and invite the community!</p>
        </header>

        <form onSubmit={handleSubmit} className="create-meeting__form">
          {error && <div className="create-meeting__error">{error}</div>}

          <fieldset className="create-meeting__fieldset">
            <legend className="create-meeting__legend">Event details</legend>

            <div className="create-meeting__form-group">
              <label htmlFor="name" className="create-meeting__label">
                Event name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Classic Car Meet"
                className="create-meeting__input"
                maxLength="200"
                required
              />
              <span className="create-meeting__char-count">{formData.name.length}/200</span>
            </div>

            <div className="create-meeting__form-group">
              <label htmlFor="description" className="create-meeting__label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the event, what to expect, and any useful info..."
                className="create-meeting__textarea"
                maxLength="1000"
                rows="5"
              />
              <span className="create-meeting__char-count">{formData.description.length}/1000</span>
            </div>

            <div className="create-meeting__form-group">
              <label htmlFor="type" className="create-meeting__label">
                Event type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="create-meeting__select"
                required
              >
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Meet-up">Meet-up</option>
              </select>
            </div>

            <div className="create-meeting__form-row">
              <div className="create-meeting__form-group">
                <label htmlFor="date" className="create-meeting__label">
                  Date and time *
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="create-meeting__input"
                  required
                />
              </div>

              <div className="create-meeting__form-group">
                <label htmlFor="location" className="create-meeting__label">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Central Park, Lisbon"
                  className="create-meeting__input"
                  maxLength="200"
                  required
                />
              </div>
            </div>

            <div className="create-meeting__form-row">
              <div className="create-meeting__form-group">
                <label htmlFor="participant_limit" className="create-meeting__label">
                  Participant limit *
                </label>
                <input
                  type="number"
                  id="participant_limit"
                  name="participant_limit"
                  value={formData.participant_limit}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  className="create-meeting__input"
                  required
                />
              </div>

              <div className="create-meeting__form-group">
                <label htmlFor="is_public" className="create-meeting__checkbox-label">
                  <input
                    type="checkbox"
                    id="is_public"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleChange}
                    className="create-meeting__checkbox"
                  />
                  Public event (visible to everyone)
                </label>
              </div>
            </div>
          </fieldset>

          <div className="create-meeting__actions">
            <button type="submit" className="create-meeting__submit" disabled={loading}>
              {loading ? "Creating..." : "Create event"}
            </button>
            <button type="button" className="create-meeting__cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>

        <div className="create-meeting__info">
          <h3>Useful information</h3>
          <ul>
            <li>Events must be approved by an administrator before they appear publicly.</li>
            <li>You can invite specific participants by switching visibility to private.</li>
            <li>Fields marked with * are required.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default CreateMeeting;

