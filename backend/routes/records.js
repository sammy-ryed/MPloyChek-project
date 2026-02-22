// routes/records.js – scoped records per user/role
const express = require('express');
const { getUsers, getRecords } = require('../utils/xmlHelper');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/records
// Admin  → all records (enriched with owner name)
// General User → only their own records
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [records, users] = await Promise.all([getRecords(), getUsers()]);

    let result;
    if (req.user.role === 'Admin') {
      // Enrich records with owner display name
      result = records.map(r => {
        const owner = users.find(u => u.id === r.userId);
        return { ...r, ownerName: owner ? owner.name : 'Unknown' };
      });
    } else {
      result = records
        .filter(r => r.userId === req.user.id)
        .map(r => ({ ...r, ownerName: req.user.name }));
    }

    res.json({
      success: true,
      role:    req.user.role,
      total:   result.length,
      data:    result
    });
  } catch (err) {
    console.error('[RECORDS]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch records.' });
  }
});

// GET /api/records/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const records = await getRecords();
    const record  = records.find(r => r.id === req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });

    if (req.user.role !== 'Admin' && record.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch record.' });
  }
});

module.exports = router;
