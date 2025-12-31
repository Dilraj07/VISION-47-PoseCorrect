import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

const StreakFlame = ({ streak = 0 }) => {
    if (streak < 3) return null; // No flame for < 3 days

    // Determine Flame Style
    let color = 'var(--color-neon-blue)'; // Default 3+ days
    let shadow = '0 0 10px var(--color-neon-blue)';
    let scale = 1;

    // 7+ Days: Raging Pink
    if (streak >= 7) {
        color = 'var(--color-neon-pink)';
        shadow = '0 0 15px var(--color-neon-pink)';
        scale = 1.1;
    }

    // 30+ Days: Inferno (Multi-color simulated with gradient text clip or complex shadow)
    // For "light scale", we'll use a dynamic gold/orange glow
    if (streak >= 30) {
        color = '#FFD700'; // Gold
        shadow = '0 0 20px #FFD700, 0 0 40px #FF4500'; // Gold + Orange glow
        scale = 1.25;
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem', cursor: 'help' }} title={`${streak} Day Streak!`}>
            <motion.div
                animate={{
                    opacity: [0.8, 1, 0.8],
                    scale: [scale, scale * 1.05, scale],
                    filter: [`drop-shadow(${shadow})`, `drop-shadow(${shadow}) blur(1px)`, `drop-shadow(${shadow})`]
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Flame size={20} color={color} fill={streak >= 30 ? "orange" : "currentColor"} fillOpacity={0.2} />
            </motion.div>

            <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    color: color,
                    textShadow: `0 0 5px ${color}`
                }}
            >
                {streak}
            </motion.span>
        </div>
    );
};

export default StreakFlame;
