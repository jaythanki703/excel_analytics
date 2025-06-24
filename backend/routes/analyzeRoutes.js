const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // using memory storage for PDFs
const protect = require('../middleware/authMiddleware');

const {
  saveAnalysis,
  getChartPDF,
  getAnalysisHistory,
  deleteAnalysis, // ✅ Import delete function
} = require('../controllers/analyzeController');

// ✅ Save a new analysis
router.post('/save', protect, upload.single('chartPDF'), saveAnalysis);

// ✅ View a saved PDF
router.get('/pdf/:id', protect, getChartPDF);

// ✅ View all previous analyses by user
router.get('/history', protect, getAnalysisHistory);

// ✅ Delete an analysis by ID
router.delete('/:id', protect, deleteAnalysis);

module.exports = router;
