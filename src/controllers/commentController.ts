import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Comment from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, postId, author } = req.body;

    if (!content || !postId || !author) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Content, postId, and author (user ID) are required',
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({
        error: 'Invalid post ID format',
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(author)) {
      res.status(400).json({
        error: 'Invalid author ID format',
      });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({
        error: 'Post not found',
        message: 'Cannot create comment for non-existent post',
      });
      return;
    }

    const user = await User.findById(author);
    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'Cannot create comment for non-existent user',
      });
      return;
    }

    const comment = new Comment({
      content,
      postId,
      author,
    });

    const savedComment = await comment.save();
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('author', 'username email firstName lastName');

    res.status(201).json({
      message: 'Comment created successfully',
      comment: populatedComment,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to create comment',
      message: err.message,
    });
  }
};

export const getAllComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId, author } = req.query;
    const query: Record<string, unknown> = {};

    if (postId) {
      if (!mongoose.Types.ObjectId.isValid(postId as string)) {
        res.status(400).json({
          error: 'Invalid post ID format',
        });
        return;
      }
      query.postId = postId;
    }

    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author as string)) {
        res.status(400).json({
          error: 'Invalid author ID format',
        });
        return;
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
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to retrieve comments',
      message: err.message,
    });
  }
};

export const getCommentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'Invalid comment ID format',
      });
      return;
    }

    const comment = await Comment.findById(id)
      .populate('author', 'username email firstName lastName');

    if (!comment) {
      res.status(404).json({
        error: 'Comment not found',
      });
      return;
    }

    res.status(200).json({
      comment,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to retrieve comment',
      message: err.message,
    });
  }
};

export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, author } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'Invalid comment ID format',
      });
      return;
    }

    if (!content) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Content is required for update',
      });
      return;
    }

    const updateData: Record<string, unknown> = { content };

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
          message: 'Cannot update comment with non-existent user',
        });
        return;
      }
      updateData.author = author;
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username email firstName lastName');

    if (!comment) {
      res.status(404).json({
        error: 'Comment not found',
      });
      return;
    }

    res.status(200).json({
      message: 'Comment updated successfully',
      comment,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to update comment',
      message: err.message,
    });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'Invalid comment ID format',
      });
      return;
    }

    const comment = await Comment.findByIdAndDelete(id)
      .populate('author', 'username email firstName lastName');

    if (!comment) {
      res.status(404).json({
        error: 'Comment not found',
      });
      return;
    }

    res.status(200).json({
      message: 'Comment deleted successfully',
      comment,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to delete comment',
      message: err.message,
    });
  }
};
