import { motion } from 'framer-motion';

export default function Hero({ onJoinClick }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden" id="home">
      <div className="max-w-7xl mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block mb-6 px-4 py-1.5 rounded-full glass-card text-sm font-medium text-[#00f0ff] border border-[#00f0ff]/30"
        >
          🚀 Welcome to the Future
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading mb-6 tracking-tight"
        >
          CSIS Recruitment <br/>
          <span className="text-gradient">2026</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 font-light mb-8 max-w-2xl mx-auto"
        >
          Build &bull; Learn &bull; Innovate
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg leading-relaxed"
        >
          A student-led tech community focused on Web Development, AI/ML, DSA, Open Source, Design, and Innovation.
        </motion.p>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onJoinClick}
          className="glow-button bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-white px-10 py-4 rounded-full font-bold text-lg tracking-wide inline-flex items-center gap-2"
        >
          Join Now
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </motion.button>
      </div>
    </section>
  );
}
