const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// GET /feed — get posts from people you follow
router.get('/', auth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT posts.*, users.username,
        COUNT(likes.post_id) AS like_count
       FROM posts
       JOIN users ON posts.user_id = users.id
       LEFT JOIN likes ON likes.post_id = posts.id
       WHERE posts.user_id IN (
         SELECT following_id FROM follows WHERE follower_id = $1
       )
       GROUP BY posts.id, users.username
       ORDER BY posts.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      page,
      limit,
      posts: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
