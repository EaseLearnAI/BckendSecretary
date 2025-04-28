/**
 * Standardized API response formats
 * Ensures consistent response structure across the API
 */

/**
 * Success response with data
 * @param {Object} res - Express response object
 * @param {*} data - Data to be sent in the response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Express response object
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    data,
    message,
    success: true,
  });
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} errors - Detailed error information
 * @returns {Object} Express response object
 */
const errorResponse = (res, message = 'Error occurred', statusCode = 500, errors = null) => {
  const response = {
    error: {
      code: getErrorCode(statusCode),
      message,
    },
    success: false,
  };

  // Add detailed errors if provided
  if (errors) {
    response.error.details = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Get error code based on HTTP status
 * @param {number} statusCode - HTTP status code
 * @returns {string} Error code
 */
const getErrorCode = (statusCode) => {
  switch (statusCode) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'UNPROCESSABLE_ENTITY';
    case 500:
    default:
      return 'SERVER_ERROR';
  }
};

module.exports = {
  successResponse,
  errorResponse,
}; 