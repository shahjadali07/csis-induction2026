import { motion } from 'framer-motion';

export default function CyberSkeleton() {
  return (
    <div className="min-h-screen bg-[#04060A] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative floating grids */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.03),transparent_65%)]" />
      
      <div className="w-full max-w-6xl space-y-12 relative z-10">
        {/* Header Skeleton node */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
          <div className="space-y-3 w-full max-w-md">
            {/* Pulsing Title */}
            <div className="h-10 w-3/4 bg-white/5 rounded-2xl relative overflow-hidden border border-white/5">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00f0ff]/10 to-transparent w-full h-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              />
            </div>
            {/* Pulsing description */}
            <div className="h-4 w-1/2 bg-white/5 rounded-full relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8a2be2]/10 to-transparent w-full h-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear', delay: 0.2 }}
              />
            </div>
          </div>
          
          {/* Top Quick actions radar */}
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 relative overflow-hidden shrink-0">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00f0ff]/20 to-transparent w-full h-full"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Dashboard mock Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / Left Col */}
          <div className="space-y-8 lg:col-span-1">
            <div className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden h-72 flex flex-col justify-between">
              <div className="flex flex-col items-center space-y-4">
                {/* Avatar skeleton */}
                <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00f0ff]/10 to-transparent w-full h-full"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  />
                </div>
                {/* Profile Title skeleton */}
                <div className="h-5 w-1/2 bg-white/5 rounded-full relative overflow-hidden" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-white/5 rounded-full relative overflow-hidden" />
                <div className="h-3 w-3/4 bg-white/5 rounded-full relative overflow-hidden" />
              </div>
            </div>

            {/* Cognitive Module skeleton */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden h-48 space-y-4">
              <div className="h-4 w-1/3 bg-white/5 rounded-full relative overflow-hidden" />
              <div className="space-y-3">
                {[1, 2, 3].map((val) => (
                  <div key={val} className="space-y-2">
                    <div className="h-2 w-full bg-white/5 rounded-full relative overflow-hidden" />
                    <div className="h-1 bg-white/5 rounded-full relative overflow-hidden" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Main Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stream timeline skeleton */}
            <div className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden h-52 flex flex-col justify-between">
              <div className="h-6 w-1/4 bg-white/5 rounded-full relative overflow-hidden" />
              
              <div className="flex justify-between items-center relative py-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00f0ff]/10 to-transparent w-full h-full"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      />
                    </div>
                    <div className="h-3 w-12 bg-white/5 rounded-full relative overflow-hidden" />
                  </div>
                ))}
              </div>
            </div>

            {/* Subgrid cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((idx) => (
                <div key={idx} className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden h-44 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-4 w-1/3 bg-white/5 rounded-full relative overflow-hidden" />
                    <div className="h-12 w-full bg-white/5 rounded-xl relative overflow-hidden" />
                  </div>
                  <div className="h-3 w-1/2 bg-white/5 rounded-full relative overflow-hidden" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
