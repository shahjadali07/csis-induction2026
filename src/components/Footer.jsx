import { motion } from 'framer-motion';
import { Code as Github, Globe as Linkedin, Camera as Instagram, MessageCircle as Discord } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();

  if (location.pathname === '/profile') {
    return null;
  }
  const socialLinks = [
    { icon: <Discord size={20} />, href: "#", color: "hover:text-[#5865F2] hover:border-[#5865F2]/50 hover:shadow-[0_0_15px_rgba(88,101,242,0.4)]" },
    { icon: <Github size={20} />, href: "#", color: "hover:text-white hover:border-white/50 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]" },
    { icon: <Linkedin size={20} />, href: "#", color: "hover:text-[#0077b5] hover:border-[#0077b5]/50 hover:shadow-[0_0_15px_rgba(0,119,181,0.4)]" },
    { icon: <Instagram size={20} />, href: "#", color: "hover:text-[#e1306c] hover:border-[#e1306c]/50 hover:shadow-[0_0_15px_rgba(225,48,108,0.4)]" }
  ];

  return (
    <footer className="glass-card border-t border-white/5 py-10 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00f0ff] to-[#8a2be2] flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            C
          </div>
          <span className="font-heading font-bold text-xl tracking-wider">
            CSIS
          </span>
        </div>
        
        <div className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Computer Science & Innovation Society. All rights reserved.
        </div>
        
        <div className="flex gap-4">
          {socialLinks.map((social, i) => (
            <motion.a 
              key={i}
              href={social.href}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 transition-all ${social.color}`}
            >
              {social.icon}
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
}
