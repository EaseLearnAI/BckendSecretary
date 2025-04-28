/**
 * Global error handling middleware
 * Processes all errors and returns standardized responses
 */

const { errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Custom error handler middleware
 * @param {Object} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Object} Error response
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server Error';
  let errors = null;

  // Log the error
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { 
    error: err.stack,
    requestBody: req.body,
    requestParams: req.params,
    requestQuery: req.query,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).reduce((acc, curr) => {
      acc[curr.path] = curr.message;
      return acc;
    }, {});
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
    errors = { [Object.keys(err.keyValue)[0]]: `${Object.keys(err.keyValue)[0]} already exists` };
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  return errorResponse(res, message, statusCode, errors);
};

module.exports = errorHandler; 