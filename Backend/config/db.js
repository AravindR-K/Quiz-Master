const mongoose = require('mongoose');

const User = require('./models/User');
const bcrypt = require('bcrypt');

const createAdmin = async () => {
  const adminExists = await User.findOne({ email: 'admin@test.com' });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Default admin created');
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
