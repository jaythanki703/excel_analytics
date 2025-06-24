import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/navbar';
import Footer from './components/footer';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import AboutPage from './components/AboutPage';
import DashboardPage from './components/DashboardPage';

import './App.css';

// 🔐 Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function AppContent() {
  const location = useLocation();

  // Show Navbar only on the following routes
  const showNavbar = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/about',
  ].includes(location.pathname);

  // Show Footer only on homepage and about
  const isScrollable =
    location.pathname === '/' || location.pathname === '/about';

  // ✅ Safe JSON parsing of user
  const user = (() => {
    try {
      const data = sessionStorage.getItem('user');
      return data && data !== 'undefined' ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div
      className={`App ${
        isScrollable
          ? location.pathname === '/'
            ? 'homepage-scroll'
            : 'about-scroll'
          : ''
      }`}
    >
      {showNavbar && <Navbar />}

      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {isScrollable && <Footer />}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        className="custom-toast-container"
        toastClassName="custom-toast"
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
