import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email } = req.query;
    const query: Record<string, unknown> = {};

    if (username) {
      query.username = { $regex: username as string, $options: 'i' };
    }

    if (email) {
      query.email = { $regex: email as string, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to retrieve users',
      message: err.message,
    });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'Invalid user ID format',
      });
      return;
    }

    const user = await User.findById(id).select('-password -refreshTokens');

    if (!user) {
      res.status(404).json({
        error: 'User not found',
      });
      return;
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to retrieve user',
      message: err.message,
    });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, bio } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'Invalid user ID format',
      });
      return;
    }

    const updateData: Record<string, unknown> = { updatedAt: Date.now() };
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;

    if (username || email) {
      const orConditions = [];
      if (username) orConditions.push({ username });
      if (email) orConditions.push({ email });

      const existingUser = await User.findOne({
        _id: { $ne: id },
        $or: orConditions,
      });

      if (existingUser) {
        res.status(409).json({
          error: 'Duplicate entry',
          message: existingUser.username === username
            ? 'Username already taken'
            : 'Email already registered',
        });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      res.status(404).json({
        error: 'User not found',
      });
      return;
    }

    res.status(200).json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    const err = error as Error & { code?: number };
    if (err.code === 11000) {
      res.status(409).json({
        error: 'Duplicate entry',
        message: 'Username or email already exists',
      });
      return;
    }
    res.status(500).json({
      error: 'Failed to update user',
      message: err.message,
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: 'Invalid user ID format',
      });
      return;
    }

    const user = await User.findByIdAndDelete(id).select('-password -refreshTokens');

    if (!user) {
      res.status(404).json({
        error: 'User not found',
      });
      return;
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to delete user',
      message: err.message,
    });
  }
};
