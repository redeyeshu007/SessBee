import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Users, Calendar, Briefcase, TrendingUp, CheckCircle, XCircle, Plus, Trash2, Edit2, Star, Save, X, FileText, Download, Eye, Lock, Unlock, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatTime = (timeStr) => {
  if (!timeStr) return 'N/A';
  if (!timeStr.includes(':')) return timeStr;
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalBookings: 0, totalExperts: 0, totalUsers: 120, revenue: '$12,450' });
  const [bookings, setBookings] = useState([]);
  const [experts, setExperts] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpert, setEditingExpert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Business',
    experience: '5+ Years',
    bio: '',
    avatar: '',
    availableSlots: []
  });
  const [profileData, setProfileData] = useState({ name: '', email: '', password: '', avatar: '' });

  const handleImageUpload = (e, isProfile = false) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size too large (max 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isProfile) {
          setProfileData(prev => ({ ...prev, avatar: reader.result }));
        } else {
          setFormData(prev => ({ ...prev, avatar: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, expertsRes] = await Promise.all([
        API.get('/api/bookings'),
        API.get('/api/experts'),
      ]);
      setBookings(bookingsRes.data);
      setExperts(expertsRes.data);
      setStats(prev => ({ ...prev, totalBookings: bookingsRes.data.length, totalExperts: expertsRes.data.length }));
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.patch(`/api/bookings/${id}/status`, { status });
      toast.success(`Booking marked as ${status}`);
      fetchData();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDeleteExpert = async (id) => {
    if (!window.confirm('Delete this expert permanently?')) return;
    try {
      await API.delete(`/api/experts/${id}`);
      toast.success('Expert removed');
      fetchData();
    } catch {
      toast.error('Deletion failed');
    }
  };

  const handleOpenModal = (expert = null) => {
    if (expert) {
      setEditingExpert(expert);
      setFormData({
        name: expert.name,
        category: expert.category || 'Business',
        experience: expert.experience || '1 Year',
        bio: expert.bio || '',
        avatar: expert.avatar || '',
        availableSlots: (expert.availableSlots || []).map(slot => {
          if (typeof slot === 'string') {
            return { date: new Date().toISOString().split('T')[0], time: slot, capacity: 1, status: 'open', participants: [] };
          }
          return {
            date: slot.date || '',
            time: slot.time || '',
            capacity: slot.capacity || 1,
            status: slot.status || 'open',
            participants: slot.participants || []
          };
        })
      });
    } else {
      setEditingExpert(null);
      setFormData({
        name: '',
        category: 'Business',
        experience: '5+ Years',
        bio: '',
        avatar: '',
        availableSlots: []
      });
    }
    setShowModal(true);
  };

  const addSlot = () => {
    setFormData({
      ...formData,
      availableSlots: [
        ...formData.availableSlots,
        { date: '', time: '', capacity: 1, status: 'open', participants: [] }
      ]
    });
  };

  const removeSlot = (index) => {
    const newSlots = [...formData.availableSlots];
    newSlots.splice(index, 1);
    setFormData({ ...formData, availableSlots: newSlots });
  };

  const updateSlot = (index, field, value) => {
    const newSlots = [...formData.availableSlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setFormData({ ...formData, availableSlots: newSlots });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.availableSlots.length === 0) {
      toast.error('Please add at least one slot');
      return;
    }
    try {
      if (editingExpert) {
        await API.put(`/api/experts/${editingExpert._id}`, formData);
        toast.success('Expert updated successfully');
      } else {
        await API.post('/api/experts', formData);
        toast.success('Expert added successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put('/api/auth/profile', profileData);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Profile updated successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking? This will free up the slot.')) return;
    try {
      await API.delete(`/api/bookings/${id}`);
      toast.success('Booking deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const generatePDF = (expert) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(255, 79, 139);
    doc.text("SessBe Session Report", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.setDrawColor(240);
    doc.line(14, 35, 196, 35);
    doc.setTextColor(0);
    doc.setFontSize(16);
    doc.text(`Mentor: ${expert.name}`, 14, 45);
    doc.setFontSize(11);
    doc.text(`Category: ${expert.category} | Experience: ${expert.experience}`, 14, 52);

    const normalizedSlots = (expert.availableSlots || []).map(s => {
      if (typeof s === 'string') return { date: 'Legacy Date', time: s, status: 'open', participants: [] };
      return { 
        date: s.date || 'N/A', 
        time: s.time || 'N/A', 
        status: s.status || 'open', 
        participants: s.participants || [],
        capacity: s.capacity || 1
      };
    });

    normalizedSlots.forEach((slot, index) => {
      const startY = 70 + (index * 60);
      if (startY > 250) doc.addPage();
      doc.setFontSize(13);
      doc.setTextColor(255, 79, 139);
      
      const timeLabel = slot.time.includes(':') ? formatTime(slot.time) : slot.time;
      doc.text(`Slot ${index + 1}: ${slot.date} at ${timeLabel}`, 14, startY);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Status: ${slot.status.toUpperCase()} | Capacity: ${slot.participants.length}/${slot.capacity}`, 14, startY + 7);
      
      const slotBookings = bookings.filter(b => 
        b.expert?._id === expert._id && 
        b.date === slot.date && 
        (b.timeSlot === slot.time || b.timeSlot === timeLabel)
      );
      
      const tableData = slotBookings.map((b, i) => [i + 1, b.name || 'Unknown', b.email || '-', b.phone || '-', b.status || 'N/A']);
      
      autoTable(doc, {
        startY: startY + 12,
        head: [['#', 'Name', 'Email', 'Phone', 'Status']],
        body: tableData.length > 0 ? tableData : [['-', 'No participants registered', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [255, 79, 139] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      });
    });
    doc.save(`${expert.name.replace(/\s+/g, '_')}_Report.pdf`);
    toast.success('PDF Report Downloaded');
  };

  useEffect(() => {
    if (activeTab === 'profile' && user) {
      setProfileData({
        name: user.name,
        email: user.email,
        password: '',
        avatar: user.avatar || ''
      });
    }
  }, [activeTab, user]);

  const statCards = [
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Experts', value: stats.totalExperts, icon: Briefcase, color: 'text-primary', bg: 'bg-pink-50' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Revenue', value: stats.revenue, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const statusBadge = (status) => {
    const map = { Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200', Pending: 'bg-amber-50 text-amber-700 border-amber-200', Completed: 'bg-blue-50 text-blue-700 border-blue-200' };
    return map[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-40 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-500 text-lg">Monitor and manage your platform sessions.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {statCards.map((s, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`${s.bg} ${s.color} p-3 rounded-xl`}><s.icon size={22} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {['bookings', 'experts'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl font-bold text-sm capitalize transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-500 border border-gray-100 hover:border-primary/30'}`}>
              {tab === 'bookings' ? '📋 Bookings' : '👥 Experts'}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : activeTab === 'bookings' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['User', 'Expert', 'Schedule', 'Status', 'Actions'].map(h => <th key={h} className={`px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map(b => (
                    <tr key={b._id}>
                      <td className="px-6 py-4"><p className="font-bold">{b.name}</p></td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{b.expert?.name || 'Deleted Expert'}</p>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-tight">{b.expert?.category || 'General'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{b.date}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{b.timeSlot}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge(b.status)}`}>{b.status}</span></td>
                      <td className="px-6 py-4 text-right flex gap-2 justify-end">
                        <button onClick={() => handleStatusUpdate(b._id, 'Confirmed')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Confirm"><CheckCircle size={16}/></button>
                        <button onClick={() => handleDeleteBooking(b._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'experts' ? (
            <div>
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-extrabold">Expert Roster</h3>
                <button onClick={() => handleOpenModal()} className="btn-primary py-2.5 px-5 gap-2 text-sm"><Plus size={16} /> Create Session</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b"><tr>{['Expert', 'Active Slots', 'Status', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-xs uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y">
                    {experts.map(e => (
                      <tr key={e._id}>
                        <td className="px-6 py-4 font-bold">{e.name}</td>
                        <td className="px-6 py-4">{e.availableSlots?.length || 0} Slots</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs">Active</span></td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => generatePDF(e)} className="p-2 text-emerald-500"><Download size={18} /></button>
                          <button onClick={() => handleOpenModal(e)} className="p-2 text-blue-500"><Edit2 size={18} /></button>
                          <button onClick={() => handleDeleteExpert(e._id)} className="p-2 text-red-400"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-dark/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="bg-white w-full max-w-4xl rounded-3xl sm:rounded-[40px] shadow-2xl relative z-10 overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col" >
                <div className="p-5 sm:p-8 border-b flex justify-between items-center bg-gray-50/30">
                  <h2 className="text-xl sm:text-2xl font-black">{editingExpert ? 'Manage Session' : 'Create New Session'}</h2>
                  <button onClick={() => setShowModal(false)} className="p-2 sm:p-3 hover:bg-gray-200 rounded-2xl"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-8 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Mentor Name</label>
                        <input type="text" required className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                          <select className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-none font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {['Business', 'Technology', 'Marketing', 'Design', 'Health', 'Finance'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase">Experience</label>
                          <input type="text" placeholder="e.g. 5+ Years" className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-none font-bold" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Mentor Photo</label>
                        <div className="flex items-center gap-4">
                          {formData.avatar && (
                            <img src={formData.avatar} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-primary" />
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            required={!formData.avatar}
                            className="flex-1 px-5 py-4 bg-gray-50 rounded-2xl border-none font-medium text-sm" 
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setFormData({ ...formData, avatar: reader.result });
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Bio</label>
                        <textarea required rows={3} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-none font-medium" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-black uppercase tracking-widest">Defined Slots</h4>
                        <button type="button" onClick={addSlot} className="text-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"><Plus size={14} /> Add Slot</button>
                      </div>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {formData.availableSlots.map((slot, index) => (
                          <div key={index} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase">Slot #{index + 1}</span>
                              <button type="button" onClick={() => removeSlot(index)} className="text-red-400"><Trash2 size={14} /></button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Date</label>
                                <input type="date" required className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs" value={slot.date} onChange={e => updateSlot(index, 'date', e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Time</label>
                                <select 
                                  required 
                                  className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs" 
                                  value={slot.time} 
                                  onChange={e => updateSlot(index, 'time', e.target.value)}
                                >
                                  <option value="">Select Time</option>
                                  {Array.from({ length: 34 }).map((_, i) => {
                                    const h = Math.floor(i / 2) + 6;
                                    const m = (i % 2) * 30;
                                    const time24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                    const ampm = h >= 12 ? 'PM' : 'AM';
                                    const h12 = h % 12 || 12;
                                    const label = `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
                                    return <option key={time24} value={time24}>{label}</option>;
                                  })}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Capacity</label>
                                <input type="number" min="1" required className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs" value={slot.capacity} onChange={e => updateSlot(index, 'capacity', e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                                <select className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs" value={slot.status} onChange={e => updateSlot(index, 'status', e.target.value)}>
                                  <option value="open">Open</option><option value="closed">Closed</option><option value="finalized">Finalized</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-primary text-white py-5 rounded-[24px] font-black text-lg shadow-xl">{editingExpert ? 'Save Session' : 'Publish Session'}</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
