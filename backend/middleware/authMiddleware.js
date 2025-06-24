const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('✅ Token decoded:', decoded); // Debug line

    // ✅ FIXED LINE
    req.user = { id: decoded.id }; // only include id to avoid token bloat or exposure

    next();
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(401).json({ message: 'Token is not valid or has expired' });
  }
};

module.exports = protect;
