const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET;

// ===== User Registration =====
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        msg: 'You have already registered with us. Try to register with another email ID.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Please register with us.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch || user.role !== role) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    // ✅ Save the old login time to previousLogin
    user.previousLogin = user.lastLogin || user.createdAt;

    // ✅ Now update lastLogin to the current time
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      msg: `Welcome ${user.name}! You have successfully logged in.`,
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.previousLogin,       // ⬅️ now returns correct previous login
        memberSince: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error during login' });
  }
};


// ===== Forgot Password =====
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'You are not registered with us.' });

    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30m' });
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Reset Password</h2>
        <p>Click the link below to reset your password. This link is valid for 30 minutes.</p>
        <a href="${resetLink}">Reset Password</a>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: 'Password reset link is sent on your registered email.' });
  } catch (err) {
    console.error('Forgot Password error:', err.message);
    res.status(500).json({ msg: 'Server error during password reset process' });
  }
};

// ===== Reset Password =====
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ msg: 'All fields are required.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords do not match.' });
  }

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
  if (!passwordPattern.test(newPassword)) {
    return res.status(400).json({
      msg: 'Password must be at least 6 characters and include uppercase, lowercase, number and special character.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: 'Invalid token or user does not exist.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: 'Password changed successfully.' });
  } catch (err) {
    console.error('Reset Password error:', err.message);
    res.status(400).json({ msg: 'Token expired or invalid. Please generate a new reset link.' });
  }
};

// ===== Update Profile =====
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ msg: 'Name and email are required.' });
  }

  try {
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser && existingEmailUser._id.toString() !== userId) {
      return res.status(400).json({ msg: 'Email already in use by another account.' });
    }

    const user = await User.findByIdAndUpdate(userId, { name, email }, { new: true });
    res.json({
      msg: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Update Profile error:', err.message);
    res.status(500).json({ msg: 'Server error while updating profile' });
  }
};

// ===== Change Password =====
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ msg: 'New password is required.' });
  }

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
  if (!passwordPattern.test(newPassword)) {
    return res.status(400).json({
      msg: 'Password must be at least 6 characters and include uppercase, lowercase, number, and special character.',
    });
  }

  try {
    const user = await User.findById(userId);
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ msg: 'New password must not be the same as the old password.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change Password error:', err.message);
    res.status(500).json({ msg: 'Server error while changing password' });
  }
};

// ===== Get Logged-in User Info =====
exports.getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const previousLogin = user.lastLogin || user.createdAt;

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: previousLogin,
      memberSince: user.createdAt,
      filesUploaded: user.filesUploaded || 0,
      chartsCreated: user.chartsCreated || 0,
      downloadedFiles: user.downloadedFiles || 0,
    });
  } catch (err) {
    console.error('Get Logged-in User error:', err.message);
    res.status(500).json({ msg: 'Failed to fetch user' });
  }
};

// ===== Increment Charts Created =====
exports.incrementChartsCreated = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { chartsCreated: 1 } },
      { new: true }
    );
    res.status(200).json({ chartsCreated: user.chartsCreated });
  } catch (err) {
    console.error('Increment Charts Error:', err.message);
    res.status(500).json({ msg: 'Failed to increment charts count' });
  }
};

// ===== Increment downloadedFiles count =====
exports.incrementDownloads = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.downloadedFiles = (user.downloadedFiles || 0) + 1;
    await user.save();

    res.json({ msg: 'Download count incremented', downloadedFiles: user.downloadedFiles });
  } catch (err) {
    console.error('Increment Downloads error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
