const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search = '', category, page = 1, limit = 20 } = req.query;
    const offset = (Math.max(1, page) - 1) * limit;

    let query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.name LIKE ?`;
    const params = [`%${search}%`];

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name FROM products p
     LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
  res.json(rows[0]);
});

router.post('/', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const { name, description, price, stock, unit, image, category_id } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, stock, unit, image, category_id, seller_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, price, stock || 0, unit || 'pcs', image || null, category_id || null, req.user.id]
    );
    res.status(201).json({ id: result.insertId, message: 'Product created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

router.put('/:id', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Product not found' });

    if (req.user.role !== 'admin' && existing[0].seller_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own products' });
    }

    const { name, description, price, stock, unit, image, category_id } = req.body;
    await pool.query(
      `UPDATE products SET name=?, description=?, price=?, stock=?, unit=?, image=?, category_id=?
       WHERE id = ?`,
      [
        name ?? existing[0].name,
        description ?? existing[0].description,
        price ?? existing[0].price,
        stock ?? existing[0].stock,
        unit ?? existing[0].unit,
        image ?? existing[0].image,
        category_id ?? existing[0].category_id,
        req.params.id
      ]
    );
    res.json({ message: 'Product updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product' });
  }
});


router.delete('/:id', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (existing.length === 0) return res.status(404).json({ message: 'Product not found' });

  if (req.user.role !== 'admin' && existing[0].seller_id !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete your own products' });
  }

  await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
