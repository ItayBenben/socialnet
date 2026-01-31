import mongoose, { Schema } from 'mongoose';
import { IComment } from '../types';

const commentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post ID is required'],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

commentSchema.index({ postId: 1 });
commentSchema.index({ author: 1 });

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
