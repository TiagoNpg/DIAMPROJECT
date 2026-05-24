import React, { useState, useEffect } from 'react';

function AdminComments() {
  const [comments, setComments] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [viewMode, setViewMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const [allResponse, reportedResponse] = await Promise.all([
        fetch('http://localhost:8000/api/admin/comments/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
        fetch('http://localhost:8000/api/admin/comments/reported/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
      ]);

      if (!allResponse.ok || !reportedResponse.ok)
        throw new Error('Failed to fetch comments');

      const allData = await allResponse.json();
      const reportedData = await reportedResponse.json();

      setComments(allData);
      setReportedComments(reportedData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/admin/comment/${commentId}/delete/`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) throw new Error('Failed to delete comment');

        setSuccessMessage('Comment deleted successfully');
        fetchComments();
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError(err.message);
        console.error('Error deleting comment:', err);
      }
    }
  };

  const handleMarkAsReported = async (commentId, isReported) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/comment/${commentId}/report/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ is_reported: isReported }),
        }
      );

      if (!response.ok) throw new Error('Failed to update comment status');

      setSuccessMessage(
        `Comment marked as ${isReported ? 'reported' : 'not reported'}`
      );
      fetchComments();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Error updating comment:', err);
    }
  };

  const displayComments =
    viewMode === 'reported' ? reportedComments : comments;
  const filteredComments = displayComments.filter((comment) =>
    comment.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="comments-section">
      <h2>Comment Management</h2>

      {error && <div className="error-message">Error: {error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="search-filter">
        <button
          onClick={() => setViewMode('all')}
          className={`btn ${viewMode === 'all' ? 'btn-primary' : 'btn-info'}`}
        >
          All Comments ({comments.length})
        </button>
        <button
          onClick={() => setViewMode('reported')}
          className={`btn ${viewMode === 'reported' ? 'btn-primary' : 'btn-warning'}`}
        >
          Reported Comments ({reportedComments.length})
        </button>
        <input
          type="text"
          placeholder="Search by comment content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={fetchComments} className="btn btn-primary">
          Refresh
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Event</th>
              <th>Content</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.map((comment) => (
              <tr key={comment.id}>
                <td>{comment.id}</td>
                <td>{comment.user.username}</td>
                <td>Event #{comment.event}</td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {comment.content}
                </td>
                <td>{new Date(comment.created_at).toLocaleDateString()}</td>
                <td>
                  <span
                    className={`status-badge ${
                      comment.is_reported
                        ? 'status-blocked'
                        : 'status-approved'
                    }`}
                  >
                    {comment.is_reported ? 'Reported' : 'Normal'}
                  </span>
                </td>
                <td>
                  <div className="btn-group">
                    {comment.is_reported ? (
                      <button
                        onClick={() =>
                          handleMarkAsReported(comment.id, false)
                        }
                        className="btn btn-success"
                      >
                        Clear Report
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleMarkAsReported(comment.id, true)
                        }
                        className="btn btn-warning"
                      >
                        Mark Reported
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: '20px', color: '#666' }}>
        Showing {filteredComments.length} comments
      </p>
    </div>
  );
}

export default AdminComments;
