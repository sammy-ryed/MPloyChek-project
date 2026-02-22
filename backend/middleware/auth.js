// middleware/auth.js – validate JWT and attach decoded user to req
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mpoly_secret_key_2025';

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorisation token missing.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
