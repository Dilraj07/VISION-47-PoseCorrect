import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, CheckCircle, Video, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReactMediaRecorder } from "react-media-recorder";
import { API_URL } from '../lib/config';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

// Component to render the preview stream
const VideoPreview = ({ stream }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    if (!stream) {
        return <div style={{ color: '#666', marginTop: '2rem' }}>Waiting for camera permission...</div>;
    }

    return <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} autoPlay muted />;
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

    const { status, startRecording, stopRecording, mediaBlobUrl, previewStream } = useReactMediaRecorder({ video: true, audio: false });

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

    const { user } = useAuth(); // Get user to save results

    const uploadAndAnalyze = async (videoFile) => {
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
            if (user && !user.isDemo && data.analysis_data) {
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
            `}</style>

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
                            color: 'var(--color-neon-pink)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem',
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
                    <div className="report-container" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem' }}>
                                <h2 className="report-title" style={{ fontSize: '3rem', color: '#fff', fontFamily: "'Anton', sans-serif", textTransform: 'uppercase', margin: 0 }}>SESSION REPORT</h2>
                                <button
                                    onClick={handleRetry}
                                    className="analysis-button"
                                    style={{
                                        padding: '1rem 2rem', backgroundColor: 'transparent', color: 'var(--color-neon-green)',
                                        border: '1px solid var(--color-neon-green)', fontWeight: 'bold', cursor: 'pointer',
                                        fontFamily: "'Anton', sans-serif", textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.1rem'
                                    }}
                                >
                                    EVALUATE AGAIN
                                </button>
                            </div>

                            {error && (
                                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 0, 0, 0.1)', color: 'red', border: '1px solid red', marginBottom: '2rem' }}>
                                    {error}
                                </div>
                            )}

                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {/* Video Result Player */}
                                    {result.download_url && (
                                        <div style={{ backgroundColor: '#111', border: '1px solid #333', marginBottom: '3rem' }}>
                                            <video controls src={result.download_url} style={{ width: '100%', display: 'block' }} />
                                        </div>
                                    )}

                                    {/* Analysis Feedback Section */}
                                    {result.analysis_data && (
                                        <div>
                                            <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                                                <div className="stat-card" style={{ border: '1px solid #333', padding: '2rem', textAlign: 'center' }}>
                                                    <h4 style={{ color: '#888', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', letterSpacing: '1px' }}>TOTAL REPS</h4>
                                                    <p className="big-stat" style={{ fontSize: '5rem', fontWeight: 'bold', color: '#fff', fontFamily: "'Anton', sans-serif", margin: 0, lineHeight: 1 }}>{result.analysis_data.reps_count}</p>
                                                </div>
                                                {result.analysis_data.avg_depth > 0 && (
                                                    <div className="stat-card" style={{ border: '1px solid #333', padding: '2rem', textAlign: 'center' }}>
                                                        <h4 style={{ color: '#888', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', letterSpacing: '1px' }}>
                                                            {selectedExercise === 'pullup' ? 'AVG EXTENSION' : selectedExercise === 'deadlift' ? 'HIP EXTENSION' : 'AVG DEPTH'}
                                                        </h4>
                                                        <p className="big-stat" style={{
                                                            fontSize: '5rem', fontWeight: 'bold', fontFamily: "'Anton', sans-serif", margin: 0, lineHeight: 1,
                                                            color: result.analysis_data.avg_depth <= 135 ? 'var(--color-neon-green)' : 'var(--color-neon-pink)'
                                                        }}>
                                                            {result.analysis_data.avg_depth}°
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ marginBottom: '3rem' }}>
                                                <h4 style={{ color: 'var(--color-neon-green)', marginBottom: '1.5rem', fontSize: '1.5rem', fontFamily: "'Anton', sans-serif", textTransform: 'uppercase' }}>COACH FEEDBACK</h4>
                                                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                                    {result.analysis_data.feedback.map((item, index) => (
                                                        <div key={index} style={{ backgroundColor: '#111', padding: '1.5rem', borderLeft: '4px solid var(--color-neon-blue)' }}>
                                                            <p style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>"{item}"</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {result.analysis_data.corrections.length > 0 && (
                                                <div style={{ border: '1px solid var(--color-neon-pink)', padding: '2rem' }}>
                                                    <h4 style={{ color: 'var(--color-neon-pink)', marginBottom: '1.5rem', fontSize: '1.5rem', fontFamily: "'Anton', sans-serif", textTransform: 'uppercase' }}>CORRECTIONS NEEDED</h4>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                        {result.analysis_data.corrections.map((item, index) => (
                                                            <li key={index} style={{ marginBottom: '1rem', color: '#ccc', display: 'flex', gap: '1rem', fontSize: '1.1rem' }}>
                                                                <span style={{ color: 'var(--color-neon-pink)' }}>⚠</span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
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
                                <VideoPreview stream={previewStream} />
                                {step === 'recording' && <ScanLine />}
                                <CornerReticles />

                                {/* Overlay UI */}
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
                                    {step === 'countdown' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
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
