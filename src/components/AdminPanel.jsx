import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, XCircle, Eye, Calendar, Bell, ShieldAlert, Loader, UploadCloud, Mail, Info, Clock, XCircle as CloseIcon } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  // Sub‑tab state
  const [activeSubTab, setActiveSubTab] = useState('applications'); // applications | events | notifications | users
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [submittingEvent, setSubmittingEvent] = useState(false);
  const [submittingNotif, setSubmittingNotif] = useState(false);

  // ---------- Fetch data ---------------------------------------------------
  useEffect(() => {
    // Fetch users collection for admin overview
    const fetchUsers = async () => {
      try {
        const q = collection(db, 'users');
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        setUsers(list);
      } catch (e) {
        console.error(e);
        toast.error('Could not load users');
      }
    };
    fetchUsers();
    // Applications (inductionForms)
    const fetchApps = async () => {
      setLoadingApps(true);
      try {
        const q = collection(db, 'inductionForms');
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setApplications(list);
      } catch (e) {
        console.error(e);
        toast.error('Could not load applications');
      } finally {
        setLoadingApps(false);
      }
    };
    fetchApps();

    // Real‑time listeners for events & notifications (to keep UI fresh)
    const unsubEvents = onSnapshot(collection(db, 'events'), snap => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(list);
    }, err => console.error('events listener', err));

    const unsubNotifs = onSnapshot(collection(db, 'notifications'), snap => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(list);
    }, err => console.error('notifications listener', err));

    return () => {
      unsubEvents();
      unsubNotifs();
    };
  }, []);

  // ---------- Handlers ----------------------------------------------------
  const handleUpdateStatus = async (appId, newStatus) => {
    const toastId = toast.loading(`Updating status to ${newStatus}…`);
    try {
      const docRef = doc(db, 'inductionForms', appId);
      await updateDoc(docRef, { status: newStatus });

      // Mirror change to user document for quick UI feedback
      const userDoc = doc(db, 'users', appId);
      const userStatus = newStatus === 'accepted' ? 'Certified' : newStatus === 'rejected' ? 'Rejected' : 'Induction Pending';
      await updateDoc(userDoc, { applicationStatus: userStatus });

      toast.success(`Application ${newStatus}`, { id: toastId });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      if (selectedApp && selectedApp.id === appId) setSelectedApp(p => ({ ...p, status: newStatus }));
    } catch (e) {
      console.error(e);
      toast.error('Failed to update status', { id: toastId });
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    // Simple validation – fields are collected via a controlled form (see JSX below)
    if (!eventForm.title || !eventForm.date) {
      toast.error('Title and date are required');
      return;
    }
    setSubmittingEvent(true);
    try {
      await addDoc(collection(db, 'events'), { ...eventForm, createdAt: new Date().toISOString() });
      toast.success('Event created');
      setEventForm(initialEventForm);
    } catch (e) {
      console.error(e);
      toast.error('Could not create event');
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifText.trim()) {
      toast.error('Message cannot be empty');
      return;
    }
    setSubmittingNotif(true);
    try {
      await addDoc(collection(db, 'notifications'), { text: notifText.trim(), createdAt: new Date().toISOString() });
      toast.success('Alert dispatched');
      setNotifText('');
    } catch (e) {
      console.error(e);
      toast.error('Failed to send alert');
    } finally {
      setSubmittingNotif(false);
    }
  };

  // ---------- Form state for event creation ------------------------------
  const initialEventForm = { title: '', date: '', time: '', loc: '', desc: '', category: 'Workshop' };
  const [eventForm, setEventForm] = useState(initialEventForm);
  const [notifText, setNotifText] = useState('');

  // ---------- UI -----------------------------------------------------------------
  const renderApplications = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 text-center">
          <h3 className="text-sm font-mono text-gray-400 mb-1">Total Inductions</h3>
          <p className="text-2xl font-bold text-[#00f0ff]">{applications.length}</p>
          <button onClick={() => setActiveSubTab('applications')} className="mt-2 text-xs text-[#00f0ff] hover:underline">View All</button>
        </div>
        <div className="glass-card p-4 text-center">
          <h3 className="text-sm font-mono text-gray-400 mb-1">Total Events</h3>
          <p className="text-2xl font-bold text-[#00f0ff]">{events.length}</p>
          <button onClick={() => setActiveSubTab('events')} className="mt-2 text-xs text-[#00f0ff] hover:underline">View All</button>
        </div>
        <div className="glass-card p-4 text-center">
          <h3 className="text-sm font-mono text-gray-400 mb-1">Alerts Sent</h3>
          <p className="text-2xl font-bold text-[#00f0ff]">{notifications.length}</p>
          <button onClick={() => setActiveSubTab('notifications')} className="mt-2 text-xs text-[#00f0ff] hover:underline">View All</button>
        </div>
      </div>
      <div className="glass-card rounded-3xl p-6 border border-white/10">
        {loadingApps ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader className="animate-spin text-[#00f0ff] mr-2" /> Loading applications…
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No applications found.</div>
        ) : (
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead className="border-b border-white/5 text-gray-500 uppercase font-bold">
              <tr>
                <th className="py-2 px-3">Applicant</th>
                <th className="py-2 px-3">Team</th>
                <th className="py-2 px-3">Dept / Year</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-3">
                    <div className="font-bold text-white text-sm">{app.name}</div>
                    <div className="text-[10px] text-gray-500">{app.email}</div>
                  </td>
                  <td className="py-2 px-3 font-bold text-[#00f0ff]">{app.team}</td>
                  <td className="py-2 px-3 text-gray-300">{app.department} // Year {app.year}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      app.status === 'accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button onClick={() => setSelectedApp(app)} className="p-1.5 rounded bg-white/5 border border-white/5 hover:border-[#00f0ff]/30 text-gray-400 hover:text-white transition-all">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <motion.form
        onSubmit={handleCreateEvent}
        className="glass-card rounded-3xl p-6 border border-white/10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-heading font-bold text-[#00f0ff] mb-4">Create New Event</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input placeholder="Title" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
            className="bg-[#070B13] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff]" />
          <select value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
            className="bg-[#070B13] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff]">
            <option>Workshop</option>
            <option>Conference</option>
            <option>Competition</option>
            <option>Ceremonial</option>
          </select>
          <input type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
            className="bg-[#070B13] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff]" />
          <input placeholder="Time" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
            className="bg-[#070B13] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff]" />
          <input placeholder="Location" value={eventForm.loc} onChange={e => setEventForm({ ...eventForm, loc: e.target.value })}
            className="bg-[#070B13] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff]" />
          <textarea placeholder="Description" rows={3} value={eventForm.desc} onChange={e => setEventForm({ ...eventForm, desc: e.target.value })}
            className="bg-[#070B13] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff] resize-none" />
        </div>
        <button type="submit" disabled={submittingEvent}
          className="px-6 py-2 bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-black font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
          {submittingEvent ? 'Creating…' : 'Create Event'}
        </button>
      </motion.form>
      <div className="glass-card rounded-3xl p-6 border border-white/10">
        <h3 className="text-lg font-heading font-bold text-[#00f0ff] mb-4">Upcoming Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(evt => (
            <div key={evt.id || evt.title} className="glass-card rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="px-2.5 py-0.5 bg-white/5 border border-white/5 text-gray-400 uppercase text-xs">{evt.category}</span>
                <div className="flex items-center gap-1 text-xs text-gray-500"><Clock size={12} /><span>{evt.time}</span></div>
              </div>
              <h4 className="text-lg font-bold text-white hover:text-[#00f0ff] transition-colors">{evt.title}</h4>
              <p className="text-xs text-gray-400 mt-1">{evt.desc}</p>
              <div className="flex justify-between items-center mt-3 text-xs">
                <div className="flex items-center gap-1 text-[#00f0ff]"><Calendar size={12} /><span>{evt.date}</span></div>
                <div className="flex items-center gap-1 text-gray-500"><MapPin size={12} /><span>{evt.loc}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="glass-card rounded-3xl p-6 border border-white/10">
      <h3 className="text-lg font-heading font-bold text-[#00f0ff] mb-4">Broadcast Alert</h3>
      <form onSubmit={handleSendNotification} className="space-y-3">
        <textarea placeholder="Alert message…" rows={4} value={notifText}
          onChange={e => setNotifText(e.target.value)}
          className="w-full bg-[#070B13] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff] resize-none" />
        <button type="submit" disabled={submittingNotif}
          className="px-6 py-2 bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-black font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
          {submittingNotif ? 'Sending…' : 'Dispatch Alert'}
        </button>
      </form>
      <div className="mt-6">
        <h4 className="text-sm font-bold text-[#8a2be2] mb-2">Recent Alerts</h4>
        <ul className="space-y-2">
          {notifications.map(n => (
            <li key={n.id} className="text-xs text-gray-300 border-b border-white/5 pb-2">
              {n.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="glass-card rounded-3xl p-6 border border-white/10">
      <h3 className="text-lg font-heading font-bold text-[#00f0ff] mb-4">All Users</h3>
      <table className="w-full text-left font-mono text-xs border-collapse">
        <thead className="border-b border-white/5 text-gray-500 uppercase font-bold">
          <tr>
            <th className="py-2 px-3">Name</th>
            <th className="py-2 px-3">Email</th>
            <th className="py-2 px-3">Role</th>
            <th className="py-2 px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-2 px-3 font-bold text-white">{u.name}</td>
              <td className="py-2 px-3 text-gray-300 text-sm">{u.email}</td>
              <td className="py-2 px-3 text-gray-400">{u.role}</td>
              <td className="py-2 px-3 text-right">
                <button onClick={() => setSelectedApp({ ...u, id: u.id, status: u.applicationStatus || 'N/A' })}
                        className="p-1.5 rounded bg-white/5 border border-white/5 hover:border-[#00f0ff]/30 text-gray-400 hover:text-white transition-all">
                  <Eye size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ----- Modal for detailed application view -----
  const renderAppModal = () => (
    <AnimatePresence>
      {selectedApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-2xl bg-[#070b13] border border-white/10 rounded-3xl p-6 overflow-y-auto max-h-[90vh] shadow-[0_0_30px_rgba(0,240,255,0.2)]"
          >
            <button onClick={() => setSelectedApp(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <CloseIcon size={18} />
            </button>
            <h3 className="text-2xl font-bold text-white mb-2">{selectedApp.name}</h3>
            <p className="text-gray-400 mb-4">{selectedApp.email}</p>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-300">
              <div><span className="text-gray-500">Team</span> {selectedApp.team}</div>
              <div><span className="text-gray-500">Department / Year</span> {selectedApp.department} / {selectedApp.year}</div>
              <div><span className="text-gray-500">Status</span> {selectedApp.status}</div>
            </div>
            {selectedApp.email && (
              <div className="mt-4">
                <h4 className="text-sm font-bold text-[#8a2be2] mb-2">Induction Applications</h4>
                {applications.filter(app => app.email === selectedApp.email).length === 0 ? (
                  <p className="text-xs text-gray-400">No inductions submitted.</p>
                ) : (
                  <ul className="list-disc list-inside text-xs text-gray-300">
                    {applications.filter(app => app.email === selectedApp.email).map(app => (
                      <li key={app.id}>{app.team} - {app.status}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')} disabled={selectedApp.status === 'rejected'}
                className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20 disabled:opacity-50">
                Reject
              </button>
              <button onClick={() => handleUpdateStatus(selectedApp.id, 'accepted')} disabled={selectedApp.status === 'accepted'}
                className="px-4 py-2 bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-black rounded hover:shadow-md disabled:opacity-50">
                Accept
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-8">
      {/* Sub‑tab navigation */}
      <div className="flex gap-4 border-b border-white/5 pb-2">
        {['applications', 'events', 'notifications', 'users'].map(tab => (
          <button key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 text-sm font-mono uppercase rounded ${activeSubTab === tab ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-b-2 border-[#00f0ff]' : 'text-gray-400 hover:text-white'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content based on active sub‑tab */}
      {activeSubTab === 'applications' && renderApplications()}
      {activeSubTab === 'events' && renderEvents()}
      {activeSubTab === 'notifications' && renderNotifications()}
      {activeSubTab === 'users' && renderUsers()}

      {renderAppModal()}
    </div>
  );
}
