import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './forgotPassword.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset link is sent to your registered email ID.');
      } else {
        toast.error(data.msg || 'You are not registered with us.');
      }

      setEmail('');
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      setEmail('');
    }
  };

  return (
    <div className="forgot-container">
      <form className="forgot-box" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>

        <label>Email ID</label>
        <input
          type="email"
          placeholder="Enter your registered email id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
