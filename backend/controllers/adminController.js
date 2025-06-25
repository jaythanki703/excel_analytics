const User = require('../models/userModel');
const File = require('../models/uploadedFileModel');
const bcrypt = require('bcryptjs');

// GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'User' });
    const activeUsersToday = await User.countDocuments({
      role: 'User',
      lastLogin: { $gte: new Date().setHours(0, 0, 0, 0) },
    });

    const allUsers = await User.find({ role: 'User' });
    const totalFiles = allUsers.reduce((sum, user) => sum + (user.filesUploaded || 0), 0);
    const totalCharts = allUsers.reduce((sum, user) => sum + (user.chartsCreated || 0), 0);
    const totalDownloads = allUsers.reduce((sum, user) => sum + (user.downloadedFiles || 0), 0);

    res.json({
      totalUsers,
      activeUsersToday,
      totalFiles,
      totalCharts,
      totalDownloads,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'User' }).select('-password').lean();
    const userStats = users.map(user => ({
      ...user,
      fileCount: user.filesUploaded || 0,
      chartCount: user.chartsCreated || 0,
      downloadCount: user.downloadedFiles || 0,
    }));
    res.json(userStats);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// DELETE /api/admin/user/:id
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await File.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};

// GET /api/admin/profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);

    if (!admin || admin.role !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const previousLogin = admin.previousLogin || admin.createdAt;

res.json({
  name: admin.name,
  email: admin.email,
  role: admin.role,
  lastLogin: previousLogin,
  createdAt: admin.createdAt,
});

  } catch (err) {
    res.status(500).json({ message: 'Error fetching admin profile', error: err.message });
  }
};

// PUT /api/admin/profile
const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({ message: 'Name must contain only letters.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully.',
      name: updated.name,
      email: updated.email,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};

// POST /api/admin/change-password
const changeAdminPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ message: 'New password must be different from the old one.' });
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{6,}$/.test(newPassword)
    ) {
      return res.status(400).json({
        message:
          'Password must be at least 6 characters and include uppercase, lowercase, number, and special character.',
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password', error: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAdminProfile,      // ✅ Updated
  updateAdminProfile,
  changeAdminPassword,
};
