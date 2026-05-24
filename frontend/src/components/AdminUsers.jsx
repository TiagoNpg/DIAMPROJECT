import { useState, useEffect } from 'react';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
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

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/admin/users/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
        });

        if (!response.ok) throw new Error('Failed to fetch users');

        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          console.error('Error fetching users:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, [refetchTrigger]);

  const handleBlockUser = async (userId, shouldBlock) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/user/${userId}/block/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
          },
          credentials: 'include',
          body: JSON.stringify({ is_blocked: shouldBlock }),
        }
      );

      if (!response.ok) throw new Error('Failed to update user');

      setSuccessMessage(`User ${shouldBlock ? 'blocked' : 'unblocked'} successfully`);
      refetch();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Error updating user:', err);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/user/${userId}/role/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
          },
          credentials: 'include',
          body: JSON.stringify({ profile: newRole }),
        }
      );

      if (!response.ok) throw new Error('Failed to update role');

      setSuccessMessage('User role updated successfully');
      refetch();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Error updating role:', err);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="users-section">
      <h2>User Management</h2>

      {error && <div className="error-message">Error: {error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by username or email..."
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
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.profile}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="guest">Guest</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.is_blocked ? 'status-blocked' : 'status-approved'}`}>
                    {user.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td>
                  <div className="btn-group">
                    {user.is_blocked ? (
                      <button onClick={() => handleBlockUser(user.id, false)} className="btn btn-success">
                        Unblock
                      </button>
                    ) : (
                      <button onClick={() => handleBlockUser(user.id, true)} className="btn btn-danger">
                        Block
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: '20px', color: 'var(--text)' }}>
        Total Users: {filteredUsers.length}
      </p>
    </div>
  );
}

export default AdminUsers;
