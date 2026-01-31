const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

// POST /user - Create a new user
router.post('/', createUser);

// GET /user - Get all users (with optional ?username= and ?email= query parameters)
router.get('/', getAllUsers);

// GET /user/:id - Get a specific user by ID
router.get('/:id', getUserById);

// PUT /user/:id - Update a user
router.put('/:id', updateUser);

// DELETE /user/:id - Delete a user
router.delete('/:id', deleteUser);

module.exports = router;

