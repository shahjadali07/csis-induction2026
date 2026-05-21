import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail, 
  updateProfile, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session auth states with Firestore profile snapshot subscriptions
  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous profile subscription if any
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen to profile updates in real time, caching state in Context
        unsubscribeSnapshot = onSnapshot(userRef, async (userSnap) => {
          if (userSnap.exists()) {
            setUser(userSnap.data());
            setLoading(false);
          } else {
            // Document might not have been created yet (e.g. Google Sign-In first time)
            const defaultProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              department: 'N/A',
              year: 'N/A',
              role: 'member',
              location: 'Nodes // SF',
              rank: 'Alpha Tier',
              memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase(),
              avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}&backgroundColor=0f172a`,
              profileCompleted: false,
              applicationStatus: 'Profile Created',
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(userRef, defaultProfile);
              setUser(defaultProfile);
            } catch (err) {
              console.error("Initial profile set error:", err);
            }
            setLoading(false);
          }
        }, (error) => {
          console.error("Profile snapshot listener error:", error);
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully logged in!");
      return userCredential.user;
    } catch (error) {
      console.error("Login failure:", error);
      let errorMsg = "Failed to sign in. Please verify your credentials.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMsg = "Invalid email or password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = "Invalid email address format.";
      }
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name, department = 'N/A', year = 'N/A') => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name inside firebase auth profile
      await updateProfile(firebaseUser, { displayName: name });
      
      // Initialize full profile parameters inside Firestore
      const userProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name,
        department,
        year,
        role: 'member', // Default access role
        location: 'Nodes // SF',
        rank: 'Alpha Tier',
        memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase(),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}&backgroundColor=0f172a`,
        profileCompleted: false,
        applicationStatus: 'Profile Created',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      setUser(userProfile);
      toast.success("Account created successfully!");
      return firebaseUser;
    } catch (error) {
      console.error("Registration failure:", error);
      let errorMsg = "Could not initialize account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = "This email is already in use.";
      } else if (error.code === 'auth/weak-password') {
        errorMsg = "Password must be at least 6 characters long.";
      }
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Sign out failure:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      toast.success("Successfully logged in with Google!");
      return userCredential.user;
    } catch (error) {
      console.error("Google Sign-In failure:", error);
      toast.error("Google Authentication cancelled or failed.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password recovery credentials dispatched to email!");
    } catch (error) {
      console.error("Password reset failure:", error);
      let errorMsg = "Could not dispatch reset credentials.";
      if (error.code === 'auth/user-not-found') {
        errorMsg = "No account found matching this email.";
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = "Invalid email format.";
      }
      toast.error(errorMsg);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    googleSignIn,
    forgotPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
