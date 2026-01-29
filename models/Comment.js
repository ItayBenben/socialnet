const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post ID is required'],
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

commentSchema.index({ postId: 1 });
commentSchema.index({ senderId: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
