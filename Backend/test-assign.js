const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp';

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const quiz = await Quiz.findOne({});
  if (!quiz) {
    console.log('No quiz found');
    process.exit(0);
  }

  console.log('Quiz found:', quiz.title, 'ID:', quiz._id.toString());
  console.log('Initial assignees:', quiz.assignees);

  // simulate PUT request assignToAll = false, assignees = [some mock id]
  const mockId = new mongoose.Types.ObjectId();
  quiz.assignToAll = false;
  quiz.assignees = [mockId];
  await quiz.save();
  
  console.log('Saved assignees:', quiz.assignees);

  const reloaded = await Quiz.findById(quiz._id);
  console.log('Reloaded assignees:', reloaded.assignees);

  await mongoose.disconnect();
}

check().catch(console.error);
