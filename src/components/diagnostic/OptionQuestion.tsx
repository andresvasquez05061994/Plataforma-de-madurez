'use client';

import { useState } from 'react';
import { Question } from '@/types/assessment';
import HelpTooltip from './HelpTooltip';

interface OptionQuestionProps {
    question: Question;
    currentValue?: number;
    onAnswer: (value: number) => void;
    questionNumber: number;
    totalQuestions: number;
}

export default function OptionQuestion({
    question,
    currentValue,
    onAnswer,
    questionNumber,
    totalQuestions,
}: OptionQuestionProps) {
    const [hoveredOption, setHoveredOption] = useState<number | null>(null);

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <span className="inline-block text-xs font-semibold text-accent tracking-wider mb-5">
                {questionNumber} → {totalQuestions}
            </span>

            <div className="flex items-start gap-3 mb-8">
                <h2 className="font-syne font-extrabold text-xl sm:text-2xl text-foreground leading-snug flex-1">
                    {question.text}
                </h2>
                {question.help && <HelpTooltip text={question.help} />}
            </div>

            <div className="space-y-2.5">
                {question.options?.map((option) => {
                    const isSelected = currentValue === option.level;
                    const isHovered = hoveredOption === option.level;

                    return (
                        <button
                            key={option.level}
                            onClick={() => onAnswer(option.level)}
                            onMouseEnter={() => setHoveredOption(option.level)}
                            onMouseLeave={() => setHoveredOption(null)}
                            className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${
                                isSelected
                                    ? 'border-accent bg-accent-light shadow-card'
                                    : isHovered
                                        ? 'border-border-focus bg-surface shadow-card'
                                        : 'border-border bg-surface hover:border-border-focus'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-syne font-bold text-sm transition-all ${
                                    isSelected ? 'bg-accent text-navy-800 shadow-gold' : 'bg-surface-alt text-muted'
                                }`}>
                                    {option.level}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={`font-semibold text-[15px] transition-colors ${isSelected ? 'text-navy-700' : 'text-foreground'}`}>
                                            {option.title}
                                        </p>
                                        {isSelected && <span className="text-accent animate-scale-in">✓</span>}
                                    </div>
                                    <p className="text-sm text-muted mt-1 leading-relaxed">{option.description}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <p className="hidden sm:block text-center text-light text-xs mt-6">
                Presiona <kbd className="px-1.5 py-0.5 bg-surface-alt rounded text-muted font-mono text-[11px]">1</kbd>–<kbd className="px-1.5 py-0.5 bg-surface-alt rounded text-muted font-mono text-[11px]">5</kbd> para seleccionar
            </p>
        </div>
    );
}
