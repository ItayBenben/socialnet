const User = require('../models/User');
const mongoose = require('mongoose');

const createUser = async (req, res) => {
  try {
    const { username, email, firstName, lastName, bio } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Username and email are required',
      });
    }

    // Check if user with username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: existingUser.username === username
          ? 'Username already taken'
          : 'Email already registered',
      });
    }

    const user = new User({
      username,
      email,
      firstName,
      lastName,
      bio,
    });

    const savedUser = await user.save();
    res.status(201).json({
      message: 'User created successfully',
      user: savedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate entry',
        message: 'Username or email already exists',
      });
    }
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { username, email } = req.query;
    let query = {};

    if (username) {
      query.username = { $regex: username, $options: 'i' };
    }

    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve users',
      message: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid user ID format',
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve user',
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, bio } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid user ID format',
      });
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    updateData.updatedAt = Date.now();

    // Check for duplicate username or email if being updated
    if (username || email) {
      const existingUser = await User.findOne({
        _id: { $ne: id },
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : []),
        ],
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'Duplicate entry',
          message: existingUser.username === username
            ? 'Username already taken'
            : 'Email already registered',
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate entry',
        message: 'Username or email already exists',
      });
    }
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid user ID format',
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message,
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};

