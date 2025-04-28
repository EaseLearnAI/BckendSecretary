/**
 * Pomodoro Routes
 * Routes for managing pomodoro sessions
 */

const express = require('express');
const { 
  createPomodoroSession,
  getTaskPomodoroSessions,
  getPomodoroSession,
  updatePomodoroSession,
  deletePomodoroSession,
} = require('../controllers/pomodoroController');
const { protect } = require('../middleware/auth');
const { pomodoroValidators } = require('../middleware/validators');

const router = express.Router({ mergeParams: true });

// Apply authentication middleware to all routes
router.use(protect);

// Routes for /api/v1/tasks/:taskId/pomodoro
router
  .route('/')
  .get(getTaskPomodoroSessions)
  .post(pomodoroValidators.create, createPomodoroSession);

// Routes for /api/v1/tasks/:taskId/pomodoro/:sessionId
router
  .route('/:sessionId')
  .get(getPomodoroSession)
  .put(pomodoroValidators.create, updatePomodoroSession)
  .delete(deletePomodoroSession);

module.exports = router; 