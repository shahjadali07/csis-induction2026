import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: "Personal" },
  { id: 2, title: "Technical" },
  { id: 3, title: "Projects" },
  { id: 4, title: "Experience" },
  { id: 5, title: "Goals" },
  { id: 6, title: "Success" }
];

export default function Form() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const savedDraft = localStorage.getItem(`induction_draft_${user?.uid}`);
  const initialData = savedDraft ? JSON.parse(savedDraft) : {
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    rollNumber: '',
    department: user?.department || '',
    year: user?.year || '',
    domains: [],
    skillLevel: '',
    skills: '',
    github: '',
    hasProject: '',
    projectTitle: '',
    projectDescription: '',
    projectTechUsed: '',
    projectTeamType: '',
    projectGithub: '',
    projectChallenges: '',
    projectLearned: '',
    participatedEvents: [],
    certifications: '',
    contributionSkills: '',
    whyJoin: '',
    team: '',
    hours: '',
    careerGoals: '',
    whatToLearn: '',
    twoYearVision: ''
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (currentStep === 6) {
      localStorage.removeItem(`induction_draft_${user?.uid}`);
      const timer = setTimeout(() => navigate('/profile'), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, navigate, user?.uid]);

  useEffect(() => {
    const handleResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentStep < 6 && user?.uid) {
      localStorage.setItem(`induction_draft_${user.uid}`, JSON.stringify(formData));
    }
  }, [formData, currentStep, user?.uid]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDomainChange = (domain) => {
    const active = [...formData.domains];
    setFormData({ ...formData, domains: active.includes(domain) ? active.filter(d => d !== domain) : [...active, domain] });
  };

  const handleEventChange = (event) => {
    const active = [...formData.participatedEvents];
    setFormData({ ...formData, participatedEvents: active.includes(event) ? active.filter(e => e !== event) : [...active, event] });
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.rollNumber.trim() || !formData.department || !formData.year) {
        return toast.error("Please fill in all personal and academic parameters.");
      }
    } else if (currentStep === 2) {
      if (formData.domains.length === 0) return toast.error("Please select at least one domain of interest.");
      if (!formData.skillLevel) return toast.error("Please select your current skill level.");
      if (!formData.skills.trim()) return toast.error("Please specify technologies you know.");
    } else if (currentStep === 3) {
      if (!formData.hasProject) return toast.error("Please specify if you have worked on any project.");
      if (formData.hasProject === 'Yes') {
        if (!formData.projectTitle.trim() || !formData.projectDescription.trim() || !formData.projectTechUsed.trim() || !formData.projectTeamType) {
          return toast.error("Please fill in the required project details.");
        }
      }
    } else if (currentStep === 4) {
      if (!formData.contributionSkills.trim() || !formData.whyJoin.trim() || !formData.team || !formData.hours) {
        return toast.error("Please complete the core experience and contribution questions.");
      }
    } else if (currentStep === 5) {
      if (!formData.careerGoals.trim() || !formData.whatToLearn.trim() || !formData.twoYearVision.trim()) {
        return toast.error("Please outline your future goals.");
      }
      return await handleSubmitForm();
    }
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmitForm = async () => {
    if (!user) return toast.error("Authentication expired. Please log in again.");
    setIsSubmitting(true);
    try {
      const inductionDocRef = doc(db, 'inductionForms', user.uid);
      const userDocRef = doc(db, 'users', user.uid);
      await Promise.all([
        setDoc(inductionDocRef, { ...formData, uid: user.uid, status: 'pending', submittedAt: new Date().toISOString() }),
        updateDoc(userDocRef, {
          profileCompleted: true,
          skills: formData.skills.split(',').map(s => ({ name: s.trim(), level: formData.skillLevel === 'Advanced' ? 90 : formData.skillLevel === 'Intermediate' ? 60 : 30 })),
          domains: formData.domains,
          preferredTeam: formData.team,
          github: formData.github.trim(),
          applicationStatus: 'Induction Pending',
          submissionTimestamp: new Date().toISOString(),
          goals: formData.careerGoals,
          experience: formData.participatedEvents,
          projectsCount: formData.hasProject === 'Yes' ? 1 : 0
        })
      ]);
      toast.success("Induction details submitted successfully!");
      setCurrentStep(6);
    } catch (error) {
      console.error("Form submission failure:", error);
      toast.error("Could not sync induction details. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#04060A] text-white pt-32 pb-20 px-6 relative flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.02),transparent_65%)] pointer-events-none" />

      {/* Optimized submission loader */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="w-full max-w-sm bg-[#070b13]/80 border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,240,255,0.2)] text-center space-y-6 relative overflow-hidden backdrop-blur-xl"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#00f0ff]/10 to-transparent blur-xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#8a2be2]/10 to-transparent blur-xl animate-pulse" />
              <Loader size={48} className="animate-spin text-[#00f0ff] mx-auto mb-4" />
              <h3 className="text-xl font-heading font-extrabold text-white tracking-wide">Syncing Profile...</h3>
              <p className="text-xs text-gray-400 font-mono">Transmitting parameters to central ledger.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl relative z-10">
        
        {/* Progress Stepper */}
        <div className="mb-12 flex justify-between items-center max-w-3xl mx-auto px-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono text-xs border transition-all duration-500 ${
                  currentStep === step.id 
                    ? 'bg-gradient-to-br from-[#00f0ff] to-[#8a2be2] text-black border-transparent shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-110' 
                    : currentStep > step.id 
                      ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-[#00f0ff]' 
                      : 'bg-[#0E1528] border-white/10 text-gray-500'
                }`}>
                  {currentStep > step.id ? <CheckCircle2 size={16} /> : step.id}
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider absolute -bottom-6 whitespace-nowrap hidden sm:block ${
                  currentStep === step.id ? 'text-white' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-4 bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] transition-all duration-500" style={{ width: currentStep > step.id ? '100%' : '0%' }}/>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Form Cards */}
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00f0ff]/5 to-transparent blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#8a2be2]/5 to-transparent blur-3xl -z-10" />

          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              
              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4 mb-6">
                    <h2 className="text-3xl font-heading font-extrabold text-white">Personal Details</h2>
                    <p className="text-xs text-gray-500 font-mono">Complete your profile setup.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="Alex Rivero" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="alex@university.edu" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Phone Number</label>
                      <input type="number" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="+91 63864887-31" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Roll Number</label>
                      <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="2025-306" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Department</label>
                      <select name="department" value={formData.department} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono appearance-none">
                        <option value="">Select Domain...</option>
                        <option value="Computer Science">Computer Science & Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics & Communication">Electronics & Communication</option>
                        <option value="Artificial Intelligence">Artificial Intelligence & ML</option>
                         <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Current Year</label>
                      <select name="year" value={formData.year} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono appearance-none">
                        <option value="">Select Year...</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Technical Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4 mb-6">
                    <h2 className="text-3xl font-heading font-extrabold text-white">Technical Details</h2>
                    <p className="text-xs text-gray-500 font-mono">Stage your operational preferences and cognitive skills.</p>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-2">Which domains are you interested in?</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Web Development', 'App Development', 'AI/ML', 'DSA', 'Cyber Security', 'UI/UX', 'Open Source', 'Content Mangement '].map((domain) => (
                        <motion.button type="button" key={domain} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleDomainChange(domain)}
                          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center h-20 ${formData.domains.includes(domain) ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-[#070B13]/40 border-white/5 text-gray-400 hover:border-white/10'}`}
                        >
                          <span className="text-xs font-mono font-bold">{domain}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Current Skill Level</label>
                      <select name="skillLevel" value={formData.skillLevel} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono appearance-none">
                        <option value="">Select Level...</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">GitHub / Portfolio / LinkedIn Link</label>
                      <input type="url" name="github" value={formData.github} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="https://github.com/alexrivero" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Technologies you know</label>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="HTML, CSS, JavaScript, React, Python, C++, Firebase..." />
                  </div>
                </div>
              )}

              {/* Step 3: Project Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4 mb-6">
                    <h2 className="text-3xl font-heading font-extrabold text-white">Project Details</h2>
                    <p className="text-xs text-gray-500 font-mono">Detail your practical executions.</p>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-2">Have you worked on any project before?</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['Yes', 'No', 'Currently Learning'].map((opt) => (
                        <motion.button type="button" key={opt} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setFormData({ ...formData, hasProject: opt })}
                          className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${formData.hasProject === opt ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-[#070B13]/40 border-white/5 text-gray-400 hover:border-white/10'}`}
                        >
                          <span className="text-xs font-mono font-bold">{opt}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {formData.hasProject === 'Yes' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 pt-4 border-t border-white/5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Project Title</label>
                          <input type="text" name="projectTitle" value={formData.projectTitle} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="Project Name" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Team or Individual?</label>
                          <select name="projectTeamType" value={formData.projectTeamType} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono appearance-none">
                            <option value="">Select Option...</option>
                            <option value="Individual">Individual</option>
                            <option value="Team">Team</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Describe your project</label>
                        <textarea name="projectDescription" value={formData.projectDescription} onChange={handleChange} rows={2} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="What does it do?" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Technologies Used</label>
                          <input type="text" name="projectTechUsed" value={formData.projectTechUsed} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="React, Node.js..." />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">GitHub Link (Optional)</label>
                          <input type="url" name="projectGithub" value={formData.projectGithub} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="https://github.com/..." />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">What challenges did you face?</label>
                        <textarea name="projectChallenges" value={formData.projectChallenges} onChange={handleChange} rows={2} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="Briefly describe challenges..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">What did you learn from the project?</label>
                        <textarea name="projectLearned" value={formData.projectLearned} onChange={handleChange} rows={2} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="Key takeaways..." />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 4: Experience & Contribution */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4 mb-6">
                    <h2 className="text-3xl font-heading font-extrabold text-white">Experience & Contribution</h2>
                    <p className="text-xs text-gray-500 font-mono">Align your past experiences and value proposition.</p>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-2">Have you participated in:</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['Hackathons', 'Workshops', 'Coding Contests', 'Open Source', 'Technical Events'].map((evt) => (
                        <motion.button type="button" key={evt} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleEventChange(evt)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${formData.participatedEvents.includes(evt) ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-[#070B13]/40 border-white/5 text-gray-400 hover:border-white/10'}`}
                        >
                          <span className="text-[10px] font-mono font-bold">{evt}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Any certifications completed?</label>
                      <input type="text" name="certifications" value={formData.certifications} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="AWS, Coursera..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">What skills can you contribute to CSIS?</label>
                      <input type="text" name="contributionSkills" value={formData.contributionSkills} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="Management, Coding..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Why do you want to join CSIS?</label>
                    <textarea name="whyJoin" value={formData.whyJoin} onChange={handleChange} rows={2} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="Your motivation..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Preferred Team</label>
                      <select name="team" value={formData.team} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono appearance-none">
                        <option value="">Select intersted Team...</option>
                        <option value="Technical">Technical</option>
                        <option value="Design">Design</option>
                        <option value="Content">Content</option>
                        <option value="Event Management">Event Management</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Research">Research</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Weekly contribution hours</label>
                      <input type="number" name="hours" value={formData.hours} onChange={handleChange} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="e.g. 10" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Future Goals */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4 mb-6">
                    <h2 className="text-3xl font-heading font-extrabold text-white">Future Goals</h2>
                    <p className="text-xs text-gray-500 font-mono">Map out your long-term trajectories.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">What are your career goals?</label>
                    <textarea name="careerGoals" value={formData.careerGoals} onChange={handleChange} rows={3} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="Become a Full Stack Developer, Data Scientist..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">What do you want to learn through CSIS?</label>
                    <textarea name="whatToLearn" value={formData.whatToLearn} onChange={handleChange} rows={3} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="Technical skills, leadership, teamwork..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Where do you see yourself in the next 2 years?</label>
                    <textarea name="twoYearVision" value={formData.twoYearVision} onChange={handleChange} rows={3} className="w-full bg-[#070B13]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all font-mono" placeholder="Working at a tech company, building my own startup..." />
                  </div>
                </div>
              )}

              {/* Step 6: Success Page */}
              {currentStep === 6 && (
                <div className="text-center py-12 flex flex-col items-center">
                  <Confetti width={windowDimensions.width} height={windowDimensions.height} recycle={false} numberOfPieces={350} colors={['#00f0ff', '#8a2be2', '#ffffff']} />
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#8a2be2] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(138,43,226,0.5)]"
                  >
                    <CheckCircle2 size={48} className="text-white" />
                  </motion.div>
                  <h2 className="text-4xl font-heading font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#8a2be2]">Form Submitted!</h2>
                  <p className="text-gray-300 text-sm font-mono mb-8 max-w-md leading-relaxed">
                    Your detailed profile has been synced directly to the CSIS Core Ledger. Review the progress metrics in your profile workstation dashboard.
                  </p>
                  <button onClick={() => navigate('/profile')} className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-black font-extrabold text-xs font-mono uppercase cursor-pointer tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105 transition-transform">
                    Load Workstation
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 6 && (
            <div className="mt-10 flex justify-between border-t border-white/5 pt-6 relative z-10">
              <button type="button" onClick={handlePrev} disabled={currentStep === 1 || isSubmitting}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-mono font-extrabold uppercase transition-all cursor-pointer ${currentStep === 1 || isSubmitting ? 'opacity-0 pointer-events-none' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300'}`}
              >
                <ChevronLeft size={16} /> Back
              </button>
              
              <button type="button" onClick={handleNext} disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-black font-extrabold text-xs font-mono uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? <><Loader size={16} className="animate-spin text-black" /> Syncing...</> : currentStep === 5 ? <>Submit <ChevronRight size={16} /></> : <>Continue <ChevronRight size={16} /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
