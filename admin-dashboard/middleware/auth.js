const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

const verifyToken = (req, res, next) => {
  // Get token from cookie
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Clear invalid token cookie
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

module.exports = {
  verifyToken,
  generateToken,
  JWT_SECRET
};