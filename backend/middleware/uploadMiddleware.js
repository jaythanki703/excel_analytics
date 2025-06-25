// backend/middleware/uploadMiddleware.js

const multer = require('multer');

// Memory storage keeps the uploaded file in RAM (no disk writes)
const storage = multer.memoryStorage();

// Optional: add file filter to allow only Excel files
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
    file.mimetype === 'application/vnd.ms-excel' // .xls
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed (.xls or .xlsx)'), false);
  }
};

// Optional: limit file size to 5MB
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

// Create the multer instance
const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload; // ✅ exported directly
