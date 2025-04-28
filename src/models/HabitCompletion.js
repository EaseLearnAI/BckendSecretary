/**
 * Habit Completion Model
 * Represents a record of habit completion for a specific date
 */

const mongoose = require('mongoose');

const habitCompletionSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: [true, '必须关联习惯ID'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '必须关联用户ID'],
    },
    date: {
      type: Date,
      required: [true, '完成日期不能为空'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure that each habit can only be completed once per day for a user
habitCompletionSchema.index(
  { habitId: 1, date: 1, userId: 1 },
  { unique: true }
);

// Add other indexes for query performance
habitCompletionSchema.index({ habitId: 1, date: 1 });
habitCompletionSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('HabitCompletion', habitCompletionSchema); 