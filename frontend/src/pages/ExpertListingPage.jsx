import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ExpertCard from '../components/ExpertCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const ExpertListingPage = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    'Business', 'Technology', 'Marketing', 'Design', 'Health', 'Finance'
  ];

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/api/experts?keyword=${search}&category=${category}`);
      setExperts(data);
    } catch (error) {
      console.error('Error fetching experts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchExperts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category]);

  return (
    <div className="pt-32 pb-20 bg-secondary/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-dark mb-4">Find Your Perfect Expert</h1>
          <p className="text-gray-500 text-lg">Browse through hundreds of vetted experts across the globe.</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-2 rounded-3xl shadow-soft mb-12 flex flex-col lg:flex-row gap-2 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or keyword..." 
              className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-dark font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto p-2 lg:p-0">
            <div className="relative flex-grow lg:w-64">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                className="w-full pl-14 pr-10 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 appearance-none outline-none text-dark font-medium cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <button className="px-6 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card h-[450px] animate-pulse bg-gray-100/50"></div>
            ))}
          </div>
        ) : experts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {experts.map(expert => (
              <ExpertCard key={expert._id} expert={expert} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-soft">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-dark mb-2">No experts found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            <button 
              onClick={() => { setSearch(''); setCategory(''); }}
              className="mt-6 text-primary font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertListingPage;
