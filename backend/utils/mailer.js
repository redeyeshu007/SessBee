const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #FFF1F6; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(255, 79, 139, 0.1); }
    .header { padding: 40px 40px 20px; text-align: center; }
    .logo { font-size: 32px; font-weight: 800; color: #1F2937; letter-spacing: -1px; }
    .logo span { color: #FF4F8B; }
    .content { padding: 0 40px 40px; }
    .footer { padding: 30px; background: #F9FAFB; text-align: center; color: #9CA3AF; font-size: 13px; }
    .btn { display: inline-block; background-color: #FF4F8B; color: #ffffff !important; padding: 16px 32px; border-radius: 16px; font-weight: 700; text-decoration: none; margin-top: 24px; }
    .otp-code { background: #FFF1F6; border: 2px dashed #FF4F8B; border-radius: 20px; padding: 30px; margin: 30px 0; font-size: 48px; font-weight: 800; color: #1F2937; letter-spacing: 12px; text-align: center; }
    .info-card { background: #F9FAFB; border-radius: 24px; padding: 24px; margin-top: 24px; }
    .info-item { display: flex; align-items: center; margin-bottom: 12px; }
    .info-label { color: #9CA3AF; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
    .info-value { color: #1F2937; font-weight: 700; font-size: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Sess<span>Be</span></div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; 2026 SessBe. All rights reserved.<br>
      High-performance expert consultations.
    </div>
  </div>
</body>
</html>
`;

const sendOTPEmail = async (to, otp, purpose) => {
  const transporter = createTransporter();
  const isRegister = purpose === 'register';
  const isForgot = purpose === 'forgot-password';
  
  let title = 'Welcome Back!';
  let sub = 'Use the code below to log in securely.';
  
  if (isRegister) {
    title = 'Welcome to SessBe!';
    sub = 'Use the code below to create your account.';
  } else if (isForgot) {
    title = 'Reset Your Password';
    sub = 'Use the code below to reset your SessBe password.';
  }
  
  const content = `
    <h2 style="font-size: 24px; font-weight: 800; color: #1F2937; text-align: center; margin-bottom: 8px;">
      ${title}
    </h2>
    <p style="color: #6B7280; text-align: center; margin-bottom: 32px;">
      ${sub}
    </p>
    <div class="otp-code">${otp}</div>
    <p style="color: #9CA3AF; font-size: 14px; text-align: center; line-height: 1.6;">
      This code will expire in 10 minutes.<br>
      If you didn't request this, please ignore this email.
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"SessBe" <${process.env.EMAIL_USER}>`,
      to,
      subject: `${otp} is your SessBe verification code`,
      html: baseTemplate(content),
    });
  } catch (emailError) {
    console.error('Email send failed:', emailError.message);
    throw new Error('Failed to send OTP email. Please check your email address or try again later.');
  }
};

const sendBookingEmail = async (to, bookingData) => {
  const transporter = createTransporter();
  
  const content = `
    <h2 style="font-size: 24px; font-weight: 800; color: #1F2937; margin-bottom: 12px;">
      Booking Confirmed! 🎉
    </h2>
    <p style="color: #6B7280; margin-bottom: 32px;">
      Your session with <strong>${bookingData.expert.name}</strong> has been successfully booked.
    </p>
    
    <div class="info-card">
      <div style="margin-bottom: 20px;">
        <div class="info-label">Expert</div>
        <div class="info-value">${bookingData.expert.name}</div>
        <div style="color: #FF4F8B; font-size: 13px; font-weight: 600;">${bookingData.expert.category}</div>
      </div>
      
      <div style="display: flex; gap: 30px;">
        <div style="flex: 1;">
          <div class="info-label">Date</div>
          <div class="info-value">${bookingData.date}</div>
        </div>
        <div style="flex: 1;">
          <div class="info-label">Time Slot</div>
          <div class="info-value">${bookingData.timeSlot}</div>
        </div>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL}/my-bookings" class="btn">View Booking Details</a>
    </div>

    <p style="color: #9CA3AF; font-size: 14px; text-align: center; margin-top: 32px;">
      Need to reschedule? Please contact us or manage it from your dashboard.
    </p>
  `;

  await transporter.sendMail({
    from: `"SessBe" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Booking Confirmed: Session with ${bookingData.expert.name}`,
    html: baseTemplate(content),
  });
};

module.exports = { sendOTPEmail, sendBookingEmail };
