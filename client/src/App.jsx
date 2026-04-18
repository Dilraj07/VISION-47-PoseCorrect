import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';
import { AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import MusicFlow from './components/MusicFlow';
import { AudioProvider, useAudio } from './context/AudioContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import RealTimeCoach from './pages/RealTimeCoach';
import VideoAnalysis from './pages/VideoAnalysis';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Help from './pages/Help';
import Navbar from './components/Navbar';
import History from './pages/History';
import Profile from './pages/Profile';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import { AuthProvider } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

const ProtectedLayout = ({ children, hideNavbar = false }) => {
  return (
    <ProtectedRoute>
      {!hideNavbar && <Navbar />}
      {children}
    </ProtectedRoute>
  );
}

const AppContent = () => {
  const { play, toggleMute, isMuted, isLoading } = useAudio();
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <MusicFlow />
      <Routes>
        <Route path="/" element={<><Navbar /><LandingPage onStart={handleStart} /></>} />
        <Route path="/about" element={<><Navbar /><About /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /></>} />
        <Route path="/privacy" element={<><Navbar /><Privacy /></>} />
        <Route path="/help" element={<><Navbar /><Help /></>} />
        
        {/* Auth routes */}
        <Route path="/sign-in/*" element={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#000'}}><SignIn routing="path" path="/sign-in" /></div>} />
        <Route path="/sign-up/*" element={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#000'}}><SignUp routing="path" path="/sign-up" /></div>} />
        <Route path="/auth" element={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#000'}}><SignIn routing="path" path="/auth" signUpUrl="/sign-up" /></div>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedLayout hideNavbar><Dashboard /></ProtectedLayout>} />
        <Route path="/coach" element={<ProtectedLayout hideNavbar><RealTimeCoach /></ProtectedLayout>} />
        <Route path="/upload" element={<ProtectedLayout hideNavbar><VideoAnalysis /></ProtectedLayout>} />
        <Route path="/history" element={<ProtectedLayout><History /></ProtectedLayout>} />
        <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
        <Route path="/schedule" element={<ProtectedLayout hideNavbar><Schedule /></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout hideNavbar><Settings /></ProtectedLayout>} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <AudioProvider>
          <AppContent />
        </AudioProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
