import React, { useState, useEffect } from 'react';

function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/admin/stats/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        Error: {error}
        <button onClick={fetchStats} className="btn btn-primary" style={{ marginLeft: '10px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="stats-section">
      <h2>Dashboard Statistics</h2>
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="number">{stats.total_users}</p>
          </div>
          <div className="stat-card">
            <h3>Total Events</h3>
            <p className="number">{stats.total_events}</p>
          </div>
          <div className="stat-card">
            <h3>Total Comments</h3>
            <p className="number">{stats.total_comments}</p>
          </div>
          <div className="stat-card">
            <h3>Total Reports</h3>
            <p className="number">{stats.total_reports}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Events</h3>
            <p className="number">{stats.pending_events}</p>
          </div>
          <div className="stat-card">
            <h3>Blocked Users</h3>
            <p className="number">{stats.blocked_users}</p>
          </div>
          <div className="stat-card">
            <h3>Reported Comments</h3>
            <p className="number">{stats.reported_comments}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStats;
