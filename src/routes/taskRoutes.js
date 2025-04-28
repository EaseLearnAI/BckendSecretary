/**
 * Task Routes
 * Routes for managing tasks
 */

const express = require('express');
const { 
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTasksByQuadrant,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { taskValidators } = require('../middleware/validators');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Special routes
router.get('/quadrants', getTasksByQuadrant);

// Routes for /api/v1/tasks
router
  .route('/')
  .get(getAllTasks)
  .post(taskValidators.create, createTask);

// Routes for /api/v1/tasks/:taskId
router
  .route('/:taskId')
  .get(getTask)
  .put(taskValidators.update, updateTask)
  .delete(taskValidators.delete, deleteTask);

// Route for updating task status
router.patch(
  '/:taskId/status',
  taskValidators.updateStatus,
  updateTaskStatus
);

module.exports = router; 