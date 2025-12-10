import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Calendar, Activity, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }

        const fetchWorkouts = async () => {
            const { data, error } = await supabase
                .from('workouts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching workouts:', error);
            } else {
                setWorkouts(data || []);
            }
            setLoading(false);
        };

        fetchWorkouts();
    }, [user, navigate]);

    if (loading) return <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>Loading history...</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Activity color="var(--color-neon-blue)" size={32} />
                    Your Workout History
                </h1>

                {workouts.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '4rem' }}>
                        <p style={{ fontSize: '1.2rem' }}>No workouts recorded yet.</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                marginTop: '1rem',
                                padding: '1rem 2rem',
                                backgroundColor: 'var(--color-neon-green)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '2rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Start Training
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {workouts.map((workout) => (
                            <motion.div
                                key={workout.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    backgroundColor: '#111',
                                    border: '1px solid #333',
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', color: 'var(--color-neon-green)' }}>
                                        {workout.exercise_type}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: '#888', fontSize: '0.9rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Calendar size={14} />
                                            {new Date(workout.created_at).toLocaleDateString()}
                                        </span>
                                        <span>•</span>
                                        <span style={{ color: '#fff', fontWeight: 'bold' }}>
                                            {workout.reps} Reps
                                        </span>
                                    </div>
                                    {/* Show first feedback item if exists */}
                                    {workout.feedback && workout.feedback.length > 0 && (
                                        <div style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: '#aaa', fontStyle: 'italic' }}>
                                            "{workout.feedback[0]}"
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
