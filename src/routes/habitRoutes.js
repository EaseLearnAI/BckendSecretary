/**
 * Habit Routes
 * Routes for habit management
 */

const express = require('express');
const { protect } = require('../middleware/auth');
const habitController = require('../controllers/habitController');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all habits or filter by date
router.get('/', habitController.getHabits);

// Create a new habit
router.post('/', habitController.createHabit);

// Get habit tags
router.get('/tags', habitController.getTags);

// Get, update, delete a specific habit
router.route('/:habitId')
  .get(habitController.getHabit)
  .put(habitController.updateHabit)
  .delete(habitController.deleteHabit);

// Mark a habit as complete or incomplete
router.post('/:habitId/complete', habitController.completeHabit);
router.post('/:habitId/uncomplete', habitController.uncompleteHabit);

module.exports = router; 