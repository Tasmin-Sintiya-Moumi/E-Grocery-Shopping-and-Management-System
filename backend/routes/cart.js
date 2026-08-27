const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth); 

router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT ci.id AS cart_item_id, ci.quantity, p.id AS product_id, p.name, p.price,
            p.image, p.unit, (ci.quantity * p.price) AS line_total
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.user_id = ?`,
    [req.user.id]
  );
  const total = rows.reduce((sum, r) => sum + Number(r.line_total), 0);
  res.json({ items: rows, total });
});

router.post('/', async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ message: 'product_id is required' });

  const [product] = await pool.query('SELECT stock FROM products WHERE id = ?', [product_id]);
  if (product.length === 0) return res.status(404).json({ message: 'Product not found' });

  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [req.user.id, product_id, quantity]
  );
  res.status(201).json({ message: 'Added to cart' });
});

router.put('/:productId', async (req, res) => {
  const { quantity } = req.body;
  if (quantity == null || quantity < 1) {
    return res.status(400).json({ message: 'quantity must be at least 1 (use DELETE to remove)' });
  }
  await pool.query(
    'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
    [quantity, req.user.id, req.params.productId]
  );
  res.json({ message: 'Cart updated' });
});


router.delete('/:productId', async (req, res) => {
  await pool.query(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
    [req.user.id, req.params.productId]
  );
  res.json({ message: 'Item removed from cart' });
});

module.exports = router;