import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { Dumbbell, X, Activity, Flame, Timer, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ICONS = [Dumbbell, Activity, Flame, Timer];
const Navbar = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { isPlaying, isMuted, toggleMute } = useAudio();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    // Visualizer Bar Component
    const AudioBar = ({ delay }) => (
        <motion.div
            animate={
                isPlaying && !isMuted
                    ? {
                        height: [4, 16, 8, 24, 4],
                        backgroundColor: ['#fff', 'var(--color-neon-pink)', 'var(--color-neon-green)', '#fff']
                    }
                    : { height: 4, backgroundColor: isMuted ? '#444' : '#666' }
            }
            transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
            style={{
                width: '4px',
                backgroundColor: isMuted ? '#444' : '#666',
                borderRadius: '2px'
            }}
        />
    );

    const NavLinks = () => (
        <>
            {!user ? (
                <Link to="/auth" className="mobile-nav-link" onClick={closeMenu}>Join Gymbro</Link>
            ) : (
                <Link to="/dashboard" className="mobile-nav-link" onClick={closeMenu}>Dashboard</Link>
            )}

            <Link to="/" className="mobile-nav-link" onClick={closeMenu}>Homepage</Link>

            <Link to="/about" className="mobile-nav-link" onClick={closeMenu}>About Us</Link>
            <Link to="/contact" className="mobile-nav-link" onClick={closeMenu}>Contact Us</Link>
            <Link to="/privacy" className="mobile-nav-link" onClick={closeMenu}>Privacy</Link>

            {user && (
                <>
                    <Link to="/history" className="mobile-nav-link" onClick={closeMenu}>History</Link>
                    <Link to="/profile" className="mobile-nav-link" onClick={closeMenu}>Profile</Link>
                    <Link to="/leaderboard" className="mobile-nav-link" onClick={closeMenu}>Leaderboard</Link>
                    <Link to="/schedule" className="mobile-nav-link" onClick={closeMenu}>Schedule</Link>

                    <button
                        onClick={() => { signOut(); closeMenu(); }}
                        className="mobile-nav-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
                    >
                        Log Out
                    </button>
                    <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>Signed in as<br />{user.email}</p>
                </>
            )}
        </>
    );

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <h2>GYMBRO</h2>
            </Link>

            {/* Right Side: Visualizer + Menu Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Profile Icon */}
                <button
                    onClick={() => user ? navigate('/profile') : navigate('/auth', { state: { isSignup: true } })}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: user ? 'var(--color-neon-blue)' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.5rem'
                    }}
                    title={user ? "Profile" : "Join Gymbro"}
                >
                    <User size={24} />
                </button>

                {/* Music Visualizer (Click to Toggle Mute) */}
                <div
                    onClick={toggleMute}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        height: '24px',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255,255,255,0.05)'
                    }}
                    title={isMuted ? "Unmute Music" : "Mute Music"}
                >
                    <AudioBar delay={0} />
                    <AudioBar delay={0.2} />
                    <AudioBar delay={0.4} />
                    <AudioBar delay={0.1} />
                </div>

                {/* Menu Toggle (Visible on all screens) */}
                <div className="mobile-toggle" onClick={toggleMenu} style={{ display: 'block' }}>
                    <Dumbbell
                        size={32}
                        color="var(--color-neon-green)"
                        style={{
                            transform: isMobileMenuOpen ? 'rotate(45deg)' : 'none',
                            transition: 'transform 0.3s'
                        }}
                    />
                </div>
            </div>

            {/* Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="mobile-menu-overlay"
                    >
                        <button className="close-menu-btn" onClick={closeMenu}>
                            <X size={32} color="#fff" />
                        </button>
                        <div className="mobile-menu-content">
                            <h2 style={{ marginBottom: '2rem', color: 'var(--color-neon-green)' }}>MENU</h2>
                            <NavLinks />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
