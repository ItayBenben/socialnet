import request from 'supertest';
import app from '../app';
import User from '../models/User';

describe('Auth Endpoints', () => {
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
    });

    it('should return 409 if username already exists', async () => {
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'existinguser',
          email: 'new@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Username already taken');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/auth/register')
        .send({
          username: 'loginuser',
          email: 'login@example.com',
          password: 'password123',
        });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should return 401 with invalid password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication failed');
    });

    it('should return 401 with non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication failed');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'refreshuser',
          email: 'refresh@example.com',
          password: 'password123',
        });
      refreshToken = res.body.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should return 400 if refresh token is missing', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing refresh token');
    });

    it('should return 403 for invalid refresh token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Invalid refresh token');
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'logoutuser',
          email: 'logout@example.com',
          password: 'password123',
        });
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logout successful');
    });

    it('should return 401 without access token', async () => {
      const res = await request(app)
        .post('/auth/logout')
        .send({ refreshToken });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Access token required');
    });
  });
});
