import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository';
import { AuthRequest, JwtPayload } from '../types';

/**
 * Get JWT secret - throws if not configured
 */
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return secret;
};

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer <token>

    if (!token) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    const user = await UserRepository.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    const err = error as Error;

    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, message: 'Token has expired' });
      return;
    }

    if (err.name === 'JsonWebTokenError') {
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    res.status(401).json({ success: false, message: 'Authentication failed', error: err.message });
  }
};

