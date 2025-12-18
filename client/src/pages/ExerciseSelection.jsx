import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const exercises = [
    {
        id: 'pushup',
        name: 'PUSH UP',
        targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
        gradient: 'linear-gradient(135deg, #ccff00 0%, #99cc00 100%)',
        accentColor: '#ccff00',
        shadowColor: 'rgba(204, 255, 0, 0.4)',
        icon: '💪',
        description: 'Upper body strength foundation'
    },
    {
        id: 'pullup',
        name: 'PULL UP',
        targetMuscles: ['Back', 'Biceps', 'Lats'],
        gradient: 'linear-gradient(135deg, #9900ff 0%, #6600cc 100%)',
        accentColor: '#9900ff',
        shadowColor: 'rgba(153, 0, 255, 0.4)',
        icon: '🔥',
        description: 'Complete back development'
    },
    {
        id: 'benchpress',
        name: 'BENCH PRESS',
        targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
        gradient: 'linear-gradient(135deg, #ff0099 0%, #cc0077 100%)',
        accentColor: '#ff0099',
        shadowColor: 'rgba(255, 0, 153, 0.4)',
        icon: '🏋️',
        description: 'Compound pushing power'
    },
    {
        id: 'squat',
        name: 'SQUAT',
        targetMuscles: ['Quads', 'Glutes', 'Hamstrings'],
        gradient: 'linear-gradient(135deg, #00ffcc 0%, #00cc99 100%)',
        accentColor: '#00ffcc',
        shadowColor: 'rgba(0, 255, 204, 0.4)',
        icon: '⚡',
        description: 'Lower body foundation'
    },
    {
        id: 'deadlift',
        name: 'DEADLIFT',
        targetMuscles: ['Back', 'Glutes', 'Hamstrings'],
        gradient: 'linear-gradient(135deg, #ff6600 0%, #cc5200 100%)',
        accentColor: '#ff6600',
        shadowColor: 'rgba(255, 102, 0, 0.4)',
        icon: '🎯',
        description: 'Full body strength builder'
    },
    {
        id: 'shoulder_press',
        name: 'SHOULDER PRESS',
        targetMuscles: ['Shoulders', 'Triceps', 'Upper Chest'],
        gradient: 'linear-gradient(135deg, #ff3333 0%, #cc0000 100%)',
        accentColor: '#ff3333',
        shadowColor: 'rgba(255, 51, 51, 0.4)',
        icon: '🆙',
        description: 'Overhead strength & stability'
    },
    {
        id: 'lunge',
        name: 'LUNGE',
        targetMuscles: ['Quads', 'Glutes', 'Calves'],
        gradient: 'linear-gradient(135deg, #33cc33 0%, #009900 100%)',
        accentColor: '#33cc33',
        shadowColor: 'rgba(51, 204, 51, 0.4)',
        icon: '🦵',
        description: 'Unilateral leg strength'
    },
    {
        id: 'bicep_curl',
        name: 'BICEP CURL',
        targetMuscles: ['Biceps', 'Forearms'],
        gradient: 'linear-gradient(135deg, #3399ff 0%, #0066cc 100%)',
        accentColor: '#3399ff',
        shadowColor: 'rgba(51, 153, 255, 0.4)',
        icon: '🦾',
        description: 'Arm isolation & aesthetic'
    },
    {
        id: 'plank',
        name: 'PLANK',
        targetMuscles: ['Core', 'Abs', 'Lower Back'],
        gradient: 'linear-gradient(135deg, #ffff33 0%, #cccc00 100%)',
        accentColor: '#ffff33',
        shadowColor: 'rgba(255, 255, 51, 0.4)',
        icon: '🧱',
        description: 'Static core stability'
    }
];

const ExerciseSelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.state?.mode || 'coach';
    const [hoveredId, setHoveredId] = useState(null);

    const handleSelect = (exercise) => {
        const targetPath = mode === 'upload' ? '/upload' : '/coach';
        navigate(targetPath, { state: { selectedExercise: exercise.id } });
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            padding: '2rem',
            overflowX: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4rem',
                maxWidth: '1400px',
                margin: '0 auto 4rem auto'
            }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#666',
                        fontSize: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                >
                    <ChevronLeft size={24} /> BACK
                </button>

                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    letterSpacing: '0.1em',
                    color: '#333'
                }}>
                    SELECT EXERCISE
                </h1>
            </div>

            {/* Grid Container */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '2rem',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {exercises.map((exercise) => (
                    <motion.div
                        key={exercise.id}
                        onHoverStart={() => setHoveredId(exercise.id)}
                        onHoverEnd={() => setHoveredId(null)}
                        onClick={() => handleSelect(exercise)}
                        whileHover={{ scale: 0.98 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            height: '400px',
                            backgroundColor: '#111',
                            borderRadius: '1rem',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: '1px solid #222'
                        }}
                    >
                        {/* Background Gradient on Hover */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: hoveredId === exercise.id ? 1 : 0 }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: exercise.gradient,
                                zIndex: 0
                            }}
                        />

                        {/* Content */}
                        <div style={{
                            position: 'relative',
                            zIndex: 1,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '2rem',
                            textAlign: 'center'
                        }}>
                            {/* Icon - Large and Bold */}
                            <motion.div
                                animate={{
                                    scale: hoveredId === exercise.id ? 1.2 : 1,
                                    y: hoveredId === exercise.id ? -20 : 0
                                }}
                                style={{
                                    fontSize: '5rem',
                                    marginBottom: '1rem',
                                    filter: hoveredId === exercise.id ? 'grayscale(0%)' : 'grayscale(100%) brightness(1.5)',
                                    opacity: hoveredId === exercise.id ? 1 : 0.5
                                }}
                            >
                                {exercise.icon}
                            </motion.div>

                            {/* Name - Huge Typography */}
                            <motion.h2
                                animate={{
                                    color: hoveredId === exercise.id ? '#000' : '#fff',
                                    scale: hoveredId === exercise.id ? 1.1 : 1
                                }}
                                style={{
                                    fontSize: '3rem',
                                    fontWeight: '900',
                                    lineHeight: 0.8,
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    fontFamily: 'Migha, Impact, sans-serif'
                                }}
                            >
                                {exercise.name}
                            </motion.h2>

                            {/* Muscles - Visible on Hover */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: hoveredId === exercise.id ? 1 : 0,
                                    y: hoveredId === exercise.id ? 0 : 20
                                }}
                                style={{
                                    marginTop: '1rem',
                                    display: 'flex',
                                    gap: '0.5rem',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center'
                                }}
                            >
                                {exercise.targetMuscles.map((muscle, idx) => (
                                    <span key={idx} style={{
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        backgroundColor: 'rgba(0,0,0,0.2)',
                                        color: '#000',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '100px'
                                    }}>
                                        {muscle.toUpperCase()}
                                    </span>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ExerciseSelection;
