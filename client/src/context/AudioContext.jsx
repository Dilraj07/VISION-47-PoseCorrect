import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};

export const AudioProvider = ({ children, url }) => {
    const contextRef = useRef(null);
    const audioBufferRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const gainNodeRef = useRef(null);
    const analyserRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.2);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize setup
    useEffect(() => {
        const initAudio = async () => {
            try {
                // Create context
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                contextRef.current = new AudioCtx();

                // Create analyser node
                analyserRef.current = contextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256; // Smaller FFT size for bass detection focus

                // Create gain node for volume control
                gainNodeRef.current = contextRef.current.createGain();
                gainNodeRef.current.gain.value = volume;

                // Connect Logic: Source -> Analyser -> Gain -> Destination
                // Source is connected later when playing
                // Check connect order: Analyser -> Gain -> Destination
                analyserRef.current.connect(gainNodeRef.current);
                gainNodeRef.current.connect(contextRef.current.destination);

                if (url) {
                    // Fetch and decode audio
                    const response = await fetch(url);
                    const arrayBuffer = await response.arrayBuffer();
                    const decodedBuffer = await contextRef.current.decodeAudioData(arrayBuffer);
                    audioBufferRef.current = decodedBuffer;
                }
                setIsLoading(false);
            } catch (error) {
                console.error("Error loading audio:", error);
                setIsLoading(false);
            }
        };

        initAudio();

        return () => {
            if (contextRef.current) {
                contextRef.current.close();
            }
        };
    }, [url]);

    // Handle volume changes
    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const play = useCallback(async () => {
        if (!contextRef.current || !audioBufferRef.current) return;

        // Resume context if suspended (browser autoplay policy)
        if (contextRef.current.state === 'suspended') {
            await contextRef.current.resume();
        }

        // If already playing, don't double play
        if (isPlaying) return;

        // Create new source node (nodes are one-time use)
        const source = contextRef.current.createBufferSource();
        source.buffer = audioBufferRef.current;
        source.loop = true;

        // Connect Source -> Analyser
        source.connect(analyserRef.current); // Source -> Analyser -> Gain -> Destination
        source.start(0);

        sourceNodeRef.current = source;
        setIsPlaying(true);
    }, [isPlaying]);

    const stop = useCallback(() => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
            setIsPlaying(false);
        }
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const value = {
        play,
        stop,
        toggleMute,
        setVolume,
        isPlaying,
        isMuted,
        isLoading,
        analyser: analyserRef.current // Expose analyser
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};
