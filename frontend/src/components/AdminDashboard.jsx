import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import AdminStats from './AdminStats';
import AdminUsers from './AdminUsers';
import AdminEvents from './AdminEvents';
import AdminComments from './AdminComments';
import AdminReports from './AdminReports';
import { useUserContext } from './UserProvider';

function AdminDashboard() {
  const { user } = useUserContext();
  const [activeTab, setActiveTab] = useState('stats');

  // Check if user is admin
  if (!user || user.profile !== 'admin') {
    return (
      <div className="admin-unauthorized">
        <h1>Access Denied</h1>
        <p>You need admin privileges to access this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user.username}</p>
      </div>

      <div className="admin-navigation">
        <button
          className={`nav-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
        <button
          className={`nav-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`nav-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          📅 Events
        </button>
        <button
          className={`nav-button ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          💬 Comments
        </button>
        <button
          className={`nav-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          🚩 Reports
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'events' && <AdminEvents />}
        {activeTab === 'comments' && <AdminComments />}
        {activeTab === 'reports' && <AdminReports />}
      </div>
    </div>
  );
}

export default AdminDashboard;
