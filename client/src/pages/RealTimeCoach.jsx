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
                .coach-header { padding: 1rem !important; }
                .report-container { padding: 1rem !important; }
                .report-title { font-size: 2rem !important; }
                .report-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
                .stat-card { padding: 1.5rem !important; }
                .big-stat { font-size: 4rem !important; }
                .action-button { padding: 1rem 1.5rem !important; font-size: 1.2rem !important; }
                .analysis-button { padding: 1rem 1.5rem !important; font-size: 1rem !important; }
                
                @media (min-width: 768px) {
                    .coach-header { padding: 1rem 2rem !important; }
                    .report-container { padding: 2rem !important; }
                    .report-title { font-size: 3rem !important; }
                    .report-grid { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; }
                    .stat-card { padding: 2rem !important; }
                    .big-stat { font-size: 5rem !important; }
                    .action-button { padding: 1.5rem 3rem !important; font-size: 1.5rem !important; }
                    .analysis-button { padding: 1rem 2rem !important; font-size: 1.1rem !important; }
                }

                /* Layout Utilities */
                .analysis-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: start; }
                .stats-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; auto-rows: minmax(160px, auto); }
                .button-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
                
                @media (min-width: 768px) {
                    .stats-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
                    .button-grid { grid-template-columns: 1fr 1fr; }
                    .coach-card, .improve-card { grid-column: span 2 !important; }
                }

                @media (min-width: 1024px) {
                    .analysis-grid { grid-template-columns: 0.9fr 1.1fr; }
                    .video-column { position: sticky; top: 2rem; }
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
                .shimmer-effect {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    animation: shimmer 2s infinite;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>

            {/* Header */}
            <header className="coach-header" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
                <button
                    aria-label="Exit to Dashboard"
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

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
                {step === 'result' ? (
                    <div className="report-container page-container" style={{ flex: 1, overflowY: 'auto' }}>
                        {error && (
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 0, 0, 0.1)', color: 'red', border: '1px solid red', marginBottom: '2rem' }}>
                                {error}
                            </div>
                        )}
                        
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="main-card glass-panel"
                                style={{
                                    borderRadius: '2.5rem',
                                    maxWidth: '1200px',
                                    width: '100%',
                                    margin: '2rem auto',
                                    padding: '2rem'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '3rem' }}>
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: '16px',
                                        backgroundColor: 'rgba(57, 255, 20, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid rgba(57, 255, 20, 0.3)'
                                    }}>
                                        <CheckCircle size={28} color="var(--color-neon-green)" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '800', margin: 0 }}>SESSION REPORT</h3>
                                        <p style={{ color: '#888', margin: 0, fontSize: '0.95rem' }}>Analysis Complete</p>
                                    </div>
                                </div>

                                <div className="analysis-grid">
                                    <div className="video-column">
                                        <div style={{ borderRadius: '2rem', overflow: 'hidden', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', backgroundColor: '#000' }}>
                                            <video controls src={result.download_url} style={{ width: '100%', display: 'block' }} />
                                        </div>
                                        <div className="button-grid">
                                            <motion.a
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                href={result.download_url}
                                                download
                                                style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.03)', color: '#fff', borderRadius: '1.25rem', fontWeight: '600', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}
                                            >
                                                <FileVideo size={20} color="var(--color-neon-blue)" /> Download
                                            </motion.a>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleRetry}
                                                style={{ padding: '1.25rem', background: 'linear-gradient(135deg, var(--color-neon-pink) 0%, #b3006b 100%)', color: '#fff', borderRadius: '1.25rem', fontWeight: '700', border: 'none', cursor: 'pointer' }}
                                            >
                                                Evaluate Again
                                            </motion.button>
                                        </div>
                                    </div>

                                    <div className="stats-section">
                                        {result.analysis_data && (
                                            <div className="stats-grid">
                                                <div className="glass-card" style={{ padding: '2rem', borderRadius: '2rem' }}>
                                                    <h4 style={{ color: '#888', margin: 0, fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                                        {selectedExercise === 'plank' ? 'HOLD TIME' : 'TOTAL REPS'}
                                                    </h4>
                                                    <span style={{ fontSize: '5rem', fontWeight: '800', color: '#fff' }}>
                                                        {selectedExercise === 'plank' ? result.analysis_data.hold_time : result.analysis_data.reps_count}
                                                    </span>
                                                </div>

                                                <div className="glass-card" style={{ padding: '2rem', borderRadius: '2rem' }}>
                                                    <h4 style={{ color: '#888', margin: 0, fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase' }}>BIOMECHANICS</h4>
                                                    <span style={{ fontSize: '5rem', fontWeight: '800', color: 'var(--color-neon-blue)' }}>
                                                        {result.analysis_data.avg_depth}°
                                                    </span>
                                                </div>

                                                <div className="coach-card glass-card" style={{ padding: '2rem', borderRadius: '2rem' }}>
                                                    <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Activity size={20} color="var(--color-neon-blue)" /> COACH NOTES
                                                    </h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                        {result.analysis_data.feedback.map((item, idx) => (
                                                            <div key={idx} style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <span style={{ color: '#fff' }}>{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {result.analysis_data.corrections.length > 0 && (
                                                    <div className="improve-card glass-card" style={{ padding: '2rem', borderRadius: '2rem', border: '1px solid rgba(255, 191, 0, 0.2)' }}>
                                                        <h4 style={{ color: '#FFBF00', fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <AlertTriangle size={20} /> IMPROVEMENTS
                                                        </h4>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                            {result.analysis_data.corrections.map((item, idx) => (
                                                                <div key={idx} style={{ padding: '1rem', backgroundColor: 'rgba(255,191,0,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,191,0,0.1)' }}>
                                                                    <span style={{ color: '#eee' }}>{item}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <div style={{ flex: 1, position: 'relative', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                        {step === 'analyzing' ? (
                            <div style={{ textAlign: 'center' }}>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: '80px', height: '80px', border: '8px solid #333', borderTopColor: 'var(--color-neon-green)', borderRadius: '50%', margin: '0 auto 2rem' }} />
                                <h3 style={{ fontSize: '3rem', color: '#fff', fontFamily: "'Anton', sans-serif", textTransform: 'uppercase' }}>ANALYZING...</h3>
                            </div>
                        ) : (
                            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                <VideoPreview stream={localStream} streamError={streamError} />
                                {step === 'recording' && <ScanLine />}
                                {(step === 'countdown' || step === 'recording') && <SilhouetteOverlay exercise={selectedExercise} />}
                                <CornerReticles />

                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
                                    {step === 'countdown' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', position: 'relative' }}>
                                            <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} transition={{ duration: 0.5 }} style={{ fontSize: '15rem', fontWeight: '900', color: 'transparent', fontFamily: "'Anton', sans-serif", WebkitTextStroke: '4px var(--color-neon-pink)' }}>
                                                {countdown}
                                            </motion.div>
                                            <button onClick={handleCancel} style={{ padding: '1rem 3rem', backgroundColor: 'black', color: '#fff', border: '1px solid #666', fontSize: '1.2rem', cursor: 'pointer', pointerEvents: 'auto' }}>Cancel</button>
                                        </div>
                                    )}

                                    {step === 'recording' && (
                                        <div style={{ position: 'absolute', bottom: '10%', width: '100%', textAlign: 'center' }}>
                                            <div style={{ fontSize: '8rem', fontWeight: '900', color: 'var(--color-neon-green)', fontFamily: "'Anton', sans-serif" }}>{recordTime}s</div>
                                            <div style={{ marginTop: '2rem', pointerEvents: 'auto' }}>
                                                <button aria-label="STOP & ANALYZE recording" onClick={handleManualStop} className="action-button" style={{ padding: '1.5rem 3rem', backgroundColor: 'var(--color-neon-pink)', color: '#fff', border: '4px solid #fff', fontFamily: "'Anton', sans-serif", textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '1rem', boxShadow: '0 8px 30px rgba(255, 0, 153, 0.5)' }}>
                                                    <div style={{ width: '16px', height: '16px', backgroundColor: '#fff' }}></div> STOP & ANALYZE
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
