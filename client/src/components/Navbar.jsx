import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { Dumbbell, X, Activity, Flame, Timer, User, BookOpen, Calendar, Trophy, Settings as SettingsIcon, ChevronRight, HelpCircle, Mail, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

const MENU_ICONS = [Dumbbell, Activity, Flame, Timer];
const Navbar = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { isPlaying, isMuted, toggleMute } = useAudio();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [initials, setInitials] = useState('');

    useEffect(() => {
        const getProfile = async () => {
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                if (data?.full_name) {
                    setInitials(data.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase());
                }
            } else {
                setInitials('');
            }
        };
        getProfile();
    }, [user]);

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

    // Icon mapping
    const NavItem = ({ to, icon: Icon, label, onClick }) => (
        <Link
            to={to}
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.8rem', // Compact padding
                backgroundColor: '#1a1a1a',
                borderBottom: '1px solid #222',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '0.85rem', // Compact font size
                transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Icon size={16} color="#888" />
                <span style={{ fontWeight: '500' }}>{label}</span>
            </div>
            <ChevronRight size={14} color="#444" />
        </Link>
    );

    const MenuSection = ({ title, children }) => (
        <div style={{ width: '100%', marginBottom: '0.8rem' }}> {/* Reduced margin */}
            <h4 style={{
                padding: '0 0.8rem 0.4rem',
                color: '#666',
                fontSize: '0.7rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                {title}
            </h4>
            <div style={{
                borderRadius: '8px', // Slightly smaller radius
                overflow: 'hidden',
                border: '1px solid #222'
            }}>
                {children}
            </div>
        </div>
    );

    const NavLinks = () => (
        <div style={{ width: '100%', padding: '0 0.5rem' }}> {/* Removed scroll container */}
            <MenuSection title="Main">
                <NavItem to="/" icon={Flame} label="Homepage" onClick={closeMenu} />
                <NavItem to="/dashboard" icon={Activity} label="Dashboard" onClick={closeMenu} />
                <NavItem to="/academy" icon={BookOpen} label="Academy" onClick={closeMenu} />
            </MenuSection>

            <MenuSection title="Training">
                <NavItem to="/schedule" icon={Calendar} label="Schedule" onClick={closeMenu} />
                <NavItem to="/history" icon={Timer} label="History" onClick={closeMenu} />
                <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" onClick={closeMenu} />
            </MenuSection>

            <MenuSection title="System">
                <NavItem to="/profile" icon={User} label="Profile" onClick={closeMenu} />
                <NavItem to="/settings" icon={SettingsIcon} label="Settings" onClick={closeMenu} />
            </MenuSection>

            <MenuSection title="Support">
                <NavItem to="/help" icon={HelpCircle} label="Help Center" onClick={closeMenu} />
                <NavItem to="/contact" icon={Mail} label="Contact Us" onClick={closeMenu} />
                <NavItem to="/privacy" icon={Shield} label="Privacy Policy" onClick={closeMenu} />
            </MenuSection>

            {user ? (
                <button
                    onClick={() => { signOut(); closeMenu(); }}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        marginTop: '1rem',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 50, 50, 0.1)',
                        color: '#ff4444',
                        border: '1px solid rgba(255, 50, 50, 0.2)',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer'
                    }}
                >
                    Log Out
                </button>
            ) : (
                <Link
                    to="/auth"
                    onClick={closeMenu}
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '1rem',
                        marginTop: '1rem',
                        borderRadius: '12px',
                        backgroundColor: 'var(--color-neon-green)',
                        color: '#000',
                        textAlign: 'center',
                        textDecoration: 'none',
                        fontWeight: '700',
                        fontSize: '1rem'
                    }}
                >
                    JOIN GYMBRO
                </Link>
            )}
        </div>
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
                        background: user ? 'var(--color-neon-blue)' : 'none',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        color: user ? '#000' : '#fff',
                        display: 'flex',
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

                {/* Academy Icon */}
                <button
                    onClick={() => navigate('/academy')}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.5rem'
                    }}
                    title="Academy"
                >
                    <BookOpen size={24} />
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
