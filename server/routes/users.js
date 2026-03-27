const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const { auth } = require('../middleware/auth');

// Get user public profile
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-email -phoneNumber -isEmailVerified -lastLogin')
      .populate('listings', 'title price status createdAt mainImage category');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        message: 'User profile not available'
      });
    }

    // Get only active listings for public view
    const activeListings = user.listings.filter(listing => listing.status === 'active');

    res.json({
      user: {
        ...user.toJSON(),
        listings: activeListings
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      message: 'Internal server error while fetching user profile'
    });
  }
};

// Get user's favorite listings
const getFavoriteListings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favoriteListings',
        match: { status: 'active' },
        populate: {
          path: 'seller',
          select: 'firstName lastName avatar university'
        }
      });

    res.json({
      favoriteListings: user.favoriteListings
    });
  } catch (error) {
    console.error('Get favorite listings error:', error);
    res.status(500).json({
      message: 'Internal server error while fetching favorite listings'
    });
  }
};

// Search users (for admin or public directory if implemented)
const searchUsers = async (req, res) => {
  try {
    const { query, university, graduationYear, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };

    if (query) {
      filter.$or = [
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') },
        { major: new RegExp(query, 'i') }
      ];
    }

    if (university) {
      filter.university = new RegExp(university, 'i');
    }

    if (graduationYear) {
      filter.graduationYear = parseInt(graduationYear);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(filter)
      .select('firstName lastName avatar university graduationYear major createdAt')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limitNum);

    res.json({
      users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      message: 'Internal server error while searching users'
    });
  }
};

// Public routes
router.get('/:id/profile', getUserProfile);
router.get('/search', searchUsers);

// Protected routes
router.use(auth);
router.get('/favorites', getFavoriteListings);

module.exports = router;