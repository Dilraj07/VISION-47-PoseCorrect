import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff, ServerOff } from 'lucide-react';

const Privacy = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-black)',
            color: 'var(--color-white)',
            padding: '4rem 2rem',
            fontFamily: 'var(--font-primary)'
        }}>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.6 }}
                style={{ maxWidth: '800px', margin: '0 auto' }}
            >
                <h1 style={{
                    fontSize: '3.5rem',
                    marginBottom: '2rem',
                    color: 'var(--color-neon-green)',
                    textAlign: 'center'
                }}>
                    Privacy & Permissions
                </h1>

                <p style={{
                    fontSize: '1.2rem',
                    lineHeight: '1.6',
                    textAlign: 'center',
                    marginBottom: '4rem',
                    color: '#ccc'
                }}>
                    At GymBro, we believe your fitness journey is personal. That's why we've built our technology to respect your privacy by design.
                </p>

                <div style={{ display: 'grid', gap: '2rem' }}>

                    <Section
                        icon={<ServerOff size={32} color="var(--color-neon-pink)" />}
                        title="Local Processing Only"
                        content="All analysis happens directly on your device. We do not use cloud servers to process your video feed. This means your data never leaves your computer."
                    />

                    <Section
                        icon={<EyeOff size={32} color="var(--color-neon-green)" />}
                        title="No Video Recording"
                        content="We do not record, store, or save any video footage. The camera access is used strictly for real-time skeletal tracking to provide instant feedback."
                    />

                    <Section
                        icon={<Lock size={32} color="var(--color-neon-purple)" />}
                        title="Data Security"
                        content="Since we don't collect your data, there's nothing for us to sell or lose. Your workout metrics are temporary and exist only for your active session."
                    />

                    <Section
                        icon={<Shield size={32} color="var(--color-white)" />}
                        title="Transparency"
                        content="We are open source about our approach. You can inspect our code to verify that no data transmission occurs during your workout sessions."
                    />

                </div>
            </motion.div>
        </div>
    );
};

const Section = ({ icon, title, content }) => (
    <div style={{
        padding: '2rem',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '1rem',
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'flex-start'
    }}>
        <div style={{ marginTop: '0.2rem' }}>{icon}</div>
        <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-white)' }}>{title}</h3>
            <p style={{ color: '#aaa', lineHeight: '1.5' }}>{content}</p>
        </div>
    </div>
);

export default Privacy;
