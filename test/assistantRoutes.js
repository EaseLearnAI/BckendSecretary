/**
 * Assistant Routes
 * Routes for AI assistant functionality
 */

const express = require('express');
const { protect } = require('../middleware/auth');
const assistantController = require('../controllers/assistantController');
const { assistantValidators } = require('../middleware/validators');

const router = express.Router();

// Protect all routes
router.use(protect);

// Save user message
router.post(
  '/conversations', 
  assistantValidators.saveConversation, 
  assistantController.saveConversation
);

// Save AI response
router.post(
  '/responses', 
  assistantValidators.saveConversation, 
  assistantController.saveResponse
);

// Get conversation history
router.get(
  '/conversations/:userId', 
  assistantValidators.getConversations, 
  assistantController.getConversations
);

// Delete conversation message
router.delete(
  '/conversations/:id', 
  assistantController.deleteConversation
);

// Analyze input for entities
router.post(
  '/analyze', 
  assistantValidators.analyze, 
  assistantController.analyzeInput
);

module.exports = router; 