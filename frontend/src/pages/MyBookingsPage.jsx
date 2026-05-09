import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Calendar, Clock, CheckCircle, AlertCircle, ExternalLink, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const statusConfig = {
  Confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Completed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  Pending:   { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get('/api/bookings/mybookings');
        setBookings(data);
      } catch {
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await API.delete(`/api/bookings/${id}`);
      toast.success('Booking cancelled');
      setBookings(bookings.filter(b => b._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const upcoming = bookings.filter(b => b.status !== 'Completed').length;

  return (
    <div className="min-h-screen bg-[#FFF1F6] pt-40 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-500 text-lg">Manage your expert sessions in one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm">
              🔜 Upcoming: {upcoming}
            </div>
            <div className="px-4 py-2 bg-white text-gray-600 rounded-xl font-bold text-sm border border-gray-100">
              Total: {bookings.length}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>

        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking, idx) => {
              const sc = statusConfig[booking.status] || statusConfig.Pending;
              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(255,79,139,0.12)] transition-all duration-300 flex flex-col"
                >
                  {/* Status badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                      {booking.status}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">
                      #{booking._id?.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  {/* Expert info */}
                  <div className="flex items-center gap-3 mb-5">
                    <img
                      src={booking.expert?.avatar || `https://ui-avatars.com/api/?name=${booking.expert?.name}&background=FF4F8B&color=fff`}
                      className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                      alt={booking.expert?.name}
                    />
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{booking.expert?.name || 'Expert'}</h3>
                      <p className="text-primary text-sm font-semibold">{booking.expert?.category}</p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex gap-3 mb-5 flex-grow">
                    <div className="flex-1 bg-[#FFF1F6] rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} className="text-primary" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{booking.date}</p>
                    </div>
                    <div className="flex-1 bg-[#FFF1F6] rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-primary" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{booking.timeSlot}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <button className="flex items-center gap-1.5 text-primary font-bold text-sm hover:underline">
                      <ExternalLink size={14} /> Join Session
                    </button>
                    <button 
                      onClick={() => handleCancel(booking._id)}
                      className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-[#FFF1F6] rounded-3xl flex items-center justify-center mx-auto mb-6">
              <BookOpen size={32} className="text-primary" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3">No bookings yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't booked any expert sessions yet. Start exploring and find the right expert for you!</p>
            <Link to="/experts" className="btn-primary gap-2">
              Browse Experts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
