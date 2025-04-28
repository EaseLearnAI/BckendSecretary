/**
 * Task Group Routes
 * Routes for managing task groups
 */

const express = require('express');
const { 
  getAllTaskGroups,
  getTaskGroup,
  createTaskGroup,
  updateTaskGroup,
  deleteTaskGroup,
} = require('../controllers/taskGroupController');
const { protect } = require('../middleware/auth');
const { taskGroupValidators } = require('../middleware/validators');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes for /api/v1/task-groups
router
  .route('/')
  .get(getAllTaskGroups)
  .post(taskGroupValidators.create, createTaskGroup);

// Routes for /api/v1/task-groups/:groupId
router
  .route('/:groupId')
  .get(getTaskGroup)
  .put(taskGroupValidators.update, updateTaskGroup)
  .delete(taskGroupValidators.delete, deleteTaskGroup);

module.exports = router; 