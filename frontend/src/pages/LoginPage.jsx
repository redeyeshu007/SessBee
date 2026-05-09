import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const { sendLoginOTP, verifyLoginOTP } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await sendLoginOTP(email.trim(), password);
      if (res && res.directLogin) {
        toast.success(`Welcome back, Admin!`);
        navigate(res.role === 'admin' ? '/admin' : '/');
        return;
      }
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyLoginOTP(email, otp);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
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
                <h1 className="text-4xl font-black text-dark mb-4">Welcome Back</h1>
                <p className="text-gray-500 mb-10">Enter your details to receive a login OTP.</p>
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="email" required className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border-none" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Password</label>
                      <Link to="/forgot-password" size={20} className="text-sm text-primary font-bold hover:underline">Forgot?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="password" required className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border-none" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <button disabled={loading} className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 group">
                    {loading ? 'Sending OTP...' : 'Continue to Login'} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
                <p className="mt-8 text-center text-gray-500">
                  Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Create one</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-dark font-bold mb-8 transition-colors">
                  <ArrowLeft size={20} /> Back to credentials
                </button>
                <h1 className="text-4xl font-black text-dark mb-4">Verify OTP</h1>
                <p className="text-gray-500 mb-10">We've sent a 6-digit code to <span className="text-dark font-bold">{email}</span></p>
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">OTP Code</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="text" required maxLength={6} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border-none tracking-[0.5em] font-mono text-xl" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
                    </div>
                  </div>
                  <button disabled={loading} className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 group">
                    {loading ? 'Verifying...' : 'Login Now'} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
                <div className="mt-8 text-center">
                  <p className="text-gray-500">Didn't receive the code?</p>
                  <button onClick={handleSendOTP} className="text-primary font-bold hover:underline">Resend OTP</button>
                </div>
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
        <div className="relative h-full flex flex-col justify-end">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
            <div className="flex items-center gap-2 mb-6">
              {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/40"></div>)}
            </div>
            <p className="text-3xl font-bold text-white mb-8 leading-tight">
              "SessBe has transformed how I connect with mentors. The real-time booking is seamless."
            </p>
            <div className="flex items-center gap-4">
              <img src="https://i.pravatar.cc/100?u=jane" className="w-12 h-12 rounded-full border-2 border-white/40" />
              <div>
                <p className="font-bold text-white">Jane Cooper</p>
                <p className="text-white/60 text-sm">Product Manager at Google</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
