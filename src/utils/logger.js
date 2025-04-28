/**
 * Logger utility using Winston
 * Provides consistent logging across the application
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create the logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'task-api' },
  transports: [
    // Console transport for all environments
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          ({ timestamp, level, message, service }) =>
            `${timestamp} [${service}] ${level}: ${message}`
        )
      ),
    }),
    
    // File transports for error and combined logs
    new transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
    }),
    new transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
    }),
  ],
  // Don't exit on error
  exitOnError: false,
});

module.exports = logger; 