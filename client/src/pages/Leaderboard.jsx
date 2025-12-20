import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const dummyData = [
    { rank: 1, name: 'Mike Tyson', score: 9850, avatar: 'MT', change: '+2' },
    { rank: 2, name: 'Arya Bro', score: 9200, avatar: 'AB', change: '0', isMe: true },
    { rank: 3, name: 'Sarah Connor', score: 8940, avatar: 'SC', change: '-1' },
    { rank: 4, name: 'John Wick', score: 8500, avatar: 'JW', change: '+5' },
    { rank: 5, name: 'Rocky Balboa', score: 8100, avatar: 'RB', change: '-2' },
    { rank: 6, name: 'Bruce Lee', score: 7900, avatar: 'BL', change: '0' },
    { rank: 7, name: 'Arnold S.', score: 7600, avatar: 'AS', change: '+1' },
    { rank: 8, name: 'The Rock', score: 7400, avatar: 'TR', change: '-3' },
];

const LeaderboardRow = ({ user, index }) => {
    const isTop3 = index < 3;
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1.5rem',
                backgroundColor: user.isMe ? 'rgba(0, 255, 204, 0.1)' : 'rgba(255,255,255,0.03)',
                border: user.isMe ? '1px solid rgba(0, 255, 204, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '1rem',
                marginBottom: '1rem',
            }}
        >
            {/* Rank */}
            <div style={{ width: '40px', fontSize: '1.2rem', fontWeight: 'bold', color: isTop3 ? colors[index] : '#888', textAlign: 'center' }}>
                {isTop3 ? <Medal size={28} /> : user.rank}
            </div>

            {/* Avatar */}
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: isTop3 ? colors[index] : '#333',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                marginLeft: '1.5rem',
                marginRight: '1.5rem'
            }}>
                {user.avatar}
            </div>

            {/* Name */}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: user.isMe ? '#00ffcc' : '#fff' }}>
                    {user.name} {user.isMe && '(You)'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    Pro Member
                </div>
            </div>

            {/* Score */}
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                    {user.score.toLocaleString()} XP
                </div>
            </div>
        </motion.div>
    );
};

const Leaderboard = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            padding: '2rem',
            paddingBottom: '6rem'
        }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.9rem',
                        background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    <ArrowLeft size={16} /> BACK
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px', margin: 0 }}>GLOBAL RANKING</h1>
                <div style={{ width: '60px' }}></div> {/* Spacer for center alignment */}
            </header>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        style={{
                            display: 'inline-flex',
                            padding: '1.5rem',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 215, 0, 0.1)',
                            color: '#FFD700',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(255, 215, 0, 0.2)'
                        }}
                    >
                        <Trophy size={48} />
                    </motion.div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Top Performers</h2>
                    <p style={{ color: '#888' }}>Compete with the best Bros worldwide.</p>
                </div>

                <div>
                    {dummyData.map((user, index) => (
                        <LeaderboardRow key={index} user={user} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
