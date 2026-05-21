import { motion } from 'framer-motion';
import { Code as Github, Globe as Linkedin, Mail } from 'lucide-react';

export default function Team() {
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "President",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Sarah Chen",
      role: "Technical Lead",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Michael Torres",
      role: "Head of AI Research",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Emma Davis",
      role: "Events Coordinator",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20"
      >
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
          The People Behind <span className="text-[#00f0ff]">CSIS</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          A dedicated team of passionate students working to advance innovation, learning, and collaboration within the university.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative rounded-2xl overflow-hidden glass-card border border-white/10"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img 
                src={member.image} 
                alt={member.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/80 to-transparent opacity-90 transition-opacity duration-300" />
            
            <div className="absolute bottom-0 left-0 w-full p-6 translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
              <p className="text-[#00f0ff] text-sm font-medium mb-4">{member.role}</p>
              
              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <Linkedin size={18} />
                </a>
                <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <Github size={18} />
                </a>
                <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
