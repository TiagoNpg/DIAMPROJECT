import React, { useState, useEffect } from 'react';

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/admin/reports/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch reports');

      const data = await response.json();
      setReports(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) =>
    report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reporter.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="reports-section">
      <h2>Reports Management</h2>

      {error && <div className="error-message">Error: {error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by reason or reporter..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={fetchReports} className="btn btn-primary">
          Refresh
        </button>
      </div>

      {reports.length === 0 ? (
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '10px', textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#666', fontSize: '1.1em' }}>No reports available</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Reporter</th>
                <th>Comment ID</th>
                <th>Reason</th>
                <th>Created</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.reporter.username}</td>
                  <td>{report.comment}</td>
                  <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {report.reason}
                  </td>
                  <td>{new Date(report.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-info" onClick={() => alert(report.reason)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '20px', color: '#666' }}>
        Total Reports: {filteredReports.length}
      </p>

      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '20px',
        borderRadius: '10px',
        marginTop: '20px'
      }}>
        <h3>Report Summary</h3>
        <ul>
          <li><strong>Total Reports:</strong> {reports.length}</li>
          <li><strong>Unique Reporters:</strong> {new Set(reports.map(r => r.reporter.username)).size}</li>
          <li><strong>Unique Reported Comments:</strong> {new Set(reports.map(r => r.comment)).size}</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminReports;
