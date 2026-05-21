import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, User as UserIcon, Shield, Lock, Unlock, Eye, EyeOff, Key, 
  Loader, UploadCloud, Globe, Cpu, Palette, Info, Mail, AlertTriangle, Monitor, Clock, Award
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { db, storage, auth } from '../firebase/config';
import toast from 'react-hot-toast';

export default function SettingsView({ user, onUpdateUser }) {
  const isAdmin = user?.role === 'admin';

  // State: Restricted Profile Info (Locked for members)
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [role, setRole] = useState(user?.role || "member");
  const [rank, setRank] = useState(user?.rank || "Alpha Tier");
  const [memberSince, setMemberSince] = useState(user?.memberSince || "MAR 2024");
  const [appStatus, setAppStatus] = useState(user?.applicationStatus || "Pending");
  const [prefTeam, setPrefTeam] = useState(user?.preferredTeam || "Web Dev");
  const [certStatus, setCertStatus] = useState(user?.certificationStatus || "None");
  
  // State: Editable Personal Preferences
  const [bio, setBio] = useState(user?.bio || "");
  const [socialLink, setSocialLink] = useState(user?.socialLink || "");
  const [theme, setTheme] = useState(user?.theme || "Cyberpunk Dark");
  const [skills, setSkills] = useState(user?.skills || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Alex&backgroundColor=0f172a");
  
  // State: Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // General State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [committing, setCommitting] = useState(false);
  const fileInputRef = useRef(null);

  const avatars = [
    { name: 'Alex', url: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex&backgroundColor=0f172a" },
    { name: 'Matrix', url: "https://api.dicebear.com/7.x/bottts/svg?seed=Matrix&backgroundColor=0f172a" },
    { name: 'Hacker', url: "https://api.dicebear.com/7.x/bottts/svg?seed=Hacker&backgroundColor=0f172a" },
    { name: 'Cyber', url: "https://api.dicebear.com/7.x/bottts/svg?seed=Cyber&backgroundColor=0f172a" },
    { name: 'Synth', url: "https://api.dicebear.com/7.x/bottts/svg?seed=Synth&backgroundColor=0f172a" }
  ];

  // Logic: Calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.match(/[a-z]+/)) strength += 25;
    if (pass.match(/[A-Z]+/)) strength += 25;
    if (pass.match(/[0-9]+/)) strength += 25;
    return strength;
  };
  const pwStrength = getPasswordStrength(newPassword);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file format.");
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading("Uploading custom node avatar...");

    try {
      const storageRef = ref(storage, `avatars/${user.uid}_avatar_${Date.now()}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      setSelectedAvatar(downloadUrl);
      toast.success("Avatar loaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Avatar upload failure:", error);
      toast.error("Failed to upload custom avatar.", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsChangingPassword(true);
    const toastId = toast.loading("Authenticating and updating security key...");

    try {
      const currentUser = auth.currentUser;
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      
      // Re-authenticate user before changing password
      await reauthenticateWithCredential(currentUser, credential);
      // Update password
      await updatePassword(currentUser, newPassword);

      toast.success("Security key updated successfully!", { id: toastId });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password update error:", error);
      if (error.code === 'auth/invalid-credential') {
        toast.error("Invalid current password.", { id: toastId });
      } else {
        toast.error("Failed to update password. Try again later.", { id: toastId });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) {
      toast.error("No email associated with this account.");
      return;
    }
    const toastId = toast.loading("Requesting password reset link...");
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success(`Reset link dispatched to ${user.email}`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reset email.", { id: toastId });
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setCommitting(true);
    const toastId = toast.loading("Syncing configuration states to ledger...");

    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Construct base editable payload
      let updatedProfile = {
        bio: bio.trim(),
        socialLink: socialLink.trim(),
        theme: theme,
        skills: skills.trim(),
        avatar: selectedAvatar
      };

      // If admin, they can update restricted fields too
      if (isAdmin) {
        updatedProfile = {
          ...updatedProfile,
          name: name.trim(),
          email: email.trim(),
          department: department.trim(),
          role: role,
          rank: rank,
          memberSince: memberSince.trim(),
          applicationStatus: appStatus,
          preferredTeam: prefTeam,
          certificationStatus: certStatus
        };
      }

      await updateDoc(userDocRef, updatedProfile);
      
      onUpdateUser({
        ...user,
        ...updatedProfile
      });

      toast.success("Workstation profile updated securely!", { id: toastId });
    } catch (error) {
      console.error("Profile synchronization failure:", error);
      toast.error("Failed to commit modifications to ledger.", { id: toastId });
    } finally {
      setCommitting(false);
    }
  };

  // Helper for rendering locked inputs
  const RestrictedInput = ({ label, value, setter, icon: Icon, isSelect = false, options = [] }) => {
    const isLocked = !isAdmin;
    return (
      <div className="space-y-2 relative group">
        <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon size={14} className={isLocked ? "text-gray-500" : "text-[#00f0ff]"} />
            {label}
          </span>
          {isLocked && <Lock size={12} className="text-gray-600" />}
        </label>
        
        {isSelect ? (
          <select
            value={value}
            onChange={(e) => setter(e.target.value)}
            disabled={isLocked}
            className={`w-full bg-[#070B13] border ${isLocked ? 'border-gray-800 text-gray-500 cursor-not-allowed' : 'border-white/10 text-white focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30'} rounded-xl px-4 py-3 text-sm transition-all font-mono appearance-none`}
          >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setter(e.target.value)}
            disabled={isLocked}
            className={`w-full bg-[#070B13] border ${isLocked ? 'border-gray-800 text-gray-500 cursor-not-allowed' : 'border-white/10 text-white focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30'} rounded-xl px-4 py-3 text-sm transition-all font-mono`}
          />
        )}
        
        {isLocked && (
          <div className="absolute inset-0 bg-transparent" title="Admin access required to modify this information." />
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-12">
      
      {/* LEFT COLUMN: Security & Session */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Account Security Module */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 border border-red-500/20 relative overflow-hidden bg-gradient-to-br from-red-500/5 to-transparent"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-lg">Account Security</h3>
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Authentication Gateway</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">Current Security Key</label>
              <div className="relative">
                <input 
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#04060A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:border-red-500 focus:outline-none transition-all pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">New Security Key</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#04060A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:border-red-500 focus:outline-none transition-all pr-10"
                  placeholder="New Password"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Strength Indicator */}
              <div className="flex gap-1 h-1 w-full mt-2 rounded-full overflow-hidden bg-gray-800">
                <div className={`h-full transition-all duration-500 ${pwStrength >= 25 ? 'bg-red-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                <div className={`h-full transition-all duration-500 ${pwStrength >= 50 ? 'bg-orange-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                <div className={`h-full transition-all duration-500 ${pwStrength >= 75 ? 'bg-yellow-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                <div className={`h-full transition-all duration-500 ${pwStrength >= 100 ? 'bg-[#00f0ff]' : 'bg-transparent'}`} style={{ width: '25%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">Confirm Security Key</label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#04060A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:border-red-500 focus:outline-none transition-all"
                placeholder="Confirm Password"
              />
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-red-500/20 hover:text-red-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isChangingPassword ? <Loader size={16} className="animate-spin" /> : <Key size={16} />}
                Update Password
              </button>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-mono text-gray-500 hover:text-gray-300 underline underline-offset-2 transition-colors self-center cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </motion.div>

        {/* Profile Security UI (Session Information) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-6 border border-white/10"
        >
          <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Session Integrity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <Monitor size={16} className="text-[#00f0ff]" />
              <div>
                <p className="text-xs font-bold text-white font-mono">Current Device</p>
                <p className="text-[10px] text-gray-500 font-mono">Web Browser (Active)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <Clock size={16} className="text-[#8a2be2]" />
              <div>
                <p className="text-xs font-bold text-white font-mono">Last Authenticated</p>
                <p className="text-[10px] text-gray-500 font-mono">Just now</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* RIGHT COLUMN: Profile Configurations */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Main Settings Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-8 border border-white/10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold font-heading text-white">Profile Configuration</h2>
              <p className="text-xs text-gray-500 font-mono mt-1 flex items-center gap-2">
                <Info size={12} />
                Critical identifiers are managed by system administrators.
              </p>
            </div>
            {isAdmin && (
              <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-mono font-bold rounded-full uppercase tracking-widest flex items-center gap-2">
                <Unlock size={12} />
                Admin Override Active
              </span>
            )}
          </div>

          <form onSubmit={handleSubmitProfile} className="space-y-10">
            
            {/* Restricted Profile Information */}
            <div className="space-y-6">
              <h3 className="text-sm font-heading font-extrabold text-[#00f0ff] uppercase tracking-widest flex items-center gap-2">
                <Lock size={16} /> Restricted Registry
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#04060A]/50 p-6 rounded-2xl border border-white/5">
                <RestrictedInput label="System Name" value={name} setter={setName} icon={UserIcon} />
                <RestrictedInput label="Registered Email" value={email} setter={setEmail} icon={Mail} />
                <RestrictedInput label="Department" value={department} setter={setDepartment} icon={Globe} />
                <RestrictedInput 
                  label="Role/Clearance" 
                  value={role} 
                  setter={setRole} 
                  icon={Shield} 
                  isSelect 
                  options={["member", "admin"]} 
                />
                <RestrictedInput 
                  label="Application Status" 
                  value={appStatus} 
                  setter={setAppStatus} 
                  icon={Info} 
                  isSelect 
                  options={["Pending", "Review", "Inducted", "Rejected"]} 
                />
                <RestrictedInput 
                  label="Certification Level" 
                  value={certStatus} 
                  setter={setCertStatus} 
                  icon={Award} 
                  isSelect 
                  options={["None", "Basic", "Advanced", "Master"]} 
                />
              </div>
            </div>

            {/* Editable User Fields */}
            <div className="space-y-6 pt-4 border-t border-white/5">
              <h3 className="text-sm font-heading font-extrabold text-[#8a2be2] uppercase tracking-widest flex items-center gap-2">
                <UserIcon size={16} /> Personal Preferences
              </h3>

              {/* Avatar Picker */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block">
                  Interface Avatar
                </label>
                <div className="flex flex-wrap gap-4 items-center">
                  {avatars.map((av) => (
                    <button
                      type="button"
                      key={av.name}
                      onClick={() => setSelectedAvatar(av.url)}
                      className={`w-14 h-14 rounded-xl p-[2px] bg-gradient-to-br transition-all relative overflow-hidden cursor-pointer ${
                        selectedAvatar === av.url 
                          ? 'from-[#00f0ff] to-[#8a2be2] scale-110 shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
                          : 'from-white/10 to-transparent hover:scale-105'
                      }`}
                    >
                      <div className="w-full h-full rounded-lg bg-[#070b13] overflow-hidden flex items-center justify-center">
                        <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                      </div>
                    </button>
                  ))}
                  <div className="border-l border-white/10 pl-4 ml-2">
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current.click()}
                      className="w-14 h-14 rounded-xl border border-dashed border-white/20 hover:border-[#00f0ff] hover:bg-white/5 transition-all flex flex-col items-center justify-center text-gray-500 hover:text-[#00f0ff] cursor-pointer"
                    >
                      {uploadingImage ? <Loader size={16} className="animate-spin" /> : (
                        <><UploadCloud size={16} /><span className="text-[8px] font-mono font-bold mt-1 uppercase">Custom</span></>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">Bio / About</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-[#070B13] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8a2be2] focus:ring-1 focus:ring-[#8a2be2]/30 transition-all font-mono resize-none"
                    placeholder="Tell us about your developer journey..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full bg-[#070B13] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8a2be2] focus:ring-1 focus:ring-[#8a2be2]/30 transition-all font-mono"
                    placeholder="React, Python, Machine Learning..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">Social / Portfolio Link</label>
                  <input
                    type="url"
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                    className="w-full bg-[#070B13] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8a2be2] focus:ring-1 focus:ring-[#8a2be2]/30 transition-all font-mono"
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Palette size={14} className="text-[#00f0ff]" /> Interface Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-[#070B13] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8a2be2] focus:ring-1 focus:ring-[#8a2be2]/30 transition-all font-mono appearance-none cursor-pointer"
                  >
                    <option value="Cyberpunk Dark">Cyberpunk Dark (Default)</option>
                    <option value="Neon Blue">Neon Blue Matrix</option>
                    <option value="Deep Void">Deep Void Minimal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8 flex justify-end border-t border-white/5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={committing || uploadingImage}
                type="submit"
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] cursor-pointer disabled:opacity-50 transition-all"
              >
                {committing ? (
                  <><Loader size={16} className="animate-spin text-black" /> Syncing Configurations...</>
                ) : (
                  <><Save size={18} /> Commit Profile Changes</>
                )}
              </motion.button>
            </div>

          </form>
        </motion.div>

      </div>
    </div>
  );
}
