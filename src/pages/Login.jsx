import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff, X, Send } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  
  const { login, googleSignIn, forgotPassword, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/profile";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please fill in all credentials");
      return;
    }
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is caught and printed by AuthContext toast
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      navigate(from, { replace: true });
    } catch (error) {
      // Error handled
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      toast.error("Recovery email is empty");
      return;
    }
    setRecoveryLoading(true);
    try {
      await forgotPassword(recoveryEmail);
      setRecoveryOpen(false);
      setRecoveryEmail('');
    } catch (error) {
      // Error handled by AuthContext toast
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center relative">
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[#04060A] -z-20" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/20 to-[#8a2be2]/20 blur-2xl -z-10 rounded-3xl" />
        
        <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00f0ff]/30 to-transparent blur-2xl rounded-full" />
          
          <div className="text-center mb-8 relative z-10">
            <h2 className="text-3xl font-heading font-extrabold mb-2 tracking-wide text-white">Welcome Back</h2>
            <p className="text-gray-400 text-sm font-mono">Access your CSIS developer induction dashboard</p>
          </div>

          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
            {/* Email Field */}
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
                  className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 transition-all font-mono text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Password</label>
                <button 
                  type="button" 
                  onClick={() => setRecoveryOpen(true)}
                  className="text-xs font-mono text-[#00f0ff] hover:underline cursor-pointer font-bold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl py-3.5 pl-10 pr-12 text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 transition-all font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="remember" className="rounded border-white/20 bg-[#070B13]/60 text-[#00f0ff] focus:ring-0" />
              <label htmlFor="remember" className="text-xs font-mono text-gray-400 cursor-pointer">Remember me</label>
            </div>

            {/* Submit Actions */}
            <button 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-black font-extrabold py-3.5 rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-2 group mt-6 disabled:opacity-50 shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer"
            >
              {loading ? "Authenticating..." : "login"}
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

          <p className="text-center text-sm text-gray-400 mt-8 relative z-10 font-mono">
            Don't have an account?{' '}
            <Link to="/signup" className="text-white font-semibold hover:text-[#00f0ff] transition-colors">
              Sign up first
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Futuristic Password Recovery Popup Overlay Modal */}
      <AnimatePresence>
        {recoveryOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#070b13] border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,240,255,0.15)] relative overflow-hidden"
            >
              <button 
                onClick={() => setRecoveryOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="space-y-6 pt-4">
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-extrabold font-heading text-white">Reset Credentials</h3>
                  <p className="text-xs font-mono text-gray-500">
                    Input your synchronized email to receive password recovery protocols.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 block">Recovery Email</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail size={18} />
                      </div>
                      <input 
                        type="email" 
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="name@university.ac.in"
                        className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 transition-all font-mono text-sm"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
                  >
                    {recoveryLoading ? "Dispatching..." : "Dispatch Recovery Protocols"}
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
