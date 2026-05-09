import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Menu, X, BookOpen } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `text-sm font-bold transition-colors ${
      isActive(path) ? 'text-primary' : 'text-gray-600 hover:text-primary'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between" style={{ height: '96px' }}>

          {/* Logo (Left) */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center shrink-0">
              <img
                src={logo}
                alt="SessBe"
                className="object-contain"
                style={{ height: '56px', width: 'auto' }}
              />
            </Link>
          </div>

          {/* Desktop Nav (Center) */}
          <div className="hidden md:flex items-center justify-center gap-10 flex-1">
            {(!user || user.role !== 'admin') && (
              <Link to="/experts" className={linkClass('/experts')}>Find Experts</Link>
            )}
            {!user && (
              <Link to="/login" className={linkClass('/login')}>Login</Link>
            )}
            {user && (
              <>
                {user.role !== 'admin' && (
                  <Link to="/my-bookings" className={linkClass('/my-bookings')}>My Bookings</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className={`${linkClass('/admin')} flex items-center gap-1.5`}>
                    <LayoutDashboard size={16} /> Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth Actions (Right) */}
          <div className="flex-1 flex justify-end items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
                <div className="flex items-center gap-3 text-right">
                  <div className="hidden lg:block">
                    <p className="text-xs text-gray-400 font-semibold leading-none mb-0.5">Signed in as</p>
                    <p className="text-sm font-extrabold text-gray-900 leading-none">{user.name}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                  title="Logout"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <Link
                to="/register"
                className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-5 pt-2 border-t border-gray-100 space-y-2">
            {(!user || user.role !== 'admin') && (
              <Link to="/experts" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-pink-50 hover:text-primary transition-colors">
                Find Experts
              </Link>
            )}
            {user ? (
              <>
                {user.role !== 'admin' && (
                  <Link to="/my-bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-pink-50 hover:text-primary transition-colors">
                    <BookOpen size={18} /> My Bookings
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-pink-50 hover:text-primary transition-colors">
                    <LayoutDashboard size={18} /> Admin Dashboard
                  </Link>
                )}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-extrabold text-gray-900">{user.name}</p>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-500 font-bold text-sm">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-4">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="py-3 text-center rounded-xl font-bold text-gray-700 border border-gray-200 hover:border-primary hover:text-primary transition-colors">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="py-3 text-center rounded-xl font-extrabold text-white bg-primary hover:opacity-90 transition-all">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
