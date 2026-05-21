import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Cpu, Loader, Save } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

export default function SkillsTrackerView({ user }) {
  const defaultSkills = [
    { name: 'Neural Networks', level: 88 },
    { name: 'Quantum Computing', level: 42 },
    { name: 'Blockchain Architecture', level: 75 }
  ];

  const [skills, setSkills] = useState(user?.skills || defaultSkills);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(50);
  const [saving, setSaving] = useState(false);

  // Sync state if user prop changes
  useEffect(() => {
    if (user?.skills) {
      setSkills(user.skills);
    }
  }, [user]);

  const handleLevelChange = (index, value) => {
    const updated = [...skills];
    updated[index].level = parseInt(value, 10);
    setSkills(updated);
  };

  const handleSaveSkills = async (updatedSkills = skills) => {
    setSaving(true);
    const toastId = toast.loading("Syncing cognitive database to network...");
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { skills: updatedSkills });
      toast.success("Cognitive profile synced successfully!", { id: toastId });
    } catch (err) {
      console.error("Skills sync error:", err);
      toast.error("Failed to commit cognitive module to ledger.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      toast.error("Module identifier is empty");
      return;
    }
    if (skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      toast.error("Module already synchronized");
      return;
    }
    
    const updated = [...skills, { name: newSkillName.trim(), level: newSkillLevel }];
    setSkills(updated);
    setNewSkillName('');
    setNewSkillLevel(50);
    toast.success("Cognitive module staged!");
    handleSaveSkills(updated);
  };

  const handleDeleteSkill = (index) => {
    const updated = skills.filter((_, i) => i !== index);
    setSkills(updated);
    toast.success("Cognitive module marked for purge!");
    handleSaveSkills(updated);
  };

  // Compute composite score index
  const averageScore = skills.length > 0 
    ? Math.round(skills.reduce((acc, curr) => acc + curr.level, 0) / skills.length) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* 1. Skill Sliders Grid (Left Columns) */}
      <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white/10 space-y-6">
        <div className="border-b border-white/5 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold font-heading text-white">Cognitive Tracker</h2>
            <p className="text-xs text-gray-500 font-mono">Calibrate and upgrade your neural skill systems.</p>
          </div>
          
          <button
            onClick={() => handleSaveSkills()}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
            Commit Calibration
          </button>
        </div>

        <div className="space-y-6">
          {skills.map((skill, index) => (
            <div key={skill.name} className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex justify-between items-center text-sm font-mono text-gray-300">
                <span className="font-bold text-white">{skill.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#00f0ff] font-extrabold">{skill.level}%</span>
                  <button
                    onClick={() => handleDeleteSkill(index)}
                    className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    title="Purge Skill"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Range slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={skill.level}
                onChange={(e) => handleLevelChange(index, e.target.value)}
                className="w-full h-1.5 bg-[#090D1A] rounded-lg appearance-none cursor-pointer accent-[#00f0ff] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Controls & Gauge Circle (Right Column) */}
      <div className="lg:col-span-1 space-y-8">
        
        {/* Gauge Overview */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 text-center space-y-6">
          <h3 className="font-heading font-extrabold text-xs uppercase tracking-[0.15em] text-[#8a2be2]">
            Arsenal Composite Matrix
          </h3>

          <div className="relative w-40 h-40 mx-auto rounded-full bg-[#090D1A] border border-white/5 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,240,255,0.05)]">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                className="stroke-white/5"
                strokeWidth="8"
                fill="transparent"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                className="stroke-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={440}
                animate={{ strokeDashoffset: 440 - (440 * averageScore) / 100 }}
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="z-10 text-center">
              <span className="text-4xl font-extrabold text-white font-heading">{averageScore}</span>
              <span className="text-xs uppercase tracking-wider block text-gray-500 font-mono mt-0.5">SCORE INDEX</span>
            </div>
          </div>
        </div>

        {/* Load New Skills Form */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
          <h3 className="font-heading font-extrabold text-xs uppercase tracking-[0.15em] text-white flex items-center gap-2">
            <Cpu size={14} className="text-[#00f0ff]" />
            Initialize Cognitive Module
          </h3>
          
          <form onSubmit={handleAddSkill} className="space-y-4">
            <div className="space-y-1">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. Quantum Cryptography"
                className="w-full bg-[#070B13] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase font-bold">
                <span>Power Calibration</span>
                <span>{newSkillLevel}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-[#090D1A] rounded-lg appearance-none cursor-pointer accent-[#8a2be2]"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 bg-[#0E1528] hover:bg-white/5 border border-white/10 hover:border-[#00f0ff]/30 text-[#00f0ff] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-mono uppercase tracking-wider"
            >
              <Plus size={14} />
              Inject Module
            </motion.button>
          </form>
        </div>

      </div>
    </motion.div>
  );
}
