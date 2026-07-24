import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { Dumbbell, X, Activity, Flame, Timer, User, BookOpen, Calendar, Trophy, Settings as SettingsIcon, ChevronRight, HelpCircle, Mail, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWorkouts } from '../lib/api';
import StreakFlame from './StreakFlame';

const MENU_ICONS = [Dumbbell, Activity, Flame, Timer];
// Icon mapping
const NavItem = ({ to, icon: Icon, label, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <Link
            to={to}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.8rem 0',
                color: isHovered ? 'var(--color-neon-green)' : '#fff',
                textDecoration: 'none',
                fontFamily: 'var(--font-display, Outfit, sans-serif)',
                fontWeight: '900',
                fontSize: '1.4rem',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
                width: '100%'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Icon size={24} color={isHovered ? 'var(--color-neon-green)' : '#888'} strokeWidth={2.5} style={{ transition: 'color 0.2s' }} />
                <span>{label}</span>
            </div>
            <ChevronRight size={20} color={isHovered ? 'var(--color-neon-green)' : '#444'} strokeWidth={3} style={{ transition: 'color 0.2s' }} />
        </Link>
    );
};

const Navbar = () => {
    const navigate = useNavigate();
    const { user, signOut, getToken } = useAuth();
    const { isPlaying, isMuted, toggleMute } = useAudio();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [initials, setInitials] = useState('');
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        if (user && user.fullName) {
            setInitials(user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase());
            
            // Calculate actual streak based on history
            getWorkouts(getToken).then(data => {
                const workouts = data.workouts || [];
                if (workouts.length === 0) {
                    setStreak(0);
                    return;
                }
                
                const uniqueDates = [...new Set(workouts.map(w => new Date(w.created_at || w.createdAt).toLocaleDateString()))]
                    .sort((a,b) => new Date(b) - new Date(a));
                
                let currentStreak = 0;
                const today = new Date().toLocaleDateString();
                const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
                
                if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
                    currentStreak = 1;
                    let lastDateStr = uniqueDates[0];
                    for (let i = 1; i < uniqueDates.length; i++) {
                        const expectedPrevDay = new Date(new Date(lastDateStr).getTime() - 86400000).toLocaleDateString();
                        if (uniqueDates[i] === expectedPrevDay) {
                            currentStreak++;
                            lastDateStr = uniqueDates[i];
                        } else {
                            break;
                        }
                    }
                }
                setStreak(currentStreak);
            }).catch(err => console.error("Streak error:", err));
            
        } else {
            setInitials('');
            setStreak(0);
        }
    }, [user, getToken]);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    const NavLinks = () => (
        <div style={{ 
            width: '100%', 
            padding: '0 1rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.5rem' 
        }}>
            <NavItem to="/dashboard" icon={Activity} label="Dashboard" onClick={closeMenu} />
            <NavItem to="/schedule" icon={Calendar} label="Schedule" onClick={closeMenu} />
            <NavItem to="/profile" icon={User} label="Profile" onClick={closeMenu} />
            <NavItem to="/settings" icon={SettingsIcon} label="Settings" onClick={closeMenu} />


            {user ? (
                <button
                    onClick={() => { signOut(); closeMenu(); }}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        marginTop: '1rem',
                        backgroundColor: 'transparent',
                        color: '#ff4444',
                        border: '2px solid #ff4444',
                        fontWeight: '900',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-display, Outfit, sans-serif)',
                        textTransform: 'uppercase',
                        borderRadius: 0,
                        boxShadow: '4px 4px 0px #ff4444'
                    }}
                >
                    Log Out
                </button>
            ) : (
                <Link
                    to="/auth"
                    onClick={closeMenu}
                    className="button-51"
                    style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'center',
                        textDecoration: 'none',
                        marginTop: '1.5rem',
                        marginBottom: '1rem'
                    }}
                >
                    JOIN GYMBRO
                </Link>
            )}
        </div>
    );

    return (
        <nav className="navbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/" className="navbar-brand">
                    <h2>GYMBRO</h2>
                </Link>
                {/* Streak Flame */}
                <StreakFlame streak={streak} />
            </div>

            {/* Right Side: Visualizer + Menu Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Profile Icon */}
                <button
                    aria-label="Profile"
                    onClick={() => user ? navigate('/profile') : navigate('/auth', { state: { isSignup: true } })}
                    style={{
                        background: user ? 'var(--color-neon-blue)' : 'none',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        color: user ? '#000' : '#fff',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                    }}
                    title={user ? "Profile" : "Join Gymbro"}
                >
                    {initials || <User size={20} />}
                </button>

                {/* Academy Icon - Desktop Only */}
                <button
                    aria-label="Academy"
                    className="desktop-only"
                    onClick={() => navigate('/academy')}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#fff',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.5rem'
                    }}
                    title="Academy"
                >
                    <BookOpen size={24} />
                </button>

                {/* Menu Toggle (Visible on all screens) */}
                <div
                    aria-label="Toggle Menu"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); } }}
                    className="mobile-toggle"
                    onClick={toggleMenu}
                    style={{ display: 'block', cursor: 'pointer' }}
                >
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
                    <>
                        {/* Backdrop to close menu on outside click */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                zIndex: 150,
                                backdropFilter: 'blur(3px)'
                            }}
                            onClick={closeMenu}
                        />

                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="mobile-menu-overlay"
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                backgroundColor: '#0a0a0a' 
                            }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                width: '100%', 
                                marginBottom: '2.5rem',
                                padding: '0 1rem'
                            }}>
                                <h2 style={{ color: 'var(--color-neon-green)', margin: 0, fontSize: '2.5rem', fontFamily: 'var(--font-display)', letterSpacing: '2px' }}>MENU</h2>
                                <motion.button
                                    aria-label="Close Menu"
                                    onClick={closeMenu}
                                    whileHover={{ color: 'var(--color-neon-green)' }}
                                    whileFocus={{ color: 'var(--color-neon-green)' }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#fff' }}
                                >
                                    <X size={36} strokeWidth={3} />
                                </motion.button>
                            </div>
                            
                            <div className="mobile-menu-content" style={{ overflowY: 'auto', flex: 1, paddingBottom: '2rem' }}>
                                <NavLinks />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
