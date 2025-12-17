import { useState, useRef, useEffect, useCallback } from 'react';

export const useAudioContext = (url) => {
    const contextRef = useRef(null);
    const audioBufferRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const gainNodeRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.2);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize setup
    useEffect(() => {
        const initAudio = async () => {
            try {
                // Create context
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                contextRef.current = new AudioContext();

                // Create gain node for volume control
                gainNodeRef.current = contextRef.current.createGain();
                gainNodeRef.current.gain.value = volume;
                gainNodeRef.current.connect(contextRef.current.destination);

                // Fetch and decode audio
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const decodedBuffer = await contextRef.current.decodeAudioData(arrayBuffer);
                audioBufferRef.current = decodedBuffer;
                setIsLoading(false);
            } catch (error) {
                console.error("Error loading audio:", error);
                setIsLoading(false);
            }
        };

        if (url) {
            initAudio();
        }

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
        source.connect(gainNodeRef.current);
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

    return {
        play,
        stop,
        toggleMute,
        setVolume,
        isPlaying,
        isMuted,
        isLoading
    };
};
