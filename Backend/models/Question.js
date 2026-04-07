const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.length === 4;
      },
      message: 'Each question must have exactly 4 options'
    }
  },
  correctAnswers: {
    type: [String],
    required: true
  },
  type: {
    type: String,
    enum: ['single', 'mcq'],
    default: 'single'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
