/**
 * Feedback Routes
 * Routes for feedback message generation and retrieval
 */

const express = require('express');
const feedbackController = require('../controllers/feedbackController');
// const { protect } = require('../middleware/authMiddleware'); 
// Uncomment to add authentication if needed

const router = express.Router();

/**
 * @route   POST /api/v1/feedback
 * @desc    Generate and store feedback messages
 * @access  Public (or Private if protect middleware is used)
 */
router.post('/', feedbackController.generateFeedback);

/**
 * @route   GET /api/v1/feedback
 * @desc    Get all feedback messages with pagination
 * @access  Public (or Private if protect middleware is used)
 */
router.get('/', feedbackController.getAllFeedback);

/**
 * @route   GET /api/v1/feedback/:id
 * @desc    Get a single feedback message by ID
 * @access  Public (or Private if protect middleware is used)
 */
router.get('/:id', feedbackController.getFeedbackById);

module.exports = router; 