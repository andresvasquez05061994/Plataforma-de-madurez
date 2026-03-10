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
            {/* Question number */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                    {questionNumber} / {totalQuestions}
                </span>
            </div>

            {/* Question text */}
            <div className="flex items-start gap-3 mb-8">
                <h2 className="font-syne font-bold text-xl sm:text-2xl text-foreground leading-snug flex-1">
                    {question.text}
                </h2>
                {question.help && <HelpTooltip text={question.help} />}
            </div>

            {/* Options */}
            <div className="space-y-3">
                {question.options?.map((option) => {
                    const isSelected = currentValue === option.level;
                    const isHovered = hoveredOption === option.level;

                    return (
                        <button
                            key={option.level}
                            onClick={() => onAnswer(option.level)}
                            onMouseEnter={() => setHoveredOption(option.level)}
                            onMouseLeave={() => setHoveredOption(null)}
                            className={`
                w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-300
                ${isSelected
                                    ? 'bg-accent/5 border-accent shadow-lg shadow-accent/10 scale-[1.01]'
                                    : isHovered
                                        ? 'bg-surface-white border-accent/30 shadow-md'
                                        : 'bg-surface-white border-border-light hover:border-accent/20'
                                }
              `}
                        >
                            <div className="flex items-start gap-3 sm:gap-4">
                                {/* Level indicator */}
                                <div
                                    className={`
                    flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-syne font-bold text-sm transition-all duration-300
                    ${isSelected
                                            ? 'bg-accent text-white shadow-md shadow-accent/30'
                                            : 'bg-surface-muted text-text-muted'
                                        }
                  `}
                                >
                                    {option.level}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p
                                            className={`font-semibold text-[15px] transition-colors duration-200 ${isSelected ? 'text-accent' : 'text-foreground'
                                                }`}
                                        >
                                            {option.title}
                                        </p>
                                        {isSelected && (
                                            <span className="text-accent animate-scale-in">✓</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-text-muted mt-1 leading-relaxed">
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Keyboard hint */}
            <p className="hidden sm:block text-center text-text-light text-xs mt-6">
                Presiona <kbd className="px-1.5 py-0.5 bg-surface-muted rounded text-text-muted font-mono">1</kbd>–<kbd className="px-1.5 py-0.5 bg-surface-muted rounded text-text-muted font-mono">5</kbd> para seleccionar
            </p>
        </div>
    );
}
