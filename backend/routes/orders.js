const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);


router.post('/checkout', async (req, res) => {
  const { shipping_address } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [cartItems] = await connection.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ? FOR UPDATE`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await connection.rollback();
        return res.status(409).json({ message: `Not enough stock for ${item.name}` });
      }
    }

    const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES (?, ?, ?, ?)',
      [req.user.id, total, shipping_address || null, 'pending']
    );
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.price, item.quantity]
      );
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    await connection.commit();
    res.status(201).json({ message: 'Order placed', order_id: orderId, total });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Checkout failed' });
  } finally {
    connection.release();
  }
});


router.get('/', async (req, res) => {
  const [orders] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(orders);
});

router.get('/all', requireRole('admin'), async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch all orders' });
  }
});

router.get('/:id', async (req, res) => {
  const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

  if (req.user.role !== 'admin' && orders[0].user_id !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
  res.json({ ...orders[0], items });
});


router.put('/:id/status', requireRole('admin', 'seller'), async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' });

  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ message: 'Order status updated' });
});

module.exports = router;
