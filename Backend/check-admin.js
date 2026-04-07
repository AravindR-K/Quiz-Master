require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkAdmin = async () => {
  try {
    // Connect to MongoDB using the URI from .env
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`\n✅ Connected to MongoDB: ${conn.connection.host}`);
    
    // Find users with the role 'admin'
    const admins = await User.find({ role: 'admin' }).select('-password'); // Exclude password from logs
    
    if (admins.length > 0) {
      console.log(`\n🎉 Found ${admins.length} Admin User(s) in the database:\n`);
      console.log(admins);
    } else {
      console.log('\n❌ No admin users found in the database. When the server starts up, it should automatically create admin@test.com if it doesn\'t exist.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error connecting to database or checking admins:');
    console.error(error.message);
    process.exit(1);
  }
};

checkAdmin();
