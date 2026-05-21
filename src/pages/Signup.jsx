import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const { register, googleSignIn, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!department) {
      toast.error("Please select a department");
      return;
    }
    if (!year) {
      toast.error("Please select an academic year");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      await register(email, password, name, department, year);
      navigate("/profile", { replace: true });
    } catch (error) {
      // Error handled inside AuthContext
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      navigate("/profile", { replace: true });
    } catch (error) {
      // Error handled
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center relative">
      {/* Dynamic Background Glow Overlay */}
      <div className="absolute inset-0 bg-[#04060A] -z-20" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#8a2be2]/20 to-[#00f0ff]/20 blur-2xl -z-10 rounded-3xl" />
        
        <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#8a2be2]/30 to-transparent blur-2xl rounded-full" />
          
          <div className="text-center mb-8 relative z-10">
            <h2 className="text-3xl font-heading font-extrabold mb-2 tracking-wide text-white">Create Account</h2>
            <p className="text-gray-400 text-sm font-mono">Join the CSIS futuristic developer community</p>
          </div>

          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 block">Full Name</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#8a2be2] focus:ring-1 focus:ring-[#8a2be2]/30 transition-all font-mono text-sm"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 block">Email Address</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.ac.in"
                  className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#8a2be2] focus:ring-1 focus:ring-[#8a2be2]/30 transition-all font-mono text-sm"
                />
              </div>
            </div>

            {/* Department and Academic Year Dropdowns */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 block">Department</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <BookOpen size={18} />
                  </div>
                  <select 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#8a2be2] focus:ring-1 focus:ring-[#8a2be2]/30 transition-all font-mono text-sm appearance-none [&>option]:bg-[#070B13]"
                  >
                    <option value="">Select</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 block">Academic Year</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <GraduationCap size={18} />
                  </div>
                  <select 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#8a2be2] focus:ring-1 focus:ring-[#8a2be2]/30 transition-all font-mono text-sm appearance-none [&>option]:bg-[#070B13]"
                  >
                    <option value="">Select</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 block">Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#8a2be2] focus:ring-1 focus:ring-[#8a2be2]/30 transition-all font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 block">Confirm</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#8a2be2] focus:ring-1 focus:ring-[#8a2be2]/30 transition-all font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Trigger Buttons */}
            <button 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-[#8a2be2] to-[#00f0ff] text-black font-extrabold py-3.5 rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-2 group mt-6 disabled:opacity-50 shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer"
            >
              {loading ? "Initializing Node..." : "Create Workspace Profile"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              type="button" 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full mt-4 bg-white/5 border border-white/10 text-white font-semibold py-3.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8 relative z-10">
            Already registered?{' '}
            <Link to="/login" className="text-white font-semibold hover:text-[#8a2be2] transition-colors">
              Access account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
