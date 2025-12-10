import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, Video, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';

const exercises = [
    {
        id: 'pushup',
        name: 'PUSH UP',
        targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
        gradient: 'linear-gradient(90deg, #1a1a1a 0%, #1a1a1a 100%)',
        accentColor: '#ccff00',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80',
    },
    {
        id: 'pullup',
        name: 'PULL UP',
        targetMuscles: ['Back', 'Biceps', 'Lats'],
        gradient: 'linear-gradient(90deg, #1a1a1a 0%, #1a1a1a 100%)',
        accentColor: '#9900ff',
        image: 'https://images.unsplash.com/photo-1598971639058-211a74a96fb4?auto=format&fit=crop&q=80',
    },
    {
        id: 'benchpress',
        name: 'BENCH PRESS',
        targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
        gradient: 'linear-gradient(90deg, #1a1a1a 0%, #1a1a1a 100%)',
        accentColor: '#ff0099',
        image: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&q=80',
        status: 'in-progress'
    },
    {
        id: 'squat',
        name: 'SQUAT',
        targetMuscles: ['Quads', 'Glutes', 'Hamstrings'],
        gradient: 'linear-gradient(90deg, #1a1a1a 0%, #1a1a1a 100%)',
        accentColor: '#00ffcc',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80',
    },
    {
        id: 'deadlift',
        name: 'DEADLIFT',
        targetMuscles: ['Back', 'Glutes', 'Hamstrings'],
        gradient: 'linear-gradient(90deg, #1a1a1a 0%, #1a1a1a 100%)',
        accentColor: '#ff6600',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80',
    },
    {
        id: 'lunge',
        name: 'LUNGE',
        targetMuscles: ['Quads', 'Glutes', 'Hamstrings'],
        gradient: 'linear-gradient(90deg, #1a1a1a 0%, #1a1a1a 100%)',
        accentColor: '#ffbf00',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80',
        status: 'in-progress'
    },
    {
        id: 'bicep_curl',
        name: 'BICEP CURL',
        targetMuscles: ['Biceps', 'Forearms'],
        gradient: 'linear-gradient(90deg, #1a1a1a 0%, #1a1a1a 100%)',
        accentColor: '#00ccff',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80',
        status: 'in-progress'
    }
];

const ExerciseStrip = ({ exercise, onSelect, isHovered, setHovered }) => {
    const isInProgress = exercise.status === 'in-progress';

    return (
        <motion.div
            layout
            onMouseEnter={() => !isInProgress && setHovered(exercise.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => !isInProgress && onSelect(exercise)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                width: '100%',
                height: isHovered && !isInProgress ? '200px' : '100px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2rem',
                cursor: isInProgress ? 'not-allowed' : 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: isInProgress ? 0.6 : 1
            }}
        >
            {/* Hover Background Accent */}
            <motion.div
                animate={{ opacity: isHovered && !isInProgress ? 0.1 : 0 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: exercise.accentColor,
                    zIndex: 0
                }}
            />

            {/* Content */}
            <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <motion.h2
                            layout="position"
                            style={{
                                fontSize: isHovered && !isInProgress ? '3rem' : '2rem',
                                color: isHovered && !isInProgress ? '#fff' : '#888',
                                fontWeight: '900',
                                margin: 0,
                                letterSpacing: '-0.03em',
                                transition: 'color 0.3s ease'
                            }}
                        >
                            {exercise.name}
                        </motion.h2>
                        {isInProgress && (
                            <span style={{
                                backgroundColor: '#333',
                                color: '#ccc',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                border: '1px solid #555'
                            }}>
                                SOON
                            </span>
                        )}
                    </div>
                    {isHovered && !isInProgress && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}
                        >
                            {exercise.targetMuscles.map(muscle => (
                                <span key={muscle} style={{ color: exercise.accentColor, fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    {muscle}
                                </span>
                            ))}
                        </motion.div>
                    )}
                </div>

                {!isInProgress && (
                    <motion.div
                        animate={{ x: isHovered ? 10 : 0, scale: isHovered ? 1.2 : 1 }}
                    >
                        <ChevronRight size={32} color={isHovered ? exercise.accentColor : "#444"} />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredId, setHoveredId] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);

    const handleModeSelect = (mode) => {
        const targetPath = mode === 'upload' ? '/upload' : '/coach';
        navigate(targetPath, { state: { selectedExercise: selectedExercise.id } });
    };

    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <header style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid #222' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.9rem',
                            background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        <ArrowLeft size={16} /> BACK
                    </button>
                    <div style={{ fontSize: '0.9rem', color: '#444', letterSpacing: '0.1em' }}>SELECT EXERCISE</div>
                </div>

                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: '#111',
                        border: '1px solid #333',
                        borderRadius: '0.5rem',
                        color: '#fff',
                        fontSize: '1rem',
                        outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#666'}
                    onBlur={(e) => e.target.style.borderColor = '#333'}
                />
            </header>

            {/* List */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {filteredExercises.map((exercise) => (
                    <ExerciseStrip
                        key={exercise.id}
                        exercise={exercise}
                        isHovered={hoveredId === exercise.id}
                        setHovered={setHoveredId}
                        onSelect={setSelectedExercise}
                    />
                ))}
                {filteredExercises.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>
                        No exercises found matching "{searchTerm}"
                    </div>
                )}
            </div>

            {/* Mode Selection Modal */}
            <AnimatePresence>
                {selectedExercise && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 100,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '2rem'
                        }}
                        onClick={() => setSelectedExercise(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '800px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '2rem'
                            }}
                        >
                            <div
                                onClick={() => handleModeSelect('coach')}
                                style={{
                                    backgroundColor: '#111',
                                    border: `1px solid ${selectedExercise.accentColor}`,
                                    borderRadius: '1rem',
                                    padding: '3rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Camera size={48} color={selectedExercise.accentColor} />
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>REAL-TIME COACH</h2>
                            </div>

                            <div
                                onClick={() => handleModeSelect('upload')}
                                style={{
                                    backgroundColor: '#111',
                                    border: '1px solid #333',
                                    borderRadius: '1rem',
                                    padding: '3rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.borderColor = selectedExercise.accentColor;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.borderColor = '#333';
                                }}
                            >
                                <Video size={48} color="#666" />
                                <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#888' }}>VIDEO UPLOAD</h2>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
