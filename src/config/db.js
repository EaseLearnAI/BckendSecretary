/**
 * MongoDB database connection configuration
 * Establishes connection to MongoDB using Mongoose
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB database
 * @returns {Promise} Mongoose connection promise
 */
const connectDB = async () => {
  try {
    // Connection string using environment variables or default values
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/supertimer';
    
    // Connect to MongoDB with Mongoose
    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 