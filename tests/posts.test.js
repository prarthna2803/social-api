const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

let token;
let postId;

beforeAll(async () => {
  await pool.query('DELETE FROM likes');
  await pool.query('DELETE FROM follows');
  await pool.query('DELETE FROM posts');
  await pool.query('DELETE FROM users');

  const res = await request(app)
    .post('/auth/register')
    .send({ username: 'postuser', email: 'postuser@test.com', password: 'password123' });
  token = res.body.token;
});

afterAll(async () => {
  await pool.end();
});

describe('Posts', () => {
  test('POST /posts — creates a post', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hello world!' });
    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Hello world!');
    postId = res.body.id;
  });

  test('POST /posts — fails with empty content', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '' });
    expect(res.status).toBe(400);
  });

  test('GET /posts/:id — returns post', async () => {
    const res = await request(app)
      .get(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(postId);
  });

  test('POST /posts/:id/like — likes a post', async () => {
    const res = await request(app)
      .post(`/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post liked');
  });

  test('POST /posts/:id/like — unlikes a post', async () => {
    const res = await request(app)
      .post(`/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post unliked');
  });

  test('DELETE /posts/:id — soft deletes a post', async () => {
    const res = await request(app)
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post deleted');
  });

  test('GET /posts/:id — returns 404 after soft delete', async () => {
    const res = await request(app)
      .get(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
