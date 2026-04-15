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

  // ============ USER MANAGEMENT ============

  // @route   GET /api/admin/users
  // @desc    Get all candidates and HR users
  // @access  Admin
  router.get('/users', async (req, res) => {
    try {
      const { role } = req.query;
      const filter = role ? { role } : { role: { $in: ['candidate', 'hr'] } };
      const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 });

      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // @route   GET /api/admin/users/logged-in
  // @desc    Get all currently logged-in users
  // @access  Admin
  router.get('/users/logged-in', async (req, res) => {
    try {
      const users = await User.find({ role: { $in: ['candidate', 'hr'] }, isLoggedIn: true })
        .select('-password')
        .sort({ createdAt: -1 });

      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // @route   POST /api/admin/users/create-hr
  // @desc    Create an HR user
  // @access  Admin
  router.post('/users/create-hr', async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const user = await User.create({ name, email, password, role: 'hr' });

      res.status(201).json({
        message: 'HR user created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // @route   DELETE /api/admin/users/:userId
  // @desc    Delete a user
  // @access  Admin
  router.delete('/users/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin users' });

      await Submission.deleteMany({ studentId: userId });
      await User.findByIdAndDelete(userId);

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // @route   GET /api/admin/users/:userId/history
  // @desc    Get a user's test history
  // @access  Admin
  router.get('/users/:userId/history', async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const submissions = await Submission.find({ studentId: userId })
        .populate('quizId', 'title timer totalQuestions category')
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

  // ============ QUIZ MANAGEMENT ============

  // @route   POST /api/admin/quiz/create
  // @desc    Create quiz with Excel upload
  // @access  Admin
  router.post('/quiz/create', upload.single('questionsFile'), async (req, res) => {
    try {
      const { title, timer, category, difficulty, topic, assignToAll, assignees, assignedGroups } = req.body;

      if (!title || !timer) {
        return res.status(400).json({ message: 'Please provide quiz title and timer' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Please upload an Excel file with questions' });
      }
      console.log("FILE:", req.file);
      console.log("BODY:", req.body);
      // Parse Excel file
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      if (data.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Excel file is empty' });
      }

      // Parse assignees
      let parsedAssignees = [];
      if (assignees) {
        try { parsedAssignees = JSON.parse(assignees); } catch (e) { parsedAssignees = []; }
      }

      let parsedGroups = [];
      if (assignedGroups) {
        try { parsedGroups = JSON.parse(assignedGroups); } catch (e) { parsedGroups = []; }
      }

      // Create quiz
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

      // Parse and create questions
      const questions = parseExcelQuestions(data, quiz._id);
      console.log("PARSED QUESTIONS:", questions);
      await Question.insertMany(questions);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.status(201).json({
        message: 'Quiz created successfully',
        quiz: {
          id: quiz._id,
          title: quiz.title,
          timer: quiz.timer,
          totalQuestions: quiz.totalQuestions,
          category: quiz.category
        }
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // @route   POST /api/admin/quiz/create-manual
  // @desc    Create quiz manually (for AI-generated quizzes or manual entry)
  // @access  Admin
  router.post('/quiz/create-manual', async (req, res) => {
    try {
      const { title, timer, category, difficulty, topic, assignToAll, assignees, assignedGroups, questions, generatedByAI } = req.body;

      if (!title || !timer) {
        return res.status(400).json({ message: 'Please provide quiz title and timer' });
      }

      if (!questions || questions.length === 0) {
        return res.status(400).json({ message: 'Please provide at least one question' });
      }

      // Create quiz
      const quiz = await Quiz.create({
        title,
        timer: parseInt(timer),
        totalQuestions: questions.length,
        createdBy: req.user._id,
        category: category || 'General',
        difficulty: difficulty || 'Intermediate',
        topic: topic || '',
        assignToAll: assignToAll || false,
        assignees: assignees || [],
        assignedGroups: assignedGroups || [],
        generatedByAI: generatedByAI || false
      });

      // Create questions
      const questionDocs = questions.map(q => ({
        quizId: quiz._id,
        question: q.question,
        options: q.options,
        correctAnswers: q.correctAnswers,
        type: q.correctAnswers.length > 1 ? 'mcq' : 'single'
      }));

      await Question.insertMany(questionDocs);

      res.status(201).json({
        message: 'Quiz created successfully',
        quiz: {
          id: quiz._id,
          title: quiz.title,
          timer: quiz.timer,
          totalQuestions: quiz.totalQuestions,
          category: quiz.category
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // @route   GET /api/admin/quizzes
  // @desc    Get all quizzes with attempt count
  // @access  Admin
  router.get('/quizzes', async (req, res) => {
    try {
      const quizzes = await Quiz.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      // Get attempt counts for each quiz
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

  // @route   GET /api/admin/quiz/:quizId
  // @desc    Get quiz with its questions for editing
  // @access  Admin
  router.get('/quiz/:quizId', async (req, res) => {
    try {
      const { quizId } = req.params;
      const quiz = await Quiz.findById(quizId)
        .populate('createdBy', 'name email')
        .populate('assignees', 'name email');

      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      const questions = await Question.find({ quizId });
      const attemptCount = await Submission.countDocuments({ quizId });

      res.json({ quiz, questions, attemptCount });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // @route   PUT /api/admin/quiz/:quizId
  // @desc    Edit quiz (only if no attempts have been made)
  // @access  Admin
  router.put('/quiz/:quizId', async (req, res) => {
    try {
      const { quizId } = req.params;

      // Check if any attempts exist
      const attemptCount = await Submission.countDocuments({ quizId });
      if (attemptCount > 0) {
        return res.status(403).json({
          message: 'This quiz cannot be edited because it has already been attempted by users.',
          attemptCount
        });
      }

      const { title, timer, category, difficulty, topic, assignToAll, assignees, assignedGroups, questions } = req.body;

      // Update quiz metadata
      const updateData = {};
      if (title) updateData.title = title;
      if (timer) updateData.timer = parseInt(timer);
      if (category) updateData.category = category;
      if (difficulty) updateData.difficulty = difficulty;
      if (topic !== undefined) updateData.topic = topic;
      if (assignToAll !== undefined) updateData.assignToAll = assignToAll;
      if (assignees) updateData.assignees = assignees;
      if (assignedGroups) updateData.assignedGroups = assignedGroups;

      // If questions are provided, replace them
      if (questions && questions.length > 0) {
        await Question.deleteMany({ quizId });

        const questionDocs = questions.map(q => ({
          quizId,
          question: q.question,
          options: q.options,
          correctAnswers: q.correctAnswers,
          type: q.correctAnswers.length > 1 ? 'mcq' : 'single'
        }));

        await Question.insertMany(questions);
        updateData.totalQuestions = questions.length;
      }

      const quiz = await Quiz.findByIdAndUpdate(quizId, updateData, { new: true });

      res.json({ message: 'Quiz updated successfully', quiz });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // @route   PUT /api/admin/quiz/:quizId/assign
  // @desc    Assign quiz to users/groups
  // @access  Admin
  router.put('/quiz/:quizId/assign', async (req, res) => {
    try {
      const { quizId } = req.params;
      const { assignToAll, assignees, assignedGroups } = req.body;

      const quiz = await Quiz.findByIdAndUpdate(quizId, {
        assignToAll: assignToAll || false,
        assignees: assignees || [],
        assignedGroups: assignedGroups || []
      }, { new: true });

      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

      res.json({ message: 'Quiz assignment updated', quiz });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // @route   DELETE /api/admin/quiz/:quizId
  // @desc    Delete a quiz (only if no attempts have been made)
  // @access  Admin
  router.delete('/quiz/:quizId', async (req, res) => {
    try {
      const { quizId } = req.params;

      // Check if any attempts exist
      const attemptCount = await Submission.countDocuments({ quizId });
      if (attemptCount > 0) {
        return res.status(403).json({
          message: 'This quiz cannot be deleted because it has already been attempted by users.',
          attemptCount
        });
      }

      await Question.deleteMany({ quizId });
      await Quiz.findByIdAndDelete(quizId);

      res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // @route   GET /api/admin/categories
  // @desc    Get all unique quiz categories
  // @access  Admin
  router.get('/categories', async (req, res) => {
    try {
      const categories = await Quiz.distinct('category');
      res.json({ categories });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // @route   GET /api/admin/groups
  // @desc    Get all unique user groups
  // @access  Admin
  router.get('/groups', async (req, res) => {
    try {
      const groups = await User.distinct('group');
      res.json({ groups });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });



  // @route   POST /api/admin/groups
  // @desc    Create a new group
  // @access  Admin
  router.post('/groups', async (req, res) => {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Group name is required' });
      }

      // Check if already exists
      const existing = await User.findOne({ group: name.trim() });

      if (existing) {
        return res.status(400).json({ message: 'Group already exists' });
      }

      // ⚠️ Since you're using group as string,
      // we don't store separately — just return success
      res.status(201).json({ message: 'Group created successfully', group: name.trim() });

    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // @route   GET /api/admin/stats
  // @desc    Get dashboard statistics
  // @access  Admin
  router.get('/stats', async (req, res) => {
    try {
      const totalUsers = await User.countDocuments({ role: 'candidate' });
      const totalHR = await User.countDocuments({ role: 'hr' });
      const totalQuizzes = await Quiz.countDocuments();
      const totalSubmissions = await Submission.countDocuments();
      const onlineUsers = await User.countDocuments({ isLoggedIn: true, role: { $in: ['candidate', 'hr'] } });

      // Recent submissions
      const recentSubmissions = await Submission.find()
        .populate('studentId', 'name email')
        .populate('quizId', 'title')
        .sort({ submittedAt: -1 })
        .limit(5);

      res.json({
        stats: { totalUsers, totalHR, totalQuizzes, totalSubmissions, onlineUsers },
        recentSubmissions
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // ============ HELPER FUNCTIONS ============

  function parseExcelQuestions(data, quizId) {
    return data.map(row => {
      const question = row['Question'] || row['question'] || '';
      const option1 = row['Option1'] || row['option1'] || row['Option 1'] || '';
      const option2 = row['Option2'] || row['option2'] || row['Option 2'] || '';
      const option3 = row['Option3'] || row['option3'] || row['Option 3'] || '';
      const option4 = row['Option4'] || row['option4'] || row['Option 4'] || '';
      const correct = row['Correct'] || row['correct'] || row['Answer'] || row['answer'] || '';

      const options = [
        option1.toString().trim(),
        option2.toString().trim(),
        option3.toString().trim(),
        option4.toString().trim()
      ];

      const correctStr = correct.toString().trim();
      const correctArr = correctStr.split(',').map(s => s.trim());

      // 🔥 convert text → index
      const correctAnswers = options
        .map((opt, index) => correctArr.includes(opt) ? index.toString() : null)
        .filter(val => val !== null);

      if (correctAnswers.length === 0) {
        throw new Error(`Correct answer "${correctStr}" not matching options`);
      }
      const type = correctAnswers.length > 1 ? 'mcq' : 'single';

      return {
        quizId,
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
  }

  function checkAnswersMatch(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
    const a = arr1.map(x => x.toString().trim().toLowerCase()).sort().join('||');
    const b = arr2.map(x => x.toString().trim().toLowerCase()).sort().join('||');
    return a === b;
  }

  module.exports = router;
