import React from 'react';
import { motion } from 'framer-motion';

const MuscleHeatmap = ({ muscles = {} }) => {
    // Helper to get color based on intensity (0 to 1)
    const getColor = (intensity) => {
        if (!intensity || intensity < 0.3) return '#333'; // Dim/Grey for low activity
        // Projecting from Dark Green to Neon Green based on intensity
        return `rgba(57, 255, 20, ${0.4 + (intensity * 0.6)})`;
    };

    const getStroke = (intensity) => {
        if (!intensity || intensity < 0.3) return '#444';
        return '#39ff14'; // Neon Green Stroke
    };

    const getGlow = (intensity) => {
        if (!intensity || intensity < 0.3) return 'none';
        return `0 0 ${intensity * 20}px rgba(57, 255, 20, 0.5)`;
    };

    // Muscle Group Paths (Simplified Geometric/Wireframe Body)
    const muscleGroups = {
        shoulders: {
            path: "M130,60 L180,60 L190,90 L120,90 Z M70,60 L20,60 L10,90 L80,90 Z", // Left & Right Delts
            intensity: muscles.shoulders || 0
        },
        chest: {
            path: "M80,90 L120,90 L110,140 L90,140 Z M80,90 L90,140 L50,130 L10,90 Z M120,90 L150,130 L110,140 Z", // Pecs
            intensity: muscles.chest || 0
        },
        arms: {
            path: "M10,90 L-10,150 L20,160 L50,130 Z M190,90 L210,150 L180,160 L150,130 Z", // Biceps/Triceps
            intensity: muscles.arms || 0
        },
        abs: {
            path: "M90,140 L110,140 L105,190 L95,190 Z M95,190 L105,190 L105,210 L95,210 Z", // Abs/Core
            intensity: muscles.abs || 0
        },
        legs: {
            path: "M95,210 L60,220 L65,300 L95,280 Z M105,210 L140,220 L135,300 L105,280 Z M65,300 L70,380 L90,380 L95,280 Z M135,300 L130,380 L110,380 L105,280 Z", // Quads/Thighs/Calves
            intensity: muscles.legs || 0
        },
        head: {
            path: "M85,15 L115,15 L125,50 L75,50 Z", // Head
            intensity: 0.1 // Always dim
        }
    };

    return (
        <div style={{
            width: '100%',
            height: '300px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            marginTop: '2rem'
        }}>
            {/* Background Grid Effect */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'linear-gradient(rgba(57, 255, 20, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 20, 0.05) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
                zIndex: 0
            }} />

            <svg width="300" height="400" viewBox="-50 0 300 400" style={{ zIndex: 1, overflow: 'visible' }}>
                <defs>
                    <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {Object.entries(muscleGroups).map(([key, data]) => (
                    <motion.path
                        key={key}
                        d={data.path}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            fill: getColor(data.intensity),
                            stroke: getStroke(data.intensity),
                            filter: data.intensity > 0.5 ? 'url(#neon-glow)' : 'none'
                        }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        strokeWidth="2"
                        strokeLinejoin="round"
                    />
                ))}
            </svg>

            {/* Stats Overlay for visual flair */}
            <div style={{ position: 'absolute', right: '10%', top: '20%', textAlign: 'right' }}>
                <div style={{ color: '#666', fontSize: '0.8rem', letterSpacing: '2px' }}>MUSCLE ACTIVATION</div>
                <div style={{ color: 'var(--color-neon-green)', fontSize: '2rem', fontWeight: '900', textShadow: '0 0 10px rgba(57,255,20,0.5)' }}>
                    {Math.round((Object.values(muscles).reduce((a, b) => a + b, 0) / 5) * 100)}%
                </div>
                <div style={{ color: '#444', fontSize: '0.7rem', marginTop: '5px' }}>Whole Body Tension</div>
            </div>

            <div style={{ position: 'absolute', left: '10%', bottom: '20%', textAlign: 'left' }}>
                <div style={{ color: '#666', fontSize: '0.8rem', letterSpacing: '2px' }}>STATUS</div>
                <div style={{ color: muscles.legs < 0.3 ? '#888' : 'var(--color-neon-green)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {muscles.legs < 0.3 ? 'SKIP LEG DAY?' : 'BALANCED'}
                </div>
            </div>
        </div>
    );
};

export default MuscleHeatmap;
