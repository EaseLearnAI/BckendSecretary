/**
 * Task Group Model
 * Represents a collection or category of tasks
 */

const mongoose = require('mongoose');

const taskGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '任务集名称不能为空'],
      trim: true,
      maxlength: [100, '任务集名称不能超过100个字符'],
    },
  },
  {
    timestamps: true,
    // Virtual populate of tasks that belong to this group
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for tasks in this group
taskGroupSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'groupId',
  justOne: false,
});

module.exports = mongoose.model('TaskGroup', taskGroupSchema); 