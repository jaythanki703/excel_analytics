// ==== server.js ====

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ==== Route Imports ====
const authRoutes = require('./routes/authRoutes');
const excelRoutes = require('./routes/excelRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==== Middleware ====
app.use(cors());                // Allow cross-origin requests from frontend
app.use(express.json());       // Parse incoming JSON requests

// ==== Basic Route for Testing ====
app.get('/', (req, res) => {
  res.send('✅ Excelytics API is running');
});

// ==== API Routes ====
app.use('/api/auth', authRoutes);        // Authentication (register, login, profile)
app.use('/api/excel', excelRoutes);      // Excel upload and file-related endpoints
app.use('/api/analysis', analyzeRoutes); // Chart analysis, downloads

// ==== MongoDB Connection ====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
