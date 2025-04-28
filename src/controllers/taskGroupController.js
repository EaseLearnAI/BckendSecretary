/**
 * Task Group Controller
 * Handlers for task group related operations
 */

const TaskGroup = require('../models/TaskGroup');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Get all task groups with their tasks
 * @route GET /api/v1/task-groups
 * @access Private
 */
const getAllTaskGroups = async (req, res) => {
  try {
    // Find all task groups and populate with their tasks
    const taskGroups = await TaskGroup.find().populate('tasks');
    
    return successResponse(res, taskGroups);
  } catch (error) {
    logger.error(`Error getting task groups: ${error.message}`);
    return errorResponse(res, 'Failed to get task groups', 500);
  }
};

/**
 * Create a new task group
 * @route POST /api/v1/task-groups
 * @access Private
 */
const createTaskGroup = async (req, res) => {
  try {
    // Create new task group with data from request body
    const taskGroup = await TaskGroup.create({
      name: req.body.name,
    });
    
    return successResponse(res, taskGroup, 'Task group created successfully', 201);
  } catch (error) {
    logger.error(`Error creating task group: ${error.message}`);
    return errorResponse(res, 'Failed to create task group', 500);
  }
};

/**
 * Update a task group
 * @route PUT /api/v1/task-groups/:groupId
 * @access Private
 */
const updateTaskGroup = async (req, res) => {
  try {
    // Find task group by ID and update
    const taskGroup = await TaskGroup.findByIdAndUpdate(
      req.params.groupId,
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    
    // Check if task group exists
    if (!taskGroup) {
      return errorResponse(res, `Task group with ID ${req.params.groupId} not found`, 404);
    }
    
    return successResponse(res, taskGroup, 'Task group updated successfully');
  } catch (error) {
    logger.error(`Error updating task group: ${error.message}`);
    return errorResponse(res, 'Failed to update task group', 500);
  }
};

/**
 * Delete a task group
 * @route DELETE /api/v1/task-groups/:groupId
 * @access Private
 */
const deleteTaskGroup = async (req, res) => {
  try {
    // Find task group by ID
    const taskGroup = await TaskGroup.findById(req.params.groupId);
    
    // Check if task group exists
    if (!taskGroup) {
      return errorResponse(res, `Task group with ID ${req.params.groupId} not found`, 404);
    }
    
    // Delete the task group
    await taskGroup.deleteOne();
    
    // No content response for successful deletion
    return res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting task group: ${error.message}`);
    return errorResponse(res, 'Failed to delete task group', 500);
  }
};

/**
 * Get a single task group by ID
 * @route GET /api/v1/task-groups/:groupId
 * @access Private
 */
const getTaskGroup = async (req, res) => {
  try {
    // Find task group by ID and populate with tasks
    const taskGroup = await TaskGroup.findById(req.params.groupId).populate('tasks');
    
    // Check if task group exists
    if (!taskGroup) {
      return errorResponse(res, `Task group with ID ${req.params.groupId} not found`, 404);
    }
    
    return successResponse(res, taskGroup);
  } catch (error) {
    logger.error(`Error getting task group: ${error.message}`);
    return errorResponse(res, 'Failed to get task group', 500);
  }
};

module.exports = {
  getAllTaskGroups,
  createTaskGroup,
  updateTaskGroup,
  deleteTaskGroup,
  getTaskGroup,
}; 