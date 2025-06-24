const multer = require('multer');
const path = require('path');

// Store uploaded files in memory for parsing with XLSX
const storage = multer.memoryStorage();

// Custom file filter to allow only Excel files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidExt = ext === '.xls' || ext === '.xlsx';
  const isValidMime =
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel';

  if (isValidExt && isValidMime) {
    cb(null, true); // ✅ Accept file
  } else {
    cb(new Error('Only Excel files (.xls or .xlsx) are allowed')); // ❌ Reject file
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit: 5MB
});

module.exports = upload;
