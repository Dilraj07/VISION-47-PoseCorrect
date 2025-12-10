
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, CheckCircle, Video, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReactMediaRecorder } from "react-media-recorder";
import { API_URL } from '../config';
import { supabase } from '../supabaseClient';
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
            const response = await fetch(`${API_URL}/analyze`, {
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
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-black)' }}>
            {/* Header */}
            <header style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
                <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={20} /> Exit Session
                </button>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {step === 'recording' && (
                        <span style={{ color: 'var(--color-neon-pink)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--color-neon-pink)', borderRadius: '2rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-neon-pink)', boxShadow: '0 0 10px var(--color-neon-pink)' }}></div>
                            RECORDING
                        </span>
                    )}
                    <span style={{ color: 'var(--color-neon-green)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        LIVE COACH: {selectedExercise.toUpperCase()}
                    </span>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Result View */}
                {step === 'result' ? (
                    <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '2rem', color: '#fff' }}>Analysis Results</h2>
                                <button onClick={handleRetry} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-neon-blue)', color: '#000', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                                    Evaluate Again
                                </button>
                            </div>

                            {error && (
                                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 0, 0, 0.1)', color: 'red', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                                    {error}
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
                                            <p style={{ color: '#888' }}>Recorded Session</p>
                                        </div>
                                    </div>

                                    {/* Video Result Player */}
                                    {result.download_url && (
                                        <div style={{ backgroundColor: '#000', borderRadius: '1rem', overflow: 'hidden', marginBottom: '2rem' }}>
                                            <video controls src={result.download_url} style={{ width: '100%', display: 'block' }} />
                                        </div>
                                    )}

                                    {/* Analysis Feedback Section - Reused Logic */}
                                    {result.analysis_data && (
                                        <div style={{ marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                                                <div style={{ flex: 1, backgroundColor: '#222', padding: '1.5rem', borderRadius: '1rem', textAlign: 'center' }}>
                                                    <h4 style={{ color: '#888', marginBottom: '0.5rem' }}>TOTAL REPS</h4>
                                                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{result.analysis_data.reps_count}</p>
                                                </div>
                                                {result.analysis_data.avg_depth > 0 && (
                                                    <div style={{ flex: 1, backgroundColor: '#222', padding: '1.5rem', borderRadius: '1rem', textAlign: 'center' }}>
                                                        <h4 style={{ color: '#888', marginBottom: '0.5rem' }}>
                                                            {selectedExercise === 'pullup' ? 'AVG EXTENSION' : selectedExercise === 'deadlift' ? 'HIP EXTENSION' : 'AVG DEPTH'}
                                                        </h4>
                                                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: result.analysis_data.avg_depth <= 135 ? 'var(--color-neon-green)' : 'var(--color-neon-pink)' }}>
                                                            {result.analysis_data.avg_depth}°
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ backgroundColor: '#222', padding: '2rem', borderRadius: '1rem', marginBottom: '1rem' }}>
                                                <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.2rem' }}>COACH FEEDBACK</h4>
                                                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                                    {result.analysis_data.feedback.map((item, index) => (
                                                        <div key={index} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid var(--color-neon-blue)' }}>
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
                                                            <li key={index} style={{ marginBottom: '1rem', color: '#ccc', display: 'flex', gap: '1rem' }}>
                                                                <span style={{ color: 'var(--color-neon-green)' }}>•</span>
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
                                    style={{ width: '64px', height: '64px', border: '4px solid #333', borderTopColor: 'var(--color-neon-pink)', borderRadius: '50%', margin: '0 auto 2rem' }}
                                />
                                <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Analyzing Performance...</h3>
                            </div>
                        ) : (
                            // Use VideoPreview component for stream
                            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                <VideoPreview stream={previewStream} />

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
                                                style={{ fontSize: '10rem', fontWeight: 'bold', color: 'var(--color-neon-pink)', textShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                                            >
                                                {countdown}
                                            </motion.div>
                                            <button
                                                onClick={handleCancel}
                                                style={{
                                                    padding: '0.75rem 2rem',
                                                    backgroundColor: 'rgba(50, 50, 50, 0.8)',
                                                    color: '#fff',
                                                    border: '1px solid #666',
                                                    borderRadius: '2rem',
                                                    cursor: 'pointer',
                                                    backdropFilter: 'blur(5px)',
                                                    pointerEvents: 'auto'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                    {step === 'recording' && (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '2rem', color: '#fff', marginBottom: '1rem', backgroundColor: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '1rem' }}>
                                                Performing {selectedExercise}
                                            </div>
                                            <div style={{ fontSize: '5rem', fontWeight: 'bold', color: 'var(--color-neon-green)', textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                                                {recordTime}s
                                            </div>
                                            <button
                                                onClick={handleManualStop}
                                                style={{
                                                    marginTop: '2rem',
                                                    padding: '1rem 3rem',
                                                    fontSize: '1.2rem',
                                                    backgroundColor: 'var(--color-neon-pink)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '3rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 0 20px rgba(255, 0, 153, 0.5)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    pointerEvents: 'auto'
                                                }}
                                            >
                                                <div style={{ width: '12px', height: '12px', backgroundColor: '#fff', borderRadius: '2px' }}></div>
                                                STOP & ANALYZE
                                            </button>
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
