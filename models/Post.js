const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  senderId: {
    type: String,
    required: [true, 'Sender ID is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
});

postSchema.index({ senderId: 1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

