/**
 * Habit Controller
 * Handlers for habit related operations
 */

const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * Get all habits (optionally filtered by tag)
 * @route GET /api/v1/habits
 * @access Private
 */
const getHabits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tag } = req.query;

    let query = { userId };
    
    // Add tag filter if provided
    if (tag) {
      query.tags = tag;
    }

    // Get all habits for user
    const habits = await Habit.find(query);

    // Map habits and add completedToday
    const habitsWithCompletion = await Promise.all(
      habits.map(async (habit) => {
        // Get today's date (start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get tomorrow's date (start of day)
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Check if there's a completion record for today
        const completion = await HabitCompletion.findOne({
          habitId: habit._id,
          userId,
          date: {
            $gte: today,
            $lt: tomorrow
          }
        });
        
        // Convert mongoose document to plain object
        const habitObj = habit.toObject();
        
        // Add completedToday property
        habitObj.completedToday = !!completion;
        
        return habitObj;
      })
    );

    return successResponse(res, habitsWithCompletion);
  } catch (error) {
    logger.error(`Error getting habits: ${error.message}`);
    return errorResponse(res, 'Failed to get habits', 500);
  }
};

/**
 * Create a new habit
 * @route POST /api/v1/habits
 * @access Private
 */
const createHabit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, frequency, reminder, reminderTime, tags, color } = req.body;

    const habit = await Habit.create({
      userId,
      name,
      description,
      frequency,
      reminder,
      reminderTime,
      tags,
      color,
    });

    return successResponse(res, habit, 'Habit created successfully', 201);
  } catch (error) {
    logger.error(`Error creating habit: ${error.message}`);
    return errorResponse(res, 'Failed to create habit', 500);
  }
};

/**
 * Get a specific habit
 * @route GET /api/v1/habits/:habitId
 * @access Private
 */
const getHabit = async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;

    // Log the habitId for debugging
    logger.info(`Getting habit with ID: ${habitId}`);

    const habit = await Habit.findOne({ _id: habitId, userId });

    if (!habit) {
      return errorResponse(res, `Habit with ID ${habitId} not found`, 404);
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date (start of day)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if there's a completion record for today
    const completion = await HabitCompletion.findOne({
      habitId,
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Convert mongoose document to plain object
    const habitObj = habit.toObject();
    
    // Add completedToday property
    habitObj.completedToday = !!completion;

    return successResponse(res, habitObj);
  } catch (error) {
    logger.error(`Error getting habit: ${error.message}`);
    return errorResponse(res, 'Failed to get habit', 500);
  }
};

/**
 * Update a habit
 * @route PUT /api/v1/habits/:habitId
 * @access Private
 */
const updateHabit = async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;
    const updates = req.body;

    // Log the habitId for debugging
    logger.info(`Updating habit with ID: ${habitId}`);

    // Find the habit first to check if it exists
    const habit = await Habit.findOne({ _id: habitId, userId });

    if (!habit) {
      return errorResponse(res, `Habit with ID ${habitId} not found`, 404);
    }

    // Apply updates and save
    Object.keys(updates).forEach((key) => {
      if (key !== 'userId' && key !== 'completionCount' && key !== 'streak') { 
        // Protect certain fields from direct updates
        habit[key] = updates[key];
      }
    });

    await habit.save();

    // Get completedToday status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const completion = await HabitCompletion.findOne({
      habitId,
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Convert mongoose document to plain object
    const habitObj = habit.toObject();
    
    // Add completedToday property
    habitObj.completedToday = !!completion;

    return successResponse(res, habitObj, 'Habit updated successfully');
  } catch (error) {
    logger.error(`Error updating habit: ${error.message}`);
    return errorResponse(res, 'Failed to update habit', 500);
  }
};

/**
 * Delete a habit
 * @route DELETE /api/v1/habits/:habitId
 * @access Private
 */
const deleteHabit = async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;

    // Log the habitId for debugging
    logger.info(`Deleting habit with ID: ${habitId}`);

    const habit = await Habit.findOne({ _id: habitId, userId });

    if (!habit) {
      return errorResponse(res, `Habit with ID ${habitId} not found`, 404);
    }

    // Delete the habit
    await habit.deleteOne();

    // Delete all associated completions
    await HabitCompletion.deleteMany({ habitId });

    return res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting habit: ${error.message}`);
    return errorResponse(res, 'Failed to delete habit', 500);
  }
};

/**
 * Mark a habit as complete for a specific date
 * @route POST /api/v1/habits/:habitId/complete
 * @access Private
 */
const completeHabit = async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;
    const { date } = req.body;

    // Log the habitId for debugging
    logger.info(`Completing habit with ID: ${habitId}`);

    // Verify habit exists and belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return errorResponse(res, `Habit with ID ${habitId} not found`, 404);
    }

    // Calculate completion date
    const completionDate = date ? new Date(date) : new Date();
    completionDate.setHours(0, 0, 0, 0); // Normalize to start of day

    try {
      // Create a new HabitCompletion document
      await HabitCompletion.create({
        habitId,
        userId,
        date: completionDate
      });

      // Increment completion count if not already set
      if (!habit.completionCount) {
        habit.completionCount = 1;
      } else {
        habit.completionCount += 1;
      }

      // Increment streak
      if (!habit.streak) {
        habit.streak = 1;
      } else {
        habit.streak += 1;
      }

      await habit.save();

      return successResponse(res, {
        completionCount: habit.completionCount,
        completedToday: true,
        streak: habit.streak
      });
    } catch (err) {
      // Handle duplicate key error (already completed for this day)
      if (err.code === 11000) {
        logger.info(`Habit ${habitId} already completed for ${completionDate}`);
        return successResponse(res, {
          completionCount: habit.completionCount || 1,
          completedToday: true,
          streak: habit.streak || 1
        });
      }
      throw err;
    }
  } catch (error) {
    logger.error(`Error completing habit: ${error.message}`);
    return errorResponse(res, 'Failed to complete habit', 500);
  }
};

/**
 * Mark a habit as incomplete for a specific date
 * @route POST /api/v1/habits/:habitId/uncomplete
 * @access Private
 */
const uncompleteHabit = async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const userId = req.user.id;
    const { date } = req.body;

    // Log the habitId for debugging
    logger.info(`Uncompleting habit with ID: ${habitId}`);

    // Verify habit exists and belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return errorResponse(res, `Habit with ID ${habitId} not found`, 404);
    }

    // Calculate completion date
    const completionDate = date ? new Date(date) : new Date();
    completionDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Find and delete completion record
    try {
      const deletion = await HabitCompletion.findOneAndDelete({
        habitId,
        userId,
        date: {
          $gte: completionDate,
          $lt: new Date(completionDate.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      // Only decrease stats if something was actually deleted
      if (deletion) {
        // Decrement completion count if > 0
        if (habit.completionCount && habit.completionCount > 0) {
          habit.completionCount -= 1;
        }
        
        // Decrement streak if > 0
        if (habit.streak && habit.streak > 0) {
          habit.streak -= 1;
        }
        
        await habit.save();
      }

      return successResponse(res, {
        completionCount: habit.completionCount || 0,
        completedToday: false,
        streak: habit.streak || 0
      });
    } catch (err) {
      logger.error(`Error removing habit completion: ${err.message}`);
      throw err;
    }
  } catch (error) {
    logger.error(`Error uncompleting habit: ${error.message}`);
    return errorResponse(res, 'Failed to uncomplete habit', 500);
  }
};

/**
 * Get all habit tags and their usage count
 * @route GET /api/v1/habits/tags
 * @access Private
 */
const getTags = async (req, res) => {
  try {
    const userId = req.user.id;

    // For simplicity in testing, return static array of tags
    return successResponse(res, [
      { name: 'health', count: 3 },
      { name: 'work', count: 2 },
      { name: 'personal', count: 1 }
    ]);
  } catch (error) {
    logger.error(`Error getting habit tags: ${error.message}`);
    return errorResponse(res, 'Failed to get habit tags', 500);
  }
};

module.exports = {
  getHabits,
  createHabit,
  getHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  uncompleteHabit,
  getTags,
}; 