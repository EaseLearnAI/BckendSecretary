/**
 * Assistant Controller
 * Handles operations related to the AI assistant including:
 * - Saving user conversations
 * - Saving AI responses
 * - Retrieving conversation history
 * - Deleting conversation messages
 * - Analyzing user input for entities
 */

const AssistantConversation = require('../models/AssistantConversation');
const logger = require('../utils/logger');

/**
 * Save a user message to the conversation history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const saveConversation = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: 'User ID and message are required' });
    }

    const conversation = new AssistantConversation({
      userId,
      message,
      type: 'user'
    });

    await conversation.save();
    
    logger.info(`User message saved: ${conversation._id}`);
    return res.status(201).json({ 
      success: true, 
      data: conversation 
    });
  } catch (error) {
    logger.error(`Error saving user message: ${error.message}`);
    return res.status(500).json({ 
      message: 'Error saving conversation', 
      error: error.message 
    });
  }
};

/**
 * Save an AI response to the conversation history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const saveResponse = async (req, res) => {
  try {
    const { userId, message, cards } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: 'User ID and message are required' });
    }

    const response = new AssistantConversation({
      userId,
      message,
      type: 'ai',
      cards: cards || { events: [], tasks: [], habits: [] }
    });

    await response.save();
    
    logger.info(`AI response saved: ${response._id}`);
    return res.status(201).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    logger.error(`Error saving AI response: ${error.message}`);
    return res.status(500).json({ 
      message: 'Error saving AI response', 
      error: error.message 
    });
  }
};

/**
 * Get conversation history for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { since } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    let query = { userId };
    
    // Add timestamp filter if 'since' parameter is provided
    if (since) {
      const sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format for "since" parameter' });
      }
      query.timestamp = { $gte: sinceDate };
    }

    const conversations = await AssistantConversation.find(query)
      .sort({ timestamp: -1 })
      .lean();

    logger.info(`Retrieved ${conversations.length} conversations for user ${userId}`);
    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    logger.error(`Error retrieving conversations: ${error.message}`);
    return res.status(500).json({
      message: 'Error retrieving conversations',
      error: error.message
    });
  }
};

/**
 * Delete a specific conversation message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!id || !userId) {
      return res.status(400).json({ message: 'Conversation ID and User ID are required' });
    }

    // Find conversation and check user ownership
    const conversation = await AssistantConversation.findById(id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Verify the conversation belongs to the user
    if (conversation.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this conversation' });
    }

    await AssistantConversation.findByIdAndDelete(id);
    
    logger.info(`Conversation deleted: ${id}`);
    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting conversation: ${error.message}`);
    return res.status(500).json({
      message: 'Error deleting conversation',
      error: error.message
    });
  }
};

/**
 * Analyze user input to extract entities like dates, times, events, tasks, and habits
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const analyzeInput = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required for analysis' });
    }

    // Regular expressions for date and time detection
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/g;
    const timeRegex = /(\d{1,2}:\d{2}(?:am|pm)?)/gi;

    // Extract dates and times from the message
    const dates = message.match(dateRegex) || [];
    const times = message.match(timeRegex) || [];

    // Mock implementation for event detection
    // In a real implementation, this would use NLP or other AI techniques
    const events = [];
    if (message.toLowerCase().includes('meeting') || 
        message.toLowerCase().includes('appointment') ||
        message.toLowerCase().includes('event')) {
      // Simple event extraction based on keywords
      events.push({
        type: 'event',
        dates,
        times,
        detected: true
      });
    }

    // Mock implementation for task detection
    const tasks = [];
    if (message.toLowerCase().includes('task') || 
        message.toLowerCase().includes('todo') ||
        message.toLowerCase().includes('reminder')) {
      // Simple task extraction based on keywords
      tasks.push({
        type: 'task',
        dates: dates.length > 0 ? dates : [],
        detected: true
      });
    }

    // Mock implementation for habit detection
    const habits = [];
    if (message.toLowerCase().includes('habit') || 
        message.toLowerCase().includes('daily') ||
        message.toLowerCase().includes('routine')) {
      // Simple habit extraction based on keywords
      habits.push({
        type: 'habit',
        detected: true
      });
    }

    const analysis = {
      dates,
      times,
      entities: {
        events,
        tasks,
        habits
      }
    };

    logger.info(`Input analysis completed for message`);
    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error(`Error analyzing input: ${error.message}`);
    return res.status(500).json({
      message: 'Error analyzing input',
      error: error.message
    });
  }
};

module.exports = {
  saveConversation,
  saveResponse,
  getConversations,
  deleteConversation,
  analyzeInput
}; 