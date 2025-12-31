import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import IntroAnimation from './components/IntroAnimation';
import MusicFlow from './components/MusicFlow'; // Import MusicFlow
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
import Auth from './pages/Auth';
import History from './pages/History';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Schedule from './pages/Schedule';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import Academy from './pages/Academy';
import { AuthProvider } from './context/AuthContext';

const AppContent = () => {
  const [showIntro, setShowIntro] = useState(true);
  const { play, toggleMute, isMuted, isLoading } = useAudio();
  const navigate = useNavigate();

  const handleStartAudio = async () => {
    await play();
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleStart = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showIntro && <IntroAnimation onComplete={handleIntroComplete} onStart={handleStartAudio} isLoading={isLoading} />}
      </AnimatePresence>

      {!showIntro && (
        <>
          <MusicFlow /> {/* Persistent Music Control */}
          <Routes>
            <Route path="/" element={<><Navbar /><LandingPage onStart={handleStart} /></>} />
            <Route path="/about" element={<><Navbar /><About /></>} />
            <Route path="/contact" element={<><Navbar /><Contact /></>} />
            <Route path="/privacy" element={<><Navbar /><Privacy /></>} />
            <Route path="/help" element={<><Navbar /><Help /></>} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/coach" element={<RealTimeCoach />} />
            <Route path="/upload" element={<VideoAnalysis />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/history" element={<><Navbar /><History /></>} />
            <Route path="/profile" element={<><Navbar /><Profile /></>} />
            <Route path="/leaderboard" element={<><Navbar /><Leaderboard /></>} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/academy" element={<><Navbar /><Academy /></>} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </>
      )}

    </>
  );
};

const App = () => {
  /* Audio Playlist */
  const SONGS = [
    '/pump-it-up.mp3',
    '/we-are-gymbro.mp3'
  ];

  /* Select random song on mount - maintained here to pass to provider */
  const [currentSong] = useState(() => {
    const randomIndex = Math.floor(Math.random() * SONGS.length);
    return SONGS[randomIndex];
  });

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <AudioProvider url={currentSong}>
          <AppContent />
        </AudioProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
