/**
 * Task Model
 * Represents an individual task in the task management system
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '任务名称不能为空'],
      trim: true,
      maxlength: [200, '任务名称不能超过200个字符'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaskGroup',
      required: [true, '任务必须属于一个任务集'],
    },
    // For importance-urgency quadrant
    isImportant: {
      type: Boolean,
      default: false,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to get group name
taskSchema.virtual('groupName').get(function () {
  if (this.populated('groupId')) {
    return this.groupId.name;
  }
  return null;
});

// Add index for improved query performance
taskSchema.index({ groupId: 1 });
taskSchema.index({ completed: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema); 