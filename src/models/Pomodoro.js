/**
 * Pomodoro Session Model
 * Represents a time tracking session for a task
 */

const mongoose = require('mongoose');

const pomodoroSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Pomodoro session must be linked to a task'],
    },
    duration: {
      type: Number,
      required: [true, 'Session duration is required'],
      min: [1, 'Duration must be at least 1 second'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Add validation to ensure endTime is after startTime
pomodoroSchema.pre('validate', function (next) {
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    this.invalidate('endTime', 'End time must be after start time');
  }
  next();
});

// Add index for improved query performance
pomodoroSchema.index({ taskId: 1 });
pomodoroSchema.index({ startTime: 1 });

module.exports = mongoose.model('Pomodoro', pomodoroSchema); 