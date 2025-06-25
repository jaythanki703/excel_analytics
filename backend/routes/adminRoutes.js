const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword
} = require('../controllers/adminController');

const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

// Apply both middlewares to all admin routes
router.use(authenticateToken, verifyAdmin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Users table
router.get('/users', getAllUsers);
router.delete('/user/:id', deleteUser);

// Admin profile
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.post('/change-password', changeAdminPassword);

module.exports = router;
