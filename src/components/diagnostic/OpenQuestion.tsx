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

export default function OpenQuestion({ text, help, value, onChange, onNext, placeholder = 'Escribe tu respuesta aquí...', questionNumber, totalQuestions }: OpenQuestionProps) {
    const handleTranscript = useCallback(
        (transcript: string) => { onChange(value ? `${value} ${transcript}` : transcript); },
        [value, onChange]
    );

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <span className="inline-block text-xs font-semibold text-accent tracking-wider mb-5">
                {questionNumber} → {totalQuestions}
            </span>

            <div className="flex items-start gap-3 mb-8">
                <h2 className="font-syne font-extrabold text-xl sm:text-2xl text-foreground leading-snug flex-1">{text}</h2>
                {help && <HelpTooltip text={help} />}
            </div>

            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className="w-full px-5 py-4 bg-surface border-2 border-border rounded-2xl text-foreground placeholder:text-light text-[15px] leading-relaxed focus:border-accent focus:ring-0 focus:outline-none transition-all duration-200 resize-none"
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onNext(); }}
                />
                <div className="absolute bottom-3 right-3">
                    <VoiceInput onTranscript={handleTranscript} />
                </div>
            </div>

            <div className="flex items-center justify-between mt-5">
                <p className="text-light text-xs">Puedes dictar tu respuesta con el micrófono</p>
                <button
                    onClick={onNext}
                    disabled={!value.trim()}
                    className={`px-6 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                        value.trim()
                            ? 'bg-accent text-navy-800 shadow-gold hover:shadow-gold-lg'
                            : 'bg-surface-alt text-light cursor-not-allowed'
                    }`}
                >
                    Continuar <span className="hidden sm:inline text-xs opacity-60">(Ctrl+Enter)</span>
                </button>
            </div>
        </div>
    );
}
