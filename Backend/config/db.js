const mongoose = require('mongoose');

const User = require('../models/User');

const createAdmin = async () => {
  const adminExists = await User.findOne({ email: 'admin@quizapp.com' });

  if (!adminExists) {
    // Pass plain password - User model's pre-save hook will hash it
    await User.create({
      name: 'Admin',
      email: 'admin@quizapp.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Default admin created: admin@quizapp.com / admin123');
  }
};
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await createAdmin();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
