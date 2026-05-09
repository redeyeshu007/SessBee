import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const sendRegisterOTP = async (name, email, password) => {
    await API.post('/api/auth/send-register-otp', { name, email, password });
  };

  const verifyRegisterOTP = async (email, otp) => {
    const { data } = await API.post('/api/auth/verify-register-otp', { email, otp });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const sendLoginOTP = async (email, password) => {
    const { data } = await API.post('/api/auth/send-login-otp', { email, password });
    if (data.directLogin) {
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      return data;
    }
    return null;
  };

  const verifyLoginOTP = async (email, otp) => {
    const { data } = await API.post('/api/auth/verify-login-otp', { email, otp });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const sendForgotPasswordOTP = async (email) => {
    await API.post('/api/auth/send-forgot-password-otp', { email });
  };

  const resetPasswordWithOTP = async (email, otp, newPassword) => {
    await API.post('/api/auth/reset-password-otp', { email, otp, newPassword });
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      sendRegisterOTP, 
      verifyRegisterOTP, 
      sendLoginOTP, 
      verifyLoginOTP, 
      sendForgotPasswordOTP,
      resetPasswordWithOTP,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
