import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, FileVideo, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config';

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

    const uploadAndAnalyze = async (videoFile) => {
        setAnalyzing(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', videoFile);
        formData.append('exercise_type', selectedExercise);

        try {
            const response = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            setResult(data);
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

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ backgroundColor: 'var(--color-dark-gray)', borderRadius: '2rem', padding: '2rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <CheckCircle size={32} color="var(--color-neon-green)" />
                            <div>
                                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Analysis Complete</h3>
                                <p style={{ color: '#888' }}>{result.original_file}</p>
                            </div>
                        </div>

                        {/* Video Result Player */}
                        <div style={{ backgroundColor: '#000', borderRadius: '1rem', overflow: 'hidden', marginBottom: '2rem' }}>
                            <video
                                controls
                                src={result.download_url}
                                style={{ width: '100%', display: 'block' }}
                            />
                        </div>

                        {/* Analysis Feedback Section */}
                        {result.analysis_data && (
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    marginBottom: '2rem',
                                    flexWrap: 'wrap'
                                }}>
                                    <div style={{
                                        flex: 1,
                                        backgroundColor: '#222',
                                        padding: '1.5rem',
                                        borderRadius: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        <h4 style={{ color: '#888', marginBottom: '0.5rem' }}>TOTAL REPS</h4>
                                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
                                            {result.analysis_data.reps_count}
                                        </p>
                                    </div>
                                    {result.analysis_data.avg_depth > 0 && (
                                        <div style={{
                                            flex: 1,
                                            backgroundColor: '#222',
                                            padding: '1.5rem',
                                            borderRadius: '1rem',
                                            textAlign: 'center'
                                        }}>
                                            <h4 style={{ color: '#888', marginBottom: '0.5rem' }}>
                                                {selectedExercise === 'pullup' ? 'AVG EXTENSION' :
                                                    selectedExercise === 'deadlift' ? 'HIP EXTENSION' :
                                                        'AVG DEPTH'}
                                            </h4>
                                            <p style={{
                                                fontSize: '2.5rem',
                                                fontWeight: 'bold',
                                                // Dynamic Color Logic based on Exercise Biomechanics
                                                color: (() => {
                                                    const val = result.analysis_data.avg_depth;
                                                    // Higher is Better: Pullup (Extension), Deadlift (Lockout)
                                                    if (['pullup', 'deadlift'].includes(selectedExercise)) {
                                                        return val >= 160 ? 'var(--color-neon-green)' : 'var(--color-neon-pink)';
                                                    }
                                                    // Lower is Better: Squat (Knee flexion), Pushup (Elbow flexion), Bench
                                                    if (['squat', 'pushup', 'benchpress'].includes(selectedExercise)) {
                                                        // Wait, squat depth rating: < 80 is deep (good?), > 100 is shallow (bad)
                                                        // Pushup: < 80 is excellent, > 100 is shallow
                                                        return val <= 100 ? 'var(--color-neon-green)' : 'var(--color-neon-pink)';
                                                    }
                                                    return '#fff';
                                                })()
                                            }}>
                                                {result.analysis_data.avg_depth}°
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div style={{ backgroundColor: '#222', padding: '2rem', borderRadius: '1rem', marginBottom: '1rem' }}>
                                    <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.2rem' }}>COACH FEEDBACK</h4>
                                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                        {result.analysis_data.feedback.map((item, index) => (
                                            <div key={index} style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                padding: '1rem',
                                                borderRadius: '0.5rem',
                                                borderLeft: '4px solid var(--color-neon-blue)'
                                            }}>
                                                <p style={{ color: '#eee', margin: 0 }}>{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {result.analysis_data.corrections.length > 0 && (
                                    <div style={{ backgroundColor: '#222', padding: '2rem', borderRadius: '1rem' }}>
                                        <h4 style={{ color: 'var(--color-neon-green)', marginBottom: '1rem', fontSize: '1.2rem' }}>CORRECTIONS</h4>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {result.analysis_data.corrections.map((item, index) => (
                                                <li key={index} style={{
                                                    marginBottom: '1rem',
                                                    color: '#ccc',
                                                    display: 'flex',
                                                    gap: '1rem'
                                                }}>
                                                    <span style={{ color: 'var(--color-neon-green)' }}>•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a
                                href={result.download_url}
                                download
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    backgroundColor: 'var(--color-neon-green)',
                                    color: '#000',
                                    borderRadius: '1rem',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    textDecoration: 'none'
                                }}
                            >
                                Download Analyzed Video
                            </a>
                            <button
                                onClick={() => {
                                    setFile(null);
                                    setResult(null);
                                }}
                                style={{
                                    padding: '1rem 2rem',
                                    backgroundColor: '#333',
                                    color: '#fff',
                                    borderRadius: '1rem',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                New Scan
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default VideoAnalysis;
