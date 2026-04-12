const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  timer: {
    type: Number,
    required: [true, 'Timer is required'],
    min: 1
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // 🔥 ADD THESE (important)
  category: {
    type: String,
    default: 'General'
  },
  assignToAll: {
    type: Boolean,
    default: true
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Hard']
  },
  topic: {
    type: String
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);