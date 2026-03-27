const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getConversationThread,
  replyToMessage,
  markAsRead,
  archiveConversation,
  reportSpam,
  getMessageStats
} = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

// All message routes require authentication
router.use(auth);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/stats', getMessageStats);
router.get('/thread/:threadId', getConversationThread);
router.post('/thread/:threadId/reply', replyToMessage);
router.patch('/:id/read', markAsRead);
router.patch('/thread/:threadId/archive', archiveConversation);
router.post('/:id/report-spam', reportSpam);

module.exports = router;