// ==== 📁 backend/routes/excelRoutes.js ====
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const protect = require('../middleware/authMiddleware');

const {
  handleExcelUpload,
  getLatestExcel,
} = require('../controllers/excelController');

// ✅ Upload Excel (protected)
router.post('/upload-excel', protect, upload.single('excel'), handleExcelUpload);

// ✅ Fetch Latest Excel (protected)
router.get('/latest', protect, getLatestExcel);

module.exports = router;
