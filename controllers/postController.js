const Post = require('../models/Post');
const mongoose = require('mongoose');

const createPost = async (req, res) => {
  try {
    const { title, content, senderId } = req.body;

    if (!title || !content || !senderId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, content, and senderId are required',
      });
    }

    const post = new Post({
      title,
      content,
      senderId,
    });

    const savedPost = await post.save();
    res.status(201).json({
      message: 'Post created successfully',
      post: savedPost,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create post',
      message: error.message,
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const { sender } = req.query;
    let query = {};

    // Filter by senderId if provided
    if (sender) {
      query.senderId = sender;
    }

    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve posts',
      message: error.message,
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid post ID format',
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
      });
    }

    res.status(200).json({
      post,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve post',
      message: error.message,
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, senderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid post ID format',
      });
    }

    if (!title || !content || !senderId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, content, and senderId are required for update',
      });
    }

    const post = await Post.findByIdAndUpdate(
      id,
      { title, content, senderId },
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
      });
    }

    res.status(200).json({
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update post',
      message: error.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid post ID format',
      });
    }

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
      });
    }

    res.status(200).json({
      message: 'Post deleted successfully',
      post,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete post',
      message: error.message,
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};

