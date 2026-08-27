const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories - public
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
  res.json(rows);
});

// POST /api/categories - admin only
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, image } = req.body;
  if (!name) return res.status(400).json({ message: 'Category name required' });

  const [result] = await pool.query(
    'INSERT INTO categories (name, image) VALUES (?, ?)',
    [name, image || null]
  );
  res.status(201).json({ id: result.insertId, name, image });
});

module.exports = router;
