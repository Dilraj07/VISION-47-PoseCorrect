import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { User, Trophy, Calendar, Zap, ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';



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
            backgroundColor: '#000',
            color: '#fff',
            padding: '2rem',
            paddingBottom: '6rem'
        }}>
            <style>{`
                .profile-container {
                    padding: 1rem;
                }
                .profile-header {
                    margin-bottom: 2rem;
                }
                .profile-info {
                    flex-direction: column;
                    text-align: center;
                    gap: 1.5rem;
                }
                .stats-grid {
                    grid-template-columns: 1fr;
                }
                .charts-grid {
                    grid-template-columns: 1fr;
                }
                .stat-card {
                    min-width: 100%;
                }
                
                @media (min-width: 768px) {
                    .profile-container {
                        padding: 2rem;
                    }
                    .profile-info {
                        flex-direction: row;
                        text-align: left;
                    }
                    .stats-grid {
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    }
                    .charts-grid {
                        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    }
                    .stat-card {
                        min-width: 200px;
                    }
                }
            `}</style>

            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.9rem',
                        background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    <ArrowLeft size={16} /> BACK
                </button>
                <button
                    onClick={() => navigate('/settings')}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                >
                    <Settings size={20} />
                </button>
            </header>

            {/* Profile Info */}
            <div className="profile-info" style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, var(--color-neon-blue), var(--color-neon-green))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#000',
                    boxShadow: '0 0 20px rgba(0, 255, 204, 0.3)'
                }}>
                    {initials}
                </div>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        {profile?.full_name || 'GYM BRO'}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                        <span style={{
                            backgroundColor: 'rgba(255, 215, 0, 0.1)',
                            color: '#FFD700',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '1rem',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            border: '1px solid rgba(255, 215, 0, 0.2)'
                        }}>
                            {profile?.experience_level?.toUpperCase() || 'MEMBER'}
                        </span>
                        <span style={{ color: '#888' }}>Joined {joinedDate}</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
                <StatCard icon={Zap} label="Goal" value={profile?.primary_goal?.toUpperCase() || "FITNESS"} color="#FFD700" />
                <StatCard icon={Trophy} label="Total Reps" value={stats.totalReps.toLocaleString()} color="#00ffcc" />
                <StatCard icon={Calendar} label="Workouts" value={stats.totalWorkouts} color="#ff0099" />
            </div>

            {/* Charts */}
            <div className="charts-grid" style={{ display: 'grid', gap: '2rem' }}>

                {/* Form Consistency Chart */}
                {/* Form Consistency Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        backgroundColor: '#111',
                        border: '1px solid #333',
                        borderRadius: '1.5rem',
                        padding: '1.5rem'
                    }}
                >
                    <h2 style={{ marginBottom: '2rem', fontSize: '1.2rem', color: '#ccc' }}>Form Consistency Score</h2>
                    <div style={{ height: '250px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00ffcc" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00ffcc" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" tickLine={false} axisLine={false} dy={10} tick={{ fontSize: 12 }} />
                                <YAxis stroke="#666" tickLine={false} axisLine={false} dx={-10} domain={[0, 100]} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#00ffcc" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Rep Volume Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        backgroundColor: '#111',
                        border: '1px solid #333',
                        borderRadius: '1.5rem',
                        padding: '1.5rem'
                    }}
                >
                    <h2 style={{ marginBottom: '2rem', fontSize: '1.2rem', color: '#ccc' }}>Weekly Volume</h2>
                    <div style={{ height: '250px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" tickLine={false} axisLine={false} dy={10} tick={{ fontSize: 12 }} />
                                <YAxis stroke="#666" tickLine={false} axisLine={false} dx={-10} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="reps" stroke="#ff0099" strokeWidth={3} dot={{ r: 4, fill: '#ff0099' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
