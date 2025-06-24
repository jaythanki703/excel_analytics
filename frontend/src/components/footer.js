// src/components/Footer.js
import React from 'react';
import './footer.css';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';


function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-container">
          
          {/* Company Info */}
          <div className="footer-section company-info">
            <div className="logo-row">
              <img src="/logo.png" alt="Company Logo" className="footer-logo" />
              <span className="company-name">Excelytics</span>
            </div>
            <p className="tagline">Transform Excel data into powerful insights instantly.</p>
          </div>

          {/* Quick Links */}
          <div className="footer-section quick-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Register</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section contact-info">
            <h3>Contact</h3>
            <div className="contact-line">
  <span className="contact-icon"><FaEnvelope /></span>
  <span>support@excelytics.com</span>
</div>
<div className="contact-line">
  <span className="contact-icon"><FaPhoneAlt /></span>
  <span>+91 9054716471</span>
</div>

            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} Excelytics. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
