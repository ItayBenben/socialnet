const Comment = require('../models/Comment');
const Post = require('../models/Post');
const mongoose = require('mongoose');

const User = require('../models/User');

const createComment = async (req, res) => {
  try {
    const { content, postId, author } = req.body;

    if (!content || !postId || !author) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Content, postId, and author (user ID) are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        error: 'Invalid post ID format',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(author)) {
      return res.status(400).json({
        error: 'Invalid author ID format',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Cannot create comment for non-existent post',
      });
    }

    // Verify that the author (user) exists
    const user = await User.findById(author);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Cannot create comment for non-existent user',
      });
    }

    const comment = new Comment({
      content,
      postId,
      author,
    });

    const savedComment = await comment.save();
    const populatedComment = await Comment.findById(savedComment._id).populate('author', 'username email firstName lastName');
    res.status(201).json({
      message: 'Comment created successfully',
      comment: populatedComment,
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
    const { postId, author } = req.query;
    let query = {};

    if (postId) {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({
          error: 'Invalid post ID format',
        });
      }
      query.postId = postId;
    }

    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author)) {
        return res.status(400).json({
          error: 'Invalid author ID format',
        });
      }
      query.author = author;
    }

    const comments = await Comment.find(query)
      .populate('author', 'username email firstName lastName')
      .sort({ createdAt: -1 });
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

    const comment = await Comment.findById(id).populate('author', 'username email firstName lastName');

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
    const { content, author } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid comment ID format',
      });
    }

    if (!content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Content is required for update',
      });
    }

    const updateData = { content };
    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author)) {
        return res.status(400).json({
          error: 'Invalid author ID format',
        });
      }
      // Verify that the author (user) exists
      const user = await User.findById(author);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'Cannot update comment with non-existent user',
        });
      }
      updateData.author = author;
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username email firstName lastName');

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
