import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Info, CheckCircle, Crosshair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlowButton from '../components/GlowButton';

const EXERCISES = [
    {
        id: 'squat',
        title: 'BARBELL SQUAT',
        difficulty: 'INTERMEDIATE',
        muscles: 'LEGS / CORE',
        color: 'var(--color-neon-pink)',
        description: 'The king of all exercises. Builds massive leg strength and core stability.',
        cues: [
            { title: 'Stance', text: 'Feet shoulder-width apart, toes slightly out.' },
            { title: 'Brace', text: 'Deep breath into your belly, tighten core.' },
            { title: 'Descent', text: 'Hinge hips back, then bend knees simultaneously.' },
            { title: 'Depth', text: 'Go until thighs are at least parallel to floor.' },
            { title: 'Drive', text: 'Push through mid-foot, chest up, hips forward.' }
        ]
    },
    {
        id: 'deadlift',
        title: 'DEADLIFT',
        difficulty: 'ADVANCED',
        muscles: 'BACK / LEGS',
        color: 'var(--color-neon-green)',
        description: 'Total body power. Teaches proper hip hinge mechanics.',
        cues: [
            { title: 'Setup', text: 'Bar over mid-foot. Shins touching bar.' },
            { title: 'Grip', text: 'Hands just outside legs. Arms straight.' },
            { title: 'Tension', text: 'Squeeze armpits down, pull "slack" out.' },
            { title: 'Lift', text: 'Push the floor away. Hips and shoulders rise together.' }
        ]
    },
    {
        id: 'bench',
        title: 'BENCH PRESS',
        difficulty: 'INTERMEDIATE',
        muscles: 'CHEST / ARMS',
        color: 'var(--color-neon-blue)',
        description: 'Upper body strength standard. Develops pushing power.',
        cues: [
            { title: 'Arch', text: 'Retract scapula, slight arch in lower back.' },
            { title: 'Plant', text: 'Feet planted firmly on the ground.' },
            { title: 'Path', text: 'Lower bar to lower chest/sternum.' },
            { title: 'Press', text: 'Drive bar up and slightly back toward face.' }
        ]
    }
];

const Academy = () => {
    const navigate = useNavigate();
    const [selectedExercise, setSelectedExercise] = useState(null);

    return (
        <div style={{
            minHeight: '100vh',
            padding: '6rem 2rem 2rem 2rem',
            backgroundColor: 'var(--color-black)',
            color: 'var(--color-white)',
            fontFamily: "var(--font-primary)"
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                <AnimatePresence mode="wait">
                    {!selectedExercise ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
                                <h1 style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: 'clamp(3rem, 8vw, 6rem)',
                                    margin: 0,
                                    lineHeight: 0.9,
                                    textTransform: 'uppercase'
                                }}>
                                    Movement<br />
                                    <span style={{
                                        color: 'transparent',
                                        WebkitTextStroke: '2px var(--color-neon-green)'
                                    }}>Mastery</span>
                                </h1>
                                <p style={{ color: '#888', marginTop: '1rem', fontSize: '1.2rem' }}>
                                    Select a technique to analyze.
                                </p>
                            </header>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '2rem'
                            }}>
                                {EXERCISES.map((ex, index) => (
                                    <ExerciseCard
                                        key={ex.id}
                                        exercise={ex}
                                        onClick={() => setSelectedExercise(ex)}
                                        delay={index * 0.1}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <TutorialView
                            key="tutorial"
                            exercise={selectedExercise}
                            onBack={() => setSelectedExercise(null)}
                            onPractice={() => navigate('/coach')}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ExerciseCard = ({ exercise, onClick, delay }) => (
    <motion.div
        layoutId={`card-${exercise.id}`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        onClick={onClick}
        whileHover={{ y: -10, borderColor: exercise.color }}
        style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '16px',
            padding: '2rem',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: '0.5rem 1rem',
            background: exercise.color,
            color: '#000',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            borderBottomLeftRadius: '16px'
        }}>
            {exercise.difficulty}
        </div>

        <h3 style={{ fontFamily: "var(--font-display)", fontSize: '2rem', marginBottom: '0.5rem', color: 'white' }}>
            {exercise.title}
        </h3>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>{exercise.muscles}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: exercise.color, fontWeight: 'bold' }}>
            LEARN TECHNIQUE <ArrowRightIcon />
        </div>
    </motion.div>
);

const TutorialView = ({ exercise, onBack, onPractice }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ paddingTop: '2rem' }}
    >
        <button
            onClick={onBack}
            style={{
                background: 'transparent',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '2rem',
                fontSize: '1rem'
            }}
        >
            <ArrowLeft size={20} /> BACK TO ACADEMY
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem' }}>
            {/* Visual Side */}
            <div>
                <motion.h2
                    layoutId={`card-${exercise.id}`}
                    style={{ fontFamily: "var(--font-display)", fontSize: '4rem', margin: '0 0 1rem 0', color: exercise.color }}
                >
                    {exercise.title}
                </motion.h2>
                <p style={{ fontSize: '1.2rem', color: '#ccc', lineHeight: '1.6', marginBottom: '3rem' }}>
                    {exercise.description}
                </p>

                {/* Placeholder for 3D/Video */}
                <div style={{
                    width: '100%',
                    height: '300px',
                    borderRadius: '16px',
                    backgroundColor: '#1a1a1a',
                    border: `1px solid ${exercise.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    boxShadow: `0 0 50px rgba(0,0,0,0.5)`
                }}>
                    <Play size={48} color={exercise.color} />
                    <span style={{ marginTop: '1rem', color: '#666', fontFamily: "var(--font-mono)" }}>INTERACTIVE DEMO LOADING...</span>
                </div>

                <div style={{ marginTop: '3rem' }}>
                    <GlowButton onClick={onPractice} style={{ width: '100%', justifyContent: 'center' }}>
                        <Crosshair /> PRACTICE NOW
                    </GlowButton>
                </div>
            </div>

            {/* Cues Side */}
            <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: '2rem', marginBottom: '2rem', color: 'white' }}>
                    KEY CHECKPOINTS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {exercise.cues.map((cue, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            gap: '1.5rem',
                            padding: '1.5rem',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            borderLeft: `4px solid ${exercise.color}`
                        }}>
                            <div style={{
                                background: exercise.color,
                                color: '#000',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {i + 1}
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'white' }}>{cue.title}</h4>
                                <p style={{ margin: 0, color: '#999', lineHeight: '1.5' }}>{cue.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
);

const ArrowRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

export default Academy;
