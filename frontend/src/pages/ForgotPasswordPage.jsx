import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ShieldCheck, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const { sendForgotPasswordOTP, resetPasswordWithOTP } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendForgotPasswordOTP(email);
      toast.success('Reset code sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await resetPasswordWithOTP(email, otp, newPassword);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <img src={logo} alt="SessBe Logo" className="h-10 w-auto" style={{ maxHeight: '40px' }} />
            <span className="text-2xl font-black text-dark tracking-tighter">Sess<span className="text-primary">Be</span></span>
          </Link>
          
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-dark font-bold mb-8 transition-colors">
                  <ArrowLeft size={20} /> Back to Login
                </Link>
                <h1 className="text-4xl font-black text-dark mb-4">Forgot Password?</h1>
                <p className="text-gray-500 mb-10">Enter your email and we'll send you a 6-digit code to reset your password.</p>
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="email" required className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border-none" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <button disabled={loading} className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 group">
                    {loading ? 'Sending Code...' : 'Send Reset Code'} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-dark font-bold mb-8 transition-colors">
                  <ArrowLeft size={20} /> Back
                </button>
                <h1 className="text-4xl font-black text-dark mb-4">Set New Password</h1>
                <p className="text-gray-500 mb-10">Verification code sent to <span className="text-dark font-bold">{email}</span></p>
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Reset Code</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="text" required maxLength={6} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border-none tracking-[0.5em] font-mono text-xl" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="password" required className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border-none" placeholder="Min. 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                  </div>
                  <button disabled={loading} className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 group">
                    {loading ? 'Resetting...' : 'Reset Password'} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="hidden lg:block flex-1 relative overflow-hidden bg-primary p-12">
        <div className="absolute top-0 right-0 w-full h-full opacity-20">
           <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-white rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-200 rounded-full blur-[100px]"></div>
        </div>
        <div className="relative h-full flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
            <h2 className="text-4xl font-black text-white mb-6">Security First.</h2>
            <p className="text-white/80 text-xl leading-relaxed">
              We use two-step verification to ensure your account remains safe even if your password is lost.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
