import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    const NavLinks = ({ mobile = false }) => (
        <>
            <Link to="/about" className={mobile ? "mobile-nav-link" : "nav-link"} onClick={mobile ? closeMenu : undefined}>About Us</Link>
            <Link to="/contact" className={mobile ? "mobile-nav-link" : "nav-link"} onClick={mobile ? closeMenu : undefined}>Contact Us</Link>
            <Link to="/privacy" className={mobile ? "mobile-nav-link" : "nav-link"} onClick={mobile ? closeMenu : undefined}>Privacy</Link>

            {user ? (
                <>
                    <Link to="/history" className={mobile ? "mobile-nav-link" : "nav-link"} onClick={mobile ? closeMenu : undefined}>History</Link>
                    <Link to="/profile" className={mobile ? "mobile-nav-link" : "nav-link"} onClick={mobile ? closeMenu : undefined}>Profile</Link>
                    <Link to="/leaderboard" className={mobile ? "mobile-nav-link" : "nav-link"} onClick={mobile ? closeMenu : undefined}>Leaderboard</Link>
                    <Link to="/schedule" className={mobile ? "mobile-nav-link" : "nav-link"} onClick={mobile ? closeMenu : undefined}>Schedule</Link>
                    {!mobile && <span style={{ color: '#888', marginRight: '1rem', fontSize: '0.9rem' }}>{user.email}</span>}
                    <button
                        onClick={() => { signOut(); closeMenu(); }}
                        className={mobile ? "mobile-nav-link" : "nav-link"}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: mobile ? 'center' : 'left' }}
                    >
                        Log Out
                    </button>
                </>
            ) : (
                <Link to="/auth" className={mobile ? "mobile-nav-link" : "nav-link"} style={!mobile ? { color: '#fff' } : {}} onClick={mobile ? closeMenu : undefined}>Sign In</Link>
            )}

            <button
                onClick={() => { navigate('/dashboard'); closeMenu(); }}
                className={mobile ? "mobile-btn-launch" : "btn-launch"}
            >
                Launch App
            </button>
        </>
    );

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <h2>GYMBRO</h2>
            </Link>

            {/* Desktop Menu */}
            <div className="navbar-links desktop-only">
                <NavLinks />
            </div>

            {/* Mobile Toggle */}
            <div className="mobile-toggle" onClick={toggleMenu}>
                <Dumbbell size={32} color="var(--color-neon-green)" style={{ transform: isMobileMenuOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s' }} />
            </div>

            {/* Mobile Menu Overlay */}
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
                            <NavLinks mobile={true} />
                            {user && <p style={{ marginTop: '2rem', color: '#666' }}>Signed in as<br />{user.email}</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
