// backend/routes/analyzeRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // use memory storage for chart PDFs

const { protect } = require('../middleware/authMiddleware'); // ✅ FIXED HERE

const {
  saveAnalysis,
  getChartPDF,
  getAnalysisHistory,
  deleteAnalysis,
} = require('../controllers/analyzeController');

// ✅ Save a new analysis (PDF upload)
router.post('/save', protect, upload.single('chartPDF'), saveAnalysis);

// ✅ View PDF by ID
router.get('/pdf/:id', protect, getChartPDF);

// ✅ Get all analysis history for logged-in user
router.get('/history', protect, getAnalysisHistory);

// ✅ Delete specific analysis by ID
router.delete('/:id', protect, deleteAnalysis);

module.exports = router;
