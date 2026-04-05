const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// POST /posts — create a post
router.post('/', auth, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }
    const result = await pool.query(
      `INSERT INTO posts (user_id, content)
       VALUES ($1, $2)
       RETURNING *`,
      [req.user.id, content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /posts/:id — get a single post
router.get('/:id', auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT posts.*, users.username,
        COUNT(likes.post_id) AS like_count
       FROM posts
       JOIN users ON posts.user_id = users.id
       LEFT JOIN likes ON likes.post_id = posts.id
       WHERE posts.id = $1
       GROUP BY posts.id, users.username`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /posts/:id — delete own post only
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM posts WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (result.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }
    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /posts/:id/like — like or unlike a post
router.post('/:id/like', auth, async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Check post exists
    const post = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if already liked
    const existing = await pool.query(
      'SELECT * FROM likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    if (existing.rows.length > 0) {
      // Unlike
      await pool.query(
        'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
        [userId, postId]
      );
      return res.json({ message: 'Post unliked' });
    } else {
      // Like
      await pool.query(
        'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
        [userId, postId]
      );
      return res.json({ message: 'Post liked' });
    }
  } catch (err) {
    next(err);
  }
});

// GET /posts/:id/likes — get all users who liked a post
router.get('/:id/likes', auth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT users.id, users.username
       FROM likes
       JOIN users ON likes.user_id = users.id
       WHERE likes.post_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
