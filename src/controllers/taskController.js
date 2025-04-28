/**
 * Task Controller
 * Handlers for task related operations
 */

const Task = require('../models/Task');
const TaskGroup = require('../models/TaskGroup');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Get all tasks (flat list across all groups)
 * @route GET /api/v1/tasks
 * @access Private
 */
const getAllTasks = async (req, res) => {
  try {
    // Find all tasks and populate with group info
    const tasks = await Task.find().populate('groupId', 'name');
    
    return successResponse(res, tasks);
  } catch (error) {
    logger.error(`Error getting tasks: ${error.message}`);
    return errorResponse(res, 'Failed to get tasks', 500);
  }
};

/**
 * Create a new task
 * @route POST /api/v1/tasks
 * @access Private
 */
const createTask = async (req, res) => {
  try {
    // Check if the group exists
    const group = await TaskGroup.findById(req.body.groupId);
    if (!group) {
      return errorResponse(res, `Task group with ID ${req.body.groupId} not found`, 404);
    }
    
    // Create new task with data from request body
    const task = await Task.create({
      name: req.body.name,
      groupId: req.body.groupId,
      priority: req.body.priority || 'medium',
      dueDate: req.body.dueDate || null,
      isImportant: req.body.isImportant || false,
      isUrgent: req.body.isUrgent || false,
    });
    
    // Populate the group info for response
    await task.populate('groupId', 'name');
    
    return successResponse(res, task, 'Task created successfully', 201);
  } catch (error) {
    logger.error(`Error creating task: ${error.message}`);
    return errorResponse(res, 'Failed to create task', 500);
  }
};

/**
 * Get a single task by ID
 * @route GET /api/v1/tasks/:taskId
 * @access Private
 */
const getTask = async (req, res) => {
  try {
    // Find task by ID and populate with group info
    const task = await Task.findById(req.params.taskId).populate('groupId', 'name');
    
    // Check if task exists
    if (!task) {
      return errorResponse(res, `Task with ID ${req.params.taskId} not found`, 404);
    }
    
    return successResponse(res, task);
  } catch (error) {
    logger.error(`Error getting task: ${error.message}`);
    return errorResponse(res, 'Failed to get task', 500);
  }
};

/**
 * Update a task
 * @route PUT /api/v1/tasks/:taskId
 * @access Private
 */
const updateTask = async (req, res) => {
  try {
    // Find task by ID
    let task = await Task.findById(req.params.taskId);
    
    // Check if task exists
    if (!task) {
      return errorResponse(res, `Task with ID ${req.params.taskId} not found`, 404);
    }
    
    // Update fields from request body
    task.name = req.body.name || task.name;
    task.completed = req.body.completed !== undefined ? req.body.completed : task.completed;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate !== undefined ? req.body.dueDate : task.dueDate;
    task.isImportant = req.body.isImportant !== undefined ? req.body.isImportant : task.isImportant;
    task.isUrgent = req.body.isUrgent !== undefined ? req.body.isUrgent : task.isUrgent;
    
    // Save updated task
    await task.save();
    
    // Populate the group info for response
    await task.populate('groupId', 'name');
    
    return successResponse(res, task, 'Task updated successfully');
  } catch (error) {
    logger.error(`Error updating task: ${error.message}`);
    return errorResponse(res, 'Failed to update task', 500);
  }
};

/**
 * Update task status (completed)
 * @route PATCH /api/v1/tasks/:taskId/status
 * @access Private
 */
const updateTaskStatus = async (req, res) => {
  try {
    // Find and update task status
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { completed: req.body.completed },
      { new: true, runValidators: true }
    );
    
    // Check if task exists
    if (!task) {
      return errorResponse(res, `Task with ID ${req.params.taskId} not found`, 404);
    }
    
    // Return minimal response with just id and completed status
    return successResponse(res, {
      id: task._id,
      completed: task.completed,
    });
  } catch (error) {
    logger.error(`Error updating task status: ${error.message}`);
    return errorResponse(res, 'Failed to update task status', 500);
  }
};

/**
 * Delete a task
 * @route DELETE /api/v1/tasks/:taskId
 * @access Private
 */
const deleteTask = async (req, res) => {
  try {
    // Find task by ID
    const task = await Task.findById(req.params.taskId);
    
    // Check if task exists
    if (!task) {
      return errorResponse(res, `Task with ID ${req.params.taskId} not found`, 404);
    }
    
    // Delete the task
    await task.deleteOne();
    
    // No content response for successful deletion
    return res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting task: ${error.message}`);
    return errorResponse(res, 'Failed to delete task', 500);
  }
};

/**
 * Get tasks organized by quadrant (importance/urgency)
 * @route GET /api/v1/tasks/quadrants
 * @access Private
 */
const getTasksByQuadrant = async (req, res) => {
  try {
    // Get all tasks and populate with group info
    const tasks = await Task.find().populate('groupId', 'name');
    
    // Organize tasks by quadrant
    const quadrants = {
      q1: tasks.filter(task => task.isImportant && task.isUrgent),     // Important & Urgent
      q2: tasks.filter(task => task.isImportant && !task.isUrgent),    // Important & Not Urgent
      q3: tasks.filter(task => !task.isImportant && task.isUrgent),    // Not Important & Urgent
      q4: tasks.filter(task => !task.isImportant && !task.isUrgent),   // Not Important & Not Urgent
    };
    
    return successResponse(res, quadrants);
  } catch (error) {
    logger.error(`Error getting tasks by quadrant: ${error.message}`);
    return errorResponse(res, 'Failed to get tasks by quadrant', 500);
  }
};

module.exports = {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTasksByQuadrant,
}; 