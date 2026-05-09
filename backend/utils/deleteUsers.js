const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' });

const deleteSpecificUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Show all non-admin users
    const users = await User.find({ role: { $ne: 'admin' } });
    console.log('Non-admin users found:', users.map(u => u.email));

    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`✅ Deleted ${result.deletedCount} user(s)`);
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

deleteSpecificUser();
