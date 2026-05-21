import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Brain, Calendar, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardSidebar({ user, activeTab, setActiveTab, onSubmitInduction, onLogout, inductionForm }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'status', label: 'Application Status', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Dynamically append the Admin operations panel if the logged-in user holds the 'admin' security clearance role
  if (user?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Command', icon: ShieldAlert });
  }

  return (
    <div className="h-full flex flex-col justify-between py-8 px-6 bg-[#070B13]/90 border-r border-white/5 backdrop-blur-xl relative z-20">
      {/* Top Logo Section */}
      <div className="space-y-6">
        <Link to="/" className="block">
          <div className="flex flex-col gap-1">
            <span className="font-heading font-extrabold text-3xl tracking-widest text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">
              CSIS
            </span>
            <span className="text-xs uppercase tracking-[0.2em] font-mono text-gray-500 font-bold">
              Innovation Hub
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="space-y-2 mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all text-left relative overflow-hidden group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00f0ff]/10 to-transparent border-[#00f0ff]/30 text-white font-medium shadow-[inset_0_0_15px_rgba(0,240,255,0.05)]'
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00f0ff] to-[#8a2be2]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <Icon
                  size={20}
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-[#00f0ff]' : 'text-gray-400 group-hover:text-white'
                  }`}
                />
                
                <span className="text-sm font-medium transition-transform duration-300 group-hover:translate-x-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Action / Logout Section */}
      <div className="space-y-4 pt-6 border-t border-white/5">
        {!inductionForm ? (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSubmitInduction}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#00d0ff] text-black font-semibold text-sm text-center shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all cursor-pointer font-heading tracking-wide"
          >
            Fill Induction Form
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('status')}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm text-center shadow-[0_0_20px_rgba(138,43,226,0.3)] hover:shadow-[0_0_30px_rgba(138,43,226,0.5)] hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer font-heading tracking-wide"
          >
            View Application
          </motion.button>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-left group"
        >
          <LogOut size={18} className="text-gray-500 group-hover:text-red-400 transition-colors" />
          <span className="text-xs font-semibold uppercase tracking-wider font-mono">
            Exit Workspace
          </span>
        </button>
      </div>
    </div>
  );
}
