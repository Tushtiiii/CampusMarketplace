const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [50000, 'Price cannot exceed $50,000']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'textbooks', 
        'lab-equipment', 
        'electronics', 
        'furniture', 
        'clothing',
        'sports-equipment',
        'musical-instruments',
        'art-supplies',
        'vehicles',
        'other'
      ],
      message: 'Category must be one of the predefined options'
    },
    index: true
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: {
      values: ['new', 'like-new', 'good', 'fair', 'poor'],
      message: 'Condition must be: new, like-new, good, fair, or poor'
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    alt: String
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required'],
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'expired', 'draft'],
    default: 'active',
    index: true
  },
  location: {
    campus: {
      type: String,
      required: [true, 'Campus location is required'],
      trim: true
    },
    building: {
      type: String,
      trim: true
    },
    meetingPreference: {
      type: String,
      enum: ['campus-only', 'dorm', 'library', 'cafeteria', 'flexible'],
      default: 'flexible'
    }
  },
  // Academic-specific fields for textbooks/lab equipment
  academic: {
    courseCode: {
      type: String,
      trim: true,
      uppercase: true
    },
    courseName: {
      type: String,
      trim: true
    },
    professor: {
      type: String,
      trim: true
    },
    semester: {
      type: String,
      enum: ['fall', 'spring', 'summer', 'winter']
    },
    year: {
      type: Number,
      min: 2020,
      max: new Date().getFullYear() + 2
    },
    isbn: {
      type: String,
      trim: true
    },
    edition: {
      type: String,
      trim: true
    }
  },
  // Electronics-specific fields
  electronics: {
    brand: {
      type: String,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    specifications: [{
      key: String,
      value: String
    }],
    warranty: {
      hasWarranty: {
        type: Boolean,
        default: false
      },
      expiryDate: Date,
      details: String
    }
  },
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  inquiries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  // SEO and search optimization
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  searchKeywords: {
    type: String,
    select: false // Hidden field for search optimization
  },
  // Listing management
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
    },
    index: { expireAfterSeconds: 0 }
  },
  isPriority: {
    type: Boolean,
    default: false
  },
  lastBumped: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for favorites count
listingSchema.virtual('favoritesCount').get(function() {
  return this.favorites.length;
});

// Virtual for main image
listingSchema.virtual('mainImage').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

// Virtual for time since posted
listingSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const posted = this.createdAt;
  const diffTime = Math.abs(now - posted);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
});

// Indexes for search and filtering
listingSchema.index({ title: 'text', description: 'text', 'academic.courseName': 'text' });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ seller: 1, status: 1 });
listingSchema.index({ 'location.campus': 1 });
listingSchema.index({ lastBumped: -1 });

// Pre-save middleware to generate search keywords
listingSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('description') || this.isModified('tags')) {
    const keywords = [
      this.title,
      this.description,
      this.category,
      this.condition,
      ...(this.tags || []),
      this.academic?.courseCode,
      this.academic?.courseName,
      this.electronics?.brand,
      this.electronics?.model
    ].filter(Boolean).join(' ').toLowerCase();
    
    this.searchKeywords = keywords;
  }
  next();
});

// Method to increment view count
listingSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to add to favorites
listingSchema.methods.addToFavorites = function(userId) {
  const isAlreadyFavorite = this.favorites.some(
    fav => fav.user.toString() === userId.toString()
  );
  
  if (!isAlreadyFavorite) {
    this.favorites.push({ user: userId });
  }
  
  return this.save();
};

// Method to remove from favorites
listingSchema.methods.removeFromFavorites = function(userId) {
  this.favorites = this.favorites.filter(
    fav => fav.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Method to mark as sold
listingSchema.methods.markAsSold = function() {
  this.status = 'sold';
  return this.save();
};

// Method to bump listing (bring to top)
listingSchema.methods.bump = function() {
  this.lastBumped = new Date();
  return this.save();
};

// Static method to get trending listings
listingSchema.statics.getTrending = function() {
  return this.aggregate([
    { $match: { status: 'active' } },
    { $addFields: { 
      trendingScore: {
        $add: [
          { $multiply: ['$views', 0.3] },
          { $multiply: [{ $size: '$favorites' }, 0.7] }
        ]
      }
    }},
    { $sort: { trendingScore: -1 } },
    { $limit: 20 },
    { $lookup: {
      from: 'users',
      localField: 'seller',
      foreignField: '_id',
      as: 'seller'
    }},
    { $unwind: '$seller' }
  ]);
};

module.exports = mongoose.model('Listing', listingSchema);