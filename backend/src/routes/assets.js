const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as user_name FROM assets a
       JOIN users u ON a.user_id = u.id
       WHERE a.deleted_at IS NULL ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, asset_code, category, location, condition, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO assets (user_id, name, asset_code, category, location, condition, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, name, asset_code, category, location, condition || 'baik', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name, asset_code, category, location, condition, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE assets SET name=$1, asset_code=$2, category=$3, location=$4,
       condition=$5, notes=$6 WHERE id=$7 AND deleted_at IS NULL RETURNING *`,
      [name, asset_code, category, location, condition, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('UPDATE assets SET deleted_at=NOW() WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;