// src/components/DashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import {
  FaTachometerAlt,
  FaUpload,
  FaChartBar,
  FaHistory,
  FaUserCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import './dashboard.css';
import AnalyzePage from './AnalyzePage';
import ViewHistoryPage from './ViewHistoryPage';

const DashboardPage = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [editableUser, setEditableUser] = useState({ name: '', email: '', role: '' });
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [history, setHistory] = useState([]);

  const token = localStorage.getItem('token');

  const validateName = (name) => /^[A-Za-z ]+$/.test(name);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?!.*\s)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(password);

  const formatDateTime = (dateStr) =>
    new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const formatMonthYear = (dateStr) =>
    new Date(dateStr).toLocaleString('en-IN', {
      month: 'long',
      year: 'numeric',
    });

  const fetchUser = useCallback(async () => {
    try {
      if (!token) throw new Error('User token is missing. Please log in again.');
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserData(data);
      setEditableUser({
        name: data.name || '',
        email: data.email || '',
        role: data.role || '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to fetch user.');
      sessionStorage.removeItem('user');
    }
  }, [token]);

  const fetchHistory = useCallback(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/excel/history', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setHistory(data);
  } catch (err) {
    // ❌ Removed the toast
  }
}, [token]);


  useEffect(() => {
    fetchUser();
    fetchHistory();
  }, [fetchUser, fetchHistory]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          toast.warn('The selected Excel file is empty or invalid.');
          return;
        }
        setFilePreview(jsonData.slice(0, 5));
      } catch (err) {
        toast.error('Failed to parse Excel file. Please upload a valid file.');
        setSelectedFile(null);
        setFilePreview([]);
        setFileInputKey(Date.now());
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview([]);
    setFileInputKey(Date.now());
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return toast.error('Please select a file before uploading.');
    const formData = new FormData();
    formData.append('excel', selectedFile);
    try {
      const response = await fetch('http://localhost:5000/api/excel/upload-excel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Upload failed');
      toast.success('File uploaded successfully!');
      setSelectedFile(null);
      setFilePreview([]);
      setFileInputKey(Date.now());
      await fetchUser();
    } catch (error) {
      toast.error(error.message || 'Something went wrong during upload.');
    }
  };

  const handleProfileSave = async () => {
    let valid = true;
    if (!validateName(editableUser.name)) {
      setNameError('Name must contain only letters and spaces.');
      valid = false;
    } else setNameError('');

    if (!validateEmail(editableUser.email)) {
      setEmailError('Invalid email format.');
      valid = false;
    } else setEmailError('');

    if (!valid) return;
    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editableUser.name, email: editableUser.email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Failed to update profile');
      toast.success(data.msg || 'Profile updated successfully!');
      setEditMode(false);
      await fetchUser();
    } catch (err) {
      toast.error(err.message || 'Something went wrong while updating the profile.');
    }
  };

  const handlePasswordSubmit = async () => {
    if (!newPassword.trim()) return setPasswordError('New password is required.');
    if (!validatePassword(newPassword)) {
      return setPasswordError('Password must have at least 6 characters and include uppercase, lowercase, number and special character.');
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Failed to change password');
      toast.success(data.msg || 'Password changed successfully!');
      setPasswordError('');
      setPasswordMode(false);
      setNewPassword('');
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'upload':
        return (
          <div className="upload-section">
            <p>Upload your Excel file (.xls or .xlsx) to analyze and visualize your data</p>
            <div className="upload-box">
              <input
                key={fileInputKey}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="file-input"
              />
              {selectedFile && (
                <div className="selected-file">
                  <span>{selectedFile.name}</span>
                  <button className="remove-file" onClick={removeFile}><FaTimesCircle /></button>
                </div>
              )}
              <button className="upload-btn" onClick={handleFileUpload}>Upload</button>
            </div>
            {filePreview.length > 0 && (
              <div className="file-preview">
                <h4>Preview (First 5 Rows)</h4>
                <table className="preview-table">
                  <tbody>
                    {filePreview.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'profile':
        return (
          <div className="profile-section">
            <div className="form-group">
              <label>Name</label>
              {editMode ? (
                <>
                  <input type="text" value={editableUser.name} onChange={(e) => setEditableUser({ ...editableUser, name: e.target.value })} />
                  {nameError && <div className="error">{nameError}</div>}
                </>
              ) : (
                <p><strong>{editableUser.name}</strong></p>
              )}
            </div>
            <div className="form-group">
              <label>Email</label>
              {editMode ? (
                <>
                  <input type="email" value={editableUser.email} onChange={(e) => setEditableUser({ ...editableUser, email: e.target.value })} />
                  {emailError && <div className="error">{emailError}</div>}
                </>
              ) : (
                <p><strong>{editableUser.email}</strong></p>
              )}
            </div>
            <div className="form-group">
              <label>Role</label>
              <p><strong>{editableUser.role}</strong></p>
            </div>
            {editMode ? (
              <button onClick={handleProfileSave} className="save-btn">Save</button>
            ) : (
              <>
                <button onClick={() => setEditMode(true)} className="edit-btn">Edit Profile</button>
                {!passwordMode && <button onClick={() => setPasswordMode(true)} className="change-pass-btn">Change Password</button>}
              </>
            )}
            {passwordMode && (
              <div className="password-section">
                <label>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                {passwordError && <div className="error">{passwordError}</div>}
                <button onClick={handlePasswordSubmit} className="submit-btn">Submit</button>
              </div>
            )}
          </div>
        );
      case 'analyze':
        return <AnalyzePage setUserData={setUserData} />;
      case 'history':
        return <ViewHistoryPage history={history} />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    if (!userData) return null;
    return (
      <>
        <h2 className="dashboard-title">Welcome, {editableUser.name}!</h2>
        <div className="dashboard-row">
          <div className="dashboard-box files-uploaded">
            <h3>Files Uploaded</h3>
            <p>{userData.filesUploaded || 0}</p>
          </div>
          <div className="dashboard-box charts-generated">
            <h3>Charts Generated</h3>
            <p>{userData.chartsCreated || 0}</p>
          </div>
          <div className="dashboard-box downloaded-files">
            <h3>Downloaded Files</h3>
            <p>{userData.downloadedFiles || 0}</p>
          </div>
        </div>
        <div className="dashboard-row">
          <div className="dashboard-box last-login">
            <h3>Last Login</h3>
            <p>{sessionStorage.getItem('lastLogin') ? formatDateTime(sessionStorage.getItem('lastLogin')) : 'First Login'}</p>
          </div>
          <div className="dashboard-box member-since">
            <h3>Member Since</h3>
            <p>{userData.memberSince ? formatMonthYear(userData.memberSince) : 'N/A'}</p>
          </div>
        </div>
      </>
    );
  };

  const menuItems = [
    { name: 'Dashboard', key: 'dashboard', icon: <FaTachometerAlt /> },
    { name: 'Upload Excel', key: 'upload', icon: <FaUpload /> },
    { name: 'Analyze Data', key: 'analyze', icon: <FaChartBar /> },
    { name: 'View History', key: 'history', icon: <FaHistory /> },
    { name: 'Profile', key: 'profile', icon: <FaUserCircle /> },
  ];

  return (
    <div className="dashboard-container">
      <nav className="dashboard-navbar">
        <div className="navbar-left">
          <img src="/logo.png" alt="Logo" className="company-logo" />
          <h2 className="company-name">Excelytics</h2>
        </div>
        <div className="navbar-right">
          <button className="logout-btn" onClick={() => {
            toast.success('You have successfully logged out.');
            setTimeout(() => onLogout(), 1500);
          }}>Logout</button>
        </div>
      </nav>
      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <ul className="sidebar-links">
            {menuItems.map((item) => (
              <li key={item.key} className={activeSection === item.key ? 'active' : ''} onClick={() => setActiveSection(item.key)}>
                <span className="icon">{item.icon}</span>
                <span className="label">{item.name}</span>
              </li>
            ))}
          </ul>
        </aside>
        <main className="dashboard-main">
          <h1 className="dashboard-title">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;