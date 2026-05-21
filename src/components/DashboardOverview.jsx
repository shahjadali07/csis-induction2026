import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bell, CheckCircle2, Shield, Hourglass, ArrowRight, Lock, 
  Code, FolderGit2, Star, Target, Users, BookOpen
} from 'lucide-react';

export default function DashboardOverview({ user, inductionForm, notifications = [] }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Render a locked empty state wrapper
  const LockedState = ({ title, message }) => (
    <div className="absolute inset-0 bg-[#04060A]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 rounded-3xl border border-white/5 transition-all">
      <div className="w-12 h-12 rounded-full bg-[#0B0F19] border border-white/10 flex items-center justify-center text-gray-500 shadow-[0_0_20px_rgba(0,0,0,0.5)] mb-4">
        <Lock size={20} />
      </div>
      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-mono mb-2">{title} Locked</h4>
      <p className="text-[11px] text-gray-500 font-mono leading-relaxed px-4">{message || "Complete your induction form to unlock profile insights."}</p>
    </div>
  );

  return (
    <div className="space-y-8 relative pb-12">
      
      {/* 1. Welcome Header area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-white">
            Welcome back, <span className="text-gradient">{user?.name || "Student"}</span>
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
            <span className={`w-2.5 h-2.5 rounded-full ${inductionForm ? 'bg-[#00f0ff] animate-pulse' : 'bg-gray-500'}`} />
            <span>Profile Status: {inductionForm ? 'Active' : 'Awaiting Setup'}</span>
          </div>
        </div>

        {/* Notifications & Avatar */}
        <div className="flex items-center gap-4 self-end md:self-auto">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-3 rounded-full bg-[#0E1528] border border-white/10 text-gray-300 hover:text-[#00f0ff] hover:border-[#00f0ff]/30 transition-all shadow-[0_0_15px_rgba(0,0,0,0.2)] cursor-pointer"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.7)] animate-ping" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.7)]" />
                </>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-[#070b13] border border-white/10 rounded-3xl p-5 shadow-2xl z-30 space-y-4"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-xs font-mono font-bold text-gray-400 tracking-wider">SYSTEM ALERTS</span>
                    <button onClick={() => setNotificationsOpen(false)} className="text-gray-500 hover:text-white text-xs cursor-pointer font-mono">
                      Clear
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 rounded-xl bg-white/5 text-xs text-gray-300 hover:bg-white/10 transition-colors font-mono leading-relaxed border border-white/5">
                        <span className="text-[#00f0ff] font-bold block mb-1">SYSTEM NOTIFICATION</span>
                        {notif.text}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-[#00f0ff] to-[#8a2be2] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <div className="w-full h-full rounded-full bg-[#0B0F19] overflow-hidden flex items-center justify-center">
              <img src={user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Alex&backgroundColor=0f172a"} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* 1.5. Registration CTA if not submitted */}
      {!inductionForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 border border-[#00f0ff]/30 relative overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.15)] bg-gradient-to-r from-[#00f0ff]/10 to-[#8a2be2]/5"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#00f0ff]/20 to-transparent blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 uppercase tracking-widest animate-pulse">
                ACTION REQUIRED
              </span>
              <h3 className="text-2xl font-bold font-heading text-white">Complete Your Induction Form</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">
                Your profile is currently empty. Submit the official induction form to dynamically populate your tech portfolio, unlock insights, and join the CSIS network.
              </p>
            </div>
            
            <Link
              to="/join"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#00d0ff] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all font-heading self-start md:self-auto shrink-0"
            >
              Fill Induction Form
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* 2. Grid Dashboard Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left hand column cards */}
        <div className="xl:col-span-1 space-y-8">
          
          {/* Identity card profile */}
          <div className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden group hover:border-[#00f0ff]/20 transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#00f0ff]/10 to-[#8a2be2]/10 blur-xl -z-10 group-hover:scale-110 transition-transform duration-500" />

            <div className="text-center space-y-6">
              <div className="relative w-28 h-28 mx-auto rounded-full bg-[#080d1a] border-4 border-[#00f0ff] p-1 shadow-[0_0_20px_rgba(0,240,255,0.25)] flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-shadow">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#070b13]">
                  <img src={user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Alex&backgroundColor=0f172a"} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold font-heading text-white">{user?.name || "Student User"}</h2>
                <p className="text-[#00f0ff] font-mono text-xs uppercase tracking-widest font-bold">
                  {user?.role === 'admin' ? 'ADMIN CLEARANCE' : 'MEMBER'}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3.5 text-left font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase text-xs font-bold">Email</span>
                  <span className="text-gray-300 font-semibold text-xs truncate max-w-[170px]" title={user?.email}>{user?.email || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase text-xs font-bold">Department</span>
                  <span className="text-gray-300 font-semibold">{user?.department || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase text-xs font-bold">Year</span>
                  <span className="text-gray-300 font-semibold">{user?.year || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Technologies */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden group hover:border-[#00f0ff]/20 transition-all min-h-[160px]">
             <h3 className="font-heading font-extrabold text-sm uppercase tracking-[0.15em] text-white mb-6 flex items-center gap-2">
              <Code size={16} className="text-[#00f0ff]" />
              Skills & Technologies
            </h3>
            {inductionForm ? (
               <div className="flex flex-wrap gap-2">
                 {inductionForm.skills ? inductionForm.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] text-xs font-mono rounded-full font-bold shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:bg-[#00f0ff]/20 transition-colors cursor-default">
                       {skill.trim()}
                    </span>
                 )) : <span className="text-gray-500 font-mono text-xs">No skills listed</span>}
               </div>
            ) : (
               <LockedState title="Skills" message="No skills added yet." />
            )}
          </div>

          {/* Domains of Interest */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden group hover:border-[#8a2be2]/20 transition-all min-h-[160px]">
             <h3 className="font-heading font-extrabold text-sm uppercase tracking-[0.15em] text-white mb-6 flex items-center gap-2">
              <Target size={16} className="text-[#8a2be2]" />
              Domains of Interest
            </h3>
            {inductionForm ? (
               <div className="flex flex-wrap gap-2">
                 {inductionForm.domains && inductionForm.domains.length > 0 ? inductionForm.domains.map((domain, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#8a2be2]/10 border border-[#8a2be2]/20 text-[#8a2be2] text-xs font-mono rounded-full font-bold shadow-[0_0_10px_rgba(138,43,226,0.1)] hover:bg-[#8a2be2]/20 transition-colors cursor-default">
                       {domain}
                    </span>
                 )) : <span className="text-gray-500 font-mono text-xs">No domains listed</span>}
               </div>
            ) : (
               <LockedState title="Domains" message="Complete induction to map domains." />
            )}
          </div>

        </div>

        {/* Right columns main content streams */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Dynamic Application Stream Timeline */}
          <div className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <h3 className="font-heading font-extrabold text-xl text-white">Application Status</h3>
              <span className={`px-4 py-1.5 text-xs font-mono font-extrabold tracking-wider border rounded-full uppercase w-fit ${
                !inductionForm ? 'bg-gray-500/10 text-gray-400 border-gray-500/30' :
                inductionForm.status === 'accepted' ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.3)] animate-pulse' :
                inductionForm.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                'bg-[#8a2be2]/10 text-[#8a2be2] border-[#8a2be2]/30 shadow-[0_0_10px_rgba(138,43,226,0.2)]'
              }`}>
                {!inductionForm ? 'Profile Created' :
                 inductionForm.status === 'accepted' ? 'Inducted & Certified' :
                 inductionForm.status === 'rejected' ? 'Rejected' :
                 'Induction Pending Review'}
              </span>
            </div>

            <div className="relative py-4">
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-white/5 -translate-y-1/2 rounded-full" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: !inductionForm 
                    ? '33%' 
                    : inductionForm.status === 'accepted' 
                      ? '100%' 
                      : '66%' 
                }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className={`absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.5)] ${
                  inductionForm?.status === 'rejected' ? 'bg-red-500' : 'bg-gradient-to-r from-[#00f0ff] via-[#8a2be2] to-[#00f0ff]'
                }`}
              />

              <div className="relative flex justify-between items-center">
                {/* Checkpoint 1: Profile Created */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#04060A] border-2 border-[#00f0ff] flex items-center justify-center text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)] relative z-10">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-400">Profile</span>
                </div>

                {/* Checkpoint 2: Assessment */}
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 border-2 transition-all ${
                    inductionForm 
                      ? 'bg-[#04060A] border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
                      : 'bg-[#081222] border-[#00f0ff] text-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.5)] animate-pulse'
                  }`}>
                    {inductionForm ? <CheckCircle2 size={18} /> : <Hourglass size={18} />}
                  </div>
                  <span className={`text-xs font-mono font-bold ${inductionForm ? 'text-gray-400' : 'text-[#00f0ff]'}`}>Assessment</span>
                </div>

                {/* Checkpoint 3: Induction Review */}
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 border-2 transition-all ${
                    inductionForm
                      ? inductionForm.status === 'accepted' 
                        ? 'bg-[#04060A] border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                        : inductionForm.status === 'rejected'
                          ? 'bg-[#04060A] border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                          : 'bg-[#081222] border-[#8a2be2] text-[#8a2be2] shadow-[0_0_20px_rgba(138,43,226,0.5)] animate-pulse'
                      : 'bg-[#04060A] border-white/10 text-gray-700'
                  }`}>
                    {inductionForm && inductionForm.status === 'accepted' ? <CheckCircle2 size={18} /> : 
                     inductionForm && inductionForm.status === 'pending' ? <Hourglass size={18} /> : 
                     <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <span className={`text-xs font-mono font-bold ${
                    inductionForm?.status === 'pending' ? 'text-[#8a2be2]' : 'text-gray-500'
                  }`}>Induction</span>
                </div>

                {/* Checkpoint 4: Certified */}
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 border-2 transition-all ${
                    inductionForm && inductionForm.status === 'accepted'
                      ? 'bg-[#04060A] border-[#00f0ff] text-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.6)] animate-pulse'
                      : 'bg-[#04060A] border-white/10 text-gray-700'
                  }`}>
                    <Shield size={18} />
                  </div>
                  <span className={`text-xs font-mono font-bold ${
                    inductionForm?.status === 'accepted' ? 'text-[#00f0ff] drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]' : 'text-gray-500'
                  }`}>Certified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Induction Profile Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Project Experience */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden min-h-[200px] md:col-span-2 hover:border-white/20 transition-all">
              <h3 className="font-heading font-extrabold text-sm uppercase tracking-[0.15em] text-white mb-6 flex items-center gap-2">
                <FolderGit2 size={16} className="text-[#00f0ff]" />
                Project Experience
              </h3>
              {inductionForm ? (
                inductionForm.hasProject === 'Yes' ? (
                   <div className="space-y-4">
                     <div className="flex justify-between items-start">
                       <div>
                         <h4 className="text-lg font-bold text-white leading-tight mb-1">{inductionForm.projectTitle}</h4>
                         <span className="text-xs text-[#00f0ff] font-mono border border-[#00f0ff]/20 bg-[#00f0ff]/10 px-2 py-0.5 rounded-full inline-block mt-1">
                           {inductionForm.projectTeamType} Project
                         </span>
                       </div>
                       {inductionForm.projectGithub && (
                          <a href={inductionForm.projectGithub} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-colors font-mono flex items-center gap-1">
                             GitHub <ArrowRight size={12} />
                          </a>
                       )}
                     </div>
                     <p className="text-sm text-gray-400 font-mono leading-relaxed bg-[#070b13]/60 p-4 rounded-xl border border-white/5">{inductionForm.projectDescription}</p>
                     <div className="pt-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-2">Technologies Used</span>
                        <p className="text-xs text-[#8a2be2] font-mono font-bold tracking-wide">{inductionForm.projectTechUsed}</p>
                     </div>
                   </div>
                ) : (
                   <div className="flex items-center justify-center h-full pb-4">
                     <span className="text-gray-500 font-mono text-sm">No projects submitted or currently learning.</span>
                   </div>
                )
              ) : (
                <LockedState title="Projects" message="Projects not submitted." />
              )}
            </div>

            {/* Certifications & Experience */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden min-h-[200px] hover:border-white/20 transition-all">
              <h3 className="font-heading font-extrabold text-sm uppercase tracking-[0.15em] text-white mb-6 flex items-center gap-2">
                <Star size={16} className="text-[#8a2be2]" />
                Experience
              </h3>
              {inductionForm ? (
                 <div className="space-y-5">
                   <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-2">Participated In</span>
                      <div className="flex flex-wrap gap-2">
                         {inductionForm.participatedEvents && inductionForm.participatedEvents.length > 0 ? 
                           inductionForm.participatedEvents.map(evt => (
                             <span key={evt} className="text-xs text-gray-300 bg-[#0E1528] border border-white/10 px-2 py-1 rounded-lg font-mono">{evt}</span>
                           )) : <span className="text-gray-600 text-xs font-mono italic">No events listed</span>
                         }
                      </div>
                   </div>
                   {inductionForm.certifications && (
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Certifications</span>
                        <p className="text-sm text-white font-mono">{inductionForm.certifications}</p>
                      </div>
                   )}
                 </div>
              ) : (
                <LockedState title="Experience" />
              )}
            </div>

            {/* Preferred Team & Contributions */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden min-h-[200px] hover:border-white/20 transition-all flex flex-col justify-between">
              <h3 className="font-heading font-extrabold text-sm uppercase tracking-[0.15em] text-white mb-6 flex items-center gap-2">
                <Users size={16} className="text-[#00f0ff]" />
                Team Placement
              </h3>
              {inductionForm ? (
                 <div className="space-y-5 flex-1 flex flex-col justify-center">
                   <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Preferred Core Team</span>
                      <p className="text-2xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#8a2be2]">
                         {inductionForm.team || "Not specified"}
                      </p>
                   </div>
                   <div className="flex justify-between items-end border-t border-white/5 pt-4">
                      <div>
                         <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">Contribution Time</span>
                         <p className="text-sm text-white font-mono">{inductionForm.hours || 0} Hours/Weekly</p>
                      </div>
                   </div>
                 </div>
              ) : (
                <LockedState title="Placement" />
              )}
            </div>

            {/* Career Goals */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden min-h-[200px] md:col-span-2 hover:border-white/20 transition-all">
              <h3 className="font-heading font-extrabold text-sm uppercase tracking-[0.15em] text-white mb-6 flex items-center gap-2">
                <BookOpen size={16} className="text-[#8a2be2]" />
                Future Goals
              </h3>
              {inductionForm ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">Long-term Career Path</span>
                      <p className="text-sm text-gray-400 font-mono leading-relaxed bg-[#070b13]/60 p-4 rounded-xl border border-white/5 h-32 overflow-y-auto">
                        {inductionForm.careerGoals || "Not specified."}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">2-Year Vision</span>
                      <p className="text-sm text-gray-400 font-mono leading-relaxed bg-[#070b13]/60 p-4 rounded-xl border border-white/5 h-32 overflow-y-auto">
                        {inductionForm.twoYearVision || "Not specified."}
                      </p>
                    </div>
                 </div>
              ) : (
                <LockedState title="Career Goals" />
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
