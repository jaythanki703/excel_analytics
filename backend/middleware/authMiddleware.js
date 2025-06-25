const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// ✅ Middleware 1: Authenticate token from Authorization header or cookie
const authenticateToken = async (req, res, next) => {
  let token;

  // Prefer Authorization header, fallback to cookie if needed
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Optional: Support token via cookie (future-proofing)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('❌ Token validation failed:', err.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

// ✅ Middleware 2: Verify Admin Role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

module.exports = {
  authenticateToken,
  verifyAdmin,
  protect: authenticateToken, // alias for consistency
};
