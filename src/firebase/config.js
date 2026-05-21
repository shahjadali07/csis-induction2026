import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCxI0G82qbVZV7p8916ugWlaS6GQqIDfes",
  authDomain: "csis-portal.firebaseapp.com",
  projectId: "csis-portal",
  storageBucket: "csis-portal.firebasestorage.app",
  messagingSenderId: "508577243237",
  appId: "1:508577243237:web:77afdcf38fdcf9bb18e68c",
  measurementId: "G-0PQCRMGYLE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, auth, db, storage, analytics };
