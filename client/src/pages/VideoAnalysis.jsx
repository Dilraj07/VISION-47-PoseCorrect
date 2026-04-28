import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, FileVideo, CheckCircle, Dumbbell, Activity, Utensils, Trophy, AlertTriangle, PlayCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { analyzeVideo } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const LOADING_ICONS = [Dumbbell, Activity, Utensils, Trophy];

const VideoAnalysis = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedExercise = location.state?.selectedExercise || 'squat'; // Default to squat if none

    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [loadingIconIndex, setLoadingIconIndex] = useState(0);

    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [notesExpanded, setNotesExpanded] = useState(true);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        let interval;
        if (analyzing) {
            interval = setInterval(() => {
                setLoadingIconIndex((prev) => (prev + 1) % LOADING_ICONS.length);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [analyzing]);

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

    const { user, getToken } = useAuth(); // Get user token to pass to backend

    const uploadAndAnalyze = async (videoFile) => {
        setAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const data = await analyzeVideo(videoFile, selectedExercise, getToken);
            setResult(data);
            console.log("Analysis and auto-save complete");

        } catch (err) {
            console.error(err);
            setError("Failed to analyze video. Please try again.");
            setFile(null);
        } finally {
            setAnalyzing(false);
        }
    };

    // Helper to determine status color/icon for feedback
    const getFeedbackStatus = (text) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('good') || lowerText.includes('stable') || lowerText.includes('great') || lowerText.includes('upright')) {
            return { color: 'var(--color-neon-green)', icon: CheckCircle };
        }
        if (lowerText.includes('warning') || lowerText.includes('check') || lowerText.includes('improve')) {
            return { color: '#FFBF00', icon: AlertTriangle }; // Amber
        }
        return { color: 'var(--color-neon-blue)', icon: Info };
    };

    return (
        <div className="page-container" style={{ minHeight: '100vh', backgroundColor: 'var(--color-black)', fontFamily: 'var(--font-primary)' }}>
            <style>{`
                .page-container {
                    padding: 2rem;
                }
                .page-title {
                    font-size: 1.5rem;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.02em;
                }
                .page-subtitle {
                    color: #aaa;
                    margin-bottom: 2rem;
                    font-size: 0.9rem;
                }
                .back-button {
                    margin-bottom: 1.5rem;
                }
                .upload-area {
                    padding: 3rem 1.5rem !important;
                }
                
                /* Glassmorphism Utilities */
                .glass-panel {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
                }
                
                .glass-card {
                     background: rgba(20, 20, 23, 0.6);
                     backdrop-filter: blur(12px);
                     border: 1px solid rgba(255, 255, 255, 0.08);
                     box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
                     transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .glass-card:hover {
                    transform: scale(1.01);
                    box-shadow: 0 0 30px rgba(0, 240, 255, 0.1);
                    border-color: rgba(0, 240, 255, 0.2);
                }
                
                /* Animations */
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .shimmer-effect {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    animation: shimmer 2s infinite;
                }

                @media (min-width: 768px) {
                    .page-container {
                        padding: 4rem 8rem;
                    }
                    .page-title {
                        font-size: 2.2rem;
                        margin-bottom: 1rem;
                    }
                    .page-subtitle {
                        margin-bottom: 3rem;
                        font-size: 1rem;
                    }
                    .back-button {
                        margin-bottom: 2rem;
                    }
                    .upload-area {
                        padding: 6rem 2rem !important;
                    }
                }
            `}</style>
            <button
                onClick={() => navigate('/')}
                className="back-button"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#888',
                    fontSize: '1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                }}
            >
                <ArrowLeft size={20} /> Back to Home
            </button>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 className="page-title">
                    UPLOAD <span style={{ color: 'var(--color-neon-pink)' }}>{selectedExercise}</span>
                </h1>
                <p className="page-subtitle">Get a detailed breakdown of your {selectedExercise} form.</p>

                {!file && !analyzing && !result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            borderColor: isDragging ? 'var(--color-neon-pink)' : '#333',
                            backgroundColor: isDragging ? 'rgba(255, 0, 153, 0.1)' : 'rgba(20, 20, 23, 0.4)'
                        }}
                        className="upload-area glass-panel"
                        style={{
                            borderStyle: 'dashed',
                            borderWidth: '2px',
                            borderRadius: '2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                    >
                        <input
                            type="file"
                            aria-label="Upload video file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="video/*"
                            style={{ display: 'none' }}
                        />
                        <div style={{
                            width: '96px', height: '96px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '2rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <Upload size={40} color={isDragging ? 'var(--color-neon-pink)' : '#bbb'} />
                        </div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#fff', fontWeight: '600' }}>Drag & Drop your video here</h3>
                        <p style={{ color: '#888', fontSize: '1.1rem' }}>or click to browse files</p>
                        {error && <p style={{ color: '#ff4444', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={16} /> {error}</p>}
                    </motion.div>
                )}

                {analyzing && (
                    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                        <div style={{ height: '80px', width: '80px', position: 'relative', margin: '0 auto 2.5rem' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={loadingIconIndex}
                                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
                                    transition={{ duration: 0.4, ease: "backOut" }}
                                >
                                    {React.createElement(LOADING_ICONS[loadingIconIndex], {
                                        size: 64,
                                        color: 'var(--color-neon-green)'
                                    })}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem', fontWeight: '700' }}>Analyzing Form...</h3>
                        <p style={{ color: '#666', fontSize: '1rem' }}>This may take a minute based on video length</p>
                    </div>
                )}

                {result && (
                    <>
                        <style>{`
                    .analysis-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 2rem;
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
                         auto-rows: minmax(160px, auto);
                    }
                    .button-grid {
                         display: grid;
                         grid-template-columns: 1fr;
                         gap: 1rem;
                    }
                    .main-card {
                        padding: 2rem !important;
                    }
                    .coach-card, .improve-card {
                        grid-column: span 1 !important;
                        padding: 2rem !important;
                    }
                    
                    @media (min-width: 768px) {
                         .stats-grid {
                             grid-template-columns: 1fr 1fr;
                             gap: 2rem;
                         }
                         .button-grid {
                             grid-template-columns: 1fr 1fr;
                         }
                         .main-card {
                            padding: 4rem !important;
                        }
                         .coach-card, .improve-card {
                            grid-column: span 2 !important;
                         }
                         .analysis-grid {
                             gap: 4rem;
                         }
                    }
                    @media (min-width: 1024px) {
                        .analysis-grid {
                            grid-template-columns: 0.9fr 1.1fr;
                        }
                        .video-column {
                            position: sticky;
                        }
                    }
                `}</style>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="main-card glass-panel"
                            style={{
                                borderRadius: '2.5rem',
                                maxWidth: '100%',
                                width: '100%',
                                margin: '0 auto',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', paddingLeft: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{
                                        width: '56px', height: '56px',
                                        borderRadius: '16px',
                                        backgroundColor: 'rgba(57, 255, 20, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid rgba(57, 255, 20, 0.3)',
                                        boxShadow: '0 0 20px rgba(57, 255, 20, 0.1)'
                                    }}>
                                        <CheckCircle size={28} color="var(--color-neon-green)" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>ANALYSIS COMPLETE</h3>
                                        <p style={{ color: '#888', margin: 0, fontSize: '0.95rem', marginTop: '0.2rem', fontWeight: '500' }}>{result.original_file}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="analysis-grid">
                                {/* LEFT COLUMN: Video Player */}
                                <div className="video-column">
                                    <div style={{
                                        borderRadius: '2rem',
                                        overflow: 'hidden',
                                        marginBottom: '2rem',
                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        position: 'relative',
                                        backgroundColor: '#000'
                                    }}>
                                        <video
                                            controls
                                            src={result.download_url}
                                            style={{ width: '100%', display: 'block' }}
                                        />
                                        <div style={{
                                            position: 'absolute', top: '1.5rem', left: '1.5rem',
                                            padding: '0.5rem 1rem', backgroundColor: 'rgba(0,0,0,0.6)',
                                            backdropFilter: 'blur(12px)', borderRadius: '100px',
                                            color: '#fff', fontSize: '0.85rem', fontWeight: '600',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <PlayCircle size={14} fill="#fff" stroke="none" /> REPLAY ANALYSIS
                                        </div>
                                    </div>

                                    <div className="button-grid">
                                        <motion.a
                                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                            whileTap={{ scale: 0.98 }}
                                            href={result.download_url}
                                            download
                                            style={{
                                                padding: '1.25rem',
                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                borderRadius: '1.25rem',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.6rem',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                transition: 'all 0.2s',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            <FileVideo size={20} color="var(--color-neon-blue)" />
                                            <span>Download</span>
                                        </motion.a>
                                        <motion.button
                                            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255, 0, 153, 0.4)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setFile(null);
                                                setResult(null);
                                            }}
                                            style={{
                                                padding: '1.25rem',
                                                background: 'linear-gradient(135deg, var(--color-neon-pink) 0%, #b3006b 100%)',
                                                color: '#fff',
                                                borderRadius: '1.25rem',
                                                fontWeight: '700',
                                                border: 'none',
                                                cursor: 'pointer',
                                                boxShadow: '0 10px 20px -5px rgba(255, 0, 153, 0.3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                fontSize: '1rem'
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
                                                className="glass-card"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 }}
                                                style={{
                                                    padding: '2rem',
                                                    borderRadius: '2rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <h4 style={{ color: '#888', margin: 0, fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                                    {selectedExercise === 'plank' ? 'HOLD TIME' : 'TOTAL REPS'}
                                                </h4>
                                                <div>
                                                    <span style={{
                                                        fontSize: '5rem', // Larger size
                                                        fontWeight: '800',
                                                        color: '#fff',
                                                        lineHeight: 1,
                                                        letterSpacing: '-0.04em',
                                                        textShadow: '0 0 40px rgba(255,255,255,0.1)'
                                                    }}>
                                                        {selectedExercise === 'plank'
                                                            ? (result.analysis_data.hold_time ? parseFloat(result.analysis_data.hold_time).toFixed(1) : '0')
                                                            : result.analysis_data.reps_count}
                                                    </span>
                                                    {selectedExercise === 'plank' && <span style={{ fontSize: '1.5rem', color: '#666', marginLeft: '0.5rem', fontWeight: '600' }}>s</span>}
                                                </div>
                                                <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '100px', marginTop: '0.5rem', overflow: 'hidden', position: 'relative' }}>
                                                    <div style={{ height: '100%', width: '100%', backgroundColor: 'var(--color-neon-green)', borderRadius: '100px' }} />
                                                    <div className="shimmer-effect"></div>
                                                </div>
                                            </motion.div>

                                            {/* Card 2: Secondary Stat (Depth/Angle) */}
                                            <motion.div
                                                className="glass-card"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                                style={{
                                                    padding: '2rem',
                                                    borderRadius: '2rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <h4 style={{ color: '#888', margin: 0, fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                                    {selectedExercise === 'pullup' || selectedExercise === 'shoulder_press' || selectedExercise === 'bicep_curl' ? 'AVG EXTENSION' :
                                                        selectedExercise === 'deadlift' ? 'HIP EXTENSION' :
                                                            selectedExercise === 'plank' ? 'AVG ALIGNMENT' :
                                                                'AVG DEPTH'}
                                                </h4>
                                                <div>
                                                    <span style={{
                                                        fontSize: '5rem',
                                                        fontWeight: '800',
                                                        lineHeight: 1,
                                                        letterSpacing: '-0.04em',
                                                        textShadow: '0 0 40px rgba(0, 240, 255, 0.15)',
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-neon-blue)', boxShadow: '0 0 10px var(--color-neon-blue)' }} />
                                                    <span style={{ color: '#aaa', fontSize: '0.85rem', fontWeight: '500' }}>Biomechanics Score</span>
                                                </div>
                                            </motion.div>

                                            {/* Card 3: Coach Feedback (Full Width, Expandable) */}
                                            <motion.div
                                                className="coach-card glass-card"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                style={{
                                                    borderRadius: '2rem',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                    <div
                                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', cursor: 'pointer' }}
                                                        onClick={() => setNotesExpanded(!notesExpanded)}
                                                    >
                                                        <h4 style={{ color: '#fff', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '800', margin: 0 }}>
                                                            <span style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(0, 204, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 204, 255, 0.2)' }}>
                                                                <Activity size={20} color="var(--color-neon-blue)" />
                                                            </span>
                                                            COACH NOTES
                                                        </h4>
                                                        <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                                                            {notesExpanded ? <ChevronUp size={20} color="#888" /> : <ChevronDown size={20} color="#888" />}
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {notesExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}
                                                            >
                                                                {result.analysis_data.feedback.map((item, index) => {
                                                                    const parts = item.split(":");
                                                                    const label = parts[0];
                                                                    const value = parts[1] || "";
                                                                    const status = getFeedbackStatus(item);
                                                                    const StatusIcon = status.icon;

                                                                    return (
                                                                        <div key={index} style={{
                                                                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                                                            padding: '1rem 1.25rem',
                                                                            borderRadius: '1rem',
                                                                            border: '1px solid rgba(255,255,255,0.05)',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between'
                                                                        }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                                {/* Status Indicator Ring */}
                                                                                <div style={{
                                                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                                                    border: `2px solid ${status.color}`,
                                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                    boxShadow: `0 0 10px ${status.color}40`
                                                                                }}>
                                                                                    <StatusIcon size={16} color={status.color} />
                                                                                </div>
                                                                                <div>
                                                                                    <span style={{ color: '#888', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem', fontWeight: '600', textTransform: 'uppercase' }}>{label}</span>
                                                                                    <span style={{ color: '#fff', fontSize: '1rem', fontWeight: '700' }}>{value.replace(/\(.*\)/g, '').trim()}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>

                                            {/* Card 4: Corrections (Full Width, Amber Theme) */}
                                            {result.analysis_data.corrections.length > 0 && (
                                                <motion.div
                                                    className="improve-card glass-card"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.4 }}
                                                    style={{
                                                        borderRadius: '2rem',
                                                        border: '1px solid rgba(255, 191, 0, 0.2)', // Amber border
                                                        backgroundColor: 'rgba(255, 191, 0, 0.03)' // Subtle Amber tint
                                                    }}
                                                >
                                                    <h4 style={{ color: '#FFBF00', marginBottom: '1.5rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '800' }}>
                                                        <span style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(255, 191, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 191, 0, 0.2)' }}>
                                                            <AlertTriangle size={20} color="#FFBF00" />
                                                        </span>
                                                        PRIORITY IMPROVEMENTS
                                                    </h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                                        {result.analysis_data.corrections.map((item, index) => (
                                                            <div key={index} style={{
                                                                backgroundColor: 'rgba(20, 20, 20, 0.6)',
                                                                padding: '1.25rem',
                                                                borderRadius: '1.2rem',
                                                                display: 'flex',
                                                                alignItems: 'start',
                                                                gap: '1rem',
                                                                border: '1px solid rgba(255, 191, 0, 0.1)'
                                                            }}>
                                                                <span style={{
                                                                    color: '#000',
                                                                    backgroundColor: '#FFBF00',
                                                                    fontSize: '0.8rem', fontWeight: 'bold',
                                                                    width: '24px', height: '24px', borderRadius: '50%',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    marginTop: '2px', flexShrink: 0
                                                                }}>{index + 1}</span>
                                                                <div>
                                                                    <p style={{ color: '#eee', margin: 0, lineHeight: '1.5', fontWeight: '500', fontSize: '1.05rem' }}>{item}</p>
                                                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem' }}>
                                                                        <button style={{
                                                                            background: 'none', border: '1px solid #444',
                                                                            color: '#aaa', padding: '0.4rem 0.8rem', borderRadius: '0.5rem',
                                                                            fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600'
                                                                        }}>
                                                                            View Tutorial
                                                                        </button>
                                                                    </div>
                                                                </div>
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
        </div >
    );
};

export default VideoAnalysis;
