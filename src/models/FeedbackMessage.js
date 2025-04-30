/**
 * Feedback Message Model
 * Stores user input and generated encouragement and criticism messages
 */

const mongoose = require('mongoose');

const FeedbackMessageSchema = new mongoose.Schema(
  {
    userInput: {
      type: String,
      required: true,
      trim: true,
    },
    encourageStyle: {
      type: String,
      required: true,
      trim: true,
    },
    criticizeStyle: {
      type: String,
      required: true,
      trim: true,
    },
    encourageMessage: {
      type: String,
      required: true,
      trim: true,
    },
    criticizeMessage: {
      type: String,
      required: true,
      trim: true,
    },
    rawResponse: {
      type: String,
      required: false,
      trim: true,
    },
    tokenUsage: {
      prompt_tokens: {
        type: Number,
        default: 0
      },
      completion_tokens: {
        type: Number,
        default: 0
      },
      total_tokens: {
        type: Number,
        default: 0
      }
    },
    processingTime: {
      type: Number,
      default: 0
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional: can be used if authentication is implemented
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FeedbackMessage', FeedbackMessageSchema); 