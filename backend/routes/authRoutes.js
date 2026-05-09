const express = require('express');
const { 
  sendRegisterOTP, 
  verifyRegisterOTP, 
  sendLoginOTP, 
  verifyLoginOTP,
  sendForgotPasswordOTP,
  resetPasswordWithOTP,
  updateUserProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.put('/profile', protect, updateUserProfile);

router.post('/send-register-otp', sendRegisterOTP);
router.post('/verify-register-otp', verifyRegisterOTP);
router.post('/send-login-otp', sendLoginOTP);
router.post('/verify-login-otp', verifyLoginOTP);
router.post('/send-forgot-password-otp', sendForgotPasswordOTP);
router.post('/reset-password-otp', resetPasswordWithOTP);

// OTP based authentication is used primarily

module.exports = router;
