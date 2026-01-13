import mongoose, { Schema, Model, Document } from 'mongoose';
import { TaskPriority, TaskPriorityType } from '../types';

export type ITask = Document & {
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriorityType;
  dueDate?: Date | null;
  editedBy?: string | null;
  editedAt?: Date | null;
  createdBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  completed: {
    type: Boolean,
    default: false,
    index: true // Index for filtering completed/incomplete tasks
  },
  priority: {
    type: String,
    enum: {
      values: Object.values(TaskPriority),
      message: '{VALUE} is not a valid priority'
    },
    default: TaskPriority.MEDIUM,
    index: true // Index for filtering by priority
  },
  dueDate: {
    type: Date,
    default: null,
    index: true // Index for sorting/filtering by due date
  },
  editedBy: {
    type: String,
    default: null,
    index: true // Index for finding locked tasks
  },
  editedAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true // Index for filtering tasks by user
  }
}, {
  timestamps: true
});

// Compound indexes for common query patterns
taskSchema.index({ createdBy: 1, createdAt: -1 }); // User's tasks sorted by date
taskSchema.index({ completed: 1, priority: 1 }); // Filter by status and priority
taskSchema.index({ editedBy: 1, editedAt: 1 }); // Lock management

const Task: Model<ITask> = mongoose.model<ITask>('Task', taskSchema);

export default Task;

