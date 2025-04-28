/**
 * Assistant Conversation Model
 * Schema for AI assistant conversation history
 */

const mongoose = require('mongoose');

const assistantConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['user', 'ai'],
      required: true
    },
    cards: {
      type: Object,
      default: {
        events: [],
        tasks: [],
        habits: []
      }
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for quick retrieval by timestamp
assistantConversationSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('AssistantConversation', assistantConversationSchema); 