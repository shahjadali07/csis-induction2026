import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, X, CheckCircle2, Hourglass, Calendar, 
  MapPin, Clock, ArrowRight, XCircle, ShieldAlert
} from 'lucide-react';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';
import { doc, onSnapshot, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Import our custom views
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardOverview from '../components/DashboardOverview';
import SettingsView from '../components/SettingsView';
import SkillsTrackerView from '../components/SkillsTrackerView';
import AdminPanel from '../components/AdminPanel';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Tab states: 'dashboard', 'status', 'skills', 'events', 'settings', 'admin'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Real-time Firestore States
  const [inductionForm, setInductionForm] = useState(null);
  const [inductionLoading, setInductionLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState(user);

  // 1. Sync User Profile from AuthContext (which already fetches from Firestore)
  useEffect(() => {
    if (user) {
      setUserProfile(user);
    }
  }, [user]);

  // 2. Track window resizing for react-confetti accuracy
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Real-time Listeners for Induction status, Events, and Alerts
  useEffect(() => {
    if (!user) return;

    // A. Induction Form snapshot listener
    const formDocRef = doc(db, 'inductionForms', user.uid);
    const unsubForm = onSnapshot(formDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setInductionForm(docSnap.data());
      } else {
        setInductionForm(null);
      }
      setInductionLoading(false);
    }, (error) => {
      console.error("Error reading form state:", error);
      setInductionLoading(false);
    });

    // B. Notifications / Alerts fetch snapshot
    const notifCollectionRef = collection(db, 'notifications');
    const unsubNotif = onSnapshot(notifCollectionRef, (snap) => {
      const list = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Default fallback notifications if none in db
      const defaults = [
        { id: 'def1', text: "System Status: Grid connectivity operating at 99.8% capacity.", createdAt: new Date().toISOString() },
        { id: 'def2', text: "Event Reminder: Neural Interface Summit begins in 4 days.", createdAt: new Date().toISOString() }
      ];
      setNotifications(list.length > 0 ? list : defaults);
    });

    // C. Events snapshot listener
    const eventsRef = collection(db, 'events');
    const unsubEvents = onSnapshot(eventsRef, async (snap) => {
      const list = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      
      if (list.length === 0) {
        // Seed default events if events collection is empty
        const defaultEvents = [
          { title: 'Neural Interface Summit', date: 'MAY 24, 2026', time: '18:00 UTC', loc: 'Virtual Hub 04', category: 'Conference', desc: 'Immersive discussions regarding brain-computer interfaces, thought transmission nodes, and mental compiler structures.', createdAt: new Date().toISOString() },
          { title: 'Induction Ceremony', date: 'JUN 02, 2026', time: '09:00 UTC', loc: 'Main Plaza, London', category: 'Ceremonial', desc: 'Welcome the new Alpha group cohort with networking blocks, certificate distribution, and futuristic light assemblies.', createdAt: new Date().toISOString() },
          { title: 'Algorithmic Hackathon #12', date: 'JUL 18, 2026', time: '12:00 UTC', loc: 'Sandbox', category: 'Competition', desc: 'A continuous 48-hour algorithmic race to construct distributed ledgers and multi-agent AI ecosystems.', createdAt: new Date().toISOString() }
        ];
        
        try {
          for (const evt of defaultEvents) {
            await addDoc(collection(db, 'events'), evt);
          }
        } catch (err) {
          console.error("Error seeding default events:", err);
        }
        setEvents(defaultEvents);
      } else {
        // Sort events chronologically
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(list);
      }
    });

    return () => {
      unsubForm();
      unsubNotif();
      unsubEvents();
    };
  }, [user]);

  // Sync profile details trigger
  const handleUpdateUserProfile = (updated) => {
    setUserProfile(updated);
  };

  // Submit Induction action handler
  const handleSubmitInduction = () => {
    if (inductionLoading) return;

    if (!inductionForm) {
      // User has not submitted their induction form yet: redirect to /join Route!
      toast.success("Opening secure Induction Application Ledger...");
      navigate('/join');
    } else {
      // Already submitted: show celebration confetti and status toast
      setShowConfetti(true);
      toast.success(`Induction details logged. Status: ${inductionForm.status.toUpperCase()}`, {
        duration: 4000
      });
      
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 4. Subview Router/Render mapping
  const renderContentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            user={userProfile} 
            inductionForm={inductionForm}
            notifications={notifications}
          />
        );
      
      case 'skills':
        return (
          <SkillsTrackerView 
            user={userProfile}
          />
        );
      
      case 'settings':
        return (
          <SettingsView 
            user={userProfile} 
            onUpdateUser={handleUpdateUserProfile} 
          />
        );

      case 'status':
        return renderStatusView();

      case 'events':
        return renderEventsView();

      case 'admin':
        if (userProfile?.role === 'admin') {
          return <AdminPanel />;
        }
        return <div className="text-red-500 font-mono">Access Denied. Admin clearance required.</div>;

      default:
        return <div className="font-mono">Loading dynamic modules...</div>;
    }
  };

  // Dynamic status milestones based on real-time database state
  const renderStatusView = () => {
    const milestones = [];

    // Milestone 1: Profile Initialization
    milestones.push({
      id: 1,
      title: 'Profile Initialization',
      status: 'completed',
      description: 'Synchronized digital signature protocols and initialized workstation credential keys.',
      date: userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Active'
    });

    // Milestone 2: Cognitive Skill Assessment
    milestones.push({
      id: 2,
      title: 'Cognitive Skill Assessment',
      status: inductionForm ? 'completed' : 'active',
      description: inductionForm 
        ? 'Completed. Accreditations and domain portfolio synchronized.' 
        : 'Awaiting portfolio submission. Click "Submit Induction" in the sidebar to register.',
      date: inductionForm && inductionForm.submittedAt ? new Date(inductionForm.submittedAt).toLocaleDateString() : 'Awaiting Action'
    });

    // Milestone 3: Induction Phase
    let inductionStatus = 'locked';
    let inductionDesc = 'Awaiting preceding assessment milestones before clearance validation.';
    let inductionDate = 'Locked';

    if (inductionForm) {
      if (inductionForm.status === 'accepted') {
        inductionStatus = 'completed';
        inductionDesc = 'Operational clearance granted. Induction verification active and approved.';
        inductionDate = 'Cleared';
      } else if (inductionForm.status === 'rejected') {
        inductionStatus = 'failed';
        inductionDesc = 'Operational clearance rejected by Administrator audit.';
        inductionDate = 'Rejected';
      } else {
        inductionStatus = 'active';
        inductionDesc = 'Induction credentials submitted. Currently under Administrator audit.';
        inductionDate = 'Under Review';
      }
    }

    milestones.push({
      id: 3,
      title: 'Induction Phase',
      status: inductionStatus,
      description: inductionDesc,
      date: inductionDate
    });

    // Milestone 4: Society Accreditation
    let accreditStatus = 'locked';
    let accreditDesc = 'Issue authentic CSIS blockchain-indexed membership keys and access tokens.';
    let accreditDate = 'Locked';

    if (inductionForm && inductionForm.status === 'accepted') {
      accreditStatus = 'completed';
      accreditDesc = 'Induction complete! Authentic CSIS recruitment certificate active and verified.';
      accreditDate = 'Accredited';
    }

    milestones.push({
      id: 4,
      title: 'Society Accreditation',
      status: accreditStatus,
      description: accreditDesc,
      date: accreditDate
    });

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 border border-white/10 max-w-4xl space-y-8"
      >
        <div className="border-b border-white/5 pb-4">
          <h2 className="text-2xl font-bold font-heading text-white">Milestone Progression Tracker</h2>
          <p className="text-xs text-gray-500 font-mono">Verify and examine your active induction compliance checkpoints.</p>
        </div>

        <div className="relative pl-6 ml-4 space-y-8">
          {/* Background track */}
          <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-white/10 rounded-full" />
          
          {/* Foreground glowing track */}
          <motion.div 
            initial={{ height: 0 }}
            animate={{ 
              height: !inductionForm 
                ? '25%' 
                : inductionForm.status === 'accepted' 
                  ? '100%' 
                  : inductionForm.status === 'rejected' 
                    ? '66%' 
                    : '66%' 
            }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute left-0 top-2 w-[2px] bg-gradient-to-b from-[#00f0ff] via-[#8a2be2] to-indigo-600 shadow-[0_0_12px_rgba(0,240,255,0.5)] rounded-full"
          />

          {milestones.map((milestone) => (
            <div key={milestone.id} className="relative">
              {/* Timeline dot state */}
              {milestone.status === 'completed' && (
                <div className="absolute top-1 -left-[35px] w-7 h-7 rounded-full bg-[#04060A] border border-[#00f0ff] flex items-center justify-center text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.5)] z-20">
                  <CheckCircle2 size={14} />
                </div>
              )}
              {milestone.status === 'active' && (
                <div className="absolute top-1 -left-[35px] w-7 h-7 rounded-full bg-[#081222] border-2 border-[#00f0ff] flex items-center justify-center text-[#00f0ff] shadow-[0_0_18px_rgba(0,240,255,0.8)] z-20 animate-pulse">
                  <Hourglass size={12} className="animate-spin-slow" />
                </div>
              )}
              {milestone.status === 'failed' && (
                <div className="absolute top-1 -left-[35px] w-7 h-7 rounded-full bg-[#081222] border border-red-500 flex items-center justify-center text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] z-20">
                  <XCircle size={14} />
                </div>
              )}
              {milestone.status === 'locked' && (
                <div className="absolute top-1 -left-[35px] w-7 h-7 rounded-full bg-[#04060A] border border-white/10 flex items-center justify-center text-gray-700 z-20">
                  <span className="text-[10px] font-mono font-bold">{milestone.id}</span>
                </div>
              )}

              <div className="space-y-1.5 pl-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className={`font-bold font-heading text-lg tracking-wide ${
                    milestone.status === 'active' 
                      ? 'text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]' 
                      : milestone.status === 'locked' 
                        ? 'text-gray-600' 
                        : milestone.status === 'failed' 
                          ? 'text-red-400' 
                          : 'text-white'
                  }`}>
                    {milestone.title}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                    milestone.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    milestone.status === 'active' ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.2)]' :
                    milestone.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-white/5 text-gray-600 border border-white/5'
                  }`}>
                    {milestone.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono">{milestone.date}</p>
                <p className="text-sm text-gray-400 leading-relaxed font-mono">
                  {milestone.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  // Events View loaded dynamically from Firestore
  const renderEventsView = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl"
      >
        <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-4">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-2xl font-bold font-heading text-white">Events Calendar</h2>
            <p className="text-xs text-gray-500 font-mono">Register and track CSIS developer community assemblies.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {events.map((evt) => (
              <div 
                key={evt.id || evt.title} 
                className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/5 border border-white/5 text-gray-400 uppercase">
                      {evt.category || "Workshop"}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                      <Clock size={12} />
                      <span>{evt.time}</span>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold text-white group-hover:text-[#00f0ff] transition-colors leading-tight">
                    {evt.title}
                  </h4>
                  
                  <p className="text-xs text-gray-400 font-mono leading-relaxed">
                    {evt.desc}
                  </p>
                </div>
                
                <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-1.5 text-[#00f0ff] font-semibold">
                    <Calendar size={12} />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 group-hover:text-white transition-colors">
                    <MapPin size={12} />
                    <span>{evt.loc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#04060A] text-white overflow-hidden font-sans">
      
      {/* react-confetti celebration overlay */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={350}
          colors={['#00f0ff', '#8a2be2', '#ffffff', '#00d0ff', '#a855f7']}
        />
      )}

      {/* A. Left Sidebar Drawer: Desktop */}
      <aside className="hidden lg:block w-72 h-screen shrink-0 sticky top-0 left-0">
        <DashboardSidebar
          user={userProfile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSubmitInduction={handleSubmitInduction}
          onLogout={handleLogout}
          inductionForm={inductionForm}
        />
      </aside>

      {/* B. Mobile Top Banner Bar & Menu Drawer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#070B13]/90 border-b border-white/5 backdrop-blur-xl z-30 px-6 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-heading font-extrabold text-xl tracking-widest text-[#00f0ff]">CSIS</span>
          <span className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">Workspace</span>
        </div>
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Menu Layer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed top-16 left-0 bottom-0 w-72 bg-[#070B13]/95 border-r border-white/10 z-30 shadow-2xl overflow-y-auto"
          >
            <div className="p-6 h-full flex flex-col justify-between">
              <nav className="space-y-3">
                {[
                  { id: 'dashboard', label: 'Dashboard' },
                  { id: 'status', label: 'Application Status' },
                  { id: 'skills', label: 'Skill Tracker' },
                  { id: 'events', label: 'Events' },
                  { id: 'settings', label: 'Settings' },
                  ...(userProfile?.role === 'admin' ? [{ id: 'admin', label: 'Admin Command', icon: ShieldAlert }] : [])
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      activeTab === item.id 
                        ? 'bg-gradient-to-r from-[#00f0ff]/10 to-transparent border-[#00f0ff]/30 text-white' 
                        : 'bg-transparent border-transparent text-gray-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="space-y-4 pt-6 border-t border-white/5">
                {!inductionForm ? (
                  <button
                    onClick={() => {
                      handleSubmitInduction();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 bg-[#00f0ff] text-black font-bold rounded-xl text-xs text-center shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
                  >
                    Fill Induction Form
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveTab('status');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs text-center shadow-[0_0_15px_rgba(138,43,226,0.3)] cursor-pointer hover:from-purple-500 hover:to-indigo-500 transition-all duration-300"
                  >
                    View Application
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl text-xs text-center border border-red-500/20 cursor-pointer"
                >
                  Exit Workspace
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* C. Right/Main Canvas Content Block */}
      <main className="flex-1 min-h-screen overflow-y-auto pt-24 lg:pt-0">
        <div className="w-full max-w-7xl mx-auto px-6 py-8 lg:p-12">
          
          {/* Subview mapping canvas */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderContentView()}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

    </div>
  );
}
