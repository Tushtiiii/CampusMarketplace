# Campus Marketplace

A full-stack MERN application for college students to buy and sell used books, lab equipment, and electronics within their campus community.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure signup/login with JWT tokens
- **Post Items**: Easy-to-use form for creating listings with image uploads
- **Browse Listings**: Clean grid layout with search and filtering capabilities
- **Detailed View**: Comprehensive item pages with seller information
- **Contact Sellers**: Built-in messaging system for buyer-seller communication
- **Favorites**: Save interesting items for later
- **User Profiles**: Manage personal information and view listing history

### Technical Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live message counts and notifications
- **Image Optimization**: Cloudinary integration for efficient image storage
- **Advanced Search**: Filter by category, price, condition, and location
- **Security**: Protected routes, input validation, and secure authentication

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Material-UI (MUI)** for beautiful, accessible components
- **React Router** for client-side routing
- **React Query** for server state management
- **React Hook Form** with Yup validation
- **Axios** for API communication

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Cloudinary** for image storage
- **Multer** for file uploads
- **Helmet** for security headers
- **Rate limiting** for API protection

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/campus-marketplace.git
cd campus-marketplace
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-marketplace
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ADMIN_EMAIL=admin@university.edu
ADMIN_PASSWORD=admin123
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend

Open a new terminal and navigate to the client directory:
```bash
cd client
npm install
```

Create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- API Health Check: http://localhost:5000/api/health

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### Listings Endpoints
- `GET /api/listings` - Get all listings with filtering
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create new listing (protected)
- `PUT /api/listings/:id` - Update listing (protected)
- `DELETE /api/listings/:id` - Delete listing (protected)
- `POST /api/listings/:id/favorite` - Toggle favorite (protected)

### Messages Endpoints
- `POST /api/messages` - Send message (protected)
- `GET /api/messages/conversations` - Get user conversations (protected)
- `GET /api/messages/thread/:threadId` - Get conversation thread (protected)

## 🗄️ Database Schema

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  university: String,
  graduationYear: Number,
  major: String,
  phoneNumber: String,
  avatar: { url: String, public_id: String },
  isEmailVerified: Boolean,
  listings: [ObjectId], // References to user's listings
  favoriteListings: [ObjectId],
  rating: { average: Number, count: Number }
}
```

### Listing Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  category: String, // textbooks, lab-equipment, electronics, etc.
  condition: String, // new, like-new, good, fair, poor
  images: [{ url: String, public_id: String, alt: String }],
  seller: ObjectId, // Reference to User
  status: String, // active, sold, expired, draft
  location: {
    campus: String,
    building: String,
    meetingPreference: String
  },
  academic: { // For textbooks/lab equipment
    courseCode: String,
    courseName: String,
    professor: String,
    semester: String,
    year: Number,
    isbn: String,
    edition: String
  },
  electronics: { // For electronics
    brand: String,
    model: String,
    specifications: [{ key: String, value: String }],
    warranty: {
      hasWarranty: Boolean,
      expiryDate: Date,
      details: String
    }
  },
  views: Number,
  favorites: [{ user: ObjectId, addedAt: Date }],
  tags: [String]
}
```

### Message Model
```javascript
{
  sender: ObjectId, // Reference to User
  recipient: ObjectId, // Reference to User
  listing: ObjectId, // Reference to Listing
  subject: String,
  content: String,
  messageType: String, // inquiry, response, negotiation, meetup
  isRead: Boolean,
  threadId: String,
  inquiryDetails: {
    proposedPrice: Number,
    proposedMeetingLocation: String,
    proposedMeetingTime: Date,
    contactMethod: String,
    urgency: String
  }
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Properly configured cross-origin requests
- **Helmet**: Security headers for Express applications
- **File Upload Security**: File type and size validation

## 🚀 Deployment

### Frontend (Vercel)
1. Build the project: `npm run build`
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Backend (Render)
1. Create account on Render
2. Connect your GitHub repository
3. Set environment variables in Render dashboard
4. Deploy the backend service

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create a new cluster
3. Get connection string and update MONGODB_URI
4. Configure network access and database user

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Adapted layout with collapsible navigation
- **Mobile**: Touch-friendly interface with bottom navigation

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## 🔄 Development Workflow

1. **Feature Development**: Create feature branches from main
2. **Code Review**: All changes require pull request review
3. **Testing**: Run tests before merging
4. **Deployment**: Automatic deployment on merge to main

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
- Ensure MongoDB is running locally
- Check connection string in .env file
- Verify network connectivity for MongoDB Atlas

#### Cloudinary Upload Issues
- Verify Cloudinary credentials in .env
- Check file size limits (max 10MB)
- Ensure supported file formats (JPEG, PNG, GIF, WebP)

#### Authentication Issues
- Clear localStorage and cookies
- Check JWT_SECRET configuration
- Verify token expiration settings

## 💡 Future Enhancements

### Planned Features
- **Real-time Chat**: WebSocket-based messaging
- **Push Notifications**: Browser notifications for new messages
- **Advanced Analytics**: Listing performance metrics
- **Seller Ratings**: User rating and review system
- **Admin Dashboard**: Content moderation and user management
- **Mobile App**: React Native application
- **Payment Integration**: Secure payment processing
- **Email Notifications**: Email alerts for important events

### Potential Improvements
- **AI-Powered Search**: Intelligent search recommendations
- **Image Recognition**: Automatic categorization from images
- **Price Recommendations**: Market-based pricing suggestions
- **Social Features**: User profiles and social connections
- **Geolocation**: Location-based search and meetup suggestions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@campusmarketplace.com
- Documentation: [Wiki](https://github.com/yourusername/campus-marketplace/wiki)

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- MongoDB team for the robust database solution
- Cloudinary for image management services
- React and Node.js communities for amazing tools and resources

---

**Built with ❤️ for the campus community**