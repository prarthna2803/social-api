const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// GET /users/:id — get a user profile
router.get('/:id', auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, created_at FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /users/:id/follow — follow or unfollow a user
router.post('/:id/follow', auth, async (req, res, next) => {
  try {
    const followingId = parseInt(req.params.id);
    const followerId = req.user.id;

    if (followerId === followingId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Check user exists
    const user = await pool.query('SELECT id FROM users WHERE id = $1', [followingId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existing = await pool.query(
      'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    if (existing.rows.length > 0) {
      // Unfollow
      await pool.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );
      return res.json({ message: 'Unfollowed' });
    } else {
      // Follow
      await pool.query(
        'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
        [followerId, followingId]
      );
      return res.json({ message: 'Followed' });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
