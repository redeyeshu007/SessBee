import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-white py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="SessBe" className="h-8 w-auto" />
            <span className="text-xl font-black text-gray-900 tracking-tighter">Sess<span className="text-primary">Be</span></span>
          </Link>
          
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            <Link to="/experts" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">Find Experts</Link>
            <a href="#" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">Contact Support</a>
          </div>

          <div className="pt-8 w-full border-t border-gray-50">
            <p className="text-gray-400 text-sm font-medium">
              © {new Date().getFullYear()} SessBe. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
