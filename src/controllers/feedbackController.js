/**
 * Feedback Controller
 * Handles HTTP requests for generating and storing feedback messages
 */

const FeedbackMessage = require('../models/FeedbackMessage');
const feedbackService = require('../services/feedbackService');
const logger = require('../utils/logger');

/**
 * Generate feedback messages (encouragement and criticism)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function generateFeedback(req, res) {
  try {
    const { userInput, encourageStyle, criticizeStyle } = req.body;
    
    // Validate required fields
    if (!userInput || !encourageStyle || !criticizeStyle) {
      return res.status(400).json({
        success: false,
        message: '用户输入、鼓励风格和批评风格为必填项'
      });
    }
    
    // Log incoming request
    logger.info('Received feedback generation request', { userInput, encourageStyle, criticizeStyle });
    
    // Start timer for performance monitoring
    const startTime = Date.now();
    
    // Generate feedback using the LLM service
    const result = await feedbackService.generateFeedback(userInput, encourageStyle, criticizeStyle);
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Create and save to database
    const feedback = new FeedbackMessage({
      userInput,
      encourageStyle,
      criticizeStyle,
      encourageMessage: result.encourage,
      criticizeMessage: result.criticize,
      rawResponse: result.rawResponse,
      tokenUsage: result.tokenUsage,
      processingTime,
      // If authentication is implemented, add userId: req.user._id
    });
    
    // Save to MongoDB
    await feedback.save();
    
    // Log successful operation
    logger.info('Feedback generated and saved successfully', { 
      feedbackId: feedback._id,
      processingTime
    });
    
    // Return response
    return res.status(201).json({
      success: true,
      data: {
        encourage: result.encourage,
        criticize: result.criticize,
        id: feedback._id,
      },
      meta: {
        processingTime,
        tokenUsage: result.tokenUsage,
      }
    });
  } catch (error) {
    logger.error('Error in generateFeedback controller', { 
      error: error.message, 
      stack: error.stack 
    });
    
    return res.status(500).json({
      success: false,
      message: '生成反馈信息时出错',
      error: error.message
    });
  }
}

/**
 * Get all feedback messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function getAllFeedback(req, res) {
  try {
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Query with basic filtering and sorting
    const feedbacks = await FeedbackMessage.find()
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);
    
    const total = await FeedbackMessage.countDocuments();
    
    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: feedbacks
    });
  } catch (error) {
    logger.error('Error getting all feedback', { error: error.message });
    
    return res.status(500).json({
      success: false,
      message: '获取反馈信息列表失败',
      error: error.message
    });
  }
}

/**
 * Get a single feedback message by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function getFeedbackById(req, res) {
  try {
    const feedback = await FeedbackMessage.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '未找到反馈信息'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error('Error getting feedback by ID', { 
      error: error.message,
      feedbackId: req.params.id
    });
    
    return res.status(500).json({
      success: false,
      message: '获取反馈信息失败',
      error: error.message
    });
  }
}

module.exports = {
  generateFeedback,
  getAllFeedback,
  getFeedbackById
}; 