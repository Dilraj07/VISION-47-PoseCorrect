import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, CheckCircle, Video, Loader, User, AlertTriangle, PlayCircle, FileVideo, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReactMediaRecorder } from "react-media-recorder";
import { analyzeVideo } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// Component to render the preview stream
const VideoPreview = ({ stream, streamError }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    if (streamError) {
        return (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neon-pink)', padding: '2rem', textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'Anton, sans-serif', fontSize: '2.5rem' }}>HARDWARE REJECTED</h3>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', marginBottom: '1rem' }}>The browser or OS rejected the camera request.</p>
                <div style={{ backgroundColor: '#222', padding: '1rem', border: '1px solid #555', color: '#fff', fontFamily: 'monospace' }}>
                    ERROR: {streamError}
                </div>
                <p style={{ fontFamily: 'Outfit, sans-serif', marginTop: '2rem', color: '#aaa', maxWidth: '600px' }}>
                    <strong>Common Fixes:</strong><br/>
                    1. Check the URL bar for a strict "Blocked Camera" icon and allow it.<br/>
                    2. Check if another app (Zoom, OBS) is currently using the camera.<br/>
                    3. Unplug and replug your USB webcam.
                </p>
            </div>
        );
    }

    if (!stream) {
        if (!navigator.mediaDevices) {
            return (
                <div style={{ position: 'relative', width: '100%', height: '100%', color: 'var(--color-neon-pink)', marginTop: '2rem', textAlign: 'center', padding: '2rem' }}>
                    <h3 style={{ fontFamily: 'Anton, sans-serif', fontSize: '2rem' }}>CAMERA BLOCKED</h3>
                    <p style={{ fontFamily: 'Outfit, sans-serif' }}>Your browser is blocking the camera because this device is not on a secure connection.<br/><br/>You MUST use <strong>http://localhost:5173</strong> or an <strong>https://</strong> URL.</p>
                </div>
            );
        }
        return <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', marginTop: '2rem' }}>Waiting for camera permission...</div>;
    }

    return <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} autoPlay muted playsInline />;
};

// Pro Visual Components
const ScanLine = () => (
    <motion.div
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: '2px',
            backgroundColor: 'rgba(57, 255, 20, 0.5)',
            boxShadow: '0 0 10px rgba(57, 255, 20, 0.8)',
            zIndex: 10,
            pointerEvents: 'none'
        }}
    />
);

const CornerReticles = () => (
    <div style={{ position: 'absolute', inset: '2rem', pointerEvents: 'none', zIndex: 5 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '50px', height: '50px', borderTop: '4px solid var(--color-neon-green)', borderLeft: '4px solid var(--color-neon-green)' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50px', height: '50px', borderTop: '4px solid var(--color-neon-green)', borderRight: '4px solid var(--color-neon-green)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '50px', height: '50px', borderBottom: '4px solid var(--color-neon-green)', borderLeft: '4px solid var(--color-neon-green)' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '50px', height: '50px', borderBottom: '4px solid var(--color-neon-green)', borderRight: '4px solid var(--color-neon-green)' }} />
    </div>
);

const SilhouetteOverlay = ({ exercise }) => (
    <div style={{
        position: 'absolute', top: '15%', bottom: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 'min(50%, 400px)', border: '4px dashed rgba(255, 255, 255, 0.3)', borderRadius: '2rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        pointerEvents: 'none', zIndex: 6
    }}>
        <User size="40%" color="rgba(255, 255, 255, 0.3)" strokeWidth={1} style={{ marginBottom: '2rem' }} />
        <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: '0.5rem 1rem', borderRadius: '1rem',
            color: 'var(--color-neon-green)', fontFamily: "'Outfit', sans-serif", fontWeight: 'bold', letterSpacing: '1px'
        }}>
            ALIGN {exercise?.toUpperCase()} PROFILE
        </div>
    </div>
);

const RealTimeCoach = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedExercise = location.state?.selectedExercise || 'squat';

    // Steps: 'idle' -> 'countdown' -> 'recording' -> 'analyzing' -> 'result'
    const [step, setStep] = useState('countdown');
    const [countdown, setCountdown] = useState(5);
    const [recordTime, setRecordTime] = useState(60);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [streamError, setStreamError] = useState(null);
    const [notesExpanded, setNotesExpanded] = useState(true);

    // Secure context check
    const isSecureContext = window.isSecureContext || navigator.mediaDevices !== undefined;

    // Explicitly request camera permissions to bypass hook deadlock
    useEffect(() => {
        let activeStream = null;
        async function initCamera() {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                    setLocalStream(activeStream);
                } else {
                    setStreamError("navigator.mediaDevices is undefined");
                }
            } catch (err) {
                console.error("Camera access denied or unavailable:", err);
                setStreamError(err.name || err.message || "Unknown hardware error");
            }
        }
        initCamera();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ 
        video: true, 
        audio: false,
        customMediaStream: localStream 
    });

    // Countdown Logic
    useEffect(() => {
        if (step === 'countdown') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setStep('recording');
                        startRecording();
                        return 0; // Or reset for next time
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [step, startRecording]);

    // Recording Logic
    useEffect(() => {
        if (step === 'recording') {
            const timer = setInterval(() => {
                setRecordTime((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        stopRecording();
                        setStep('analyzing');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [step, stopRecording]);

    // Analysis Logic (Triggered when mediaBlobUrl is valid and we are in analyzing step)
    useEffect(() => {
        const analyzeVideo = async () => {
            if (step === 'analyzing' && mediaBlobUrl) {
                try {
                    // Convert blob URL to Blob/File
                    const blob = await fetch(mediaBlobUrl).then(r => r.blob());
                    const file = new File([blob], "recorded_video.webm", { type: "video/webm" });

                    await uploadAndAnalyze(file);
                } catch (err) {
                    console.error("Error processing video:", err);
                    setError("Failed to process recorded video.");
                    setStep('result'); // To show error
                }
            }
        };
        analyzeVideo();
    }, [step, mediaBlobUrl]);

    const { user, getToken } = useAuth(); // Get user token to pass to backend

    const uploadAndAnalyze = async (videoFile) => {
        setError(null);
        setResult(null);

        try {
            const data = await analyzeVideo(videoFile, selectedExercise, getToken);
            setResult(data);
            console.log("Analysis and auto-save complete");

        } catch (err) {
            console.error(err);
            setError("Failed to analyze video. Please try again.");
        } finally {
            setStep('result');
        }
    };

    const handleRetry = () => {
        setResult(null);
        setError(null);
        setCountdown(5);
        setRecordTime(60);
        setStep('countdown');
    };

    const handleManualStop = () => {
        stopRecording();
        setStep('analyzing');
    };

    
    const getFeedbackStatus = (text) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('good') || lowerText.includes('stable') || lowerText.includes('great') || lowerText.includes('upright')) {
            return { color: 'var(--color-neon-green)', icon: CheckCircle };
        }
        if (lowerText.includes('warning') || lowerText.includes('check') || lowerText.includes('improve')) {
            return { color: '#FFBF00', icon: AlertTriangle };
        }
        return { color: 'var(--color-neon-blue)', icon: Info };
    };

    const handleCancel = () => {
        setStep('idle');
        navigate('/dashboard');
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-black)', fontFamily: "'Outfit', sans-serif" }}>
            <style>{`
                .coach-header {
                    padding: 1rem !important;
                }
                .report-container {
                    padding: 1rem !important;
                }
                .report-title {
                    font-size: 2rem !important;
                }
                .report-grid {
                    grid-template-columns: 1fr !important;
                    gap: 1rem !important;
                }
                .stat-card {
                    padding: 1.5rem !important;
                }
                .big-stat {
                    font-size: 4rem !important;
                }
                .action-button {
                    padding: 1rem 1.5rem !important;
                    font-size: 1.2rem !important;
                }
                 .analysis-button {
                    padding: 1rem 1.5rem !important;
                    font-size: 1rem !important;
                }
                @media (min-width: 768px) {
                    .coach-header {
                        padding: 1rem 2rem !important;
                    }
                    .report-container {
                        padding: 2rem !important;
                    }
                    .report-title {
                        font-size: 3rem !important;
                    }
                    .report-grid {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 2rem !important;
                    }
                    .stat-card {
                        padding: 2rem !important;
                    }
                    .big-stat {
                        font-size: 5rem !important;
                    }
                     .action-button {
                        padding: 1.5rem 3rem !important;
                        font-size: 1.5rem !important;
                    }
                     .analysis-button {
                        padding: 1rem 2rem !important;
                        font-size: 1.1rem !important;
                    }
                }
            `}
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
                .shimmer-effect {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    animation: shimmer 2s infinite;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
</style>

            {/* Header */}
            <header className="coach-header" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff',
                        background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 'bold'
                    }}
                >
                    <ArrowLeft size={20} /> EXIT
                </button>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {step === 'recording' && (
                        <div style={{
                            color: 'var(--color-neon-pink)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative',
                            padding: '0.5rem 1rem', border: '1px solid var(--color-neon-pink)', backgroundColor: 'rgba(255, 0, 153, 0.1)'
                        }}>
                            <motion.div
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-neon-pink)' }}
                            />
                            REC
                        </div>
                    )}
                    <div style={{
                        color: 'var(--color-neon-green)', fontWeight: '900', fontSize: '1.2rem', fontFamily: "'Anton', sans-serif", letterSpacing: '1px', textTransform: 'uppercase'
                    }}>
                        {selectedExercise}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

                {/* Result View */}
                {step === 'result' ? (
                    <div className="report-container page-container" style={{ flex: 1, overflowY: 'auto' }}>
                        {error && (
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 0, 0, 0.1)', color: 'red', border: '1px solid red', marginBottom: '2rem' }}>
                                {error}
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
                `}
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
                .shimmer-effect {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    animation: shimmer 2s infinite;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
</style>
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
                                        <h3 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>SESSION REPORT</h3>
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
                                            onClick={handleRetry}
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
                                            Evaluate Again
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
                    </div>
                ) : (
                    /* Webcam Area */
                    <div style={{ flex: 1, position: 'relative', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                        {step === 'analyzing' ? (
                            <div style={{ textAlign: 'center' }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    style={{ width: '80px', height: '80px', border: '8px solid #333', borderTopColor: 'var(--color-neon-green)', borderRadius: '50%', margin: '0 auto 2rem' }}
                                />
                                <h3 style={{ fontSize: '3rem', color: '#fff', fontFamily: "'Anton', sans-serif", textTransform: 'uppercase', letterSpacing: '2px' }}>ANALYZING...</h3>
                            </div>
                        ) : (
                            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                <VideoPreview stream={localStream} streamError={streamError} />
                                {step === 'recording' && <ScanLine />}
                                {(step === 'countdown' || step === 'recording') && <SilhouetteOverlay exercise={selectedExercise} />}
                                <CornerReticles />

                                {/* Overlay UI */}
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
                                    {step === 'countdown' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', position: 'relative' }}>
                                            <motion.div
                                                key={countdown}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1.5, opacity: 1 }}
                                                exit={{ scale: 2, opacity: 0 }}
                                                transition={{ duration: 0.5 }}
                                                style={{
                                                    fontSize: 'min(25vw, 15rem)', lineHeight: 1, fontWeight: '900', color: 'transparent',
                                                    fontFamily: "'Anton', sans-serif", WebkitTextStroke: '4px var(--color-neon-pink)'
                                                }}
                                            >
                                                {countdown}
                                            </motion.div>
                                            <button
                                                onClick={handleCancel}
                                                style={{
                                                    padding: '1rem 3rem',
                                                    backgroundColor: 'black',
                                                    color: '#fff',
                                                    border: '1px solid #666',
                                                    fontSize: '1.2rem',
                                                    fontFamily: "'Outfit', sans-serif",
                                                    textTransform: 'uppercase',
                                                    cursor: 'pointer',
                                                    pointerEvents: 'auto'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                    {step === 'recording' && (
                                        <div style={{ position: 'absolute', bottom: '10%', width: '100%', textAlign: 'center' }}>
                                            <div style={{
                                                fontSize: 'min(15vw, 8rem)', fontWeight: '900', color: 'var(--color-neon-green)',
                                                fontFamily: "'Anton', sans-serif", lineHeight: 1, textShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                            }}>
                                                {recordTime}s
                                            </div>
                                            <div style={{ marginTop: '2rem', pointerEvents: 'auto' }}>
                                                <button
                                                    onClick={handleManualStop}
                                                    className="action-button"
                                                    style={{
                                                        padding: '1.5rem 3rem',
                                                        fontSize: '1.5rem',
                                                        backgroundColor: 'var(--color-neon-pink)',
                                                        color: '#fff',
                                                        border: '4px solid #fff',
                                                        fontFamily: "'Anton', sans-serif",
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        boxShadow: '0 8px 30px rgba(255, 0, 153, 0.5)'
                                                    }}
                                                >
                                                    <div style={{ width: '16px', height: '16px', backgroundColor: '#fff' }}></div>
                                                    STOP & ANALYZE
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RealTimeCoach;
