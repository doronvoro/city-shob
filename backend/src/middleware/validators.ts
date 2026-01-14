import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { TaskPriority } from '../types';
import { VALIDATION_MESSAGES } from '../constants';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: VALIDATION_MESSAGES.VALIDATION_FAILED,
      errors: errors.array().map(err => ({
        field: 'path' in err ? err.path : 'unknown',
        message: err.msg
      }))
    });
    return;
  }
  next();
};

// Password regex: at least 8 chars, 1 uppercase, 1 lowercase, 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

/**
 * Validation rules for user registration
 */
export const registerValidation: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty().withMessage(VALIDATION_MESSAGES.EMAIL_REQUIRED)
    .isEmail().withMessage(VALIDATION_MESSAGES.INVALID_EMAIL)
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage(VALIDATION_MESSAGES.PASSWORD_REQUIRED)
    .matches(PASSWORD_REGEX).withMessage(VALIDATION_MESSAGES.PASSWORD_REQUIREMENTS)
];

/**
 * Validation rules for user login
 */
export const loginValidation: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty().withMessage(VALIDATION_MESSAGES.EMAIL_REQUIRED)
    .isEmail().withMessage(VALIDATION_MESSAGES.INVALID_EMAIL)
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage(VALIDATION_MESSAGES.PASSWORD_REQUIRED)
];

/**
 * Validation rules for creating a task
 */
export const createTaskValidation: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty().withMessage(VALIDATION_MESSAGES.TITLE_REQUIRED)
    .isLength({ min: 1, max: 200 }).withMessage(VALIDATION_MESSAGES.TITLE_LENGTH),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage(VALIDATION_MESSAGES.DESCRIPTION_LENGTH),
  body('priority')
    .optional()
    .isIn(Object.values(TaskPriority)).withMessage(VALIDATION_MESSAGES.PRIORITY_INVALID),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage(VALIDATION_MESSAGES.DUE_DATE_INVALID),
  body('completed')
    .optional()
    .isBoolean().withMessage(VALIDATION_MESSAGES.COMPLETED_INVALID)
];

/**
 * Validation rules for updating a task
 */
export const updateTaskValidation: ValidationChain[] = [
  param('id')
    .isMongoId().withMessage(VALIDATION_MESSAGES.TASK_ID_INVALID),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage(VALIDATION_MESSAGES.TITLE_LENGTH),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage(VALIDATION_MESSAGES.DESCRIPTION_LENGTH),
  body('priority')
    .optional()
    .isIn(Object.values(TaskPriority)).withMessage(VALIDATION_MESSAGES.PRIORITY_INVALID),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage(VALIDATION_MESSAGES.DUE_DATE_INVALID),
  body('completed')
    .optional()
    .isBoolean().withMessage(VALIDATION_MESSAGES.COMPLETED_INVALID),
  body('clientId')
    .optional()
    .isString().withMessage(VALIDATION_MESSAGES.CLIENT_ID_INVALID)
];

/**
 * Validation rules for task ID parameter
 */
export const taskIdValidation: ValidationChain[] = [
  param('id')
    .isMongoId().withMessage(VALIDATION_MESSAGES.TASK_ID_INVALID)
];

/**
 * Validation rules for pagination query params
 */
export const paginationValidation: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage(VALIDATION_MESSAGES.PAGE_INVALID)
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage(VALIDATION_MESSAGES.LIMIT_INVALID)
    .toInt()
];
