import request from 'supertest';
import app from '../app';
import User from '../models/User';
import Post from '../models/Post';
import { Types } from 'mongoose';

describe('Post Endpoints', () => {
  let testUser: { _id: Types.ObjectId; username: string };

  beforeEach(async () => {
    const user = await User.create({
      username: 'postauthor',
      email: 'author@example.com',
      password: 'password123',
    });
    testUser = { _id: user._id, username: user.username };
  });

  describe('POST /post', () => {
    it('should create a new post', async () => {
      const res = await request(app)
        .post('/post')
        .send({
          title: 'Test Post',
          content: 'This is test content',
          author: testUser._id.toString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Post created successfully');
      expect(res.body.post.title).toBe('Test Post');
      expect(res.body.post.author.username).toBe('postauthor');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/post')
        .send({
          title: 'Test Post',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
    });

    it('should return 404 for non-existent author', async () => {
      const res = await request(app)
        .post('/post')
        .send({
          title: 'Test Post',
          content: 'Content',
          author: '507f1f77bcf86cd799439011',
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should return 400 for invalid author ID format', async () => {
      const res = await request(app)
        .post('/post')
        .send({
          title: 'Test Post',
          content: 'Content',
          author: 'invalid-id',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid author ID format');
    });
  });

  describe('GET /post', () => {
    beforeEach(async () => {
      await Post.create([
        { title: 'Post 1', content: 'Content 1', author: testUser._id },
        { title: 'Post 2', content: 'Content 2', author: testUser._id },
      ]);
    });

    it('should get all posts', async () => {
      const res = await request(app).get('/post');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.posts).toHaveLength(2);
    });

    it('should filter posts by author', async () => {
      const anotherUser = await User.create({
        username: 'another',
        email: 'another@example.com',
        password: 'password123',
      });

      await Post.create({
        title: 'Another Post',
        content: 'Content',
        author: anotherUser._id,
      });

      const res = await request(app).get(`/post?author=${testUser._id}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('should return 400 for invalid author ID format in query', async () => {
      const res = await request(app).get('/post?author=invalid-id');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid author ID format');
    });
  });

  describe('GET /post/:id', () => {
    it('should get post by ID', async () => {
      const post = await Post.create({
        title: 'Test Post',
        content: 'Test Content',
        author: testUser._id,
      });

      const res = await request(app).get(`/post/${post._id}`);

      expect(res.status).toBe(200);
      expect(res.body.post.title).toBe('Test Post');
      expect(res.body.post.author.username).toBe('postauthor');
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app).get('/post/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Post not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/post/invalid-id');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid post ID format');
    });
  });

  describe('PUT /post/:id', () => {
    it('should update post', async () => {
      const post = await Post.create({
        title: 'Old Title',
        content: 'Old Content',
        author: testUser._id,
      });

      const res = await request(app)
        .put(`/post/${post._id}`)
        .send({
          title: 'New Title',
          content: 'New Content',
        });

      expect(res.status).toBe(200);
      expect(res.body.post.title).toBe('New Title');
      expect(res.body.post.content).toBe('New Content');
    });

    it('should return 400 if required fields are missing', async () => {
      const post = await Post.create({
        title: 'Title',
        content: 'Content',
        author: testUser._id,
      });

      const res = await request(app)
        .put(`/post/${post._id}`)
        .send({
          title: 'New Title',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .put('/post/507f1f77bcf86cd799439011')
        .send({
          title: 'New Title',
          content: 'New Content',
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Post not found');
    });
  });

  describe('DELETE /post/:id', () => {
    it('should delete post', async () => {
      const post = await Post.create({
        title: 'Delete Me',
        content: 'Content',
        author: testUser._id,
      });

      const res = await request(app).delete(`/post/${post._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Post deleted successfully');

      const deletedPost = await Post.findById(post._id);
      expect(deletedPost).toBeNull();
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app).delete('/post/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Post not found');
    });
  });
});
