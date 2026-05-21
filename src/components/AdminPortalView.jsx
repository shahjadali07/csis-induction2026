import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle2, XCircle, Eye, ExternalLink, Calendar, 
  Plus, Bell, Send, Terminal, Loader, ShieldAlert 
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

export default function AdminPortalView() {
  const [activeSubTab, setActiveSubTab] = useState('applications'); // 'applications', 'events', 'notifications'
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLoc, setEventLoc] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventCategory, setEventCategory] = useState('Workshop');
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Notification Form State
  const [notifText, setNotifText] = useState('');
  const [submittingNotif, setSubmittingNotif] = useState(false);

  // 1. Fetch submitted applications
  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const q = collection(db, 'inductionForms');
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      setApplications(list);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Could not fetch recruitment logs.");
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // 2. Accept / Reject Application
  const handleUpdateStatus = async (appId, newStatus) => {
    const toastId = toast.loading(`Updating compliance state to ${newStatus}...`);
    try {
      // 1. Update inductionForms document
      const docRef = doc(db, 'inductionForms', appId);
      await updateDoc(docRef, { status: newStatus });
      
      // 2. Update users document in real-time
      let userAppStatus = 'Induction Pending';
      if (newStatus === 'accepted') {
        userAppStatus = 'Certified';
      } else if (newStatus === 'rejected') {
        userAppStatus = 'Rejected';
      }
      
      const userDocRef = doc(db, 'users', appId);
      await updateDoc(userDocRef, { 
        applicationStatus: userAppStatus
      });
      
      toast.success(`Application updated to ${newStatus}!`, { id: toastId });
      // Update state locally
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Status update failure:", error);
      toast.error("Failed to commit status change.", { id: toastId });
    }
  };

  // 3. Create society event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !eventTime || !eventLoc.trim() || !eventDesc.trim()) {
      toast.error("Please complete all event specifications.");
      return;
    }

    setSubmittingEvent(true);
    try {
      await addDoc(collection(db, 'events'), {
        title: eventTitle.trim(),
        date: eventDate,
        time: eventTime,
        loc: eventLoc.trim(),
        desc: eventDesc.trim(),
        category: eventCategory,
        createdAt: new Date().toISOString()
      });
      
      toast.success("Society calendar event created successfully!");
      // Reset form
      setEventTitle('');
      setEventDate('');
      setEventTime('');
      setEventLoc('');
      setEventDesc('');
    } catch (error) {
      console.error("Error generating event:", error);
      toast.error("Could not upload event to network.");
    } finally {
      setSubmittingEvent(false);
    }
  };

  // 4. Send alert notification
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifText.trim()) {
      toast.error("Notification string is empty.");
      return;
    }

    setSubmittingNotif(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        text: notifText.trim(),
        createdAt: new Date().toISOString()
      });
      
      toast.success("Alert notification dispatched to system net!");
      setNotifText('');
    } catch (error) {
      console.error("Error dispatching notification:", error);
      toast.error("Alert delivery failed.");
    } finally {
      setSubmittingNotif(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Title Header Banner */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-heading font-extrabold text-[#00f0ff] flex items-center gap-3">
          <ShieldAlert size={28} className="animate-pulse" />
          Admin Operations Command
        </h1>
        <p className="text-xs text-gray-500 font-mono">Ledger clearances and database synchronization controls.</p>
      </div>

      {/* Operations subtabs */}
      <div className="flex gap-4 border-b border-white/5 pb-2">
        {[
          { id: 'applications', label: 'Induction Logs', icon: Users },
          { id: 'events', label: 'Event Architect', icon: Calendar },
          { id: 'notifications', label: 'Alert Dispatcher', icon: Bell }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2 text-xs font-mono font-bold uppercase border-b-2 cursor-pointer transition-all ${
                isActive 
                  ? 'border-[#00f0ff] text-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Admin canvas view */}
      <div className="pt-2">
        {activeSubTab === 'applications' && (
          <div className="glass-card rounded-3xl p-6 border border-white/10">
            {loadingApps ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500 font-mono text-sm">
                <Loader className="animate-spin text-[#00f0ff]" />
                Reading ledger pipelines...
              </div>
            ) : applications.length === 0 ? (
              <div className="py-20 text-center text-gray-500 font-mono text-sm">
                No submitted induction applications detected on network.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 uppercase tracking-wider font-bold">
                      <th className="py-4 px-2">Applicant</th>
                      <th className="py-4 px-2">Focus Team</th>
                      <th className="py-4 px-2">Department / Year</th>
                      <th className="py-4 px-2">Status</th>
                      <th className="py-4 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-2">
                          <div className="font-bold text-white text-sm">{app.name}</div>
                          <div className="text-[10px] text-gray-500">{app.email}</div>
                        </td>
                        <td className="py-4 px-2 font-bold text-[#00f0ff]">{app.team}</td>
                        <td className="py-4 px-2 text-gray-300">
                          {app.department} // Year {app.year}
                        </td>
                        <td className="py-4 px-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            app.status === 'accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 rounded bg-white/5 border border-white/5 hover:border-[#00f0ff]/30 text-gray-400 hover:text-white transition-all cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create Events subview */}
        {activeSubTab === 'events' && (
          <div className="glass-card rounded-3xl p-8 border border-white/10 max-w-2xl">
            <h3 className="text-xl font-bold font-heading mb-6 flex items-center gap-2">
              <Calendar size={18} className="text-[#00f0ff]" />
              Schedule Event Assembly
            </h3>
            
            <form onSubmit={handleCreateEvent} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Event Title</label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Neural Network Bootcamp"
                    className="w-full bg-[#070B13] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00f0ff] font-mono"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Category</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    className="w-full bg-[#070B13] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00f0ff] font-mono appearance-none"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                    <option value="Competition">Competition</option>
                    <option value="Ceremonial">Ceremonial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-[#070B13] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00f0ff] font-mono"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Time</label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="18:00 UTC"
                    className="w-full bg-[#070B13] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00f0ff] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Location Node</label>
                <input
                  type="text"
                  value={eventLoc}
                  onChange={(e) => setEventLoc(e.target.value)}
                  placeholder="Virtual Hub 04 or Main Hall"
                  className="w-full bg-[#070B13] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00f0ff] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Event Description</label>
                <textarea
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  rows="3"
                  placeholder="Details concerning the event specifications..."
                  className="w-full bg-[#070B13] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00f0ff] font-mono resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submittingEvent}
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
                >
                  {submittingEvent ? "Uploading..." : "Inject Calendar Node"}
                  <Plus size={14} />
                </motion.button>
              </div>
            </form>
          </div>
        )}

        {/* Send notifications alert subview */}
        {activeSubTab === 'notifications' && (
          <div className="glass-card rounded-3xl p-8 border border-white/10 max-w-xl">
            <h3 className="text-xl font-bold font-heading mb-6 flex items-center gap-2">
              <Bell size={18} className="text-[#00f0ff]" />
              System Notification Dispatch
            </h3>
            
            <form onSubmit={handleSendNotification} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 block">
                  Broadcast Alert String
                </label>
                <textarea
                  value={notifText}
                  onChange={(e) => setNotifText(e.target.value)}
                  rows="4"
                  placeholder="Type the announcement to deliver to all CSIS profile dashboards..."
                  className="w-full bg-[#070B13] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#00f0ff] font-mono resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submittingNotif}
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
                >
                  {submittingNotif ? "Broadcasting..." : "Dispatch Alert Pulse"}
                  <Send size={14} />
                </motion.button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Applicant Detail Popup Modal Overlay */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-[#070b13] border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,240,255,0.15)] relative overflow-hidden overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedApp(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <XCircle size={18} />
              </button>

              <div className="space-y-6 pt-4">
                <div className="border-b border-white/5 pb-4 flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-2xl font-extrabold font-heading text-white">{selectedApp.name}</h3>
                    <span className="text-xs font-mono font-bold tracking-widest text-[#00f0ff] uppercase">
                      {selectedApp.rollNumber} // {selectedApp.email}
                    </span>
                  </div>
                  
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                    selectedApp.status === 'accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    selectedApp.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse'
                  }`}>
                    {selectedApp.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 font-mono text-xs text-gray-300">
                  <div className="space-y-1">
                    <span className="text-gray-500 uppercase font-bold text-[9px]">Academic Info</span>
                    <p className="font-semibold">{selectedApp.department} &mdash; Year {selectedApp.year}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 uppercase font-bold text-[9px]">Preferred Team</span>
                    <p className="font-semibold text-[#00f0ff]">{selectedApp.team}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 uppercase font-bold text-[9px]">Domains of Interest</span>
                    <p className="font-semibold">{selectedApp.domains ? selectedApp.domains.join(', ') : 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 uppercase font-bold text-[9px]">Contribution Load</span>
                    <p className="font-semibold">{selectedApp.hours} Hours / Week</p>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-xs border-t border-white/5 pt-4">
                  <span className="text-gray-500 uppercase font-bold text-[9px]">Core Skills Matrix</span>
                  <p className="bg-white/5 border border-white/5 p-3 rounded-xl text-gray-300 font-semibold leading-relaxed">
                    {selectedApp.skills}
                  </p>
                </div>

                <div className="space-y-2 font-mono text-xs border-t border-white/5 pt-4">
                  <span className="text-gray-500 uppercase font-bold text-[9px]">Why Join CSIS?</span>
                  <p className="bg-white/5 border border-white/5 p-3 rounded-xl text-gray-300 font-semibold leading-relaxed">
                    {selectedApp.whyJoin}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                  {/* Resume PDF anchor Link */}
                  <a 
                    href={selectedApp.resumeUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold hover:bg-white/10 hover:text-white transition-all text-gray-400"
                  >
                    Examine Resume File
                    <ExternalLink size={12} />
                  </a>

                  {/* Accept / Reject triggers */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                      disabled={selectedApp.status === 'rejected'}
                      className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-30"
                    >
                      Reject node
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'accepted')}
                      disabled={selectedApp.status === 'accepted'}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-black text-xs font-mono font-extrabold transition-all cursor-pointer disabled:opacity-30"
                    >
                      Accept node
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
