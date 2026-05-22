const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as user_name, a.name as asset_name
       FROM incidents i
       JOIN users u ON i.user_id = u.id
       LEFT JOIN assets a ON i.asset_id = a.id
       WHERE i.deleted_at IS NULL
       ORDER BY i.urgency_level DESC, i.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, asset_id, urgency_level, status, action_taken } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO incidents (user_id, asset_id, title, description, urgency_level, status, action_taken)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, asset_id || null, title, description, urgency_level || 'normal', status || 'open', action_taken]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { title, description, asset_id, urgency_level, status, action_taken } = req.body;
  try {
    const resolved_at = status === 'resolved' ? new Date() : null;
    const result = await pool.query(
      `UPDATE incidents SET title=$1, description=$2, asset_id=$3, urgency_level=$4,
       status=$5, action_taken=$6, resolved_at=$7 WHERE id=$8 AND deleted_at IS NULL RETURNING *`,
      [title, description, asset_id || null, urgency_level, status, action_taken, resolved_at, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('UPDATE incidents SET deleted_at=NOW() WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;