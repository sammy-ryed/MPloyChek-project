// routes/users.js – CRUD endpoints for user management (Admin only)
const express = require('express');
const bcrypt  = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getUsers, saveUsers } = require('../utils/xmlHelper');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Guard: Admin only
function adminOnly(req, res, next) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
}

// Sanitise – strip password before returning
function sanitise(user) {
  const { password, ...safe } = user;
  return safe;
}

// GET /api/users – list all users (Admin)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await getUsers();
    res.json({ success: true, data: users.map(sanitise) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// GET /api/users/:id – single user (Admin or self)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const users = await getUsers();
    const user  = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (req.user.role !== 'Admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    res.json({ success: true, data: sanitise(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
});

// POST /api/users – create user (Admin)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { userId, password, name, email, role, department } = req.body;
  if (!userId || !password || !name || !email || !role) {
    return res.status(400).json({ success: false, message: 'userId, password, name, email, role are required.' });
  }
  try {
    const users   = await getUsers();
    const exists  = users.find(u => u.userId === userId);
    if (exists) return res.status(409).json({ success: false, message: 'userId already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      id:         uuidv4(),
      userId,
      password:   hashed,
      name,
      email,
      role,
      department: department || 'General',
      status:     'active',
      createdAt:  new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    res.status(201).json({ success: true, data: sanitise(newUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
});

// PUT /api/users/:id – update user (Admin)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await getUsers();
    const idx   = users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'User not found.' });

    const allowed = ['name', 'email', 'role', 'department', 'status'];
    allowed.forEach(f => {
      if (req.body[f] !== undefined) users[idx][f] = req.body[f];
    });

    if (req.body.password) {
      users[idx].password = await bcrypt.hash(req.body.password, 10);
    }

    saveUsers(users);
    res.json({ success: true, data: sanitise(users[idx]) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
});

// DELETE /api/users/:id – delete user (Admin)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users   = await getUsers();
    const filtered = users.filter(u => u.id !== req.params.id);
    if (filtered.length === users.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    saveUsers(filtered);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

module.exports = router;
