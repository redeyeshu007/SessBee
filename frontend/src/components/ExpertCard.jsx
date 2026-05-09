import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const ExpertCard = ({ expert }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card flex flex-col h-full group"
    >
      <div className="relative mb-6 overflow-hidden rounded-xl h-48">
        <img 
          src={expert.avatar} 
          alt={expert.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold">{expert.rating}</span>
        </div>
      </div>
      
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-primary text-xs font-black uppercase tracking-widest bg-primary/5 px-2 py-1 rounded">{expert.category}</span>
          <div className="flex items-center gap-1 text-gray-500 font-bold text-sm">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            {expert.rating}
          </div>
        </div>
        <h3 className="text-xl font-extrabold mb-3 text-dark group-hover:text-primary transition-colors">{expert.name}</h3>
        
        <div className="flex items-center gap-3 text-gray-400 text-xs font-bold uppercase tracking-wider mb-6">
          <div className="flex items-center gap-1">
            <Briefcase size={14} />
            <span>{expert.experience}</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center gap-1 text-green-500">
            <Clock size={14} />
            <span>Available</span>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-8">
          {expert.bio}
        </p>
      </div>

      <Link 
        to={`/experts/${expert._id}`} 
        className="w-full py-4 bg-gray-50 text-dark rounded-2xl font-bold text-center group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300"
      >
        View Expert Details
      </Link>
    </motion.div>
  );
};

export default ExpertCard;
