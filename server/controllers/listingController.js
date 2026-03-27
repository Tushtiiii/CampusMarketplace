const Listing = require('../models/Listing');
const User = require('../models/User');
const { uploadImage, uploadMultipleImages, deleteMultipleImages } = require('../utils/cloudinary');

// Create new listing
const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      condition,
      location,
      academic,
      electronics,
      tags
    } = req.body;

    // Validation
    if (!title || !description || !price || !category || !condition) {
      return res.status(400).json({
        message: 'Please provide all required fields: title, description, price, category, and condition'
      });
    }

    if (price < 0 || price > 50000) {
      return res.status(400).json({
        message: 'Price must be between $0 and $50,000'
      });
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      try {
        const imageUploads = await Promise.all(
          req.files.map(file => 
            uploadImage(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, 'listings')
          )
        );
        images = imageUploads.map((upload, index) => ({
          url: upload.url,
          public_id: upload.public_id,
          alt: `${title} - Image ${index + 1}`
        }));
      } catch (uploadError) {
        return res.status(400).json({
          message: 'Failed to upload images. Please try again.'
        });
      }
    }

    // Create listing
    const listingData = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      condition,
      images,
      seller: req.user._id,
      location: location ? {
        campus: location.campus?.trim(),
        building: location.building?.trim(),
        meetingPreference: location.meetingPreference || 'flexible'
      } : undefined
    };

    // Add category-specific data
    if (category === 'textbooks' || category === 'lab-equipment') {
      if (academic) {
        listingData.academic = {
          courseCode: academic.courseCode?.trim().toUpperCase(),
          courseName: academic.courseName?.trim(),
          professor: academic.professor?.trim(),
          semester: academic.semester,
          year: academic.year ? parseInt(academic.year) : undefined,
          isbn: academic.isbn?.trim(),
          edition: academic.edition?.trim()
        };
      }
    }

    if (category === 'electronics') {
      if (electronics) {
        listingData.electronics = {
          brand: electronics.brand?.trim(),
          model: electronics.model?.trim(),
          specifications: electronics.specifications || [],
          warranty: electronics.warranty || { hasWarranty: false }
        };
      }
    }

    // Add tags
    if (tags) {
      listingData.tags = Array.isArray(tags) 
        ? tags.map(tag => tag.toLowerCase().trim()).filter(Boolean)
        : tags.split(',').map(tag => tag.toLowerCase().trim()).filter(Boolean);
    }

    const listing = new Listing(listingData);
    await listing.save();

    // Add listing to user's listings array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { listings: listing._id }
    });

    // Populate seller info for response
    await listing.populate('seller', 'firstName lastName avatar university');

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Create listing error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      message: 'Internal server error while creating listing'
    });
  }
};

// Get all listings with filtering and pagination
const getListings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      condition,
      search,
      sortBy = 'newest',
      campus,
      seller
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (condition && condition !== 'all') {
      filter.condition = condition;
    }

    if (campus) {
      filter['location.campus'] = new RegExp(campus, 'i');
    }

    if (seller) {
      filter.seller = seller;
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'popular':
        sort = { views: -1, favoritesCount: -1 };
        break;
      case 'newest':
      default:
        sort = { lastBumped: -1, createdAt: -1 };
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const listings = await Listing.find(filter)
      .populate('seller', 'firstName lastName avatar university rating')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalListings = await Listing.countDocuments(filter);
    const totalPages = Math.ceil(totalListings / limitNum);

    // Add favorite status if user is authenticated
    if (req.user) {
      listings.forEach(listing => {
        listing.isFavorited = listing.favorites.some(
          fav => fav.user.toString() === req.user._id.toString()
        );
      });
    }

    res.json({
      listings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalListings,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      filters: {
        category,
        minPrice,
        maxPrice,
        condition,
        search,
        sortBy,
        campus
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      message: 'Internal server error while fetching listings'
    });
  }
};

// Get single listing by ID
const getListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate('seller', 'firstName lastName avatar university rating createdAt')
      .populate('favorites.user', 'firstName lastName');

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    // Increment view count (but not for the seller)
    if (!req.user || listing.seller._id.toString() !== req.user._id.toString()) {
      await listing.incrementViews();
    }

    // Add favorite status if user is authenticated
    if (req.user) {
      listing.isFavorited = listing.favorites.some(
        fav => fav.user._id.toString() === req.user._id.toString()
      );
    }

    res.json({
      listing
    });
  } catch (error) {
    console.error('Get listing error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid listing ID'
      });
    }

    res.status(500).json({
      message: 'Internal server error while fetching listing'
    });
  }
};

// Update listing
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      category,
      condition,
      location,
      academic,
      electronics,
      tags,
      status
    } = req.body;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    // Check ownership
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only update your own listings.'
      });
    }

    // Update basic fields
    if (title) listing.title = title.trim();
    if (description) listing.description = description.trim();
    if (price !== undefined) {
      if (price < 0 || price > 50000) {
        return res.status(400).json({
          message: 'Price must be between $0 and $50,000'
        });
      }
      listing.price = parseFloat(price);
    }
    if (category) listing.category = category;
    if (condition) listing.condition = condition;
    if (status) listing.status = status;

    // Update location
    if (location) {
      listing.location = {
        campus: location.campus?.trim() || listing.location.campus,
        building: location.building?.trim() || listing.location.building,
        meetingPreference: location.meetingPreference || listing.location.meetingPreference
      };
    }

    // Update category-specific data
    if (academic) {
      listing.academic = {
        ...listing.academic,
        courseCode: academic.courseCode?.trim().toUpperCase() || listing.academic?.courseCode,
        courseName: academic.courseName?.trim() || listing.academic?.courseName,
        professor: academic.professor?.trim() || listing.academic?.professor,
        semester: academic.semester || listing.academic?.semester,
        year: academic.year ? parseInt(academic.year) : listing.academic?.year,
        isbn: academic.isbn?.trim() || listing.academic?.isbn,
        edition: academic.edition?.trim() || listing.academic?.edition
      };
    }

    if (electronics) {
      listing.electronics = {
        ...listing.electronics,
        brand: electronics.brand?.trim() || listing.electronics?.brand,
        model: electronics.model?.trim() || listing.electronics?.model,
        specifications: electronics.specifications || listing.electronics?.specifications,
        warranty: electronics.warranty || listing.electronics?.warranty
      };
    }

    // Update tags
    if (tags) {
      listing.tags = Array.isArray(tags) 
        ? tags.map(tag => tag.toLowerCase().trim()).filter(Boolean)
        : tags.split(',').map(tag => tag.toLowerCase().trim()).filter(Boolean);
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      try {
        const imageUploads = await Promise.all(
          req.files.map(file => 
            uploadImage(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, 'listings')
          )
        );
        const newImages = imageUploads.map((upload, index) => ({
          url: upload.url,
          public_id: upload.public_id,
          alt: `${listing.title} - Image ${listing.images.length + index + 1}`
        }));
        listing.images.push(...newImages);
      } catch (uploadError) {
        return res.status(400).json({
          message: 'Failed to upload new images. Please try again.'
        });
      }
    }

    await listing.save();
    await listing.populate('seller', 'firstName lastName avatar university rating');

    res.json({
      message: 'Listing updated successfully',
      listing
    });
  } catch (error) {
    console.error('Update listing error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid listing ID'
      });
    }

    res.status(500).json({
      message: 'Internal server error while updating listing'
    });
  }
};

// Delete listing
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    // Check ownership
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only delete your own listings.'
      });
    }

    // Delete images from Cloudinary
    if (listing.images && listing.images.length > 0) {
      const publicIds = listing.images.map(img => img.public_id);
      await deleteMultipleImages(publicIds);
    }

    // Remove listing from database
    await Listing.findByIdAndDelete(id);

    // Remove listing from user's listings array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { listings: id }
    });

    res.json({
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid listing ID'
      });
    }

    res.status(500).json({
      message: 'Internal server error while deleting listing'
    });
  }
};

// Toggle favorite listing
const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    const isFavorited = listing.favorites.some(
      fav => fav.user.toString() === req.user._id.toString()
    );

    if (isFavorited) {
      await listing.removeFromFavorites(req.user._id);
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { favoriteListings: id }
      });
    } else {
      await listing.addToFavorites(req.user._id);
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { favoriteListings: id }
      });
    }

    res.json({
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      isFavorited: !isFavorited
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid listing ID'
      });
    }

    res.status(500).json({
      message: 'Internal server error while toggling favorite'
    });
  }
};

// Get trending listings
const getTrendingListings = async (req, res) => {
  try {
    const trendingListings = await Listing.getTrending();

    res.json({
      listings: trendingListings
    });
  } catch (error) {
    console.error('Get trending listings error:', error);
    res.status(500).json({
      message: 'Internal server error while fetching trending listings'
    });
  }
};

// Get user's own listings
const getMyListings = async (req, res) => {
  try {
    const { status = 'all' } = req.query;

    const filter = { seller: req.user._id };
    if (status !== 'all') {
      filter.status = status;
    }

    const listings = await Listing.find(filter)
      .populate('seller', 'firstName lastName avatar university')
      .sort({ createdAt: -1 });

    res.json({
      listings
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      message: 'Internal server error while fetching your listings'
    });
  }
};

// Mark listing as sold
const markAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    // Check ownership
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only update your own listings.'
      });
    }

    await listing.markAsSold();

    res.json({
      message: 'Listing marked as sold',
      listing
    });
  } catch (error) {
    console.error('Mark as sold error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid listing ID'
      });
    }

    res.status(500).json({
      message: 'Internal server error while marking listing as sold'
    });
  }
};

module.exports = {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  toggleFavorite,
  getTrendingListings,
  getMyListings,
  markAsSold
};