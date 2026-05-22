const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET semua activities
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as user_name 
       FROM activities a
       JOIN users u ON a.user_id = u.id
       WHERE a.deleted_at IS NULL
       ORDER BY a.urgency_level DESC, a.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST buat activity baru
router.post('/', auth, async (req, res) => {
  const { title, description, type, location, urgency_level, status, event_time } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO activities (user_id, title, description, type, location, urgency_level, status, event_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.id, title, description, type, location, urgency_level || 'normal', status || 'ongoing', event_time || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('ERROR INSERT ACTIVITY:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PUT update activity
router.put('/:id', auth, async (req, res) => {
  const { title, description, type, location, urgency_level, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE activities SET title=$1, description=$2, type=$3, location=$4,
       urgency_level=$5, status=$6 WHERE id=$7 AND deleted_at IS NULL RETURNING *`,
      [title, description, type, location, urgency_level, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE soft delete
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE activities SET deleted_at=NOW() WHERE id=$1',
      [req.params.id]
    );
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;