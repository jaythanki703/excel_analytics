// ==== server.js ====

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ==== Route Imports ====
const authRoutes = require('./routes/authRoutes');
const excelRoutes = require('./routes/excelRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==== CORS Configuration (Allow frontend requests with credentials) ====
const corsOptions = {
  origin: 'http://localhost:3000', // ✅ Your React frontend URL
  credentials: true,              // ✅ Allow cookies & auth headers
};
app.use(cors(corsOptions));

// ==== Middleware ====
app.use(express.json()); // ✅ Parse incoming JSON requests

// ==== Test Route ====
app.get('/', (req, res) => {
  res.send('✅ Excelytics API is running');
});

// ==== API Routes ====
app.use('/api/auth', authRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/analysis', analyzeRoutes);
app.use('/api/admin', adminRoutes); // ✅ Admin routes with token & role protection

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
