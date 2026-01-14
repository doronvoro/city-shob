import express, { Response } from 'express';
import TaskRepository from '../repositories/TaskRepository';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
  paginationValidation,
  handleValidationErrors
} from '../middleware/validators';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';

const router = express.Router();

/**
 * GET /api/tasks
 * Get all tasks with pagination
 */
router.get(
  '/',
  paginationValidation,
  handleValidationErrors,
  asyncHandler(async (req: express.Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await TaskRepository.findAll({ page, limit });
    res.json(result);
  })
);

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 */
router.get(
  '/:id',
  taskIdValidation,
  handleValidationErrors,
  asyncHandler(async (req: express.Request, res: Response): Promise<void> => {
    const task = await TaskRepository.findById(req.params.id);
    if (!task) {
      throw new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND);
    }
    res.json(task);
  })
);

/**
 * POST /api/tasks
 * Create a new task
 */
router.post(
  '/',
  authenticate,
  createTaskValidation,
  handleValidationErrors,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const taskData = {
      ...req.body,
      createdBy: req.user!._id.toString()
    };
    const task = await TaskRepository.create(taskData);
    res.status(201).json(task);
  })
);

/**
 * PUT /api/tasks/:id
 * Update a task with atomic lock check
 */
router.put(
  '/:id',
  authenticate,
  updateTaskValidation,
  handleValidationErrors,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { clientId, ...updateData } = req.body;

    // Use atomic update with lock check
    const updatedTask = await TaskRepository.update(id, updateData, clientId);

    if (!updatedTask) {
      // Check if it was a lock conflict or not found
      const lockStatus = await TaskRepository.checkLockStatus(id, clientId || '');
      if (lockStatus.locked) {
        throw new ApiError(409, ERROR_MESSAGES.TASK_EDITED_BY_OTHER);
      }
      throw new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND);
    }

    res.json(updatedTask);
  })
);

/**
 * DELETE /api/tasks/:id
 * Delete a task with atomic lock check
 */
router.delete(
  '/:id',
  authenticate,
  taskIdValidation,
  handleValidationErrors,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const clientId = req.query.clientId as string;

    // Use atomic delete with lock check
    const deletedTask = await TaskRepository.delete(id, clientId);

    if (!deletedTask) {
      const lockStatus = await TaskRepository.checkLockStatus(id, clientId || '');
      if (lockStatus.locked) {
        throw new ApiError(409, ERROR_MESSAGES.TASK_DELETE_LOCKED);
      }
      throw new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND);
    }

    res.json({ message: SUCCESS_MESSAGES.TASK_DELETED, task: deletedTask });
  })
);

export default router;

