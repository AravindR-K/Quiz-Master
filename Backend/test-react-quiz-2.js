const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp';

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const quizzes = await Quiz.find({ title: 'React Basics' });
  console.log(`Found ${quizzes.length} React Basics quizzes`);
  quizzes.forEach(q => {
    console.log(`ID: ${q._id}, assignees: ${q.assignees.length}, createdBy: ${q.createdBy}`);
  });

  await mongoose.disconnect();
}

check().catch(console.error);
