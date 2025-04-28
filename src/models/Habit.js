/**
 * Habit Model
 * Represents a habit for tracking regular activities
 */

const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '习惯必须关联用户'],
    },
    name: {
      type: String,
      required: [true, '习惯名称不能为空'],
      trim: true,
      maxlength: [100, '习惯名称不能超过100个字符'],
    },
    icon: {
      type: String,
      default: 'default-habit-icon',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    completionCount: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '#4a69bd',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to check if habit is completed today
habitSchema.virtual('completedToday').get(async function() {
  const HabitCompletion = mongoose.model('HabitCompletion');
  
  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get tomorrow's date (start of day)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if there's a completion record for today
  const completion = await HabitCompletion.findOne({
    habitId: this._id,
    date: {
      $gte: today,
      $lt: tomorrow
    }
  });
  
  return !!completion;
});

// Add indexes for improved query performance
habitSchema.index({ userId: 1 });
habitSchema.index({ userId: 1, tags: 1 });

module.exports = mongoose.model('Habit', habitSchema); 