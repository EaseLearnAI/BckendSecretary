/**
 * Request validators
 * Input validation using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Validate request against defined rules
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Object|void} Error response or next middleware
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = {};
    errors.array().forEach((error) => {
      errorDetails[error.path] = error.msg;
    });
    return errorResponse(res, 'Validation failed', 400, errorDetails);
  }
  next();
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Task Group Validators
const taskGroupValidators = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('任务集名称不能为空')
      .isLength({ max: 100 })
      .withMessage('任务集名称不能超过100个字符'),
    validateRequest,
  ],
  update: [
    param('groupId')
      .custom((value) => isValidObjectId(value))
      .withMessage('Invalid task group ID'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('任务集名称不能为空')
      .isLength({ max: 100 })
      .withMessage('任务集名称不能超过100个字符'),
    validateRequest,
  ],
  delete: [
    param('groupId')
      .custom((value) => isValidObjectId(value))
      .withMessage('Invalid task group ID'),
    validateRequest,
  ],
};

// Task Validators
const taskValidators = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('任务名称不能为空')
      .isLength({ max: 200 })
      .withMessage('任务名称不能超过200个字符'),
    body('groupId')
      .notEmpty()
      .withMessage('任务必须属于一个任务集')
      .custom((value) => isValidObjectId(value))
      .withMessage('无效的任务集ID'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('优先级必须是 low, medium 或 high'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('到期日期必须是有效的日期格式'),
    body('isImportant')
      .optional()
      .isBoolean()
      .withMessage('isImportant 必须是布尔值'),
    body('isUrgent')
      .optional()
      .isBoolean()
      .withMessage('isUrgent 必须是布尔值'),
    validateRequest,
  ],
  update: [
    param('taskId')
      .custom((value) => isValidObjectId(value))
      .withMessage('Invalid task ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('任务名称不能为空')
      .isLength({ max: 200 })
      .withMessage('任务名称不能超过200个字符'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('优先级必须是 low, medium 或 high'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('到期日期必须是有效的日期格式'),
    body('isImportant')
      .optional()
      .isBoolean()
      .withMessage('isImportant 必须是布尔值'),
    body('isUrgent')
      .optional()
      .isBoolean()
      .withMessage('isUrgent 必须是布尔值'),
    validateRequest,
  ],
  updateStatus: [
    param('taskId')
      .custom((value) => isValidObjectId(value))
      .withMessage('Invalid task ID'),
    body('completed')
      .isBoolean()
      .withMessage('completed 必须是布尔值'),
    validateRequest,
  ],
  delete: [
    param('taskId')
      .custom((value) => isValidObjectId(value))
      .withMessage('Invalid task ID'),
    validateRequest,
  ],
};

// Pomodoro Validators
const pomodoroValidators = {
  create: [
    param('taskId')
      .custom((value) => isValidObjectId(value))
      .withMessage('Invalid task ID'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive number'),
    body('startTime')
      .isISO8601()
      .withMessage('开始时间必须是有效的日期格式'),
    body('endTime')
      .isISO8601()
      .withMessage('结束时间必须是有效的日期格式')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startTime)) {
          throw new Error('结束时间必须晚于开始时间');
        }
        return true;
      }),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('备注不能超过500个字符'),
    validateRequest,
  ],
};

// Auth Validators
const authValidators = {
  register: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('用户名不能为空'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('邮箱不能为空')
      .isEmail()
      .withMessage('邮箱格式不正确')
      .normalizeEmail(),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('密码不能为空')
      .isLength({ min: 6 })
      .withMessage('密码长度至少6个字符'),
    validateRequest,
  ],
  login: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('邮箱不能为空')
      .isEmail()
      .withMessage('邮箱格式不正确'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('密码不能为空'),
    validateRequest,
  ],
  updateDetails: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('用户名不能为空'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('邮箱不能为空')
      .isEmail()
      .withMessage('邮箱格式不正确'),
    validateRequest,
  ],
  updatePassword: [
    body('currentPassword')
      .trim()
      .notEmpty()
      .withMessage('当前密码不能为空'),
    body('newPassword')
      .trim()
      .notEmpty()
      .withMessage('新密码不能为空')
      .isLength({ min: 6 })
      .withMessage('新密码长度至少6个字符'),
    validateRequest,
  ],
};

// Calendar Task Validators
const calendarTaskValidators = {
  getTasks: [
    query('date')
      .optional()
      .isISO8601()
      .withMessage('日期格式必须是有效的ISO格式'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('开始日期格式必须是有效的ISO格式'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('结束日期格式必须是有效的ISO格式')
      .custom((value, { req }) => {
        if (req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
          throw new Error('结束日期必须晚于开始日期');
        }
        return true;
      }),
    validateRequest,
  ],
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('任务名称不能为空')
      .isLength({ max: 200 })
      .withMessage('任务名称不能超过200个字符'),
    body('date')
      .isISO8601()
      .withMessage('日期格式必须是有效的ISO格式'),
    body('timeRange')
      .optional()
      .isString()
      .withMessage('时间范围必须是字符串格式'),
    body('icon')
      .optional()
      .isString()
      .withMessage('图标必须是字符串格式'),
    body('color')
      .optional()
      .isString()
      .withMessage('颜色必须是字符串格式'),
    validateRequest,
  ],
  update: [
    param('taskId')
      .custom((value) => isValidObjectId(value))
      .withMessage('无效的任务ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('任务名称不能为空')
      .isLength({ max: 200 })
      .withMessage('任务名称不能超过200个字符'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('日期格式必须是有效的ISO格式'),
    body('timeRange')
      .optional()
      .isString()
      .withMessage('时间范围必须是字符串格式'),
    body('icon')
      .optional()
      .isString()
      .withMessage('图标必须是字符串格式'),
    body('color')
      .optional()
      .isString()
      .withMessage('颜色必须是字符串格式'),
    body('completed')
      .optional()
      .isBoolean()
      .withMessage('完成状态必须是布尔值'),
    validateRequest,
  ],
  delete: [
    param('taskId')
      .custom((value) => isValidObjectId(value))
      .withMessage('无效的任务ID'),
    validateRequest,
  ],
};

// Habit Validators
const habitValidators = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('习惯名称不能为空')
      .isLength({ max: 100 })
      .withMessage('习惯名称不能超过100个字符'),
    body('icon')
      .optional()
      .isString()
      .withMessage('图标必须是字符串格式'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('标签必须是数组格式'),
    body('color')
      .optional()
      .isString()
      .withMessage('颜色必须是字符串格式'),
    validateRequest,
  ],
  update: [
    param('id')
      .custom((value) => isValidObjectId(value))
      .withMessage('无效的习惯ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('习惯名称不能为空')
      .isLength({ max: 100 })
      .withMessage('习惯名称不能超过100个字符'),
    body('icon')
      .optional()
      .isString()
      .withMessage('图标必须是字符串格式'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('标签必须是数组格式'),
    body('color')
      .optional()
      .isString()
      .withMessage('颜色必须是字符串格式'),
    validateRequest,
  ],
  delete: [
    param('id')
      .custom((value) => isValidObjectId(value))
      .withMessage('无效的习惯ID'),
    validateRequest,
  ],
  getHabits: [
    query('tag')
      .optional()
      .isString()
      .withMessage('标签必须是字符串格式'),
    validateRequest,
  ],
  complete: [
    param('id')
      .custom((value) => isValidObjectId(value))
      .withMessage('无效的习惯ID'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('日期格式必须是有效的ISO格式'),
    validateRequest,
  ],
};

// Assistant Conversation Validators
const assistantValidators = {
  saveConversation: [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('消息内容不能为空'),
    body('timestamp')
      .optional()
      .isISO8601()
      .withMessage('时间戳必须是有效的ISO格式'),
    validateRequest,
  ],
  getConversations: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('限制必须是1到100之间的整数'),
    query('before')
      .optional()
      .isISO8601()
      .withMessage('时间戳必须是有效的ISO格式'),
    validateRequest,
  ],
  analyze: [
    body('input')
      .trim()
      .notEmpty()
      .withMessage('输入内容不能为空'),
    validateRequest,
  ],
};

module.exports = {
  taskGroupValidators,
  taskValidators,
  pomodoroValidators,
  authValidators,
  calendarTaskValidators,
  habitValidators,
  assistantValidators,
}; 