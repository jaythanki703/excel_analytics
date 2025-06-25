const express = require('express');
const router = express.Router();
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  getLoggedInUser,
  incrementChartsCreated,
  incrementDownloads,
} = require('../controllers/authController');


const { protect } = require('../middleware/authMiddleware'); // ✅ correct


// ==== Public Routes ====
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ==== Protected Routes ====
router.get('/me', protect, getLoggedInUser);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// ==== Increment Routes ====
router.put('/increment-charts', protect, incrementChartsCreated);
router.put('/increment-downloads', protect, incrementDownloads);

module.exports = router;
