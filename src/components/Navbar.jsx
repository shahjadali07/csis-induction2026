import { motion } from 'framer-motion';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (location.pathname === '/profile') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Team', path: '/team' },
    { name: 'Join Us', path: '/join' }
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-card border-b border-white/5 py-4 px-6' : 'bg-transparent py-6 px-6'}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00f0ff] to-[#8a2be2] flex items-center justify-center font-bold text-white font-heading shadow-[0_0_10px_rgba(0,240,255,0.5)]">
            C
          </div>
          <span className="font-heading font-bold text-xl tracking-wider text-white">
            CSIS
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] transition-all group-hover:w-full" />
            </Link>
          ))}
          
          <div className="flex gap-4 items-center border-l border-white/10 pl-8 ml-2">
            {user ? (
              <>
                <Link to="/profile">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium text-white"
                  >
                    Dashboard
                  </motion.button>
                </Link>
                <Link to="/profile">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium text-white"
                  >
                    <User size={16} className="text-[#00f0ff]" />
                    Profile
                  </motion.button>
                </Link>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all text-gray-400"
                  title="Logout"
                >
                  <LogOut size={16} />
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium text-white"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-white hover:opacity-90 transition-all text-sm font-medium shadow-[0_0_15px_rgba(138,43,226,0.4)]"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden pt-6 pb-4"
        >
          <div className="flex flex-col gap-4 bg-[#0B1020]/95 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
            {links.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="text-gray-300 hover:text-white text-lg font-medium py-2 border-b border-white/5"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="flex flex-col gap-3 mt-4">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)}>
                    <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium">
                      Dashboard
                    </button>
                  </Link>
                  <Link to="/profile" onClick={() => setIsOpen(false)}>
                    <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium">
                      <User size={18} />
                      Profile
                    </button>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <button className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium">
                      Login
                    </button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <button className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-white font-medium">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
