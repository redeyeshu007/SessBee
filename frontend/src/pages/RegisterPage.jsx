import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, CheckCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const { sendRegisterOTP, verifyRegisterOTP } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await sendRegisterOTP(name, email, password);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyRegisterOTP(email, otp);
      toast.success('Welcome to SessBe!');
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
                <h1 className="text-4xl font-black text-dark mb-4">Create Account</h1>
                <p className="text-gray-500 mb-10">Start your journey with world-class experts.</p>
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="text" required className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border-none" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="email" required className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border-none" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="password" required className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border-none" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <button disabled={loading} className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 group mt-4">
                    {loading ? 'Sending OTP...' : 'Continue to Verify'} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
                <p className="mt-8 text-center text-gray-500">
                  Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-dark font-bold mb-8 transition-colors">
                  <ArrowLeft size={20} /> Back to info
                </button>
                <h1 className="text-4xl font-black text-dark mb-4">Check your Email</h1>
                <p className="text-gray-500 mb-10">We've sent a 6-digit verification code to <span className="text-dark font-bold">{email}</span></p>
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Verification Code</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="text" required maxLength={6} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border-none tracking-[0.5em] font-mono text-xl" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
                    </div>
                  </div>
                  <button disabled={loading} className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 group">
                    {loading ? 'Verifying...' : 'Complete Registration'} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
                <div className="mt-8 text-center">
                  <p className="text-gray-500">Didn't receive the code?</p>
                  <button onClick={handleSendOTP} className="text-primary font-bold hover:underline">Resend Code</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="hidden lg:block flex-1 relative overflow-hidden bg-primary p-12">
        <div className="absolute top-0 right-0 w-full h-full opacity-20">
           <div className="absolute top-[20%] right-[-10%] w-[70%] h-[70%] bg-white rounded-full blur-[100px]"></div>
           <div className="absolute top-[-10%] left-[10%] w-[50%] h-[50%] bg-pink-300 rounded-full blur-[80px]"></div>
        </div>
        <div className="relative h-full flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-white max-w-lg">
            <h2 className="text-5xl font-black mb-8 leading-tight">Elevate your skills with experts.</h2>
            <div className="space-y-8">
              {[
                { title: 'World-class Mentors', desc: 'Connect with experts from top global companies.' },
                { title: 'Real-time Booking', desc: 'No waiting. Choose a slot and get started instantly.' },
                { title: 'Secure & Private', desc: 'Your sessions and data are always protected.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0"><CheckCircle size={24} /></div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                    <p className="text-white/60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
