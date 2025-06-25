import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './adminPanel.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminProfileModal = ({ onClose, refreshProfile }) => {
  const [profile, setProfile] = useState({ name: '', email: '', role: '' });
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/profile', getAuthConfig());
        setProfile(res.data);
      } catch (err) {
        toast.error('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateName = (name) =>
    /^[A-Za-z\s]+$/.test(name);

  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{6,}$/.test(password);

  const handleEditSubmit = async () => {
    if (!validateName(profile.name)) return toast.error('Name must contain only letters.');
    if (!validateEmail(profile.email)) return toast.error('Invalid email format.');

    try {
      await axios.put(
        'http://localhost:5000/api/admin/profile',
        {
          name: profile.name,
          email: profile.email,
        },
        getAuthConfig()
      );
      toast.success('Profile updated successfully.');
      setEditMode(false);
      refreshProfile();
    } catch (err) {
      toast.error('Error updating profile.');
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword(newPassword)) {
      return toast.error('Password must be at least 6 characters and contain uppercase, lowercase, number, and special character.');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    try {
      await axios.post(
        'http://localhost:5000/api/admin/change-password',
        { newPassword },
        getAuthConfig()
      );
      toast.success('Password changed successfully.');
      setChangePasswordMode(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error changing password.');
    }
  };

  return (
    <div className="modal-overlay">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="modal-box">
        <h2>Admin Profile</h2>

        {!editMode ? (
          <>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <button onClick={() => setEditMode(true)}>Edit Profile</button>
          </>
        ) : (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <button onClick={handleEditSubmit}>Save Changes</button>
            <button onClick={() => setEditMode(false)}>Cancel</button>
          </>
        )}

        {!changePasswordMode ? (
          <button onClick={() => setChangePasswordMode(true)}>Change Password</button>
        ) : (
          <>
            <div>
              <label>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label>Re-enter Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button onClick={handleChangePassword}>Submit</button>
            <button onClick={() => setChangePasswordMode(false)}>Cancel</button>
          </>
        )}

        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AdminProfileModal;
