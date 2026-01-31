import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest, TokenPayload, Tokens } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const generateTokens = (userId: string, username: string): Tokens => {
  const accessToken = jwt.sign(
    { userId, username } as TokenPayload,
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId, username } as TokenPayload,
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName, bio } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Username, email, and password are required',
      });
      return;
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      res.status(409).json({
        error: 'User already exists',
        message: existingUser.username === username
          ? 'Username already taken'
          : 'Email already registered',
      });
      return;
    }

    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      bio,
    });

    const tokens = generateTokens(user._id.toString(), user.username);
    user.refreshTokens.push(tokens.refreshToken);

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
      },
      ...tokens,
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
      error: 'Failed to register user',
      message: err.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required',
      });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
      return;
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
      return;
    }

    const tokens = generateTokens(user._id.toString(), user.username);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
      },
      ...tokens,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to login',
      message: err.message,
    });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      res.status(400).json({
        error: 'Missing refresh token',
        message: 'Refresh token is required for logout',
      });
      return;
    }

    const user = await User.findById(req.user?.userId);

    if (user) {
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
      );
      await user.save();
    }

    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to logout',
      message: err.message,
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: 'Missing refresh token',
        message: 'Refresh token is required',
      });
      return;
    }

    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as TokenPayload;
    } catch (error) {
      res.status(403).json({
        error: 'Invalid refresh token',
        message: 'The refresh token is invalid or expired',
      });
      return;
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      res.status(403).json({
        error: 'Invalid refresh token',
        message: 'The refresh token is not valid for this user',
      });
      return;
    }

    // Remove old refresh token and generate new tokens
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );

    const tokens = generateTokens(user._id.toString(), user.username);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.status(200).json({
      message: 'Token refreshed successfully',
      ...tokens,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to refresh token',
      message: err.message,
    });
  }
};
