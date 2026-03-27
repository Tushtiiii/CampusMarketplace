# Campus Marketplace - Backend

Node.js/Express backend for the Campus Marketplace application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

### 3. Required Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/campus-marketplace

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Frontend URL
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin Configuration
ADMIN_EMAIL=admin@university.edu
ADMIN_PASSWORD=admin123
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start on http://localhost:5000

## 📊 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)
- `PUT /api/auth/change-password` - Change password (requires auth)
- `POST /api/auth/logout` - Logout user
- `DELETE /api/auth/account` - Delete user account

### Listings
- `GET /api/listings` - Get all listings (with filtering)
- `GET /api/listings/trending` - Get trending listings
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create new listing (requires auth)
- `PUT /api/listings/:id` - Update listing (requires auth)
- `DELETE /api/listings/:id` - Delete listing (requires auth)
- `POST /api/listings/:id/favorite` - Toggle favorite (requires auth)
- `PATCH /api/listings/:id/mark-sold` - Mark as sold (requires auth)
- `GET /api/listings/user/my-listings` - Get user's listings (requires auth)

### Messages
- `POST /api/messages` - Send message (requires auth)
- `GET /api/messages/conversations` - Get user conversations (requires auth)
- `GET /api/messages/stats` - Get message statistics (requires auth)
- `GET /api/messages/thread/:threadId` - Get conversation thread (requires auth)
- `POST /api/messages/thread/:threadId/reply` - Reply to message (requires auth)
- `PATCH /api/messages/:id/read` - Mark message as read (requires auth)
- `PATCH /api/messages/thread/:threadId/archive` - Archive conversation (requires auth)
- `POST /api/messages/:id/report-spam` - Report spam (requires auth)

### Users
- `GET /api/users/:id/profile` - Get user public profile
- `GET /api/users/search` - Search users
- `GET /api/users/favorites` - Get user's favorite listings (requires auth)

## 🗄️ Database Models

### User
- Personal information (name, email, university, etc.)
- Authentication data (hashed password, verification status)
- Marketplace data (listings, favorites, ratings)

### Listing
- Item details (title, description, price, condition)
- Category-specific fields (academic info for textbooks, specs for electronics)
- Media (images with Cloudinary integration)
- Engagement metrics (views, favorites)

### Message
- Communication between buyers and sellers
- Thread management for conversations
- Inquiry details and seller responses

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API request limiting
- **CORS**: Configured cross-origin requests
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation
- **File Upload Security**: Type and size validation

## 📦 Dependencies

### Core
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token handling
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### File Upload & Storage
- `multer` - File upload middleware
- `cloudinary` - Image storage and optimization

### Security & Validation
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `validator` - Input validation

### Development
- `nodemon` - Development server with auto-reload
- `morgan` - HTTP request logger

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-marketplace
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Build and Start
```bash
npm start
```

## 🧪 Testing

```bash
npm test
```

## 📝 Development

### Code Structure
```
server/
├── controllers/     # Route handlers
├── middleware/      # Custom middleware
├── models/         # Mongoose models
├── routes/         # Express routes
├── utils/          # Utility functions
├── server.js       # Main server file
└── package.json    # Dependencies
```

### Adding New Features
1. Define database model in `models/`
2. Create controller functions in `controllers/`
3. Add routes in `routes/`
4. Register routes in `server.js`

---

For complete documentation, see the main README.md