import { Document, Types } from 'mongoose';
import { Request } from 'express';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IPost extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string;
  author: Types.ObjectId | IUser;
  createdAt: Date;
}

export interface IComment extends Document {
  _id: Types.ObjectId;
  content: string;
  postId: Types.ObjectId | IPost;
  author: Types.ObjectId | IUser;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

export interface TokenPayload {
  userId: string;
  username: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
