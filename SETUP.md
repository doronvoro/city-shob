# Quick Setup Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v16+) installed: `node --version`
- ✅ MongoDB installed and running: `mongod --version`
- ✅ npm or yarn installed: `npm --version`

## Installing MongoDB (if not installed)

### Option 1: Install MongoDB using Homebrew (Recommended for macOS)

1. **Install Homebrew** (if not already installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. **Install MongoDB Community Edition**:
```bash
brew tap mongodb/brew
brew install mongodb-community
```

3. **Start MongoDB**:
```bash
brew services start mongodb-community
```

4. **Verify installation**:
```bash
mongod --version
```

### Option 2: Use MongoDB Atlas (Cloud - No Local Installation)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a free cluster
4. Get your connection string
5. Update your `.env` file with the Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cityshob-todo?retryWrites=true&w=majority
```

### Option 3: Use Docker

```bash
# Pull MongoDB image
docker pull mongo

# Run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo
```

## Step-by-Step Setup

### 1. Install All Dependencies

This project uses **npm workspaces** to manage both frontend and backend dependencies. Install everything from the root directory:

```bash
# From the project root directory
npm install
```

This will install dependencies for both `backend` and `frontend` workspaces automatically.

### 2. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# Or run directly (if installed manually)
mongod

# If using Docker
docker start mongodb
```

**Note**: If you're using MongoDB Atlas (cloud), you don't need to start a local MongoDB server.

### 3. Backend Configuration

```bash
# Navigate to backend directory
cd backend

# Create .env file from example
cp .env.example .env

# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy the output and paste it as JWT_SECRET in .env file

# Edit .env with your MongoDB URI and the generated JWT secret
# ⚠️ IMPORTANT: Replace 'your-secret-key-change-in-production' with the generated secret
```

### 4. Start the Application

You have several options to run the application:

#### Option A: Run Both Frontend and Backend Together (Recommended)

From the project root:

```bash
# Development mode (with auto-reload for both)
npm run dev

# Production mode (builds and starts both)
npm run start:all
```

#### Option B: Run Separately

**Backend** (from project root):
```bash
# Development mode with auto-reload
npm run dev:backend

# Or production mode
npm run start:backend
```

**Frontend** (from project root, in a new terminal):
```bash
npm run start:frontend
```

#### Option C: Run from Individual Workspaces

If you prefer to run from individual workspace directories:

**Backend:**
```bash
cd backend
npm run dev  # Development mode
# or
npm start    # Production mode (requires: npm run build first)
```

**Frontend:**
```bash
cd frontend
npm start
```

The backend should be running on `http://localhost:3000`  
The frontend should be running on `http://localhost:4200`

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:4200
```

### 6. Create Your First Account

1. Click on "Register" if you don't have an account
2. Fill in username, email, and password
3. Click "Register"
4. You'll be automatically logged in

### 7. Test Real-Time Features

1. Open the application in multiple browser windows/tabs
2. Create a task in one window
3. See it appear instantly in other windows
4. Try editing a task - notice the lock indicator
5. Try editing the same task from another window - it should be blocked

## Troubleshooting

### MongoDB Connection Error

If you see "MongoDB connection error":
- Ensure MongoDB is running: `mongod`
- Check your MongoDB URI in `.env` file
- Default URI: `mongodb://localhost:27017/cityshob-todo`

### Port Already in Use

If port 3000 or 4200 is already in use:
- Backend: Change `PORT` in `.env` file
- Frontend: Use `ng serve --port 4201` or update `angular.json`

### CORS Errors

If you see CORS errors:
- Ensure backend `FRONTEND_URL` in `.env` matches your frontend URL
- Default: `http://localhost:4200`

### Socket.IO Connection Issues

- Ensure backend is running before starting frontend
- Check that both are using the same protocol (http/https)
- Verify the API URL in `frontend/src/environments/environment.ts`

## Development Tips

- **Use npm workspaces**: Run commands from the root using workspace scripts (e.g., `npm run dev:backend`)
- **Quick start**: Use `npm run dev` from root to start both frontend and backend in development mode
- **Auto-reload**: Backend uses nodemon for auto-reload, Angular dev server has hot-reload enabled by default
- **Check logs**: Monitor browser console and terminal for error messages
- **Database tools**: MongoDB Compass is helpful for viewing database contents

## Available Scripts (from root directory)

- `npm install` - Install all dependencies for both workspaces
- `npm run dev` - Start both frontend and backend in development mode
- `npm run start:all` - Start both frontend and backend in production mode
- `npm run dev:backend` - Start only backend in development mode
- `npm run start:backend` - Start only backend in production mode
- `npm run start:frontend` - Start only frontend
- `npm run build:frontend` - Build frontend for production

