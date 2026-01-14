import express, { Response } from 'express';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository';
import { UserData } from '../types';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerValidation,
  loginValidation,
  handleValidationErrors
} from '../middleware/validators';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';

const router = express.Router();

/**
 * Get JWT secret with validation
 */
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, ERROR_MESSAGES.JWT_SECRET_MISSING);
  }
  return secret;
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  authLimiter,
  registerValidation,
  handleValidationErrors,
  asyncHandler(async (req: express.Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Check if user already exists by email
    const existingEmail = await UserRepository.findByEmail(email);
    if (existingEmail) {
      throw new ApiError(400, ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED);
    }

    // Create user
    const userData: UserData = { email, password };
    const user = await UserRepository.create(userData);

    // Generate JWT token
    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_CREATED,
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  authLimiter,
  loginValidation,
  handleValidationErrors,
  asyncHandler(async (req: express.Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Find user
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate JWT token
    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  })
);

export default router;

