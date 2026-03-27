const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required'],
    index: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required'],
    index: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: [true, 'Listing is required'],
    index: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['inquiry', 'response', 'negotiation', 'meetup'],
    default: 'inquiry'
  },
  // Status tracking
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,
  isArchived: {
    type: Boolean,
    default: false
  },
  // Thread management
  threadId: {
    type: String,
    index: true
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  // Inquiry-specific fields
  inquiryDetails: {
    proposedPrice: {
      type: Number,
      min: 0
    },
    proposedMeetingLocation: String,
    proposedMeetingTime: Date,
    contactMethod: {
      type: String,
      enum: ['app', 'email', 'phone', 'in-person'],
      default: 'app'
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  // Seller response fields
  sellerResponse: {
    isInterested: Boolean,
    counterOffer: Number,
    suggestedMeetingTime: Date,
    suggestedLocation: String,
    additionalNotes: String
  },
  // Spam and moderation
  isSpam: {
    type: Boolean,
    default: false
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Metadata
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for conversation thread
messageSchema.virtual('isFirstInThread').get(function() {
  return !this.parentMessage;
});

// Generate thread ID if this is the first message
messageSchema.pre('save', function(next) {
  if (this.isNew && !this.threadId) {
    this.threadId = `${this.sender}_${this.listing}_${Date.now()}`;
  }
  next();
});

// Indexes for performance
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ listing: 1, createdAt: -1 });
messageSchema.index({ threadId: 1, createdAt: 1 });
messageSchema.index({ createdAt: -1 });

// Static method to get conversation thread
messageSchema.statics.getThread = function(threadId) {
  return this.find({ threadId })
    .populate('sender', 'firstName lastName avatar email')
    .populate('recipient', 'firstName lastName avatar email')
    .populate('listing', 'title price mainImage status')
    .sort({ createdAt: 1 });
};

// Static method to get user conversations
messageSchema.statics.getUserConversations = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { recipient: userId }],
        isArchived: false
      }
    },
    {
      $sort: { threadId: 1, createdAt: -1 }
    },
    {
      $group: {
        _id: '$threadId',
        latestMessage: { $first: '$$ROOT' },
        messageCount: { $sum: 1 },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipient', userId] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'latestMessage.sender',
        foreignField: '_id',
        as: 'sender'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'latestMessage.recipient',
        foreignField: '_id',
        as: 'recipient'
      }
    },
    {
      $lookup: {
        from: 'listings',
        localField: 'latestMessage.listing',
        foreignField: '_id',
        as: 'listing'
      }
    },
    {
      $addFields: {
        otherUser: {
          $cond: [
            { $eq: ['$latestMessage.sender', userId] },
            { $arrayElemAt: ['$recipient', 0] },
            { $arrayElemAt: ['$sender', 0] }
          ]
        }
      }
    },
    {
      $sort: { 'latestMessage.createdAt': -1 }
    }
  ]);
};

// Method to mark as read
messageSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to archive message
messageSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// Method to report as spam
messageSchema.methods.reportSpam = function(reporterId, reason) {
  this.reportedBy.push({
    user: reporterId,
    reason: reason || 'Spam content'
  });
  
  // Auto-mark as spam if reported by multiple users
  if (this.reportedBy.length >= 3) {
    this.isSpam = true;
  }
  
  return this.save();
};

// Static method to get message statistics
messageSchema.statics.getMessageStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { recipient: userId }]
      }
    },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        unreadMessages: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipient', userId] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        },
        totalConversations: { $addToSet: '$threadId' }
      }
    },
    {
      $project: {
        _id: 0,
        totalMessages: 1,
        unreadMessages: 1,
        totalConversations: { $size: '$totalConversations' }
      }
    }
  ]);
};

module.exports = mongoose.model('Message', messageSchema);