import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';

const IntroAnimation = ({ onComplete, onStart, isLoading }) => {
    const [step, setStep] = useState(-1); // Start at -1 (Click to Start)
    const { analyser } = useAudio();
    const lastStepTimeRef = useRef(0);
    const animationFrameRef = useRef(null);

    // Sync animation with music beats
    useEffect(() => {
        if (step >= 0 && step < 3 && analyser) {
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkBeat = () => {
                analyser.getByteFrequencyData(dataArray);

                // Calculate average bass volume (first 10 bins approx)
                let bassSum = 0;
                const bassBins = 10;
                for (let i = 0; i < bassBins; i++) {
                    bassSum += dataArray[i];
                }
                const bassAvg = bassSum / bassBins;

                const MIN_DELAY = 600; // Minimum ms between steps (approx 100 BPM)
                const BEAT_THRESHOLD = 180; // Volume threshold

                const now = Date.now();
                if (now - lastStepTimeRef.current > MIN_DELAY) {
                    if (bassAvg > BEAT_THRESHOLD) {
                        setStep(prev => prev + 1);
                        lastStepTimeRef.current = now;
                    }
                }

                animationFrameRef.current = requestAnimationFrame(checkBeat);
            };

            checkBeat();

            // Safety fallback: Advance if no beat detected for too long (2s)
            const safetyTimer = setTimeout(() => {
                if (Date.now() - lastStepTimeRef.current > 2000) {
                    setStep(prev => prev + 1);
                    lastStepTimeRef.current = Date.now();
                }
            }, 2000);

            return () => {
                cancelAnimationFrame(animationFrameRef.current);
                clearTimeout(safetyTimer);
            };
        } else if (step >= 0 && step < 3 && !analyser) {
            // Fallback for no audio context
            const timer = setTimeout(() => {
                setStep(step + 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [step, analyser]);


    const variants = {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "circOut" } },
        exit: { scale: 1.5, opacity: 0, filter: "blur(10px)", transition: { duration: 0.5 } }
    };

    const bgColors = [
        'var(--color-black)',      // Step 0: YOUR
        'var(--color-neon-pink)',  // Step 1: FITNESS
        'var(--color-neon-green)', // Step 2: REIMAGINED
        'var(--color-neon-purple)' // Step 3: READY?
    ];

    const handleInteraction = () => {
        if (isLoading) return; // Prevent interaction if loading

        if (step === -1) {
            if (onStart) onStart();
            setStep(0);
        } else {
            // If playing (step 0-2) or ready (step 3), click skips to end
            onComplete();
        }
    };

    return (
        <motion.div
            className="intro-container"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: step === -1 ? 'var(--color-black)' : (bgColors[step] || 'var(--color-black)'),
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                cursor: isLoading ? 'wait' : 'pointer'
            }}
            onClick={handleInteraction}
        >
            <AnimatePresence mode="wait">
                {step === -1 && (
                    <motion.div key="start" variants={variants} initial="initial" animate="animate" exit="exit" style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '1rem', letterSpacing: '4px' }}>GYMBRO</h1>
                        <p style={{ color: isLoading ? '#666' : 'var(--color-neon-green)', fontSize: '1.2rem', animation: 'pulse 1.5s infinite' }}>
                            {isLoading ? 'LOADING MUSIC...' : 'CLICK TO START'}
                        </p>
                    </motion.div>
                )}
                {step === 0 && (
                    <motion.h1 key="step1" variants={variants} initial="initial" animate="animate" exit="exit" style={{ fontSize: 'clamp(3rem, 15vw, 6rem)', color: 'var(--color-white)' }}>
                        YOUR
                    </motion.h1>
                )}
                {step === 1 && (
                    <motion.h1 key="step2" variants={variants} initial="initial" animate="animate" exit="exit" style={{ fontSize: 'clamp(3rem, 15vw, 6rem)', color: 'var(--color-black)' }}>
                        FITNESS
                    </motion.h1>
                )}
                {step === 2 && (
                    <motion.h1 key="step3" variants={variants} initial="initial" animate="animate" exit="exit" style={{ fontSize: 'clamp(2.5rem, 12vw, 5rem)', color: 'var(--color-black)' }}>
                        REIMAGINED
                    </motion.h1>
                )}
                {step === 3 && (
                    <motion.div key="step4" variants={variants} initial="initial" animate="animate" style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '4rem', color: 'var(--color-white)', marginBottom: '2rem' }}>READY?</h1>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#fff', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>Click to enter</p>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }
            `}</style>
            {step >= 0 && (
                <div style={{
                    position: 'absolute',
                    bottom: '2rem',
                    color: 'rgba(255,255,255,0.0)', /* Hidden but keeps layout if needed, or just remove */
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    pointerEvents: 'none'
                }}>
                    {/* Hidden */}
                </div>
            )}
        </motion.div>
    );
};

export default IntroAnimation;
