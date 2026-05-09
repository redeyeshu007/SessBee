import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import socket from '../services/socket';
import { Star, Clock, Calendar, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ExpertDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    notes: ''
  });

  const fetchExpert = async () => {
    try {
      const { data } = await API.get(`/api/experts/${id}`);
      setExpert(data);
    } catch (error) {
      toast.error('Failed to load expert details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedSlots = async () => {
    // Ideally we would have an API for this, or just fetch all bookings for this expert
    // For now, let's assume we fetch them separately or they are part of the detail
    // Let's implement a simple fetch for booked slots
    try {
      // Fetching all bookings for this expert to find busy slots
      // In production, you'd want a dedicated endpoint for this
      const { data } = await API.get(`/api/bookings?expert=${id}`);
      setBookedSlots(data.map(b => `${b.date}_${b.timeSlot}`));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchExpert();
    fetchBookedSlots();

    socket.on('bookingUpdate', (data) => {
      if (data.expert === id) {
        setBookedSlots(prev => [...prev, `${data.date}_${data.timeSlot}`]);
      }
    });

    return () => socket.off('bookingUpdate');
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book a session');
      navigate('/login');
      return;
    }

    try {
      await API.post('/api/bookings', {
        expert: id,
        ...bookingData,
        date: selectedDate,
        timeSlot: selectedSlot
      });
      toast.success('Booking successful!');
      setShowBookingModal(false);
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  useEffect(() => {
    if (expert && expert.availableSlots?.length > 0 && !selectedDate) {
      const firstSlot = expert.availableSlots[0];
      const firstDate = firstSlot?.date || (typeof firstSlot === 'string' ? 'Legacy Session' : 'Unknown Date');
      setSelectedDate(firstDate);
    }
  }, [expert, selectedDate]);

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!expert) return <div className="h-screen flex items-center justify-center text-2xl font-bold">Expert not found</div>;

  const groupedSlots = (expert.availableSlots || []).reduce((acc, slot) => {
    // Handle both new object format and old string/legacy format
    const date = slot?.date || (typeof slot === 'string' ? 'Legacy Session' : 'Unknown Date');
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  const availableDates = Object.keys(groupedSlots);
  const currentDaySlots = (selectedDate && groupedSlots[selectedDate]) || [];

  const formatTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return timeStr;
    if (!timeStr.includes(':')) return timeStr;
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <div className="pt-40 pb-20 bg-secondary/20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Profile Details */}
          <div className="lg:col-span-1">
            <div className="card sticky top-40">
              <div className="relative mb-8">
                <img 
                  src={expert.avatar} 
                  alt={expert.name} 
                  className="w-full aspect-square object-cover rounded-2xl"
                />
                <div className="absolute -bottom-4 right-4 bg-primary text-white p-3 rounded-2xl shadow-xl">
                   <div className="flex items-center gap-1">
                     <Star size={18} fill="currentColor" />
                     <span className="font-bold text-lg">{expert.rating || '5.0'}</span>
                   </div>
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark mb-2">{expert.name}</h1>
              <p className="text-primary font-bold mb-6 text-sm sm:text-base">{expert.category} Expert • {expert.experience} exp</p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">About</h4>
                  <p className="text-gray-600 leading-relaxed">{expert.bio}</p>
                </div>
                
                <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Shield size={18} className="text-green-500" /> Verified Expert
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <CheckCircle size={18} className="text-primary" /> Instant Booking
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Slot Selection */}
          <div className="lg:col-span-2">
            <div className="card h-full">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Calendar className="text-primary" /> Select a Session Slot
              </h2>

              {/* Date Selection */}
              <div className="mb-10">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Available Dates</h4>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                      className={`flex-shrink-0 px-6 py-4 rounded-2xl transition-all border-2 text-center min-w-[120px] ${
                        selectedDate === date 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' 
                        : 'bg-white text-dark border-gray-100 hover:border-primary/30'
                      }`}
                    >
                      <p className="text-xs font-bold opacity-70 uppercase mb-1">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className="text-lg font-black">
                        {new Date(date).getDate()}
                      </p>
                      <p className="text-xs font-bold opacity-70 uppercase mt-1">
                        {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div>
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Available Time Slots</h4>
                {currentDaySlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {currentDaySlots.map((slot, index) => {
                      // Safety checks for old data compatibility
                      const participants = slot.participants || [];
                      const capacity = slot.capacity || 1;
                      const status = slot.status || 'open';
                      const time = slot?.time || (typeof slot === 'string' ? slot : 'Unknown Time');

                      const isFull = participants.length >= capacity;
                      const isClosed = status !== 'open';
                      const isUnavailable = isFull || isClosed;
                      
                      return (
                        <button
                          key={index}
                          disabled={isUnavailable}
                          onClick={() => setSelectedSlot(time)}
                          className={`p-5 rounded-[1.5rem] transition-all border-2 flex flex-col items-center justify-center gap-2 font-bold text-lg relative ${
                            isUnavailable 
                            ? 'bg-gray-50 text-gray-300 border-gray-50 cursor-not-allowed opacity-60'
                            : selectedSlot === time
                              ? 'bg-primary text-white border-primary shadow-xl shadow-primary/30 scale-[1.02]'
                              : 'bg-white text-dark border-gray-100 hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Clock size={20} className={selectedSlot === time ? 'text-white' : 'text-primary'} />
                            {formatTime(time)}
                          </div>
                          <div className={`text-[10px] uppercase tracking-widest ${selectedSlot === time ? 'text-white/80' : 'text-gray-400'}`}>
                            {isFull ? 'Sold Out' : isClosed ? status : `${capacity - participants.length} spots left`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 bg-gray-50 rounded-2xl text-center">
                    <AlertCircle className="mx-auto text-gray-300 mb-4" size={40} />
                    <p className="text-gray-500 font-medium">No sessions scheduled for this date.</p>
                  </div>
                )}
              </div>

              {/* Booking Action */}
              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:row items-center justify-between gap-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Selected Slot</p>
                  <p className="text-xl font-bold">
                    {selectedSlot ? `${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at ${formatTime(selectedSlot)}` : 'Please select a slot'}
                  </p>
                </div>
                <button
                  disabled={!selectedSlot}
                  onClick={() => setShowBookingModal(true)}
                  className={`px-12 py-5 rounded-full font-bold text-lg transition-all ${
                    selectedSlot 
                    ? 'btn-primary shadow-lg shadow-primary/40' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Book Session Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
              onClick={() => setShowBookingModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-3xl font-black text-dark mb-6">Complete Booking</h3>
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter your name"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Email address"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                    <input 
                      type="tel" 
                      required
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Phone number"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Notes (Optional)</label>
                  <textarea 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 h-32 resize-none"
                    placeholder="Tell us what you want to discuss..."
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  />
                </div>
                
                <div className="p-6 bg-secondary/50 rounded-2xl flex items-center gap-4">
                  <Calendar className="text-primary" />
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Session details</p>
                    <p className="font-bold text-dark">{selectedDate} at {formatTime(selectedSlot)}</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] btn-primary py-4 text-lg"
                  >
                    Confirm & Book
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpertDetailPage;
