// backend/routes/excelRoutes.js

const express = require('express');
const router = express.Router();

// ✅ Middleware
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// ✅ Controllers
const {
  handleExcelUpload,
  getLatestExcel,
} = require('../controllers/excelController');

// ✅ @route   POST /api/excel/upload-excel
// ✅ @desc    Upload Excel file
// ✅ @access  Private
router.post(
  '/upload-excel',
  protect,
  upload.single('excel'), // form field must be named 'excel'
  handleExcelUpload
);

// ✅ @route   GET /api/excel/latest
// ✅ @desc    Get latest uploaded file
// ✅ @access  Private
router.get('/latest', protect, getLatestExcel);

module.exports = router;
