const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} = require('../controllers/postController');

// POST /post - Create a new post
router.post('/', createPost);

// GET /post - Get all posts (with optional ?sender= query parameter)
router.get('/', getAllPosts);

// GET /post/:id - Get a specific post by ID
router.get('/:id', getPostById);

// PUT /post/:id - Update a post (full update)
router.put('/:id', updatePost);

// DELETE /post/:id - Delete a post
router.delete('/:id', deletePost);

module.exports = router;

