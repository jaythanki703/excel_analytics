// src/components/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './homepage.css';

function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="homepage">
      <div className="center-content">
        <h1 className="main-tagline">Welcome to Excelytics!</h1>
        <p className="sub-tagline">
          Analyze, visualize and understand your Excel data effortlessly.
        </p>

        <div className="features-title">Our Key Features</div>

        <div className="features-wrapper">
          <div className="features auto-scroll">
            <div className="feature-box">📊 Powerful Dashboard</div>
            <div className="feature-box">📁 Upload Excel Files</div>
            <div className="feature-box">🧮 Analyze Data</div>
            <div className="feature-box">📈 2D/3D Charts</div>
            <div className="feature-box">🕓 View History</div>
            <div className="feature-box">📥 Download Charts</div>
            <div className="feature-box">📊 Powerful Dashboard</div>
            <div className="feature-box">📁 Upload Excel Files</div>
            <div className="feature-box">🧮 Analyze Data</div>
            <div className="feature-box">📈 2D/3D Charts</div>
            <div className="feature-box">🕓 View History</div>
            <div className="feature-box">📥 Download Charts</div>
          </div>
        </div>

        <div className="cta">
          <button className="cta-button" onClick={handleGetStarted}>
            🚀 Get Started
          </button>
        </div>

        <section className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step"> <h3>1️⃣ Upload Excel File</h3>
              <p>Select your Excel file (.xlsx or .xls) and upload it securely to the platform.</p>
            </div>
            <div className="step">
              <h3>2️⃣ Analyze Instantly</h3>
              <p>We process the data and extract insights in seconds with built-in intelligence.</p>
            </div>
            <div className="step">
              <h3>3️⃣ Visualize the Data</h3>
              <p>Generate beautiful 2D/3D charts and explore your data visually.</p>
            </div>
            <div className="step">
              <h3>4️⃣ Export Data</h3>
              <p>Download your charts as pdfs or images for sharing.</p>
            </div>
            <div className="step">
              <h3>5️⃣ View History</h3>
              <p>Access past uploads and analysis and allow them to download anytime-track your records over time.</p>
            </div>
          </div>
        </section>

        <section className="testimonials">
          <h2>What Our Users Say</h2>
          <div className="testimonial red-border">
            <p>"A game-changer for my presentations — fast, reliable, and stunning charts!"</p>
            <strong>- Anjali, Financial Analyst</strong>
          </div>
          <div className="testimonial green-border">
            <p>"The best way to get insights from spreadsheets without Excel formulas!"</p>
            <strong>- Ravi, Business Consultant</strong>
          </div>
          <div className="testimonial blue-border">
            <p>"Intuitive and simple — I love how easy it is to create visual reports for my clients!"</p>
            <strong>- Meera, Freelance Data Analyst</strong>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
