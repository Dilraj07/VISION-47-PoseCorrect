import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const MusicFlow = () => {
    const { isPlaying, isMuted, toggleMute, play, stop } = useAudio();

    // Visualizer Bar Component (Adapted from Navbar)
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

    return (
        <>
            <style>{`
                .music-flow-container {
                    position: fixed;
                    bottom: 2rem;
                    left: 2rem;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background-color: rgba(0, 0, 0, 0.6);
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    border: 1px solid #333;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                    transition: all 0.3s ease;
                }
                
                @media (max-width: 768px) {
                    .music-flow-container {
                        bottom: 1.5rem;
                        left: 50%;
                        transform: translateX(-50%);
                        width: auto;
                        min-width: 280px;
                        justify-content: space-between;
                        padding: 0.5rem 1.2rem;
                    }
                }
            `}</style>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="music-flow-container"
            >
                {/* Visualizer Animation */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    height: '24px',
                    marginRight: '0.5rem'
                }}>
                    <AudioBar delay={0} />
                    <AudioBar delay={0.2} />
                    <AudioBar delay={0.4} />
                    <AudioBar delay={0.1} />
                </div>

                {/* Song Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
                    <Music size={14} color="#888" />
                    <span style={{ fontSize: '0.8rem', color: '#ccc', fontWeight: 600, whiteSpace: 'nowrap' }}>GYMBRO FM</span>
                </div>

                <div style={{ width: '1px', height: '20px', backgroundColor: '#333' }} />

                {/* Controls */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => isPlaying ? stop() : play()}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex' }}
                    >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                    <button
                        onClick={toggleMute}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex' }}
                    >
                        {isMuted ? <VolumeX size={18} color="#FB7185" /> : <Volume2 size={18} />}
                    </button>
                </div>
            </motion.div>
        </>
    );
};

export default MusicFlow;
