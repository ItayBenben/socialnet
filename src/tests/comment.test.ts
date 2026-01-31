import request from 'supertest';
import app from '../app';
import User from '../models/User';
import Post from '../models/Post';
import Comment from '../models/Comment';
import { Types } from 'mongoose';

describe('Comment Endpoints', () => {
  let testUser: { _id: Types.ObjectId; username: string };
  let testPost: { _id: Types.ObjectId; title: string };

  beforeEach(async () => {
    const user = await User.create({
      username: 'commentauthor',
      email: 'comment@example.com',
      password: 'password123',
    });
    testUser = { _id: user._id, username: user.username };

    const post = await Post.create({
      title: 'Test Post',
      content: 'Test Content',
      author: user._id,
    });
    testPost = { _id: post._id, title: post.title };
  });

  describe('POST /comment', () => {
    it('should create a new comment', async () => {
      const res = await request(app)
        .post('/comment')
        .send({
          content: 'This is a test comment',
          postId: testPost._id.toString(),
          author: testUser._id.toString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Comment created successfully');
      expect(res.body.comment.content).toBe('This is a test comment');
      expect(res.body.comment.author.username).toBe('commentauthor');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/comment')
        .send({
          content: 'Comment without post',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .post('/comment')
        .send({
          content: 'Comment',
          postId: '507f1f77bcf86cd799439011',
          author: testUser._id.toString(),
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Post not found');
    });

    it('should return 404 for non-existent author', async () => {
      const res = await request(app)
        .post('/comment')
        .send({
          content: 'Comment',
          postId: testPost._id.toString(),
          author: '507f1f77bcf86cd799439011',
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should return 400 for invalid post ID format', async () => {
      const res = await request(app)
        .post('/comment')
        .send({
          content: 'Comment',
          postId: 'invalid-id',
          author: testUser._id.toString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid post ID format');
    });
  });

  describe('GET /comment', () => {
    beforeEach(async () => {
      await Comment.create([
        { content: 'Comment 1', postId: testPost._id, author: testUser._id },
        { content: 'Comment 2', postId: testPost._id, author: testUser._id },
      ]);
    });

    it('should get all comments', async () => {
      const res = await request(app).get('/comment');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.comments).toHaveLength(2);
    });

    it('should filter comments by postId', async () => {
      const anotherPost = await Post.create({
        title: 'Another Post',
        content: 'Content',
        author: testUser._id,
      });

      await Comment.create({
        content: 'Comment on another post',
        postId: anotherPost._id,
        author: testUser._id,
      });

      const res = await request(app).get(`/comment?postId=${testPost._id}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('should filter comments by author', async () => {
      const anotherUser = await User.create({
        username: 'another',
        email: 'another@example.com',
        password: 'password123',
      });

      await Comment.create({
        content: 'Comment by another user',
        postId: testPost._id,
        author: anotherUser._id,
      });

      const res = await request(app).get(`/comment?author=${testUser._id}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('should return 400 for invalid postId format in query', async () => {
      const res = await request(app).get('/comment?postId=invalid-id');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid post ID format');
    });
  });

  describe('GET /comment/:id', () => {
    it('should get comment by ID', async () => {
      const comment = await Comment.create({
        content: 'Test Comment',
        postId: testPost._id,
        author: testUser._id,
      });

      const res = await request(app).get(`/comment/${comment._id}`);

      expect(res.status).toBe(200);
      expect(res.body.comment.content).toBe('Test Comment');
      expect(res.body.comment.author.username).toBe('commentauthor');
    });

    it('should return 404 for non-existent comment', async () => {
      const res = await request(app).get('/comment/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Comment not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/comment/invalid-id');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid comment ID format');
    });
  });

  describe('PUT /comment/:id', () => {
    it('should update comment', async () => {
      const comment = await Comment.create({
        content: 'Old Content',
        postId: testPost._id,
        author: testUser._id,
      });

      const res = await request(app)
        .put(`/comment/${comment._id}`)
        .send({
          content: 'Updated Content',
        });

      expect(res.status).toBe(200);
      expect(res.body.comment.content).toBe('Updated Content');
    });

    it('should return 400 if content is missing', async () => {
      const comment = await Comment.create({
        content: 'Content',
        postId: testPost._id,
        author: testUser._id,
      });

      const res = await request(app)
        .put(`/comment/${comment._id}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required fields');
    });

    it('should return 404 for non-existent comment', async () => {
      const res = await request(app)
        .put('/comment/507f1f77bcf86cd799439011')
        .send({
          content: 'Updated Content',
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Comment not found');
    });
  });

  describe('DELETE /comment/:id', () => {
    it('should delete comment', async () => {
      const comment = await Comment.create({
        content: 'Delete Me',
        postId: testPost._id,
        author: testUser._id,
      });

      const res = await request(app).delete(`/comment/${comment._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Comment deleted successfully');

      const deletedComment = await Comment.findById(comment._id);
      expect(deletedComment).toBeNull();
    });

    it('should return 404 for non-existent comment', async () => {
      const res = await request(app).delete('/comment/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Comment not found');
    });
  });
});
