const Message = require('../models/Message');
const Listing = require('../models/Listing');
const User = require('../models/User');

// Send message to seller
const sendMessage = async (req, res) => {
  try {
    const {
      listingId,
      subject,
      content,
      messageType = 'inquiry',
      inquiryDetails
    } = req.body;

    // Validation
    if (!listingId || !subject || !content) {
      return res.status(400).json({
        message: 'Please provide listing ID, subject, and message content'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        message: 'Message content cannot exceed 1000 characters'
      });
    }

    // Check if listing exists
    const listing = await Listing.findById(listingId).populate('seller');
    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({
        message: 'Cannot send message for inactive listing'
      });
    }

    // Prevent sending message to own listing
    if (listing.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot send a message to your own listing'
      });
    }

    // Create message
    const messageData = {
      sender: req.user._id,
      recipient: listing.seller._id,
      listing: listingId,
      subject: subject.trim(),
      content: content.trim(),
      messageType,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    if (inquiryDetails) {
      messageData.inquiryDetails = {
        proposedPrice: inquiryDetails.proposedPrice,
        proposedMeetingLocation: inquiryDetails.proposedMeetingLocation?.trim(),
        proposedMeetingTime: inquiryDetails.proposedMeetingTime,
        contactMethod: inquiryDetails.contactMethod || 'app',
        urgency: inquiryDetails.urgency || 'medium'
      };
    }

    const message = new Message(messageData);
    await message.save();

    // Add message to listing's inquiries
    await Listing.findByIdAndUpdate(listingId, {
      $push: { inquiries: message._id }
    });

    // Populate sender and recipient info
    await message.populate([
      { path: 'sender', select: 'firstName lastName avatar email university' },
      { path: 'recipient', select: 'firstName lastName avatar email university' },
      { path: 'listing', select: 'title price mainImage status' }
    ]);

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      message: 'Internal server error while sending message'
    });
  }
};

// Get user's conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Message.getUserConversations(req.user._id);

    res.json({
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      message: 'Internal server error while fetching conversations'
    });
  }
};

// Get conversation thread
const getConversationThread = async (req, res) => {
  try {
    const { threadId } = req.params;

    const messages = await Message.getThread(threadId);

    if (messages.length === 0) {
      return res.status(404).json({
        message: 'Conversation not found'
      });
    }

    // Check if user is part of this conversation
    const firstMessage = messages[0];
    const isParticipant = firstMessage.sender._id.toString() === req.user._id.toString() ||
                         firstMessage.recipient._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        message: 'Access denied. You are not part of this conversation.'
      });
    }

    // Mark messages as read for the current user
    const unreadMessages = messages.filter(
      msg => msg.recipient._id.toString() === req.user._id.toString() && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      await Promise.all(unreadMessages.map(msg => 
        Message.findByIdAndUpdate(msg._id, { isRead: true, readAt: new Date() })
      ));
    }

    res.json({
      messages,
      threadId
    });
  } catch (error) {
    console.error('Get conversation thread error:', error);
    res.status(500).json({
      message: 'Internal server error while fetching conversation'
    });
  }
};

// Reply to message
const replyToMessage = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content, messageType = 'response', sellerResponse } = req.body;

    if (!content) {
      return res.status(400).json({
        message: 'Message content is required'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        message: 'Message content cannot exceed 1000 characters'
      });
    }

    // Get the original thread to find participants and listing
    const originalMessages = await Message.find({ threadId }).limit(1);
    
    if (originalMessages.length === 0) {
      return res.status(404).json({
        message: 'Conversation thread not found'
      });
    }

    const originalMessage = originalMessages[0];
    
    // Check if user is part of this conversation
    const isParticipant = originalMessage.sender.toString() === req.user._id.toString() ||
                         originalMessage.recipient.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        message: 'Access denied. You are not part of this conversation.'
      });
    }

    // Determine recipient (the other person in the conversation)
    const recipient = originalMessage.sender.toString() === req.user._id.toString() 
      ? originalMessage.recipient 
      : originalMessage.sender;

    // Create reply message
    const replyData = {
      sender: req.user._id,
      recipient,
      listing: originalMessage.listing,
      subject: `Re: ${originalMessage.subject}`,
      content: content.trim(),
      messageType,
      threadId,
      parentMessage: originalMessage._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    if (sellerResponse) {
      replyData.sellerResponse = {
        isInterested: sellerResponse.isInterested,
        counterOffer: sellerResponse.counterOffer,
        suggestedMeetingTime: sellerResponse.suggestedMeetingTime,
        suggestedLocation: sellerResponse.suggestedLocation?.trim(),
        additionalNotes: sellerResponse.additionalNotes?.trim()
      };
    }

    const reply = new Message(replyData);
    await reply.save();

    // Populate sender and recipient info
    await reply.populate([
      { path: 'sender', select: 'firstName lastName avatar email university' },
      { path: 'recipient', select: 'firstName lastName avatar email university' },
      { path: 'listing', select: 'title price mainImage status' }
    ]);

    res.status(201).json({
      message: 'Reply sent successfully',
      messageData: reply
    });
  } catch (error) {
    console.error('Reply to message error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      message: 'Internal server error while sending reply'
    });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only mark your own messages as read.'
      });
    }

    await message.markAsRead();

    res.json({
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid message ID'
      });
    }

    res.status(500).json({
      message: 'Internal server error while marking message as read'
    });
  }
};

// Archive conversation
const archiveConversation = async (req, res) => {
  try {
    const { threadId } = req.params;

    // Update all messages in the thread for the current user
    await Message.updateMany(
      {
        threadId,
        $or: [
          { sender: req.user._id },
          { recipient: req.user._id }
        ]
      },
      { isArchived: true }
    );

    res.json({
      message: 'Conversation archived successfully'
    });
  } catch (error) {
    console.error('Archive conversation error:', error);
    res.status(500).json({
      message: 'Internal server error while archiving conversation'
    });
  }
};

// Report message as spam
const reportSpam = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only report messages sent to you.'
      });
    }

    await message.reportSpam(req.user._id, reason);

    res.json({
      message: 'Message reported as spam'
    });
  } catch (error) {
    console.error('Report spam error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid message ID'
      });
    }

    res.status(500).json({
      message: 'Internal server error while reporting spam'
    });
  }
};

// Get message statistics
const getMessageStats = async (req, res) => {
  try {
    const stats = await Message.getMessageStats(req.user._id);

    res.json({
      stats: stats[0] || {
        totalMessages: 0,
        unreadMessages: 0,
        totalConversations: 0
      }
    });
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      message: 'Internal server error while fetching message statistics'
    });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getConversationThread,
  replyToMessage,
  markAsRead,
  archiveConversation,
  reportSpam,
  getMessageStats
};