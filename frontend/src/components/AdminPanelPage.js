import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './adminPanel.css';
import AdminProfileModal from './AdminProfileModal';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-toastify/dist/ReactToastify.css';
import 'react-confirm-alert/src/react-confirm-alert.css';

const AdminPanelPage = () => {
  const [adminName, setAdminName] = useState('');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [adminInfo, setAdminInfo] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const navigate = useNavigate();

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/profile', getAuthConfig());
      if (res.data.role !== 'Admin') {
        toast.error('Access denied: Admins only');
        navigate('/login');
        return;
      }
      setAdminName(res.data.name);
      setAdminInfo(res.data);
      if (sessionStorage.getItem('justLoggedIn') === 'true') {
        toast.success(`Welcome ${res.data.name}`);
        sessionStorage.removeItem('justLoggedIn');
      }
    } catch (err) {
      console.error('Profile fetch error:', err.response?.data?.msg || err.message);
      navigate('/login');
    }
  }, [navigate]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', getAuthConfig()),
        axios.get('http://localhost:5000/api/admin/users', getAuthConfig()),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.filter(user => user.role === 'User'));
    } catch (err) {
      console.error('Dashboard fetch error:', err.response?.data?.msg || err.message);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    toast.success('You have successfully logged out');
    navigate('/login');
  };

  const handleDelete = (id) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this user?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await axios.delete(`http://localhost:5000/api/admin/user/${id}`, getAuthConfig());
              fetchDashboardData();
              toast.success('User deleted successfully');
            } catch (err) {
              toast.error('Error deleting user');
            }
          },
        },
        {
          label: 'No',
          onClick: () => {},
        },
      ],
    });
  };

  useEffect(() => {
    fetchProfile();
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchProfile, fetchDashboardData]);

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="admin-panel">
      <ToastContainer position="top-right" autoClose={3000} />
      <nav className="admin-navbar">
        <div className="navbar-left">
          <span className="logo-text">Excelytics Admin</span>
        </div>
        <div className="navbar-right">
          <button onClick={() => setShowProfileModal(true)}>Profile</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="welcome-message">
        <h2>Welcome, {adminName}</h2>
      </div>

      <div className="dashboard-boxes">
        <div className="box">Total Users: {stats.totalUsers || 0}</div>
        <div className="box">Active Today: {stats.activeUsersToday || 0}</div>
        <div className="box">Files Uploaded: {stats.totalFiles || 0}</div>
        <div className="box">Charts Generated: {stats.totalCharts || 0}</div>
        <div className="box">Downloads: {stats.totalDownloads || 0}</div>
        <div className="box">
          Last Login:{' '}
          {adminInfo.lastLogin
            ? new Date(adminInfo.lastLogin).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            : 'N/A'}
        </div>
        <div className="box">
          Member Since:{' '}
          {adminInfo.createdAt
            ? new Date(adminInfo.createdAt).toLocaleDateString('en-IN')
            : 'N/A'}
        </div>
      </div>

      <div className="user-table-section">
        <h3>User Records</h3>
        <table className="user-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Email ID</th>
              <th>Last Login</th>
              <th>Member Since</th>
              <th>Files</th>
              <th>Charts</th>
              <th>Downloads</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>No users found.</td>
              </tr>
            ) : (
              currentUsers.map((user, index) => (
                <tr key={user._id}>
                  <td>{indexOfFirstUser + index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                      : 'N/A'}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>{user.fileCount || 0}</td>
                  <td>{user.chartCount || 0}</td>
                  <td>{user.downloadCount || 0}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(user._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {users.length > usersPerPage && (
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() =>
                setCurrentPage(prev =>
                  prev < totalPages ? prev + 1 : prev
                )
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showProfileModal && (
        <AdminProfileModal
          onClose={() => setShowProfileModal(false)}
          refreshProfile={fetchProfile}
        />
      )}
    </div>
  );
};

export default AdminPanelPage;
