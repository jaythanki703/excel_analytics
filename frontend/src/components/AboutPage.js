// src/components/AboutPage.js
import React from 'react';
import './about.css';

const AboutPage = () => {
  return (
    <div className="about-page-wrapper">
      <div className="about-scroll-section">
        <div className="about-box">
          <h1>About Excelytics</h1>
          <p>
            <strong>Excelytics</strong> is a web-based platform that helps users easily analyze and visualize their Excel data.
            Designed for professionals, students and educators, our tool simplifies spreadsheet analytics without requiring advanced software or technical knowledge.
          </p>

          <h2>Our Story</h2>
          <p>
            Founded in 2025, Excelytics was created to bridge the gap between raw Excel data and decision making insights.
            We noticed that many people struggled to interpret complex spreadsheets, so we built a platform to make data interpretation intuitive and fast.
          </p>

          <h2>Our Mission</h2>
          <p>
            Our mission is to make Excel data analysis accessible to everyone regardless of their background or industry.
            We want to help users turn rows and columns into charts, trends and actionable insights with just a few clicks.
          </p>

          <h2>What We Offer</h2>
          <ul>
            <li>📁 Upload Excel files and analyze them instantly</li>
            <li>📊 Generate 2D/3D charts and interactive dashboards</li>
            <li>📥 Download charts easily</li>
            <li>🕓 View past uploads and analysis history</li>
          </ul>

          <h2>Who Uses Excelytics?</h2>
          <p>Excelytics is used by:</p>
          <ul>
            <li>✅ Business professionals who need quick reporting</li>
            <li>✅ Students and teachers analyzing project data</li>
            <li>✅ Freelancers and consultants presenting client results</li>
          </ul>

          <h2>Looking Ahead</h2>
          <p>
            We're committed to continuously improving Excelytics by adding new chart types, more data upload options and better export features — all focused on helping you understand your data better.
          </p>

          <h2>Meet the Founder</h2>
          <p>
            <strong>Jay Thanki</strong>, the founder of Excelytics, is passionate about making data analysis simple and accessible for everyone.
            His vision is to empower individuals and organizations with powerful, intuitive tools to uncover insights from spreadsheets without complexity.
          </p>

          <p className="thank-you-note">
            Thank you for choosing Excelytics. We’re excited to be part of your data journey!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
