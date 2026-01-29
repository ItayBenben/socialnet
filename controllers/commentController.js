const Comment = require('../models/Comment');
const Post = require('../models/Post');
const mongoose = require('mongoose');

const createComment = async (req, res) => {
  try {
    const { content, postId, senderId } = req.body;

    if (!content || !postId || !senderId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Content, postId, and senderId are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        error: 'Invalid post ID format',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Cannot create comment for non-existent post',
      });
    }

    const comment = new Comment({
      content,
      postId,
      senderId,
    });

    const savedComment = await comment.save();
    res.status(201).json({
      message: 'Comment created successfully',
      comment: savedComment,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create comment',
      message: error.message,
    });
  }
};

const getAllComments = async (req, res) => {
  try {
    const { postId } = req.query;
    let query = {};

    if (postId) {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({
          error: 'Invalid post ID format',
        });
      }
      query.postId = postId;
    }

    const comments = await Comment.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      count: comments.length,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve comments',
      message: error.message,
    });
  }
};

const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid comment ID format',
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
      });
    }

    res.status(200).json({
      comment,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve comment',
      message: error.message,
    });
  }
};

const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, senderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid comment ID format',
      });
    }

    if (!content || !senderId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Content and senderId are required for update',
      });
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      { content, senderId },
      { new: true, runValidators: true }
    );

    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
      });
    }

    res.status(200).json({
      message: 'Comment updated successfully',
      comment,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update comment',
      message: error.message,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid comment ID format',
      });
    }

    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
      });
    }

    res.status(200).json({
      message: 'Comment deleted successfully',
      comment,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete comment',
      message: error.message,
    });
  }
};

module.exports = {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
};
