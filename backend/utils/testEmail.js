const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const testEmail = async () => {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***set***' : 'NOT SET');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false }
  });

  try {
    await transporter.verify();
    console.log('✅ Email connection verified successfully!');
  } catch (err) {
    console.error('❌ Email connection failed:', err.message);
  }
  process.exit();
};

testEmail();
