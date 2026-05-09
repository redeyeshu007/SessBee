const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@sessbe.com' });
    if (existing) {
      console.log('Admin already exists:', existing.email, '| role:', existing.role);
      process.exit();
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@sessbe.com',
      password: 'Admin@1234',
      role: 'admin',
    });

    console.log('✅ Admin created successfully!');
    console.log('   Email:    admin@sessbe.com');
    console.log('   Password: Admin@1234');
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
