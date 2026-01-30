const express = require('express');
const router = express.Router();
const {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');

// POST /comment - Create a new comment
router.post('/', createComment);

// GET /comment - Get all comments (with optional ?postId= query parameter)
router.get('/', getAllComments);

// GET /comment/:id - Get a specific comment by ID
router.get('/:id', getCommentById);

// PUT /comment/:id - Update a comment
router.put('/:id', updateComment);

// DELETE /comment/:id - Delete a comment
router.delete('/:id', deleteComment);

module.exports = router;
