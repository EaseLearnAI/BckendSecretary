/**
 * Authentication middleware
 * Verifies JWT tokens for protected routes
 */

const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Protect routes - verify token authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Object|void} Error response or next middleware
 */
const protect = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists and has the Bearer format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required', 401);
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    // In production, the secret should be in an environment variable
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_change_in_production');
    
    // Add user from token to request object
    req.user = {
      id: decodedToken.id,
      // Other fields can be added based on token content
    };
    
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    }
    
    return errorResponse(res, 'Authentication failed', 401);
  }
};

module.exports = {
  protect,
}; 