import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './register.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User',
    pin: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const { name, email, password, role, pin } = formData;
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      newErrors.name = 'Name must contain only letters and spaces';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(password)
    ) {
      newErrors.password =
        'Password must be at least 6 characters and include uppercase, lowercase, number, and special character';
    }

    if (!role) {
      newErrors.role = 'Role is required';
    }

    if (role === 'Admin') {
      if (!pin) {
        newErrors.pin = 'Security pin is required';
      } else if (!/^\d{4}$/.test(pin)) {
        newErrors.pin = 'Pin must be 4 digits';
      } else if (pin !== '1234') {
        newErrors.pin = 'Invalid security pin';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'User',
      pin: '',
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const { name, email, password, role } = formData;

      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      toast.success(res.data.msg);
      resetForm();
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.msg || 'Registration failed. Please try again.';
      toast.error(errorMsg);
      resetForm();
    }
  };

  return (
    <div className="register-container">
      <form className="register-box" onSubmit={handleSubmit} noValidate>
        <h2>Register</h2>

        <div className="register-grid">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Enter your name"
            onChange={handleChange}
          />
          {errors.name && <span className="error">{errors.name}</span>}

          <label>Email ID</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="Enter your email"
            onChange={handleChange}
          />
          {errors.email && <span className="error">{errors.email}</span>}

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter your password"
            onChange={handleChange}
          />
          {errors.password && <span className="error">{errors.password}</span>}

          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
          {errors.role && <span className="error">{errors.role}</span>}

          {formData.role === 'Admin' && (
            <>
              <label>Security Pin</label>
              <input
                type="password"
                name="pin"
                placeholder="Enter 4-digit pin"
                value={formData.pin}
                onChange={handleChange}
                maxLength="4"
              />
              {errors.pin && <span className="error">{errors.pin}</span>}
            </>
          )}
        </div>

        <div className="centered-button">
          <button type="submit">Register</button>
        </div>

        <p>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ cursor: 'pointer', color: '#0078D4' }}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
