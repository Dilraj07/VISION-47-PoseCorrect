import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ onStart }) => {
    const { loginDemo } = useAuth();
    const navigate = useNavigate();

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
                flexDirection: 'column', // Stack vertically
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
                    mixBlendMode: 'normal', // Changed from difference to avoid readability issues
                    width: '100%',
                    padding: '0 1rem'
                }}>
                    <motion.h1
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        style={{
                            fontSize: 'clamp(3rem, 15vw, 12rem)', // Reduced max size scaling
                            lineHeight: 0.9,
                            margin: 0,
                            textTransform: 'uppercase',
                            color: 'var(--color-white)',
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: '900',
                            wordBreak: 'break-word', // Ensure wrapping
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <span style={{ display: 'block' }}>WELCOME</span>
                        <span style={{
                            color: 'transparent',
                            WebkitTextStroke: '2px var(--color-neon-pink)',
                            display: 'block'
                        }}>BRO</span>
                    </motion.h1>
                </div>

                {/* Action Buttons */}
                <div style={{
                    marginTop: '3rem',
                    position: 'relative',
                    zIndex: 20,
                    display: 'flex',
                    gap: '1.5rem'
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
                            fontFamily: "'Anton', sans-serif",
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
                            fontFamily: "'Anton', sans-serif",
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            letterSpacing: '1px'
                        }}
                    >
                        Try Demo
                    </motion.button>
                </div>
            </main>

            {/* Bottom Bar */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                borderTop: '1px solid #333'
            }}>
                <div style={{ padding: '2rem', borderRight: '1px solid #333', backgroundColor: '#050505' }}>
                    <Activity color="var(--color-neon-green)" size={32} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', fontSize: '0.9rem', color: '#888', letterSpacing: '1px' }}>Real-time Analysis</h3>
                    <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.5rem', margin: 0 }}>30 FPS TRACKING</p>
                </div>
                <div style={{ padding: '2rem', borderRight: '1px solid #333', backgroundColor: '#050505' }}>
                    <Video color="var(--color-neon-pink)" size={32} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', fontSize: '0.9rem', color: '#888', letterSpacing: '1px' }}>Video Upload</h3>
                    <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.5rem', margin: 0 }}>INSTANT FEEDBACK</p>
                </div>
            </div>

            {/* Full Width Footer Bar */}
            <div style={{ padding: '2rem', backgroundColor: 'var(--color-neon-green)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <span style={{ fontSize: '2rem', fontFamily: "'Anton', sans-serif" }}>JOIN THE FUTURE</span>
            </div>
        </div>
    );
};

export default LandingPage;
