import mongoose, { Schema } from 'mongoose';
import { IPost } from '../types';

const postSchema = new Schema<IPost>({
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

postSchema.index({ author: 1 });

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
