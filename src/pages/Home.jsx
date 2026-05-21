import { motion } from 'framer-motion';
import { ArrowRight, Code, Terminal, Cpu, Users, ChevronRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleJoinClick = () => {
    if (user) {
      navigate('/induction-form');
    } else {
      navigate('/signup');
    }
  };

  const aboutCards = [
    { title: "Web Development", icon: <Code size={24} />, desc: "Build modern scalable web apps." },
    { title: "AI / ML", icon: <Cpu size={24} />, desc: "Dive deep into neural networks." },
    { title: "Open Source", icon: <Terminal size={24} />, desc: "Contribute to global projects." }
  ];

  const stats = [
    { label: "Members", value: "2.5K+" },
    { label: "Events Conducted", value: "100+" },
    { label: "Projects Built", value: "50+" },
    { label: "Workshops", value: "25+" }
  ];

  return (
    <div className="pt-32 pb-20 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="min-h-[80vh] flex items-center justify-center relative px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 tracking-tight">
              CSIS — Computer Science & <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#8a2be2]">
                Innovation Society
              </span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium text-gray-300 mb-6">
              Build • Learn • Innovate
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              A student-led tech community focused on Web Development, AI/ML, Open Source, DSA, Design, and Innovation.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button onClick={handleJoinClick} className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-white font-bold text-lg hover:opacity-90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2 group">
              Join Community
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/events')} className="px-8 py-4 rounded-xl glass-card border border-white/20 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2">
              Explore Events
              <Play size={18} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT CSIS SECTION */}
      <section className="py-32 px-6 max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold mb-4">What We Do</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {aboutCards.map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5 }}
              className="glass-card p-8 rounded-2xl border border-white/5 hover:border-[#00f0ff]/50 transition-all cursor-pointer group hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#8a2be2]/20 flex items-center justify-center text-[#00f0ff] mb-6 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
              <p className="text-gray-400">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. STATS SECTION */}
      <section className="py-20 relative z-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring" }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CORE TEAM (Preview) & EVENTS (Preview) */}
      <section className="py-32 px-6 max-w-7xl mx-auto relative z-10 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-4xl font-heading font-bold mb-4">Upcoming Events</h2>
          <p className="text-gray-400">Join our upcoming hackathons and workshops.</p>
        </motion.div>
        
        <div className="w-full max-w-4xl glass-card rounded-3xl p-2 border border-white/10 overflow-hidden relative group">
          <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Event Banner" className="w-full h-64 object-cover rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
            <div>
              <span className="px-3 py-1 bg-[#8a2be2] text-white text-xs font-bold rounded-full mb-3 inline-block">TECH FEST</span>
              <h3 className="text-3xl font-bold">CSIS Open Source Fellowship 2026</h3>
              <p className="text-gray-300 mt-2">The ultimate computer science festival. Showcase your skills.</p>
            </div>
            <button className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
              Register
            </button>
          </div>
        </div>
      </section>
      
      {/* 6. JOIN COMMUNITY CTA */}
      <section className="py-32 relative z-10 text-center px-6">
        <div className="max-w-3xl mx-auto glass-card p-12 rounded-3xl border border-[#00f0ff]/30 shadow-[0_0_50px_rgba(0,240,255,0.1)]">
          <h2 className="text-4xl font-bold mb-6">Ready to Innovate?</h2>
          <p className="text-gray-400 mb-8 text-lg">Join thousands of students building the future of technology.</p>
          <button onClick={handleJoinClick} className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-white font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto shadow-[0_0_20px_rgba(138,43,226,0.4)]">
            Join CSIS Now
            <ChevronRight />
          </button>
        </div>
      </section>
    </div>
  );
}
