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

### 1. Start MongoDB

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

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy the output and paste it as JWT_SECRET in .env file

# Edit .env with your MongoDB URI and the generated JWT secret
# ⚠️ IMPORTANT: Replace 'your-secret-key-change-in-production' with the generated secret

# Build TypeScript code (for production)
npm run build

# Start the server
npm start

# Or for development with auto-reload (uses ts-node)
npm run dev
```

The backend should now be running on `http://localhost:3000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend should now be running on `http://localhost:4200`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:4200
```

### 5. Create Your First Account

1. Click on "Register" if you don't have an account
2. Fill in username, email, and password
3. Click "Register"
4. You'll be automatically logged in

### 6. Test Real-Time Features

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

- Use `npm run dev` in backend for auto-reload on code changes
- Angular dev server has hot-reload enabled by default
- Check browser console and terminal for error messages
- MongoDB Compass is helpful for viewing database contents

