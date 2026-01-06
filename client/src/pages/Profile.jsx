import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { User, Trophy, Calendar, Zap, ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import MuscleHeatmap from '../components/MuscleHeatmap';



const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1.5rem',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flex: 1,
            minWidth: '200px'
        }}
    >
        <div style={{
            backgroundColor: `${color}20`,
            padding: '1rem',
            borderRadius: '1rem',
            color: color
        }}>
            <Icon size={24} />
        </div>
        <div>
            <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{label}</div>
            <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
        </div>
    </motion.div>
);

const Profile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalReps: 0,
        totalWorkouts: 0,
        chartData: [
            { name: 'Mon', score: 0, reps: 0 },
            { name: 'Tue', score: 0, reps: 0 },
            { name: 'Wed', score: 0, reps: 0 },
            { name: 'Thu', score: 0, reps: 0 },
            { name: 'Fri', score: 0, reps: 0 },
            { name: 'Sat', score: 0, reps: 0 },
            { name: 'Sun', score: 0, reps: 0 },
        ]
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                setProfile(data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Loading profile...</div>;

    const joinedDate = profile ? format(new Date(profile.created_at), 'MMM yyyy') : '...';
    const initials = profile?.full_name
        ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'GB';

    return (
        <div style={{
            minHeight: '100vh',
            height: '100vh',
            overflowY: 'auto',
            background: 'radial-gradient(circle at top center, #1a1a1a 0%, #000 100%)',
            color: '#fff',
            fontFamily: "'Outfit', sans-serif",
            paddingBottom: '6rem' // Space for navbar/music player
        }}>
            <style>{`
                .profile-container {
                    padding: 1rem;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .profile-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-top: 2rem;
                    margin-bottom: 2rem;
                }
                .stats-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.8rem;
                    margin-bottom: 2rem;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(10px);
                    border-radius: 1.5rem;
                    padding: 1.5rem;
                }
                .stat-card-inner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 1rem;
                    background: rgba(0,0,0,0.2);
                    border-radius: 1rem;
                    border: 1px solid rgba(255,255,255,0.05);
                    transition: transform 0.2s;
                }
                
                @media (min-width: 768px) {
                    .profile-container {
                        padding: 2rem;
                    }
                    .profile-header {
                        flex-direction: row;
                        justify-content: flex-start;
                        gap: 2rem;
                        align-items: center;
                        text-align: left;
                    }
                    .stats-container {
                        gap: 1.5rem;
                    }
                }
            `}</style>

            <div className="profile-container">
                {/* Header Actions */}
                <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
                    <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                        <Settings size={20} />
                    </button>
                </header>

                {/* Profile Identity */}
                <div className="profile-header">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--color-neon-green), var(--color-neon-blue))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem', fontWeight: 'bold', color: '#000',
                            boxShadow: '0 0 40px rgba(0, 255, 204, 0.2)',
                            flexShrink: 0
                        }}>
                        {initials}
                    </motion.div>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '1rem 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '-1px' }}>
                            {profile?.full_name || 'GYM BRO'}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                            <span style={{
                                background: 'rgba(255, 215, 0, 0.15)', color: '#FFD700',
                                padding: '0.2rem 0.8rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', border: '1px solid rgba(255, 215, 0, 0.3)'
                            }}>
                                {profile?.experience_level?.toUpperCase() || 'MEMBER'}
                            </span>
                            <span style={{ color: '#666', fontSize: '0.85rem' }}>Joined {joinedDate}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="stats-container">
                    <motion.div className="stat-card-inner" whileHover={{ y: -5 }}>
                        <Zap size={20} color="#FFD700" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Goal</div>
                        <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '700' }}>{profile?.primary_goal?.toUpperCase() || "FITNESS"}</div>
                    </motion.div>
                    <motion.div className="stat-card-inner" whileHover={{ y: -5 }}>
                        <Trophy size={20} color="#00ffcc" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Reps</div>
                        <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '700' }}>{stats.totalReps.toLocaleString()}</div>
                    </motion.div>
                    <motion.div className="stat-card-inner" whileHover={{ y: -5 }}>
                        <Calendar size={20} color="#ff0099" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Workouts</div>
                        <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '700' }}>{stats.totalWorkouts}</div>
                    </motion.div>
                </div>

                {/* Muscle Activation - Main Feature */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-card"
                    style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}
                >
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#ccc', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Muscle Activation</h2>
                    </div>

                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <MuscleHeatmap muscles={{
                            'Chest': 8, 'Triceps': 5, 'Shoulders': 6, 'Back': 4,
                            'Biceps': 3, 'Quads': 7, 'Glutes': 5, 'Hamstrings': 4, 'Core': 2
                        }} />
                    </div>

                    {/* Background glow for heatmap */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(0,255,204,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                </motion.div>

                {/* Charts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <motion.div className="glass-card" whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Consistency</h3>
                        <div style={{ height: '200px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00ffcc" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00ffcc" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="name" stroke="#444" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                    <Area type="monotone" dataKey="score" stroke="#00ffcc" strokeWidth={2} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div className="glass-card" whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Volume Load</h3>
                        <div style={{ height: '200px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="name" stroke="#444" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                    <Line type="monotone" dataKey="reps" stroke="#ff0099" strokeWidth={2} dot={{ r: 3, fill: '#ff0099' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
