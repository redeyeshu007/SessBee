const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Expert = require('../models/Expert');
const User = require('../models/User');

dotenv.config({ path: './.env' });

const experts = [
  {
    name: 'Sarah Jenkins',
    category: 'Business',
    experience: '12 years',
    rating: 4.9,
    bio: 'Former Fortune 500 executive helping startups scale their operations and strategy. Expert in lean management and leadership.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    availableSlots: [
      { date: '2026-05-10', timeSlots: ['09:00', '11:00', '14:00', '16:00'] },
      { date: '2026-05-11', timeSlots: ['10:00', '13:00', '15:00'] }
    ]
  },
  {
    name: 'David Chen',
    category: 'Technology',
    experience: '8 years',
    rating: 4.8,
    bio: 'Full-stack architect and cloud specialist. I help developers master React, Node.js and AWS infrastructure.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    availableSlots: [
      { date: '2026-05-10', timeSlots: ['11:00', '12:00', '17:00'] },
      { date: '2026-05-12', timeSlots: ['09:00', '14:00'] }
    ]
  },
  {
    name: 'Elena Rodriguez',
    category: 'Design',
    experience: '10 years',
    rating: 5.0,
    bio: 'Award-winning UX/UI designer focusing on accessible and emotionally resonant digital products.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    availableSlots: [
      { date: '2026-05-11', timeSlots: ['09:00', '10:00', '11:00'] },
      { date: '2026-05-13', timeSlots: ['15:00', '16:00'] }
    ]
  },
  {
    name: 'Marcus Thorne',
    category: 'Marketing',
    experience: '15 years',
    rating: 4.7,
    bio: 'Growth hacker and digital marketing strategist. Expert in SEO, PPC and community building.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    availableSlots: [
      { date: '2026-05-10', timeSlots: ['14:00', '15:00'] },
      { date: '2026-05-14', timeSlots: ['10:00', '11:00'] }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    await Expert.deleteMany({});
    await Expert.insertMany(experts);
    
    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
