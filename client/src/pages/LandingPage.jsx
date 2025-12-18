import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Video, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WORKOUT_TYPES = {
    'rest': { label: 'REST DAY', color: '#666' },
    'push': { label: 'PUSH DAY', color: '#ff0099' },
    'pull': { label: 'PULL DAY', color: '#9900ff' },
    'legs': { label: 'LEG DAY', color: '#ccff00' },
    'cardio': { label: 'CARDIO', color: '#00ccff' },
    'full': { label: 'FULL BODY', color: '#ff6600' },
};

const LandingPage = ({ onStart }) => {
    const { loginDemo } = useAuth();
    const navigate = useNavigate();
    const [todayFocus, setTodayFocus] = useState(null);

    useEffect(() => {
        try {
            const schedule = JSON.parse(localStorage.getItem('gymbro_schedule') || '{}');
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const todayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon
            const focusId = schedule[days[todayIndex]];

            if (focusId && WORKOUT_TYPES[focusId]) {
                setTodayFocus(WORKOUT_TYPES[focusId]);
            }
        } catch (e) {
            console.error("Schedule error", e);
        }
    }, []);

    const handleDemo = async () => {
        await loginDemo();
        navigate('/dashboard');
    };
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-black)',
            color: 'var(--color-white)',
            fontFamily: "'Anton', sans-serif",
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>

            {/* Main Content */}
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '2rem',
                marginTop: '1rem'
            }}>
                {/* Version Tag */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    right: '2rem',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.9rem',
                    color: '#666',
                    fontWeight: 600,
                    letterSpacing: '1px'
                }}>
                    BETA v1.4
                </div>

                {/* Giant Text */}
                <div style={{
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1,
                    mixBlendMode: 'normal',
                    width: '100%',
                    padding: '0 1rem'
                }}>
                    {/* Today's Focus Banner */}
                    {todayFocus && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            style={{
                                display: 'inline-block',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '2rem',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                border: `1px solid ${todayFocus.color}`,
                                color: todayFocus.color,
                                fontFamily: "'Outfit', sans-serif",
                                fontWeight: 'bold',
                                marginBottom: '2rem',
                                fontSize: '1.2rem',
                                letterSpacing: '0.1em'
                            }}
                        >
                            IT'S {todayFocus.label}
                        </motion.div>
                    )}

                    <motion.h1
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        style={{
                            fontSize: 'clamp(3rem, 15vw, 12rem)',
                            lineHeight: 0.9,
                            margin: 0,
                            textTransform: 'uppercase',
                            color: 'var(--color-white)',
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: '900',
                            wordBreak: 'break-word',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <span style={{ display: 'block' }}>TRAIN</span>
                        <span style={{
                            color: 'transparent',
                            WebkitTextStroke: '2px var(--color-neon-pink)',
                            display: 'block'
                        }}>SMARTER</span>
                    </motion.h1>
                </div>

                {/* Action Buttons */}
                <div style={{
                    marginTop: '3rem',
                    position: 'relative',
                    zIndex: 20,
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap', // Allow wrapping for small screens
                    justifyContent: 'center'
                }}>
                    <motion.button
                        onClick={onStart}
                        whileHover={{ scale: 1.05, backgroundColor: 'var(--color-neon-green)', color: 'black' }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            backgroundColor: 'transparent',
                            color: 'var(--color-neon-green)',
                            border: '2px solid var(--color-neon-green)',
                            padding: '1rem 3rem',
                            fontSize: '1.5rem',
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            letterSpacing: '1px'
                        }}
                    >
                        Start Training <ArrowRight />
                    </motion.button>

                    <motion.button
                        onClick={handleDemo}
                        whileHover={{ scale: 1.05, borderColor: 'var(--color-neon-pink)', color: 'var(--color-neon-pink)' }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            backgroundColor: 'transparent',
                            color: 'white',
                            border: '2px solid #333',
                            padding: '1rem 3rem',
                            fontSize: '1.5rem',
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            letterSpacing: '1px'
                        }}
                    >
                        Try Demo
                    </motion.button>
                </div>
            </main>

            {/* Bottom Bar - Feature Highlights */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                borderTop: '1px solid #333'
            }}>
                <div style={{ padding: '2rem', borderRight: '1px solid #333', backgroundColor: '#050505' }}>
                    <Activity color="var(--color-neon-green)" size={32} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', fontSize: '0.9rem', color: '#888', letterSpacing: '1px' }}>Real-time Analysis</h3>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '900', fontSize: '1.5rem', margin: 0 }}>30 FPS TRACKING</p>
                </div>
                <div style={{ padding: '2rem', borderRight: '1px solid #333', backgroundColor: '#050505' }}>
                    <Video color="var(--color-neon-pink)" size={32} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', fontSize: '0.9rem', color: '#888', letterSpacing: '1px' }}>Video Upload</h3>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '900', fontSize: '1.5rem', margin: 0 }}>INSTANT FEEDBACK</p>
                </div>
                <div
                    onClick={() => navigate('/schedule')}
                    style={{ padding: '2rem', borderRight: '1px solid #333', backgroundColor: '#050505', cursor: 'pointer' }}
                >
                    <Calendar color="var(--color-neon-blue)" size={32} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', fontSize: '0.9rem', color: '#888', letterSpacing: '1px' }}>Smart Schedule</h3>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '900', fontSize: '1.5rem', margin: 0 }}>PLAN & TRACK</p>
                </div>
            </div>

            {/* Comprehensive Footer */}
            <footer style={{
                padding: '4rem 2rem',
                backgroundColor: '#050505',
                borderTop: '1px solid #222',
                fontFamily: "'Outfit', sans-serif"
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '4rem'
                }}>
                    {/* Brand */}
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 1rem 0' }}>GYMBRO</h2>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>The future of AI-powered workout analysis. Train smarter, not harder.</p>
                    </div>

                    {/* Features */}
                    <div>
                        <h4 style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Features</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <a onClick={() => navigate('/coach')} style={{ color: 'white', cursor: 'pointer', textDecoration: 'none' }}>AI Coach</a>
                            <a onClick={() => navigate('/upload')} style={{ color: 'white', cursor: 'pointer', textDecoration: 'none' }}>Video Analysis</a>
                            <a onClick={() => navigate('/schedule')} style={{ color: 'white', cursor: 'pointer', textDecoration: 'none' }}>Schedule</a>
                            <a onClick={() => navigate('/history')} style={{ color: 'white', cursor: 'pointer', textDecoration: 'none' }}>History</a>
                        </div>
                    </div>

                    {/* Community */}
                    <div>
                        <h4 style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Community</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <a onClick={() => navigate('/leaderboard')} style={{ color: 'white', cursor: 'pointer', textDecoration: 'none' }}>Leaderboard</a>
                            <a onClick={() => navigate('/profile')} style={{ color: 'white', cursor: 'pointer', textDecoration: 'none' }}>Profile</a>
                            <a onClick={() => navigate('/settings')} style={{ color: 'white', cursor: 'pointer', textDecoration: 'none' }}>Settings</a>
                        </div>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Support</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <a onClick={() => navigate('/about')} style={{ color: 'white', cursor: 'pointer', textDecoration: 'none' }}>About</a>
                            <a onClick={() => navigate('/contact')} style={{ color: 'white', cursor: 'pointer', textDecoration: 'none' }}>Contact</a>
                            <a onClick={() => navigate('/privacy')} style={{ color: 'white', cursor: 'pointer', textDecoration: 'none' }}>Privacy</a>
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: '4rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid #222',
                    textAlign: 'center',
                    color: '#444'
                }}>
                    © 2024 GYMBRO AI. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
