const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, 
        u1.name as created_by_name,
        u2.name as assigned_to_name
       FROM tasks t
       JOIN users u1 ON t.created_by = u1.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       WHERE t.deleted_at IS NULL
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, assigned_to, priority, due_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tasks (created_by, assigned_to, title, description, priority, due_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, assigned_to || null, title, description, priority || 'medium', due_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH khusus update status (untuk drag & drop Kanban)
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tasks SET status=$1 WHERE id=$2 AND deleted_at IS NULL RETURNING *`,
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('UPDATE tasks SET deleted_at=NOW() WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;