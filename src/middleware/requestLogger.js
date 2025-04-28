/**
 * Request logging middleware
 * Logs all incoming HTTP requests
 */

const logger = require('../utils/logger');

/**
 * Log HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  // Log request details
  logger.info(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.method !== 'GET' ? req.body : undefined,
    query: Object.keys(req.query).length ? req.query : undefined,
    params: Object.keys(req.params).length ? req.params : undefined,
  });

  // Log response on finish
  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`, {
      statusCode: res.statusCode,
      responseTime: Date.now() - req._startTime,
    });
  });

  // Store request start time
  req._startTime = Date.now();
  next();
};

module.exports = requestLogger; 