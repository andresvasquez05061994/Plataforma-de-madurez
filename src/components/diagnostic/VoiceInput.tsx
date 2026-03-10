'use client';

import { useState, useEffect, useCallback } from 'react';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    language?: string;
}

export default function VoiceInput({ onTranscript, language = 'es-CO' }: VoiceInputProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    }, []);

    const startRecording = useCallback(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsRecording(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
            setIsRecording(false);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);

        recognition.start();
    }, [language, onTranscript]);

    if (!isSupported) return null;

    return (
        <button
            type="button"
            onClick={startRecording}
            className={`
        relative p-3 rounded-xl transition-all duration-300
        ${isRecording
                    ? 'bg-urgency/10 text-urgency scale-110 shadow-lg shadow-urgency/20'
                    : 'bg-surface-muted text-text-muted hover:bg-accent/10 hover:text-accent'
                }
      `}
            title={isRecording ? 'Grabando...' : 'Dictar con voz'}
        >
            {/* Microphone icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="7" y="2" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 9a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10 15v3m-3 0h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            {/* Wave animation while recording */}
            {isRecording && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 voice-waves">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className={`voice-wave-bar bg-urgency animate-wave-${i}`}
                            style={{ height: '16px' }}
                        />
                    ))}
                </div>
            )}

            {/* Recording pulse */}
            {isRecording && (
                <span className="absolute top-0 right-0 w-3 h-3">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-urgency opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-urgency" />
                </span>
            )}
        </button>
    );
}
