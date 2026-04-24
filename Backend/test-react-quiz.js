const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp';

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const quiz = await Quiz.findOne({ title: 'React Basics' });
  if (!quiz) {
    console.log('No React Basics quiz found');
    process.exit(0);
  }

  console.log('Quiz assignees:', quiz.assignees);

  const users = await User.find({ role: 'candidate' });
  console.log('Candidates IDs:', users.map(u => ({ name: u.name, id: u._id.toString() })));

  await mongoose.disconnect();
}

check().catch(console.error);
