import { useState, useEffect } from 'react';

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [viewMode, setViewMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => setRefetchTrigger((n) => n + 1);

  const getCSRFToken = () =>
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='))
      ?.split('=')[1];

  useEffect(() => {
    const controller = new AbortController();

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const [allResponse, pendingResponse] = await Promise.all([
          fetch('http://localhost:8000/api/admin/events/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            signal: controller.signal,
          }),
          fetch('http://localhost:8000/api/admin/events/pending/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            signal: controller.signal,
          }),
        ]);

        if (!allResponse.ok || !pendingResponse.ok)
          throw new Error('Failed to fetch events');

        const allData = await allResponse.json();
        const pendingData = await pendingResponse.json();

        setEvents(allData);
        setPendingEvents(pendingData);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          console.error('Error fetching events:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    return () => controller.abort();
  }, [refetchTrigger]);

  const handleApproveEvent = async (eventId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/event/${eventId}/approve/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() },
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to approve event');
      setSuccessMessage('Event approved successfully');
      refetch();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to reject and delete this event?')) return;
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/event/${eventId}/reject/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() },
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to reject event');
      setSuccessMessage('Event rejected and deleted successfully');
      refetch();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/event/${eventId}/delete/`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() },
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to delete event');
      setSuccessMessage('Event deleted successfully');
      refetch();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const displayEvents = viewMode === 'pending' ? pendingEvents : events;
  const filteredEvents = displayEvents.filter(
    (event) =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="events-section">
      <h2>Event Management</h2>

      {error && <div className="error-message">Error: {error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="search-filter">
        <button onClick={() => setViewMode('all')} className={`btn ${viewMode === 'all' ? 'btn-primary' : 'btn-info'}`}>
          All Events ({events.length})
        </button>
        <button onClick={() => setViewMode('pending')} className={`btn ${viewMode === 'pending' ? 'btn-primary' : 'btn-warning'}`}>
          Pending Events ({pendingEvents.length})
        </button>
        <input
          type="text"
          placeholder="Search by event name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={refetch} className="btn btn-primary">
          Refresh
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Owner</th><th>Date</th>
              <th>Location</th><th>Status</th><th>Participants</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id}>
                <td>{event.id}</td>
                <td>{event.name}</td>
                <td>{event.owner.username}</td>
                <td>{new Date(event.date).toLocaleDateString()}</td>
                <td>{event.location}</td>
                <td>
                  <span className={`status-badge ${event.is_approved ? 'status-approved' : 'status-pending'}`}>
                    {event.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td>{event.participants.length}</td>
                <td>
                  <div className="btn-group">
                    {!event.is_approved && (
                      <>
                        <button onClick={() => handleApproveEvent(event.id)} className="btn btn-success">Approve</button>
                        <button onClick={() => handleRejectEvent(event.id)} className="btn btn-danger">Reject</button>
                      </>
                    )}
                    <button onClick={() => handleDeleteEvent(event.id)} className="btn btn-danger">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: '20px', color: 'var(--text)' }}>
        Showing {filteredEvents.length} events
      </p>
    </div>
  );
}

export default AdminEvents;
