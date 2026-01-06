import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

const StreakFlame = ({ streak = 0 }) => {
    // Default Style (Streak < 3) - Dormant Flame
    let color = '#333';
    let shadow = 'none';
    let scale = 1;

    // 3+ Days: Blue Flame (Ignited)
    if (streak >= 3) {
        color = 'var(--color-neon-blue)';
        shadow = '0 0 10px var(--color-neon-blue)';
    }

    // 7+ Days: Raging Pink
    if (streak >= 7) {
        color = 'var(--color-neon-pink)';
        shadow = '0 0 15px var(--color-neon-pink)';
        scale = 1.1;
    }

    // 30+ Days: Inferno (Gold + Orange)
    if (streak >= 30) {
        color = '#FFD700'; // Gold
        shadow = '0 0 20px #FFD700, 0 0 40px #FF4500';
        scale = 1.25;
    }

    // Calculate opacity based on streak to show "warming up"
    const opacity = streak > 0 ? 1 : 0.3;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem', cursor: 'help', opacity }} title={streak > 0 ? `${streak} Day Streak!` : "Start a streak!"}>
            <motion.div
                animate={streak >= 3 ? {
                    opacity: [0.8, 1, 0.8],
                    scale: [scale, scale * 1.05, scale],
                    filter: [`drop-shadow(${shadow})`, `drop-shadow(${shadow}) blur(1px)`, `drop-shadow(${shadow})`]
                } : {}}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Flame size={20} color={color} fill={streak >= 30 ? "orange" : "currentColor"} fillOpacity={streak >= 3 ? 0.2 : 0} />
            </motion.div>

            <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    color: color,
                    textShadow: streak >= 3 ? `0 0 5px ${color}` : 'none'
                }}
            >
                {streak}
            </motion.span>
        </div>
    );
};

export default StreakFlame;
