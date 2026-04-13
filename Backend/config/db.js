const mongoose = require('mongoose');
const User = require('../models/User');

const createDefaultUsers = async () => {
  // Create default admin
  const adminExists = await User.findOne({ email: 'admin@quizapp.com' });
  if (!adminExists) {
    await User.create({
      name: 'Administrator',
      email: 'admin@quizapp.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Default admin created: admin@quizapp.com / admin123');
  }

  // Create default HR
  const hrExists = await User.findOne({ email: 'hr@quizapp.com' });
  if (!hrExists) {
    await User.create({
      name: 'HR Manager',
      email: 'hr@quizapp.com',
      password: 'hr1234',
      role: 'hr'
    });
    console.log('Default HR created: hr@quizapp.com / hr1234');
  }

  // Migrate any existing 'student' role users to 'candidate'
  const migrated = await User.updateMany(
    { role: 'student' },
    { $set: { role: 'candidate' } }
  );
  if (migrated.modifiedCount > 0) {
    console.log(`Migrated ${migrated.modifiedCount} student(s) to candidate role`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await createDefaultUsers();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
