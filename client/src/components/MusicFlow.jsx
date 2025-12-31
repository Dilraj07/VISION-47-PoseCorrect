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
                    background-color: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }
                
                /* Expanded Mode (Home) */
                .music-flow-expanded {
                     padding: 0.5rem 1rem;
                     border-radius: 50px;
                     border: 1px solid #333;
                     gap: 0.5rem;
                }
                
                /* Mini Mode (Other Pages) */
                .music-flow-mini {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    justify-content: center;
                    padding: 0;
                    cursor: pointer;
                }

                .music-flow-mini:hover {
                    width: auto;
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    border-color: #333;
                    gap: 0.5rem;
                }

                /* Mobile Override (Always Center Bottom, but logic handles styling) */
                @media (max-width: 768px) {
                    .music-flow-container {
                        bottom: 1.5rem;
                        left: 50%; 
                        transform: translateX(-50%) !important;
                    }
                    .music-flow-expanded {
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
                                    onClick={(e) => { e.stopPropagation(); isPlaying ? stop() : play(); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex' }}
                                    title={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); nextSong(); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex' }}
                                    title="Next Song"
                                >
                                    <SkipForward size={18} />
                                </button>

                                <button
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
