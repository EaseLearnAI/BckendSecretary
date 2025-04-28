/**
 * Authentication Controller
 * Handlers for user authentication operations
 */

const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Register a new user
 * @route POST /api/v1/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, '邮箱已被注册', 409);
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });
    
    // Generate JWT token
    const token = user.getSignedJwtToken();
    
    // Remove password from response
    user.password = undefined;
    
    return successResponse(
      res,
      { user, token },
      '注册成功',
      201
    );
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return errorResponse(res, '用户注册失败', 500);
  }
};

/**
 * Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email & password
    if (!email || !password) {
      return errorResponse(res, '请提供邮箱和密码', 400);
    }
    
    // Check for user (explicitly select password for comparison)
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists
    if (!user) {
      return errorResponse(res, '邮箱或密码不正确', 401);
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, '邮箱或密码不正确', 401);
    }
    
    // Generate JWT token
    const token = user.getSignedJwtToken();
    
    // Remove password from response
    user.password = undefined;
    
    return successResponse(
      res,
      { user, token },
      '登录成功'
    );
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return errorResponse(res, '登录失败', 500);
  }
};

/**
 * Get current logged in user
 * @route GET /api/v1/auth/me
 * @access Private
 */
const getMe = async (req, res) => {
  try {
    // User is already available in req.user from the auth middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return errorResponse(res, '用户不存在', 404);
    }
    
    return successResponse(res, user);
  } catch (error) {
    logger.error(`Get current user error: ${error.message}`);
    return errorResponse(res, '获取用户信息失败', 500);
  }
};

/**
 * Update user details
 * @route PUT /api/v1/auth/updatedetails
 * @access Private
 */
const updateDetails = async (req, res) => {
  try {
    // Only allow updating name and email
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    );
    
    return successResponse(res, user, '用户信息更新成功');
  } catch (error) {
    logger.error(`Update user details error: ${error.message}`);
    return errorResponse(res, '更新用户信息失败', 500);
  }
};

/**
 * Update password
 * @route PUT /api/v1/auth/updatepassword
 * @access Private
 */
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, '当前密码不正确', 401);
    }
    
    // Set new password
    user.password = newPassword;
    await user.save();
    
    // Generate new token
    const token = user.getSignedJwtToken();
    
    return successResponse(
      res,
      { token },
      '密码更新成功'
    );
  } catch (error) {
    logger.error(`Update password error: ${error.message}`);
    return errorResponse(res, '更新密码失败', 500);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
}; 