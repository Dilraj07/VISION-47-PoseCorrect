import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Camera, Video } from 'lucide-react';

const LandingPage = ({ onStart }) => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-black)', color: 'var(--color-white)' }}>


            <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <section style={{ textAlign: 'center', marginBottom: '8rem' }}>
                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', lineHeight: 0.9, marginBottom: '2rem' }}
                    >
                        PERFECT FORM<br />
                        <span style={{ color: 'var(--color-neon-pink)' }}>EVERY REP</span>
                    </motion.h1>
                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        style={{ fontSize: '1.5rem', maxWidth: '600px', margin: '0 auto 3rem', color: '#888' }}
                    >
                        Your personal coach. Real-time corrections. Professional analysis.
                    </motion.p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onStart}
                        style={{
                            padding: '1.5rem 3rem',
                            backgroundColor: 'var(--color-neon-green)',
                            color: 'var(--color-black)',
                            borderRadius: '3rem',
                            fontSize: '1.5rem',
                            fontWeight: '900',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                    >
                        START TRAINING <ArrowRight size={24} />
                    </motion.button>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <motion.div
                        whileHover={{ y: -10 }}
                        style={{
                            padding: '3rem',
                            backgroundColor: 'var(--color-dark-gray)',
                            borderRadius: '2rem',
                            border: '1px solid #333'
                        }}
                    >
                        <Camera size={48} color="var(--color-neon-purple)" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Real-time Coach</h3>
                        <p style={{ color: '#aaa', lineHeight: 1.6 }}>
                            Use your webcam for instant feedback. Our system analyzes your form 30 times per second to prevent injuries.
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -10 }}
                        style={{
                            padding: '3rem',
                            backgroundColor: 'var(--color-dark-gray)',
                            borderRadius: '2rem',
                            border: '1px solid #333'
                        }}
                    >
                        <Video size={48} color="var(--color-neon-pink)" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Video Analysis</h3>
                        <p style={{ color: '#aaa', lineHeight: 1.6 }}>
                            Upload workout videos for detailed breakdown. Compare your form against professional athletes side-by-side.
                        </p>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
