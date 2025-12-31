import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};

export const AudioProvider = ({ children }) => {
    const contextRef = useRef(null);
    const audioBufferRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const gainNodeRef = useRef(null);
    const analyserRef = useRef(null);

    // Audio Playlist
    const SONGS = [
        '/pump-it-up.mp3',
        '/we-are-gymbro.mp3'
    ];

    const [currentSongIndex, setCurrentSongIndex] = useState(() => Math.floor(Math.random() * SONGS.length));
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.2);
    const [isLoading, setIsLoading] = useState(true);

    const currentUrl = SONGS[currentSongIndex];

    // Initialize setup & Load Song
    useEffect(() => {
        const initAudio = async () => {
            try {
                // Create context (singleton-ish check)
                if (!contextRef.current) {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    contextRef.current = new AudioCtx();

                    // Create analyser node
                    analyserRef.current = contextRef.current.createAnalyser();
                    analyserRef.current.fftSize = 256;

                    // Create gain node
                    gainNodeRef.current = contextRef.current.createGain();
                    gainNodeRef.current.gain.value = volume;

                    // Connect Analyser -> Gain -> Destination
                    analyserRef.current.connect(gainNodeRef.current);
                    gainNodeRef.current.connect(contextRef.current.destination);
                }

                if (currentUrl) {
                    setIsLoading(true);
                    // Stop previous if any
                    if (sourceNodeRef.current) {
                        sourceNodeRef.current.stop();
                        sourceNodeRef.current.disconnect();
                    }

                    // Fetch and decode new audio
                    const response = await fetch(currentUrl);
                    const arrayBuffer = await response.arrayBuffer();
                    const decodedBuffer = await contextRef.current.decodeAudioData(arrayBuffer);
                    audioBufferRef.current = decodedBuffer;

                    setIsLoading(false);

                    // If it was playing, auto-play next song
                    if (isPlaying) {
                        play();
                    }
                }
            } catch (error) {
                console.error("Error loading audio:", error);
                setIsLoading(false);
            }
        };

        initAudio();

        return () => {
            // Cleanup on unmount (rare for root provider)
        };
    }, [currentUrl]); // Re-run when song changes

    // Handle volume changes
    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const play = useCallback(async () => {
        if (!contextRef.current || !audioBufferRef.current) return;

        if (contextRef.current.state === 'suspended') {
            await contextRef.current.resume();
        }

        // If already playing source, don't double play overlaid
        // But if we just changed song, sourceNode might be stopped/null, so we check existence
        if (sourceNodeRef.current) return;

        try {
            const source = contextRef.current.createBufferSource();
            source.buffer = audioBufferRef.current;
            source.loop = true;
            source.connect(analyserRef.current);
            source.start(0);
            sourceNodeRef.current = source;
            setIsPlaying(true);
        } catch (e) {
            console.error("Play error:", e);
        }
    }, []);

    const stop = useCallback(() => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
            setIsPlaying(false);
        }
    }, []);

    const nextSong = useCallback(() => {
        // Stop current before switching
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        setCurrentSongIndex(prev => (prev + 1) % SONGS.length);
        // isPlaying state remains true, so useEffect will auto-play new track
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const value = {
        play,
        stop,
        nextSong,
        toggleMute,
        setVolume,
        isPlaying,
        isMuted,
        isLoading,
        analyser: analyserRef.current
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};
