import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Music, SkipForward } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useLocation } from 'react-router-dom';

const MusicFlow = () => {
    const { isPlaying, isMuted, toggleMute, play, stop, nextSong } = useAudio();
    const location = useLocation();
    const isHome = location.pathname === '/';
    const [isHovered, setIsHovered] = useState(false);

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

    // Mini Circle Visualizer (for non-home pages)
    const MiniAudioBar = ({ delay }) => (
        <motion.div
            animate={
                isPlaying && !isMuted
                    ? {
                        height: [2, 8, 4, 12, 2],
                        backgroundColor: ['#fff', 'var(--color-neon-pink)', 'var(--color-neon-green)', '#fff']
                    }
                    : { height: 2, backgroundColor: isMuted ? '#444' : '#666' }
            }
            transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
            style={{
                width: '2px',
                backgroundColor: isMuted ? '#444' : '#666',
                borderRadius: '1px'
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
                    background-color: rgba(5, 5, 5, 0.85); /* Darker, more premium background */
                    backdrop-filter: blur(15px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08); /* Glow + Border trick */
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                    border-radius: 999px; /* Perfect pill */
                }
                
                /* Expanded Mode (Home) */
                .music-flow-expanded {
                     padding: 0.6rem 1.2rem;
                     gap: 0.8rem;
                }
                
                /* Mini Mode (Other Pages) */
                .music-flow-mini {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    justify-content: center;
                    padding: 0;
                    cursor: pointer;
                    opacity: 0.8;
                }

                .music-flow-mini:hover {
                    width: auto;
                    padding: 0.6rem 1.2rem;
                    border-radius: 999px;
                    gap: 0.8rem;
                    opacity: 1;
                }

                /* Mobile Override */
                @media (max-width: 768px) {
                    .music-flow-container {
                        bottom: 2rem; /* Give it space from bottom edge */
                        left: 50%; 
                        transform: translateX(-50%) !important;
                    }
                    .music-flow-expanded {
                        min-width: unset; /* Remove fixed width to shrink wrap content */
                        width: auto;
                        padding: 0.5rem 1.2rem;
                        gap: 1rem;
                    }
                }
            `}</style>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                layout // Enable automatic layout animation
                transition={{ type: "spring", stiffness: 300, damping: 30 }} // Smooth spring
                className={`music-flow-container ${isHome || isHovered ? 'music-flow-expanded' : 'music-flow-mini'}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => !isHome && setIsHovered(true)} // Tap to expand on mobile/tablet
            >
                {/* Condition: Show Full Visualizer if Home or Hovered. Show Mini if collapsed */}
                <AnimatePresence mode="popLayout">
                    {(isHome || isHovered) ? (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                height: '24px',
                            }}>
                                <AudioBar delay={0} />
                                <AudioBar delay={0.2} />
                                <AudioBar delay={0.4} />
                                <AudioBar delay={0.1} />
                            </div>

                            {/* Song Label */}
                            <motion.div
                                layout="position"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', whiteSpace: 'nowrap' }}
                            >
                                <span style={{ fontSize: '0.8rem', color: '#ccc', fontWeight: 600 }}>GYMBRO FM</span>
                            </motion.div>

                            <div style={{ width: '1px', height: '20px', backgroundColor: '#333' }} />

                            {/* Controls */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    aria-label={isPlaying ? "Pause" : "Play"}
                                    onClick={(e) => { e.stopPropagation(); isPlaying ? stop() : play(); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex' }}
                                    title={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                </button>

                                <button
                                    aria-label="Next Song"
                                    onClick={(e) => { e.stopPropagation(); nextSong(); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex' }}
                                    title="Next Song"
                                >
                                    <SkipForward size={18} />
                                </button>

                                <button
                                    aria-label={isMuted ? "Unmute" : "Mute"}
                                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex' }}
                                    title={isMuted ? "Unmute" : "Mute"}
                                >
                                    {isMuted ? <VolumeX size={18} color="#FB7185" /> : <Volume2 size={18} />}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        // Mini State Content
                        <motion.div
                            key="mini"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '2px', width: '100%', justifyContent: 'center' }}
                        >
                            <MiniAudioBar delay={0} />
                            <MiniAudioBar delay={0.2} />
                            <MiniAudioBar delay={0.4} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

export default MusicFlow;
