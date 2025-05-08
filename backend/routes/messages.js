const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Pin = require('../models/Pin');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', protect, asyncHandler(async (req, res, next) => {
  const { recipientId, content, pinId } = req.body;
  
  // Validate recipient
  const recipient = await User.findById(recipientId);
  
  if (!recipient) {
    return next(new ErrorResponse(`User not found with id of ${recipientId}`, 404));
  }
  
  // Validate pin if provided
  let pin = null;
  if (pinId) {
    pin = await Pin.findById(pinId);
    if (!pin) {
      return next(new ErrorResponse(`Pin not found with id of ${pinId}`, 404));
    }
  }
  
  // Check if conversation already exists between these users
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user.id, recipientId] }
  });
  
  // If no conversation exists, create one
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user.id, recipientId],
      lastMessage: content,
      lastMessageDate: Date.now()
    });
  } else {
    // Update conversation with last message
    conversation.lastMessage = content;
    conversation.lastMessageDate = Date.now();
    await conversation.save();
  }
  
  // Create message
  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user.id,
    recipient: recipientId,
    content,
    pin: pinId || null
  });
  
  // Populate message with sender and pin info
  await message.populate('sender', 'username profileImage');
  if (pinId) {
    await message.populate('pin', 'title thumbnail price');
  }
  
  res.status(201).json({
    success: true,
    data: message
  });
}));

// @route   GET /api/messages/conversations
// @desc    Get all user's conversations
// @access  Private
router.get('/conversations', protect, asyncHandler(async (req, res, next) => {
  const conversations = await Conversation.find({
    participants: req.user.id
  })
    .populate({
      path: 'participants',
      select: 'username profileImage',
      match: { _id: { $ne: req.user.id } } // Only populate the other participant
    })
    .sort({ lastMessageDate: -1 });
  
  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations
  });
}));

// @route   GET /api/messages/conversations/:id
// @desc    Get messages for a conversation
// @access  Private
router.get('/conversations/:id', protect, asyncHandler(async (req, res, next) => {
  // Find conversation
  const conversation = await Conversation.findById(req.params.id)
    .populate({
      path: 'participants',
      select: 'username profileImage'
    });
  
  if (!conversation) {
    return next(new ErrorResponse(`Conversation not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user is part of the conversation
  if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
    return next(new ErrorResponse('Not authorized to access this conversation', 401));
  }
  
  // Get messages for this conversation with pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const startIndex = (page - 1) * limit;
  
  const total = await Message.countDocuments({ conversation: req.params.id });
  const messages = await Message.find({ conversation: req.params.id })
    .populate('sender', 'username profileImage')
    .populate('pin', 'title thumbnail price')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Mark messages as read if user is recipient
  await Message.updateMany(
    { 
      conversation: req.params.id,
      recipient: req.user.id,
      read: false
    },
    { read: true }
  );
  
  res.status(200).json({
    success: true,
    count: messages.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: {
      conversation,
      messages: messages.reverse() // Return in chronological order
    }
  });
}));

// @route   GET /api/messages/unread
// @desc    Get count of unread messages
// @access  Private
router.get('/unread', protect, asyncHandler(async (req, res, next) => {
  const count = await Message.countDocuments({
    recipient: req.user.id,
    read: false
  });
  
  res.status(200).json({
    success: true,
    data: { count }
  });
}));

// @route   DELETE /api/messages/:id
// @desc    Delete a message (marks as deleted for the user)
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);
  
  if (!message) {
    return next(new ErrorResponse(`Message not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user is sender or recipient
  if (
    message.sender.toString() !== req.user.id &&
    message.recipient.toString() !== req.user.id
  ) {
    return next(new ErrorResponse('Not authorized to delete this message', 401));
  }
  
  // Set deleted flag for the appropriate user
  if (message.sender.toString() === req.user.id) {
    message.deletedBySender = true;
  }
  
  if (message.recipient.toString() === req.user.id) {
    message.deletedByRecipient = true;
  }
  
  // If deleted by both, actually remove the message
  if (message.deletedBySender && message.deletedByRecipient) {
    await message.remove();
  } else {
    await message.save();
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
}));

module.exports = router;