'use client';

import { useCallback } from 'react';
import VoiceInput from './VoiceInput';
import HelpTooltip from './HelpTooltip';

interface OpenQuestionProps {
    questionId: string;
    text: string;
    help?: string;
    value: string;
    onChange: (value: string) => void;
    onNext: () => void;
    placeholder?: string;
    questionNumber: number;
    totalQuestions: number;
}

export default function OpenQuestion({
    text,
    help,
    value,
    onChange,
    onNext,
    placeholder = 'Escribe tu respuesta aquí...',
    questionNumber,
    totalQuestions,
}: OpenQuestionProps) {
    const handleTranscript = useCallback(
        (transcript: string) => {
            onChange(value ? `${value} ${transcript}` : transcript);
        },
        [value, onChange]
    );

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            {/* Question number */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                    {questionNumber} / {totalQuestions}
                </span>
            </div>

            {/* Question text */}
            <div className="flex items-start gap-3 mb-6">
                <h2 className="font-syne font-bold text-xl sm:text-2xl text-foreground leading-snug flex-1">
                    {text}
                </h2>
                {help && <HelpTooltip text={help} />}
            </div>

            {/* Textarea with voice input */}
            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className="w-full px-5 py-4 bg-surface-white border-2 border-border-light rounded-xl
                     text-foreground placeholder:text-text-light text-[15px] leading-relaxed
                     focus:border-accent focus:ring-0 focus:outline-none
                     transition-all duration-300 resize-none"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            onNext();
                        }
                    }}
                />

                {/* Voice input button */}
                <div className="absolute bottom-3 right-3">
                    <VoiceInput onTranscript={handleTranscript} />
                </div>
            </div>

            <div className="flex items-center justify-between mt-4">
                <p className="text-text-light text-xs">
                    🎤 Puedes dictar tu respuesta usando el micrófono
                </p>
                <button
                    onClick={onNext}
                    disabled={!value.trim()}
                    className={`
            px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
            ${value.trim()
                            ? 'bg-accent text-white hover:bg-accent-dark shadow-md shadow-accent/20 hover:shadow-lg'
                            : 'bg-surface-muted text-text-light cursor-not-allowed'
                        }
          `}
                >
                    Continuar
                    <span className="ml-1 hidden sm:inline text-xs opacity-70">(Ctrl+Enter)</span>
                </button>
            </div>
        </div>
    );
}
