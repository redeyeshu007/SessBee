import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Zap, Users, Play, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-br from-[#FFF1F6] via-white to-[#FFF1F6] pt-40 pb-16">
        {/* Background blobs */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-100 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          {/* Centered: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-5xl lg:text-8xl font-black text-gray-900 leading-[1] mb-8 tracking-tighter">
              Book Experts <br />
              <span className="text-primary italic">Instantly.</span>
            </h1>

            <p className="text-2xl text-gray-500 mb-12 leading-relaxed max-w-2xl mx-auto">
              Connect with world-class mentors, consultants, and industry leaders for real-time 1-on-1 sessions.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
              <Link
                to="/experts"
                className="btn-primary gap-3 text-xl px-12 py-6 shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
              >
                Explore Experts <ArrowRight size={22} />
              </Link>
              <Link
                to="/register"
                className="px-10 py-5 bg-white text-gray-900 rounded-3xl font-bold text-lg border-2 border-gray-100 hover:border-primary/20 hover:bg-gray-50 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How SessBe Works</h2>
            <p className="text-gray-500 text-lg">Three simple steps to connect with the best in the industry.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Find your expert', desc: 'Browse our curated list of vetted experts across various categories and skills.', num: '01' },
              { icon: Calendar, title: 'Choose a slot', desc: "Pick a time that works for you from the expert's real-time live availability.", num: '02' },
              { icon: Shield, title: 'Secure booking', desc: 'Confirm your booking instantly with secure authentication and get notified.', num: '03' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="card text-center group hover:-translate-y-2"
              >
                <div className="relative w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-colors duration-300">
                  <feature.icon size={28} className="text-primary group-hover:text-white transition-colors duration-300" />
                  <span className="absolute -top-3 -right-3 w-7 h-7 bg-primary text-white rounded-full text-xs font-black flex items-center justify-center shadow-lg">
                    {feature.num}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#FFF1F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Experts', value: '500+' },
              { label: 'Sessions Booked', value: '15k+' },
              { label: 'Avg Rating', value: '4.9/5' },
              { label: 'Categories', value: '50+' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <p className="text-4xl lg:text-5xl font-black text-primary mb-2">{stat.value}</p>
                <p className="text-gray-500 font-semibold uppercase tracking-wider text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Features Row */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold mb-6">
                Why SessBe
              </span>
              <h2 className="text-5xl font-black text-gray-900 mb-6 leading-tight">
                Everything you need to <br /> grow with experts
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                { title: 'Real-time availability', desc: 'See live slots, no outdated calendars or back-and-forth emails.' },
                { title: 'Zero double-bookings', desc: 'Our real-time sync ensures your slot is always guaranteed.' },
                { title: 'Verified experts only', desc: 'Every expert is vetted and reviewed by our quality team.' },
                { title: 'Instant confirmation', desc: 'Get confirmed within seconds, not hours or days.' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-5 items-start p-6 rounded-3xl hover:bg-secondary/10 transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-primary/20">
                    <CheckCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-gray-900 mb-2">{item.title}</p>
                    <p className="text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#FFF1F6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-32 -mb-32 pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                Ready to elevate your career?
              </h2>
              <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of professionals growing with SessBe experts every day.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-primary px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-xl"
              >
                Get Started Free <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
