/**
 * Calendar Task Model
 * Represents a task in the calendar view
 */

const mongoose = require('mongoose');

const calendarTaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '任务必须关联用户'],
    },
    name: {
      type: String,
      required: [true, '任务名称不能为空'],
      trim: true,
      maxlength: [200, '任务名称不能超过200个字符'],
    },
    date: {
      type: Date,
      required: [true, '任务日期不能为空'],
    },
    timeRange: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: 'default-icon',
    },
    color: {
      type: String,
      default: '#4a69bd',
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for improved query performance
calendarTaskSchema.index({ userId: 1, date: 1 });
calendarTaskSchema.index({ date: 1 });

module.exports = mongoose.model('CalendarTask', calendarTaskSchema); 