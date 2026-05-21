import { motion } from 'framer-motion';

export default function About() {
  const stats = [
    { label: "Experiments", value: "100+" },
    { label: "Active Students", value: "2500+" },
    { label: "Tech Domains", value: "6+" },
    { label: "Projects", value: "50+" },
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20"
      >
        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
          Building <span className="text-[#00f0ff]">Innovation</span>. Enabling <span className="text-[#8a2be2]">Virtual Learning</span>.
        </h1>
        <p className="text-gray-400 max-w-3xl mx-auto text-lg md:text-xl">
          CSIS is a student-driven technical society focused on innovation, research, and practical learning. We bridge the gap between academic theory and industry-ready skills.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/20 to-[#8a2be2]/20 blur-3xl -z-10 rounded-full" />
            <img 
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Students collaborating" 
              className="rounded-2xl border border-white/10 shadow-2xl"
            />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div>
            <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="w-10 h-1 bg-gradient-to-r from-[#00f0ff] to-[#8a2be2]" />
              Innovation & Research
            </h3>
            <p className="text-gray-400">
              Fostering creative thinking and breakthrough solutions to real-world problems. We conduct cutting-edge research across AI, cybersecurity, and emerging tech.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="w-10 h-1 bg-gradient-to-r from-[#00f0ff] to-[#8a2be2]" />
              Skill Development
            </h3>
            <p className="text-gray-400">
              Hands-on workshops, hackathons, and virtual labs to accelerate your growth. Access our custom-built Prayukti-VLab platform for 24/7 practical learning.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card text-center p-8 rounded-2xl border border-white/5"
          >
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] bg-clip-text text-transparent mb-2">
              {stat.value}
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wider font-semibold">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
