import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Background from './components/Background';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CyberSkeleton from './components/CyberSkeleton';
import './index.css';

// Lazy loaded page components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Team = lazy(() => import('./pages/Team'));
const Admin = lazy(() => import('./pages/Admin'));
const Signup = lazy(() => import('./pages/Signup'));
const JoinUs = lazy(() => import('./pages/JoinUs'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <main className="relative min-h-screen text-white font-sans selection:bg-[#00f0ff] selection:text-[#0B1020]">
          <Background />
          <Navbar />
          
          <Suspense fallback={<CyberSkeleton />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/team" element={<Team />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route path="/join" element={
                <ProtectedRoute>
                  <JoinUs />
                </ProtectedRoute>
              } />
              <Route path="/induction-form" element={
                <ProtectedRoute>
                  <JoinUs />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>

          <Footer />
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: '#0B1020',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }}/>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;
