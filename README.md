# CityShob To-Do Application

A full-stack real-time To-Do application built with Angular, Node.js, Express, MongoDB, and Socket.IO. This application demonstrates real-time data synchronization across multiple clients, with features like task management, edit locking, authentication, and task prioritization.

## Features

- ✅ **Real-Time Updates**: Changes made by one client are instantly reflected on all connected clients
- ✅ **Edit Locking**: Only one client can edit a task at a time
- ✅ **CRUD Operations**: Create, Read, Update, and Delete tasks
- ✅ **Task Completion**: Mark tasks as completed or incomplete
- ✅ **Task Prioritization**: Assign low, medium, or high priority to tasks
- ✅ **Due Dates**: Set due dates for tasks
- ✅ **JWT Authentication**: Secure user authentication with JWT tokens
- ✅ **Modern UI**: Clean and professional interface using Angular Material

## Tech Stack

### Frontend
- **Angular 16**: Modern frontend framework
- **Angular Material**: UI component library
- **RxJS**: Reactive programming for real-time data management
- **Socket.IO Client**: Real-time WebSocket communication

### Backend
- **Node.js**: JavaScript runtime
- **TypeScript**: Type-safe JavaScript
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Socket.IO**: Real-time bidirectional communication
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing

## Project Structure

This project uses npm workspaces for unified dependency management. All dependencies are installed in the root `node_modules/` directory.

```
CityShob/
├── backend/                   # Backend workspace
│   ├── src/
│   │   ├── models/           # MongoDB models (Task, User)
│   │   ├── repositories/      # Repository pattern for database operations
│   │   ├── routes/            # Express routes (tasks, auth)
│   │   ├── services/          # Business logic (Socket service)
│   │   ├── middleware/        # Express middleware (authentication)
│   │   ├── types/             # TypeScript type definitions
│   │   └── server.ts          # Entry point
│   ├── dist/                  # Compiled JavaScript output
│   ├── tsconfig.json          # TypeScript configuration
│   └── package.json
├── frontend/                   # Frontend workspace
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Angular components
│   │   │   ├── services/      # Angular services (Task, Auth)
│   │   │   ├── models/        # TypeScript interfaces
│   │   │   ├── interceptors/  # HTTP interceptors
│   │   │   └── app.module.ts
│   │   ├── environments/      # Environment configuration
│   │   └── styles.scss
│   └── package.json
├── node_modules/              # Shared dependencies (hoisted to root)
├── package.json               # Root package.json with workspace configuration
└── README.md
```

## Design Patterns Used

### Frontend Patterns

1. **Service Pattern**: 
   - `TaskService`: Manages all task-related operations and real-time updates
   - `AuthService`: Handles authentication logic and user state management
   - Services encapsulate business logic and provide a clean API for components

2. **Reactive Programming (RxJS)**:
   - `BehaviorSubject` for managing task state
   - Observables for real-time data streams
   - Reactive forms for user input validation

3. **Component Pattern**:
   - Separation of concerns with dedicated components for different UI sections
   - Smart/Dumb component pattern (TaskList as smart, TaskItem as presentation)

### Backend Patterns

1. **Repository Pattern**:
   - `TaskRepository`: Encapsulates all database operations for tasks
   - `UserRepository`: Handles user-related database operations
   - Provides abstraction layer between business logic and data access
   - Singleton pattern implementation for repository instances

2. **Service Pattern**:
   - `SocketService`: Manages WebSocket connections and real-time event handling
   - Singleton pattern for single instance management

3. **Middleware Pattern**:
   - `authenticate` middleware: JWT token verification
   - Request/Response pipeline processing

4. **Factory Pattern** (implicit):
   - Mongoose models act as factories for creating document instances

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm (v7 or higher for workspace support)

### Quick Start

This project uses npm workspaces for unified dependency management. You can install all dependencies and run both frontend and backend with simple commands from the root directory.

1. Install all dependencies (from root directory):
```bash
npm install
```

2. Create a `.env` file in the `backend/` directory (you can copy from `.env.example`):
```bash
cp backend/.env.example backend/.env
```

Or create it manually with:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cityshob-todo
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:4200
```

3. Make sure MongoDB is running on your system.

4. Run both frontend and backend together:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3000` (with auto-reload)
- Frontend application on `http://localhost:4200`

5. Open your browser and navigate to `http://localhost:4200`

6. Register a new account or login with existing credentials

### Individual Workspace Commands

You can also run frontend and backend separately:

**From root directory:**
```bash
# Run backend in development mode
npm run dev:backend

# Run backend in production mode
npm start:backend

# Run frontend
npm start:frontend

# Build frontend
npm run build:frontend
```

**Or from individual workspace directories:**
```bash
# Backend
cd backend
npm run dev    # Development mode with auto-reload
npm start      # Production mode
npm run build  # Build TypeScript

# Frontend
cd frontend
npm start      # Development server
npm run build  # Production build
```

### Running the Application (Alternative Method)

1. Start MongoDB (if not running as a service):
```bash
mongod
```

2. Start both servers together (recommended):
```bash
npm run dev
```

Or start them separately:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm start:frontend
```

3. Open your browser and navigate to `http://localhost:4200`

4. Register a new account or login with existing credentials

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Tasks (Requires Authentication)

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a single task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## WebSocket Events

### Client to Server

- `task:create` - Create a new task
- `task:update` - Update a task
- `task:delete` - Delete a task
- `task:lock` - Lock a task for editing
- `task:unlock` - Unlock a task

### Server to Client

- `task:created` - Task created event
- `task:updated` - Task updated event
- `task:deleted` - Task deleted event
- `task:locked` - Task locked event
- `task:unlocked` - Task unlocked event
- `error` - Error occurred
- `task:lock-failed` - Failed to lock task

## Real-Time Functionality

The application uses Socket.IO for real-time bidirectional communication:

1. **Task Creation**: When a user creates a task, all connected clients receive the new task instantly
2. **Task Updates**: Updates to tasks (title, description, completion status, etc.) are broadcast to all clients
3. **Task Deletion**: Deleted tasks are removed from all clients' views immediately
4. **Edit Locking**: When a user starts editing a task, other users see a lock indicator and cannot edit or delete that task

## Edit Locking Mechanism

The edit locking system ensures data consistency:

1. When a user clicks "Edit" on a task, the client sends a `task:lock` event
2. The server checks if the task is already locked by another client
3. If available, the task is locked and all clients are notified
4. Other clients see a "Being edited" indicator and cannot edit/delete the task
5. When editing is complete or cancelled, the lock is released via `task:unlock`

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **CORS Configuration**: Configured to allow requests from the frontend
- **Input Validation**: Server-side validation for all inputs

## Code Quality

- **Clean Code Principles**: 
  - Meaningful variable and function names
  - Single Responsibility Principle
  - DRY (Don't Repeat Yourself)
  - Proper error handling

- **Separation of Concerns**:
  - Frontend: Components, Services, Models
  - Backend: Routes, Controllers, Repositories, Services
  - Clear boundaries between layers

- **Documentation**:
  - JSDoc comments for functions and classes
  - README with setup instructions
  - Inline comments for complex logic

## Testing the Real-Time Features

1. Open the application in multiple browser windows/tabs
2. Login with different accounts (or the same account)
3. Create, edit, or delete a task in one window
4. Observe the changes appear instantly in all other windows
5. Try editing the same task from two different windows - only one should succeed

## Future Enhancements

- [ ] Unit and integration tests
- [ ] Task categories/tags
- [ ] Task search and filtering
- [ ] Task sharing between users
- [ ] Push notifications
- [ ] Task attachments
- [ ] Activity log/history

## License

This project is created for the CityShob interview process.

## Support

For questions or issues, please contact the development team.

