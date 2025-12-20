import React from 'react';
import { motion } from 'framer-motion';

const GlowButton = ({ children, onClick, style = {} }) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05, backgroundColor: 'var(--color-neon-pink)', color: 'white', boxShadow: '0 0 20px var(--color-neon-pink)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ backgroundColor: 'var(--color-neon-green)', color: 'black' }}
            style={{
                border: 'none',
                padding: '1rem 3rem',
                fontSize: '1.2rem',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: '900',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                letterSpacing: '1px',
                borderRadius: '4px',
                ...style
            }}
        >
            {children}
        </motion.button>
    );
};

export default GlowButton;
