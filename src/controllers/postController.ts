import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../models/Post';
import User from '../models/User';

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, content, and author (user ID) are required',
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(author)) {
      res.status(400).json({
        error: 'Invalid author ID format',
      });
      return;
    }

    const user = await User.findById(author);
    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'Cannot create post for non-existent user',
      });
      return;
    }

    const post = new Post({
      title,
      content,
      author,
    });

    const savedPost = await post.save();
    const populatedPost = await Post.findById(savedPost._id)
      .populate('author', 'username email firstName lastName');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to create post',
      message: err.message,
    });
  }
};

export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { author } = req.query;
    const query: Record<string, unknown> = {};

    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author as string)) {
        res.status(400).json({
          error: 'Invalid author ID format',
        });
        return;
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
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to retrieve posts',
      message: err.message,
    });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'Invalid post ID format',
      });
      return;
    }

    const post = await Post.findById(id)
      .populate('author', 'username email firstName lastName');

    if (!post) {
      res.status(404).json({
        error: 'Post not found',
      });
      return;
    }

    res.status(200).json({
      post,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to retrieve post',
      message: err.message,
    });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, author } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'Invalid post ID format',
      });
      return;
    }

    if (!title || !content) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Title and content are required for update',
      });
      return;
    }

    const updateData: Record<string, unknown> = { title, content };

    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author)) {
        res.status(400).json({
          error: 'Invalid author ID format',
        });
        return;
      }

      const user = await User.findById(author);
      if (!user) {
        res.status(404).json({
          error: 'User not found',
          message: 'Cannot update post with non-existent user',
        });
        return;
      }
      updateData.author = author;
    }

    const post = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username email firstName lastName');

    if (!post) {
      res.status(404).json({
        error: 'Post not found',
      });
      return;
    }

    res.status(200).json({
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to update post',
      message: err.message,
    });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'Invalid post ID format',
      });
      return;
    }

    const post = await Post.findByIdAndDelete(id)
      .populate('author', 'username email firstName lastName');

    if (!post) {
      res.status(404).json({
        error: 'Post not found',
      });
      return;
    }

    res.status(200).json({
      message: 'Post deleted successfully',
      post,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to delete post',
      message: err.message,
    });
  }
};
