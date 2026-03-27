const express = require('express');
const router = express.Router();
const {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  toggleFavorite,
  getTrendingListings,
  getMyListings,
  markAsSold
} = require('../controllers/listingController');
const { auth, optionalAuth } = require('../middleware/auth');
const { uploadMultiple, handleMulterError } = require('../middleware/upload');

// Public routes (no auth required)
router.get('/', optionalAuth, getListings);
router.get('/trending', getTrendingListings);
router.get('/:id', optionalAuth, getListing);

// Protected routes (auth required)
router.use(auth); // Apply auth middleware to all routes below

router.post('/', uploadMultiple, handleMulterError, createListing);
router.get('/user/my-listings', getMyListings);
router.put('/:id', uploadMultiple, handleMulterError, updateListing);
router.delete('/:id', deleteListing);
router.post('/:id/favorite', toggleFavorite);
router.patch('/:id/mark-sold', markAsSold);

module.exports = router;