const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

beforeAll(async () => {
  await pool.query('DELETE FROM likes');
  await pool.query('DELETE FROM follows');
  await pool.query('DELETE FROM posts');
  await pool.query('DELETE FROM users');
});

afterAll(async () => {
  await pool.end();
});

describe('Auth', () => {
  test('POST /auth/register — creates a user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'testuser', email: 'test@test.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.user.username).toBe('testuser');
    expect(res.body.token).toBeDefined();
  });

  test('POST /auth/register — fails with duplicate email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'testuser2', email: 'test@test.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  test('POST /auth/register — fails with short password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'testuser3', email: 'test3@test.com', password: '123' });
    expect(res.status).toBe(400);
  });

  test('POST /auth/login — returns token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /auth/login — fails with wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});
