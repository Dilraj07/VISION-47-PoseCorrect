import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, FileVideo, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const VideoAnalysis = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedExercise = location.state?.selectedExercise || 'squat'; // Default to squat if none

    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = React.useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('video/')) {
            setFile(droppedFile);
            uploadAndAnalyze(droppedFile);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('video/')) {
            setFile(selectedFile);
            uploadAndAnalyze(selectedFile);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const { user } = useAuth(); // Get user to save results

    const uploadAndAnalyze = async (videoFile) => {
        setAnalyzing(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', videoFile);
        formData.append('exercise_type', selectedExercise);

        try {
            const response = await fetch(`${API_URL}/api/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            setResult(data);

            // SAVE TO DATABASE
            if (user && data.analysis_data) {
                const { error: dbError } = await supabase.from('workouts').insert({
                    user_id: user.id,
                    exercise_type: selectedExercise,
                    reps: data.analysis_data.reps_count,
                    feedback: data.analysis_data.feedback
                });
                if (dbError) console.error("Auto-save failed:", dbError);
                else console.log("Workout saved!");
            }

        } catch (err) {
            console.error(err);
            setError("Failed to analyze video. Please try again.");
            setFile(null);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-black)', padding: '2rem' }}>
            <button
                onClick={() => navigate('/dashboard')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#888',
                    fontSize: '1rem',
                    marginBottom: '2rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
                    UPLOAD <span style={{ color: 'var(--color-neon-pink)' }}>{selectedExercise}</span>
                </h1>
                <p style={{ color: '#aaa', marginBottom: '3rem' }}>Get a detailed breakdown of your {selectedExercise} form.</p>

                {!file && !analyzing && !result && (
                    <motion.div
                        animate={{
                            borderColor: isDragging ? 'var(--color-neon-pink)' : '#333',
                            backgroundColor: isDragging ? 'rgba(255, 0, 153, 0.1)' : 'var(--color-dark-gray)'
                        }}
                        style={{
                            border: '2px dashed #333',
                            borderRadius: '2rem',
                            padding: '6rem 2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="video/*"
                            style={{ display: 'none' }}
                        />
                        <Upload size={64} color={isDragging ? 'var(--color-neon-pink)' : '#555'} style={{ marginBottom: '2rem' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Drag & Drop your video here</h3>
                        <p style={{ color: '#666' }}>or click to browse files</p>
                        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
                    </motion.div>
                )}

                {analyzing && (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            style={{
                                width: '64px',
                                height: '64px',
                                border: '4px solid #333',
                                borderTopColor: 'var(--color-neon-pink)',
                                borderRadius: '50%',
                                margin: '0 auto 2rem'
                            }}
                        />
                        <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Analyzing Form...</h3>
                        <p style={{ color: '#666' }}>This may take a minute based on video length</p>
                    </div>
                )}

                {result && (
                    <>
                        <style>{`
                    .analysis-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 3rem;
                        align-items: start;
                    }
                    .video-column {
                        position: static;
                        top: 2rem;
                        z-index: 10;
                    }
                    .stats-grid {
                         display: grid;
                         grid-template-columns: 1fr;
                         gap: 1.5rem;
                         auto-rows: minmax(180px, auto);
                    }
                    .button-grid {
                         display: grid;
                         grid-template-columns: 1fr;
                         gap: 1rem;
                    }
                    @media (min-width: 768px) {
                         .stats-grid {
                             grid-template-columns: 1fr 1fr;
                         }
                         .button-grid {
                             grid-template-columns: 1fr 1fr;
                         }
                    }
                    @media (min-width: 1024px) {
                        .analysis-grid {
                            grid-template-columns: 1fr 1fr;
                        }
                        .video-column {
                            position: sticky;
                        }
                    }
                `}</style>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            style={{
                                backgroundColor: '#0a0a0a',
                                borderRadius: '2.5rem',
                                padding: '3rem',
                                maxWidth: '100%',
                                width: '100%',
                                margin: '0 auto',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                border: '1px solid #222',
                                boxSizing: 'border-box'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '3rem', paddingLeft: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{
                                        width: '56px', height: '56px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(57, 255, 20, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid var(--color-neon-green)'
                                    }}>
                                        <CheckCircle size={32} color="var(--color-neon-green)" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>ANALYSIS COMPLETE</h3>
                                        <p style={{ color: '#666', margin: 0, fontSize: '1rem', marginTop: '0.3rem', fontWeight: '500' }}>{result.original_file}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="analysis-grid">
                                {/* LEFT COLUMN: Video Player */}
                                <div className="video-column">
                                    <div style={{
                                        backgroundColor: '#000',
                                        borderRadius: '1.5rem',
                                        overflow: 'hidden',
                                        marginBottom: '2rem',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                                        border: '1px solid #333',
                                        position: 'relative'
                                    }}>
                                        <video
                                            controls
                                            src={result.download_url}
                                            style={{ width: '100%', display: 'block' }}
                                        />
                                        <div style={{
                                            position: 'absolute', top: '1rem', left: '1rem',
                                            padding: '0.4rem 0.8rem', backgroundColor: 'rgba(0,0,0,0.7)',
                                            backdropFilter: 'blur(10px)', borderRadius: '0.5rem',
                                            color: '#fff', fontSize: '0.8rem', fontWeight: 'bold'
                                        }}>
                                            REPLAY
                                        </div>
                                    </div>

                                    <div className="button-grid">
                                        <motion.a
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            href={result.download_url}
                                            download
                                            style={{
                                                padding: '1.2rem',
                                                backgroundColor: '#111',
                                                color: '#fff',
                                                borderRadius: '1.2rem',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.8rem',
                                                border: '1px solid #333',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <FileVideo size={20} color="var(--color-neon-blue)" />
                                            <span>Download</span>
                                        </motion.a>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setFile(null);
                                                setResult(null);
                                            }}
                                            style={{
                                                padding: '1.2rem',
                                                background: 'linear-gradient(135deg, var(--color-neon-pink) 0%, #b3006b 100%)',
                                                color: '#fff',
                                                borderRadius: '1.2rem',
                                                fontWeight: '800',
                                                border: 'none',
                                                cursor: 'pointer',
                                                boxShadow: '0 10px 20px rgba(255, 0, 153, 0.3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}
                                        >
                                            New Scan
                                        </motion.button>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: Bento Grid Stats & Feedback */}
                                <div>
                                    {/* Analysis Feedback Section */}
                                    {result.analysis_data && (
                                        <div className="stats-grid">
                                            {/* Card 1: Primary Stat (Reps) */}
                                            <motion.div
                                                whileHover={{ y: -5 }}
                                                style={{
                                                    backgroundColor: '#111',
                                                    padding: '2rem',
                                                    borderRadius: '2rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    border: '1px solid #222',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(57,255,20,0.1) 0%, rgba(0,0,0,0) 70%)' }} />
                                                <h4 style={{ color: '#666', margin: 0, fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                    {selectedExercise === 'plank' ? 'HOLD TIME' : 'TOTAL REPS'}
                                                </h4>
                                                <div>
                                                    <span style={{ fontSize: '4rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
                                                        {selectedExercise === 'plank'
                                                            ? (result.analysis_data.hold_time ? parseFloat(result.analysis_data.hold_time).toFixed(1) : '0')
                                                            : result.analysis_data.reps_count}
                                                    </span>
                                                    {selectedExercise === 'plank' && <span style={{ fontSize: '1.5rem', color: '#666', marginLeft: '0.5rem' }}>s</span>}
                                                </div>
                                                <div style={{ height: '4px', width: '100%', backgroundColor: '#222', borderRadius: '2px', marginTop: '1rem' }}>
                                                    <div style={{ height: '100%', width: '100%', backgroundColor: 'var(--color-neon-green)', borderRadius: '2px' }} />
                                                </div>
                                            </motion.div>

                                            {/* Card 2: Secondary Stat (Depth/Angle) */}
                                            <motion.div
                                                whileHover={{ y: -5 }}
                                                style={{
                                                    backgroundColor: '#111',
                                                    padding: '2rem',
                                                    borderRadius: '2rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    border: '1px solid #222',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(0,204,255,0.1) 0%, rgba(0,0,0,0) 70%)' }} />
                                                <h4 style={{ color: '#666', margin: 0, fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                    {selectedExercise === 'pullup' || selectedExercise === 'shoulder_press' || selectedExercise === 'bicep_curl' ? 'AVG EXTENSION' :
                                                        selectedExercise === 'deadlift' ? 'HIP EXTENSION' :
                                                            selectedExercise === 'plank' ? 'AVG ALIGNMENT' :
                                                                'AVG DEPTH'}
                                                </h4>
                                                <div>
                                                    <span style={{
                                                        fontSize: '4rem',
                                                        fontWeight: '900',
                                                        lineHeight: 1,
                                                        color: (() => {
                                                            const val = result.analysis_data.avg_depth;
                                                            // Higher is Better
                                                            if (['pullup', 'deadlift', 'shoulder_press', 'bicep_curl'].includes(selectedExercise)) {
                                                                return val >= 150 ? 'var(--color-neon-blue)' : 'var(--color-neon-pink)';
                                                            }
                                                            // Plank
                                                            if (selectedExercise === 'plank') {
                                                                return (val >= 165 && val <= 195) ? 'var(--color-neon-blue)' : 'var(--color-neon-pink)';
                                                            }
                                                            // Lower is Better
                                                            if (['squat', 'pushup', 'benchpress', 'lunge'].includes(selectedExercise)) {
                                                                return val <= 100 ? 'var(--color-neon-blue)' : 'var(--color-neon-pink)';
                                                            }
                                                            return '#fff';
                                                        })()
                                                    }}>
                                                        {result.analysis_data.avg_depth}°
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-neon-blue)' }} />
                                                    <span style={{ color: '#888', fontSize: '0.8rem' }}>Biomechanics Score</span>
                                                </div>
                                            </motion.div>

                                            {/* Card 3: Coach Feedback (Full Width) */}
                                            <motion.div
                                                whileHover={{ y: -5 }}
                                                style={{
                                                    gridColumn: 'span 2',
                                                    backgroundColor: '#111',
                                                    padding: '2.5rem',
                                                    borderRadius: '2rem',
                                                    border: '1px solid #222',
                                                    position: 'relative'
                                                }}
                                            >
                                                <h4 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: '800' }}>
                                                    <span style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(0, 204, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-neon-blue)' }} />
                                                    </span>
                                                    COACH NOTES
                                                </h4>
                                                <div style={{ display: 'grid', gap: '1rem' }}>
                                                    {result.analysis_data.feedback.map((item, index) => (
                                                        <div key={index} style={{
                                                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                                            padding: '1.2rem 1.5rem',
                                                            borderRadius: '1rem',
                                                            borderLeft: '3px solid var(--color-neon-blue)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '1rem'
                                                        }}>
                                                            <p style={{ color: '#ddd', margin: 0, lineHeight: '1.6', fontSize: '1.05rem' }}>{item}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>

                                            {/* Card 4: Corrections (Full Width) */}
                                            {result.analysis_data.corrections.length > 0 && (
                                                <motion.div
                                                    whileHover={{ y: -5 }}
                                                    style={{
                                                        gridColumn: 'span 2',
                                                        backgroundColor: '#111',
                                                        padding: '2.5rem',
                                                        borderRadius: '2rem',
                                                        border: '1px solid #222'
                                                    }}
                                                >
                                                    <h4 style={{ color: 'var(--color-neon-pink)', marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: '800' }}>
                                                        <span style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(255, 0, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-neon-pink)' }} />
                                                        </span>
                                                        AREAS TO IMPROVE
                                                    </h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                                        {result.analysis_data.corrections.map((item, index) => (
                                                            <div key={index} style={{
                                                                backgroundColor: 'rgba(255, 0, 153, 0.05)',
                                                                padding: '1rem 1.5rem',
                                                                borderRadius: '1rem',
                                                                display: 'flex',
                                                                alignItems: 'start',
                                                                gap: '1rem'
                                                            }}>
                                                                <span style={{ color: 'var(--color-neon-pink)', fontSize: '1.2rem', marginTop: '-2px' }}>•</span>
                                                                <p style={{ color: '#ccc', margin: 0, lineHeight: '1.5' }}>{item}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VideoAnalysis;
