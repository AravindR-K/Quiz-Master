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

// All HR routes require authentication + hr role
router.use(protect, authorize('hr'));

// ============ QUIZ MANAGEMENT ============

// @route   POST /api/hr/quiz/create
// @desc    Create quiz with Excel upload
// @access  HR
router.post('/quiz/create', upload.single('questionsFile'), async (req, res) => {
  try {
    const { title, timer, category, difficulty, topic, assignToAll, assignees, assignedGroups } = req.body;

    if (!title || !timer) {
      return res.status(400).json({ message: 'Please provide quiz title and timer' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file with questions' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    let parsedAssignees = [];
    if (assignees) {
      try { parsedAssignees = JSON.parse(assignees); } catch (e) { parsedAssignees = []; }
    }

    let parsedGroups = [];
    if (assignedGroups) {
      try { parsedGroups = JSON.parse(assignedGroups); } catch (e) { parsedGroups = []; }
    }

    const quiz = await Quiz.create({
      title,
      timer: parseInt(timer),
      totalQuestions: data.length,
      createdBy: req.user._id,
      category: category || 'General',
      difficulty: difficulty || 'Intermediate',
      topic: topic || '',
      assignToAll: assignToAll === 'true' || assignToAll === true,
      assignees: parsedAssignees,
      assignedGroups: parsedGroups
    });

    const questions = parseExcelQuestions(data, quiz._id);
    await Question.insertMany(questions);
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: { id: quiz._id, title: quiz.title, timer: quiz.timer, totalQuestions: quiz.totalQuestions, category: quiz.category }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/hr/quiz/create-manual
// @desc    Create quiz manually (for AI-generated quizzes)
// @access  HR
router.post('/quiz/create-manual', async (req, res) => {
  try {
    const { title, timer, category, difficulty, topic, assignToAll, assignees, assignedGroups, questions, generatedByAI } = req.body;

    if (!title || !timer) return res.status(400).json({ message: 'Please provide quiz title and timer' });
    if (!questions || questions.length === 0) return res.status(400).json({ message: 'Please provide at least one question' });

    const quiz = await Quiz.create({
      title, timer: parseInt(timer), totalQuestions: questions.length, createdBy: req.user._id,
      category: category || 'General', difficulty: difficulty || 'Intermediate', topic: topic || '',
      assignToAll: assignToAll || false, assignees: assignees || [], assignedGroups: assignedGroups || [],
      generatedByAI: generatedByAI || false
    });

    const questionDocs = questions.map(q => ({
      quizId: quiz._id, question: q.question, options: q.options,
      correctAnswers: q.correctAnswers, type: q.correctAnswers.length > 1 ? 'mcq' : 'single'
    }));

    await Question.insertMany(questionDocs);

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: { id: quiz._id, title: quiz.title, timer: quiz.timer, totalQuestions: quiz.totalQuestions, category: quiz.category }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/hr/quizzes
// @desc    Get quizzes created by this HR
// @access  HR
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const quizzesWithAttempts = await Promise.all(
      quizzes.map(async (quiz) => {
        const attemptCount = await Submission.countDocuments({ quizId: quiz._id });
        return { ...quiz.toObject(), attemptCount };
      })
    );

    res.json({ quizzes: quizzesWithAttempts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/hr/quiz/:quizId
// @desc    Get quiz details for editing
// @access  HR
router.get('/quiz/:quizId', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.quizId, createdBy: req.user._id })
      .populate('assignees', 'name email');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const questions = await Question.find({ quizId: quiz._id });
    const attemptCount = await Submission.countDocuments({ quizId: quiz._id });

    res.json({ quiz, questions, attemptCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/hr/quiz/:quizId
// @desc    Edit quiz (only if no attempts)
// @access  HR
router.put('/quiz/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findOne({ _id: quizId, createdBy: req.user._id });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const attemptCount = await Submission.countDocuments({ quizId });
    if (attemptCount > 0) {
      return res.status(403).json({ message: 'This quiz cannot be edited because it has already been attempted.', attemptCount });
    }

    const { title, timer, category, difficulty, topic, assignToAll, assignees, assignedGroups, questions } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (timer) updateData.timer = parseInt(timer);
    if (category) updateData.category = category;
    if (difficulty) updateData.difficulty = difficulty;
    if (topic !== undefined) updateData.topic = topic;
    if (assignToAll !== undefined) updateData.assignToAll = assignToAll;
    if (assignees) updateData.assignees = assignees;
    if (assignedGroups) updateData.assignedGroups = assignedGroups;

    if (questions && questions.length > 0) {
      await Question.deleteMany({ quizId });
      const questionDocs = questions.map(q => ({
        quizId, question: q.question, options: q.options,
        correctAnswers: q.correctAnswers, type: q.correctAnswers.length > 1 ? 'mcq' : 'single'
      }));
      await Question.insertMany(questionDocs);
      updateData.totalQuestions = questions.length;
    }

    const updated = await Quiz.findByIdAndUpdate(quizId, updateData, { new: true });
    res.json({ message: 'Quiz updated successfully', quiz: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/hr/quiz/:quizId
// @desc    Delete quiz (only if no attempts)
// @access  HR
router.delete('/quiz/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findOne({ _id: quizId, createdBy: req.user._id });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const attemptCount = await Submission.countDocuments({ quizId });
    if (attemptCount > 0) {
      return res.status(403).json({ message: 'This quiz cannot be deleted because it has already been attempted.', attemptCount });
    }

    await Question.deleteMany({ quizId });
    await Quiz.findByIdAndDelete(quizId);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/hr/candidates
// @desc    Get all candidates
// @access  HR
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' }).select('-password').sort({ createdAt: -1 });
    res.json({ users: candidates });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/hr/candidates/:userId/history
// @desc    Get candidate test history
// @access  HR
router.get('/candidates/:userId/history', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const submissions = await Submission.find({ studentId: req.params.userId })
      .populate('quizId', 'title timer totalQuestions category')
      .sort({ submittedAt: -1 });

    res.json({ user, submissions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/hr/submissions/:submissionId
// @desc    Get detailed submission
// @access  HR
router.get('/submissions/:submissionId', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('studentId', 'name email')
      .populate('quizId', 'title timer totalQuestions');

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const questions = await Question.find({ quizId: submission.quizId._id });

    const detailedAnswers = questions.map(q => {
      const studentAnswer = submission.answers.find(a => a.questionId.toString() === q._id.toString());
      return {
        questionId: q._id, question: q.question, options: q.options, type: q.type,
        correctAnswers: q.correctAnswers,
        studentAnswers: studentAnswer ? studentAnswer.selectedAnswers : [],
        isCorrect: (studentAnswer && studentAnswer.selectedAnswers) ? checkAnswersMatch(studentAnswer.selectedAnswers, q.correctAnswers) : false
      };
    });

    res.json({
      submission: {
        id: submission._id, student: submission.studentId, quiz: submission.quizId,
        score: submission.score, totalMarks: submission.totalMarks, percentage: submission.percentage,
        timeTaken: submission.timeTaken, submittedAt: submission.submittedAt
      },
      detailedAnswers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/hr/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Quiz.distinct('category');
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/hr/groups
router.get('/groups', async (req, res) => {
  try {
    const groups = await User.distinct('group');
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/hr/stats
router.get('/stats', async (req, res) => {
  try {
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const myQuizzes = await Quiz.countDocuments({ createdBy: req.user._id });
    const myQuizIds = (await Quiz.find({ createdBy: req.user._id }).select('_id')).map(q => q._id);
    const totalSubmissions = await Submission.countDocuments({ quizId: { $in: myQuizIds } });

    res.json({ stats: { totalCandidates, myQuizzes, totalSubmissions } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

function parseExcelQuestions(data, quizId) {
  return data.map(row => {
    const question = row['Question'] || row['question'] || '';
    const option1 = row['Option1'] || row['option1'] || row['Option 1'] || '';
    const option2 = row['Option2'] || row['option2'] || row['Option 2'] || '';
    const option3 = row['Option3'] || row['option3'] || row['Option 3'] || '';
    const option4 = row['Option4'] || row['option4'] || row['Option 4'] || '';
    const correct = row['Correct'] || row['correct'] || row['Answer'] || row['answer'] || '';
    const correctStr = correct.toString().trim();
    const correctAnswers = correctStr.includes(',') ? correctStr.split(',').map(a => a.trim()) : [correctStr];
    return {
      quizId, question: question.toString().trim(),
      options: [option1.toString().trim(), option2.toString().trim(), option3.toString().trim(), option4.toString().trim()],
      correctAnswers, type: correctAnswers.length > 1 ? 'mcq' : 'single'
    };
  });
}

function checkAnswersMatch(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  const a = arr1.map(x => x.toString().trim().toLowerCase()).sort().join('||');
  const b = arr2.map(x => x.toString().trim().toLowerCase()).sort().join('||');
  return a === b;
}

module.exports = router;
