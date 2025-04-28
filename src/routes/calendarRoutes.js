/**
 * Calendar Routes
 * Routes for calendar task management
 */

const express = require('express');
const { protect } = require('../middleware/auth');
const calendarController = require('../controllers/calendarController');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all calendar tasks or filter by date range
router.get('/tasks', calendarController.getCalendarTasks);

// Create a new calendar task
router.post('/tasks', calendarController.createCalendarTask);

// Get, update, delete a specific calendar task
router.route('/tasks/:taskId')
  .get(calendarController.getCalendarTask)
  .put(calendarController.updateCalendarTask)
  .delete(calendarController.deleteCalendarTask);

module.exports = router; 