# TODO List Application

A full-stack TODO list application built with React Native Expo (frontend) and Express.js with TypeScript (backend), featuring offline support and real-time synchronization.

## 🚀 Features

### Frontend (React Native Expo)

- **Kanban Board Interface**: Three columns (To Do, In Progress, Done)
- **CRUD Operations**: Create, Read, Update, Delete tickets
- **Offline Support**: Works without internet connection (WatermelonDB ready)
- **Material Design**: Beautiful UI with React Native Paper components
- **Real-time Updates**: Instant UI updates for all operations
- **Cross-platform**: Runs on iOS, Android, and Web

### Backend (Express.js + TypeScript)

- **RESTful API**: Complete CRUD endpoints for tickets
- **PostgreSQL Database**: Robust data persistence
- **Authentication**: JWT-based user authentication
- **Data Validation**: Joi schema validation for all inputs
- **Error Handling**: Comprehensive error handling middleware
- **Logging**: Winston-based logging system
- **Rate Limiting**: API rate limiting for security
- **Database Migrations**: Automated database schema management

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Features Guide](#features-guide)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🛠️ Prerequisites

Before running this application, make sure you have the following installed:

### Required Software

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Expo CLI**: `npm install -g @expo/cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)

### Mobile Development Setup

- **Expo Go App** (for testing on physical devices)
- **Android Emulator** or **iOS Simulator**
- **Watchman** (recommended for file watching)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TODOList
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../mobileApp
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. **Create Environment File**

```bash
cd server
cp .env.example .env
```

2. **Configure Environment Variables**
   Edit `server/.env` with your settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist
DB_USER=your_username
DB_PASSWORD=your_password

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8081,exp://10.0.0.45:8081

# Logging
LOG_LEVEL=info
```

3. **Setup PostgreSQL Database**

```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE todolist;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE todolist TO your_username;
```

### Frontend Configuration

The mobile app uses the server's IP address for API communication. Update the API base URL in `mobileApp/lib/services/api.ts` if needed:

```typescript
const API_BASE_URL = "http://YOUR_SERVER_IP:3001/api";
```

## 🚀 Running the Application

### 1. Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

### 2. Run Database Migrations

```bash
cd server
npm run db:migrate
```

### 3. Start the Frontend App

```bash
cd mobileApp
npx expo start
```

### 4. Open the App

- **Physical Device**: Scan QR code with Expo Go app
- **Android Emulator**: Press 'a' in terminal
- **iOS Simulator**: Press 'i' in terminal
- **Web Browser**: Press 'w' in terminal

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Ticket Endpoints

#### Get All Tickets

```http
GET /api/tickets
Authorization: Bearer <jwt_token>
```

#### Get Single Ticket

```http
GET /api/tickets/:id
Authorization: Bearer <jwt_token>
```

#### Create Ticket

```http
POST /api/tickets
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Task Title",
  "description": "Task Description",
  "status": "todo"
}
```

#### Update Ticket

```http
PUT /api/tickets/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description",
  "status": "in_progress"
}
```

#### Delete Ticket

```http
DELETE /api/tickets/:id
Authorization: Bearer <jwt_token>
```

### Health Check

```http
GET /api/health
```

## 📁 Project Structure

```
TODOList/
├── server/                          # Backend Express.js application
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.ts          # Database connection
│   │   │   ├── logger.ts            # Winston logger setup
│   │   │   └── migrations.ts        # Migration system
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.ts              # JWT authentication
│   │   │   ├── errorHandler.ts      # Error handling
│   │   │   ├── rateLimiter.ts       # Rate limiting
│   │   │   └── validation.ts        # Request validation
│   │   ├── models/                  # Data models
│   │   │   ├── Ticket.ts            # Ticket model
│   │   │   └── User.ts              # User model
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.ts              # Authentication routes
│   │   │   ├── tickets.ts           # Ticket CRUD routes
│   │   │   └── health.ts            # Health check routes
│   │   ├── validation/              # Joi validation schemas
│   │   │   ├── authValidation.ts    # Auth validation
│   │   │   └── ticketValidation.ts  # Ticket validation
│   │   ├── migrations/              # Database migrations
│   │   │   └── 001_initial_schema.sql
│   │   └── index.ts                 # Server entry point
│   ├── package.json
│   ├── .env.example
│   └── tsconfig.json
├── mobileApp/                       # Frontend React Native Expo app
│   ├── app/                         # Expo Router pages
│   │   ├── (tabs)/                  # Tab navigation
│   │   │   ├── index.tsx            # Home screen
│   │   │   └── _layout.tsx          # Tab layout
│   │   ├── _layout.tsx              # Root layout
│   │   └── +not-found.tsx           # 404 page
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # UI components
│   │   ├── ThemedText.tsx           # Themed text component
│   │   └── ThemedView.tsx           # Themed view component
│   ├── constants/                   # App constants
│   │   └── Colors.ts                # Color definitions
│   ├── hooks/                       # Custom React hooks
│   │   ├── useColorScheme.ts        # Color scheme hook
│   │   ├── useThemeColor.ts         # Theme color hook
│   │   └── useTickets.ts            # Ticket management hook
│   ├── lib/                         # Core libraries
│   │   ├── database/                # WatermelonDB setup (ready)
│   │   │   ├── models/              # Database models
│   │   │   ├── schema/              # Database schema
│   │   │   └── index.ts             # Database instance
│   │   └── services/                # API services
│   │       ├── api.ts               # HTTP client
│   │       └── ticketService.ts     # Ticket service
│   ├── screens/                     # Screen components
│   │   ├── HomeScreen.tsx           # Main kanban screen
│   │   └── SimpleHomeScreen.tsx     # Simplified version
│   ├── package.json
│   ├── babel.config.js
│   └── app.json
└── README.md                        # This file
```

## 🎯 Features Guide

### Creating Tickets

1. Tap the **+ (FAB)** button
2. Fill in the **title** and **description**
3. Select the **status** (To Do, In Progress, Done)
4. Tap **Create**

### Editing Tickets

1. Tap **Edit** on any ticket
2. Modify the fields as needed
3. Tap **Update** to save changes

### Deleting Tickets

1. Tap **Delete** on any ticket
2. The ticket is immediately removed

### Moving Tickets Between Columns

1. Tap **Edit** on a ticket
2. Change the **status** using the segmented buttons
3. Tap **Update** - the ticket moves to the appropriate column

### Offline Support (Ready for Implementation)

- All operations work offline with local storage
- Data syncs automatically when connection is restored
- Visual indicators show sync status

## 🔧 Development

### Backend Development

#### Available Scripts

```bash
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database
npm run db:seed      # Seed database with sample data
```

#### Adding New API Endpoints

1. Create route handler in `src/routes/`
2. Add validation schema in `src/validation/`
3. Update models in `src/models/` if needed
4. Register route in `src/index.ts`

#### Database Migrations

```bash
# Create new migration
npm run db:create-migration <migration_name>

# Run migrations
npm run db:migrate

# Rollback migrations
npm run db:rollback
```

### Frontend Development

#### Available Scripts

```bash
npx expo start       # Start development server
npx expo start --clear  # Start with cleared cache
npx expo build       # Build for production
npx expo install     # Install Expo-compatible packages
```

#### Adding New Screens

1. Create screen component in `screens/`
2. Add route in `app/` directory
3. Update navigation if needed

#### State Management

- Uses React hooks for local state
- Custom `useTickets` hook for ticket operations
- Ready for WatermelonDB integration for offline support

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues

**Database Connection Error**

```bash
# Check PostgreSQL is running
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# Verify database exists
psql -U postgres -l
```

**Port Already in Use**

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

#### Frontend Issues

**Metro Bundler Issues**

```bash
# Clear all caches
npx expo start --clear
rm -rf node_modules/.cache
```

**Module Resolution Errors**

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**Expo Go Connection Issues**

- Ensure device and computer are on same network
- Check firewall settings
- Try using tunnel mode: `npx expo start --tunnel`

#### Development Environment

**Watchman Issues (macOS)**

```bash
# Reset watchman
watchman watch-del-all
watchman shutdown-server
```

**Android Emulator Issues**

```bash
# Start emulator from command line
emulator -avd <AVD_NAME>

# List available AVDs
emulator -list-avds
```

### Performance Optimization

#### Backend

- Enable database connection pooling
- Add Redis for caching
- Implement database indexing
- Use compression middleware

#### Frontend

- Enable Hermes engine for Android
- Implement lazy loading for screens
- Optimize image assets
- Use FlatList for large datasets

## 🔐 Security Considerations

### Backend Security

- JWT tokens for authentication
- Input validation with Joi
- Rate limiting on API endpoints
- CORS configuration
- Environment variable protection
- SQL injection prevention with parameterized queries

### Frontend Security

- Secure token storage
- API endpoint validation
- Input sanitization
- Network security (HTTPS in production)

## 🚀 Deployment

### Backend Deployment

1. **Environment Setup**

   - Set production environment variables
   - Configure production database
   - Set up SSL certificates

2. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

### Frontend Deployment

1. **Build for Production**

   ```bash
   npx expo build:android  # Android APK
   npx expo build:ios      # iOS IPA
   ```

2. **Publish Updates**
   ```bash
   npx expo publish
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation for API changes
- Follow the existing code style
- Test on both iOS and Android

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **Express.js** - Backend framework
- **PostgreSQL** - Database
- **React Native Paper** - UI components
- **WatermelonDB** - Offline database (ready for integration)

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing issues in the repository
3. Create a new issue with detailed information
4. Join our community discussions

---

**Happy Coding! 🎉**
