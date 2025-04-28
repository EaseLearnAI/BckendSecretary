/**
 * Pomodoro Controller
 * Handlers for pomodoro session related operations
 */

const Pomodoro = require('../models/Pomodoro');
const Task = require('../models/Task');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Create a new pomodoro session
 * @route POST /api/v1/tasks/:taskId/pomodoro
 * @access Private
 */
const createPomodoroSession = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return errorResponse(res, `Task with ID ${taskId} not found`, 404);
    }
    
    // Create new pomodoro session
    const pomodoro = await Pomodoro.create({
      taskId,
      duration: req.body.duration,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      notes: req.body.notes || '',
    });
    
    return successResponse(res, pomodoro, 'Pomodoro session logged successfully', 201);
  } catch (error) {
    logger.error(`Error creating pomodoro session: ${error.message}`);
    return errorResponse(res, 'Failed to create pomodoro session', 500);
  }
};

/**
 * Get all pomodoro sessions for a task
 * @route GET /api/v1/tasks/:taskId/pomodoro
 * @access Private
 */
const getTaskPomodoroSessions = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return errorResponse(res, `Task with ID ${taskId} not found`, 404);
    }
    
    // Find all pomodoro sessions for the task
    const sessions = await Pomodoro.find({ taskId }).sort({ startTime: -1 });
    
    return successResponse(res, sessions);
  } catch (error) {
    logger.error(`Error getting pomodoro sessions: ${error.message}`);
    return errorResponse(res, 'Failed to get pomodoro sessions', 500);
  }
};

/**
 * Get a specific pomodoro session
 * @route GET /api/v1/tasks/:taskId/pomodoro/:sessionId
 * @access Private
 */
const getPomodoroSession = async (req, res) => {
  try {
    const { taskId, sessionId } = req.params;
    
    // Find the pomodoro session
    const session = await Pomodoro.findOne({
      _id: sessionId,
      taskId,
    });
    
    // Check if session exists
    if (!session) {
      return errorResponse(res, `Pomodoro session not found`, 404);
    }
    
    return successResponse(res, session);
  } catch (error) {
    logger.error(`Error getting pomodoro session: ${error.message}`);
    return errorResponse(res, 'Failed to get pomodoro session', 500);
  }
};

/**
 * Update a pomodoro session
 * @route PUT /api/v1/tasks/:taskId/pomodoro/:sessionId
 * @access Private
 */
const updatePomodoroSession = async (req, res) => {
  try {
    const { taskId, sessionId } = req.params;
    
    // Find and update the pomodoro session
    const session = await Pomodoro.findOneAndUpdate(
      {
        _id: sessionId,
        taskId,
      },
      {
        duration: req.body.duration,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        notes: req.body.notes,
      },
      { new: true, runValidators: true }
    );
    
    // Check if session exists
    if (!session) {
      return errorResponse(res, `Pomodoro session not found`, 404);
    }
    
    return successResponse(res, session, 'Pomodoro session updated successfully');
  } catch (error) {
    logger.error(`Error updating pomodoro session: ${error.message}`);
    return errorResponse(res, 'Failed to update pomodoro session', 500);
  }
};

/**
 * Delete a pomodoro session
 * @route DELETE /api/v1/tasks/:taskId/pomodoro/:sessionId
 * @access Private
 */
const deletePomodoroSession = async (req, res) => {
  try {
    const { taskId, sessionId } = req.params;
    
    // Find the pomodoro session
    const session = await Pomodoro.findOne({
      _id: sessionId,
      taskId,
    });
    
    // Check if session exists
    if (!session) {
      return errorResponse(res, `Pomodoro session not found`, 404);
    }
    
    // Delete the session
    await session.deleteOne();
    
    // No content response for successful deletion
    return res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting pomodoro session: ${error.message}`);
    return errorResponse(res, 'Failed to delete pomodoro session', 500);
  }
};

module.exports = {
  createPomodoroSession,
  getTaskPomodoroSessions,
  getPomodoroSession,
  updatePomodoroSession,
  deletePomodoroSession,
}; 