const express = require('express');
const xlsx = require('xlsx');
const fs = require('fs');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/users
// @desc    Get all students (logged in users)
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users/logged-in
// @desc    Get all currently logged-in students
// @access  Admin
router.get('/users/logged-in', async (req, res) => {
  try {
    const users = await User.find({ role: 'student', isLoggedIn: true })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users/:userId/history
// @desc    Get a student's test history
// @access  Admin
router.get('/users/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const submissions = await Submission.find({ studentId: userId })
      .populate('quizId', 'title timer totalQuestions')
      .sort({ submittedAt: -1 });

    res.json({ user, submissions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/submissions/:submissionId
// @desc    Get detailed submission - answers, correct answers, scores
// @access  Admin
router.get('/submissions/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId)
      .populate('studentId', 'name email')
      .populate('quizId', 'title timer totalQuestions');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Get all questions for this quiz
    const questions = await Question.find({ quizId: submission.quizId._id });

    // Build detailed result with question, student answer, correct answer
    const detailedAnswers = questions.map(q => {
      const studentAnswer = submission.answers.find(
        a => a.questionId.toString() === q._id.toString()
      );

      return {
        questionId: q._id,
        question: q.question,
        options: q.options,
        type: q.type,
        correctAnswers: q.correctAnswers,
        studentAnswers: studentAnswer ? studentAnswer.selectedAnswers : [],
        isCorrect: (studentAnswer && studentAnswer.selectedAnswers)
          ? checkAnswersMatch(studentAnswer.selectedAnswers, q.correctAnswers)
          : false
      };
    });

    res.json({
      submission: {
        id: submission._id,
        student: submission.studentId,
        quiz: submission.quizId,
        score: submission.score,
        totalMarks: submission.totalMarks,
        percentage: submission.percentage,
        timeTaken: submission.timeTaken,
        submittedAt: submission.submittedAt
      },
      detailedAnswers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/quiz/create
// @desc    Create quiz with Excel upload
// @access  Admin
router.post('/quiz/create', upload.single('questionsFile'), async (req, res) => {
  try {
    const { title, timer } = req.body;

    if (!title || !timer) {
      return res.status(400).json({ message: 'Please provide quiz title and timer' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file with questions' });
    }

    // Parse Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    // Create quiz
    const quiz = await Quiz.create({
      title,
      timer: parseInt(timer),
      totalQuestions: data.length,
      createdBy: req.user._id
    });

    // Parse and create questions
    const questions = data.map(row => {
      // Get column values (handle different header names)
      const question = row['Question'] || row['question'] || '';
      const option1 = row['Option1'] || row['option1'] || row['Option 1'] || '';
      const option2 = row['Option2'] || row['option2'] || row['Option 2'] || '';
      const option3 = row['Option3'] || row['option3'] || row['Option 3'] || '';
      const option4 = row['Option4'] || row['option4'] || row['Option 4'] || '';
      const correct = row['Correct'] || row['correct'] || row['Answer'] || row['answer'] || '';

      // Determine if single or multi-correct
      const correctStr = correct.toString().trim();
      const correctAnswers = correctStr.includes(',')
        ? correctStr.split(',').map(a => a.trim())
        : [correctStr];

      const type = correctAnswers.length > 1 ? 'mcq' : 'single';

      return {
        quizId: quiz._id,
        question: question.toString().trim(),
        options: [
          option1.toString().trim(),
          option2.toString().trim(),
          option3.toString().trim(),
          option4.toString().trim()
        ],
        correctAnswers,
        type
      };
    });

    await Question.insertMany(questions);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        timer: quiz.timer,
        totalQuestions: quiz.totalQuestions
      }
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/quizzes
// @desc    Get all quizzes
// @access  Admin
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/quiz/:quizId
// @desc    Delete a quiz and its questions
// @access  Admin
router.delete('/quiz/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;

    await Question.deleteMany({ quizId });
    await Submission.deleteMany({ quizId });
    await Quiz.findByIdAndDelete(quizId);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to compare arrays reliably
function checkAnswersMatch(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  const a = arr1.map(x => x.toString().trim().toLowerCase()).sort().join('||');
  const b = arr2.map(x => x.toString().trim().toLowerCase()).sort().join('||');
  return a === b;
}

module.exports = router;
