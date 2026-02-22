// routes/auth.js – POST /api/auth/login, GET /api/auth/me
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { getUsers } = require('../utils/xmlHelper');
const authMiddleware = require('../middleware/auth');

const router     = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mpoly_secret_key_2025';
const JWT_TTL    = '8h';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ success: false, message: 'userId and password are required.' });
  }

  try {
    const users = await getUsers();
    const user  = users.find(u => u.userId === userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is inactive. Contact administrator.' });
    }

    const payload = {
      id:         user.id,
      userId:     user.userId,
      name:       user.name,
      email:      user.email,
      role:       user.role,
      department: user.department
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TTL });
    return res.json({ success: true, token, user: payload });

  } catch (err) {
    console.error('[AUTH] login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/auth/me – return current user from token
router.get('/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
