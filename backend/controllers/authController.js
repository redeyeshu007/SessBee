const User = require('../models/User');
const Otp = require('../models/Otp');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/mailer');
const crypto = require('crypto');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

// @desc    Send OTP for registration
const sendRegisterOTP = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'register' });
    const otp = generateOTP();
    await Otp.create({
      email: email.toLowerCase(),
      otp: hashOTP(otp),
      purpose: 'register',
      payload: { name, email: email.toLowerCase(), password },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(email, otp, 'register');
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and register
const verifyRegisterOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), purpose: 'register', used: false });
    if (!otpRecord || otpRecord.otp !== hashOTP(otp) || new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const { name, password } = otpRecord.payload;
    const user = await User.create({ name, email: email.toLowerCase(), password });
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP for login
const sendLoginOTP = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    console.log(`Login attempt for: ${email}`);
    
    // Direct Admin Login Bypass (No OTP)
    if (user && user.role === 'admin') {
      const isMatch = await user.matchPassword(password);
      console.log(`Admin check: found=${!!user}, match=${isMatch}`);
      if (isMatch) {
        return res.status(200).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
          directLogin: true
        });
      }
    }

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'login' });
    const otp = generateOTP();
    await Otp.create({
      email: email.toLowerCase(),
      otp: hashOTP(otp),
      purpose: 'login',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(email, otp, 'login');
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and login
const verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), purpose: 'login', used: false });
    if (!otpRecord || otpRecord.otp !== hashOTP(otp) || new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP for forgot password
const sendForgotPasswordOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'forgot-password' });
    const otp = generateOTP();
    await Otp.create({
      email: email.toLowerCase(),
      otp: hashOTP(otp),
      purpose: 'forgot-password',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(email, otp, 'forgot-password');
    res.status(200).json({ message: 'Reset OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password with OTP
const resetPasswordWithOTP = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), purpose: 'forgot-password', used: false });
    if (!otpRecord || otpRecord.otp !== hashOTP(otp) || new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();
    
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  sendRegisterOTP, 
  verifyRegisterOTP, 
  sendLoginOTP, 
  verifyLoginOTP, 
  sendForgotPasswordOTP,
  resetPasswordWithOTP,
  updateUserProfile
};
