/**
 * Main Routes Index
 * Aggregates and exports all API routes
 */

const express = require('express');
const taskGroupRoutes = require('./taskGroupRoutes');
const taskRoutes = require('./taskRoutes');
const pomodoroRoutes = require('./pomodoroRoutes');
const authRoutes = require('./authRoutes');
const habitRoutes = require('./habitRoutes');
const calendarRoutes = require('./calendarRoutes');
const assistantRoutes = require('./assistant');

const router = express.Router();

// API health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount the individual route files
router.use('/auth', authRoutes);
router.use('/task-groups', taskGroupRoutes);
router.use('/tasks', taskRoutes);
router.use('/habits', habitRoutes);
router.use('/calendar', calendarRoutes);
router.use('/assistant', assistantRoutes);

// Nested routes for pomodoro under tasks
router.use('/tasks/:taskId/pomodoro', pomodoroRoutes);

module.exports = router; 