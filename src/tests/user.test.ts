import request from 'supertest';
import app from '../app';
import User from '../models/User';

describe('User Endpoints', () => {
  describe('GET /user', () => {
    beforeEach(async () => {
      await User.create([
        { username: 'user1', email: 'user1@example.com', password: 'password123' },
        { username: 'user2', email: 'user2@example.com', password: 'password123' },
        { username: 'admin', email: 'admin@example.com', password: 'password123' },
      ]);
    });

    it('should get all users', async () => {
      const res = await request(app).get('/user');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(3);
      expect(res.body.users).toHaveLength(3);
    });

    it('should filter users by username', async () => {
      const res = await request(app).get('/user?username=user1');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.users[0].username).toBe('user1');
    });

    it('should filter users by email', async () => {
      const res = await request(app).get('/user?email=admin');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.users[0].email).toBe('admin@example.com');
    });

    it('should not return password in response', async () => {
      const res = await request(app).get('/user');

      expect(res.status).toBe(200);
      res.body.users.forEach((user: { password?: string }) => {
        expect(user.password).toBeUndefined();
      });
    });
  });

  describe('GET /user/:id', () => {
    it('should get user by ID', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      const res = await request(app).get(`/user/${user._id}`);

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).get('/user/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/user/invalid-id');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid user ID format');
    });
  });

  describe('PUT /user/:id', () => {
    it('should update user', async () => {
      const user = await User.create({
        username: 'oldusername',
        email: 'old@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .put(`/user/${user._id}`)
        .send({
          username: 'newusername',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe('newusername');
      expect(res.body.user.firstName).toBe('John');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .put('/user/507f1f77bcf86cd799439011')
        .send({ username: 'newname' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should return 409 for duplicate username', async () => {
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      });

      const user = await User.create({
        username: 'originaluser',
        email: 'original@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .put(`/user/${user._id}`)
        .send({ username: 'existinguser' });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Username already taken');
    });
  });

  describe('DELETE /user/:id', () => {
    it('should delete user', async () => {
      const user = await User.create({
        username: 'deleteuser',
        email: 'delete@example.com',
        password: 'password123',
      });

      const res = await request(app).delete(`/user/${user._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User deleted successfully');

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).delete('/user/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });
  });
});
