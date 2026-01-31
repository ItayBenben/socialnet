const Post = require('../models/Post');
const mongoose = require('mongoose');

const User = require('../models/User');

const createPost = async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, content, and author (user ID) are required',
      });
    }

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
        message: 'Cannot create post for non-existent user',
      });
    }

    const post = new Post({
      title,
      content,
      author,
    });

    const savedPost = await post.save();
    const populatedPost = await Post.findById(savedPost._id).populate('author', 'username email firstName lastName');
    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost,
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
    const { author } = req.query;
    let query = {};

    // Filter by author if provided
    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author)) {
        return res.status(400).json({
          error: 'Invalid author ID format',
        });
      }
      query.author = author;
    }

    const posts = await Post.find(query)
      .populate('author', 'username email firstName lastName')
      .sort({ createdAt: -1 });
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

    const post = await Post.findById(id).populate('author', 'username email firstName lastName');

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
    const { title, content, author } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid post ID format',
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title and content are required for update',
      });
    }

    const updateData = { title, content };
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
          message: 'Cannot update post with non-existent user',
        });
      }
      updateData.author = author;
    }

    const post = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username email firstName lastName');

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

