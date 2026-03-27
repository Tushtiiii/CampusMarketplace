# Campus Marketplace - Frontend

React application for the Campus Marketplace platform.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at http://localhost:5173

## 🛠️ Build Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📦 Dependencies

### Core
- `react` - UI library
- `react-dom` - React DOM renderer
- `react-router-dom` - Client-side routing

### UI Framework
- `@mui/material` - Material-UI components
- `@mui/icons-material` - Material-UI icons
- `@emotion/react` - CSS-in-JS library
- `@emotion/styled` - Styled components

### State Management & API
- `react-query` - Server state management
- `axios` - HTTP client
- `react-hook-form` - Form management
- `@hookform/resolvers` - Form validation resolvers
- `yup` - Schema validation

### Utilities
- `date-fns` - Date manipulation
- `notistack` - Notification system
- `lodash.debounce` - Debouncing utility

### Development
- `@vitejs/plugin-react` - Vite React plugin
- `eslint` - Code linting

## 🗂️ Project Structure

```
client/src/
├── components/        # Reusable UI components
│   ├── Navbar.jsx    # Navigation bar
│   ├── LoadingSpinner.jsx
│   └── ProtectedRoute.jsx
├── context/          # React Context providers
│   └── AuthContext.jsx
├── hooks/            # Custom React hooks
├── pages/            # Page components
│   ├── Home.jsx      # Homepage with listings
│   ├── Login.jsx     # Authentication
│   ├── Register.jsx  # User registration
│   ├── Profile.jsx   # User profile
│   ├── CreateListing.jsx
│   ├── ListingDetails.jsx
│   ├── Messages.jsx
│   ├── Favorites.jsx
│   ├── MyListings.jsx
│   ├── Search.jsx
│   └── NotFound.jsx
├── services/         # API calls
│   └── api.js        # Axios configuration
└── utils/            # Utility functions
```

## 🎨 UI Components

### Material-UI Theme
Custom theme with:
- Primary color: Blue (#1976d2)
- Secondary color: Pink (#dc004e)
- Custom component styling
- Responsive breakpoints

### Key Components
- **Navbar**: Responsive navigation with user menu
- **ListingCard**: Product card component
- **ProtectedRoute**: Route protection wrapper
- **LoadingSpinner**: Loading state component

## 🔒 Authentication

### AuthContext
Provides authentication state and methods:
- `user` - Current user data
- `isAuthenticated` - Authentication status
- `login()` - Login function
- `register()` - Registration function
- `logout()` - Logout function
- `updateUser()` - Update user profile

### Protected Routes
Routes requiring authentication are wrapped with `ProtectedRoute` component.

## 📱 Responsive Design

### Breakpoints
- **xs**: 0px and up (mobile)
- **sm**: 600px and up (tablet)
- **md**: 900px and up (desktop)
- **lg**: 1200px and up (large desktop)
- **xl**: 1536px and up (extra large)

### Mobile Features
- Collapsible navigation drawer
- Touch-friendly buttons
- Optimized card layouts
- Mobile-first design approach

## 🌐 API Integration

### React Query
Server state management with:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

### API Service
Centralized API calls in `services/api.js`:
- Authentication endpoints
- Listings CRUD operations
- Message management
- User operations

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Connect GitHub repository
2. Set environment variables:
   ```
   VITE_API_URL=https://your-api-domain.com/api
   ```
3. Deploy automatically on push

### Deploy to Netlify
1. Build the project
2. Upload `dist` folder
3. Configure redirects for SPA

## 🧪 Testing

```bash
npm test
```

## 📝 Development Guidelines

### Code Style
- Use functional components with hooks
- Follow Material-UI design patterns
- Implement responsive design
- Handle loading and error states

### Component Structure
```jsx
import React from 'react';
import { Component } from '@mui/material';

const MyComponent = ({ prop1, prop2 }) => {
  // Hooks
  // Event handlers
  // Render logic
  
  return (
    <Component>
      {/* JSX */}
    </Component>
  );
};

export default MyComponent;
```

### State Management
- Use React Query for server state
- Use React Context for global client state
- Use local state for component-specific data

---

For complete documentation, see the main README.md