'use client';

import { PriorityLevel } from '@/types/assessment';
import HelpTooltip from './HelpTooltip';

interface PriorityQuestionProps {
    text: string;
    help?: string;
    currentValue: PriorityLevel;
    onAnswer: (value: PriorityLevel) => void;
}

const priorities: { key: PriorityLevel; label: string; color: string; description: string }[] = [
    {
        key: 'baja',
        label: 'Baja',
        color: 'border-border-light text-text-muted hover:border-text-muted',
        description: 'No es una prioridad en este momento',
    },
    {
        key: 'media',
        label: 'Media',
        color: 'border-yellow-300 text-yellow-700 hover:border-yellow-400',
        description: 'Es importante pero no urgente',
    },
    {
        key: 'alta',
        label: 'Alta',
        color: 'border-orange-400 text-orange-600 hover:border-orange-500',
        description: 'Es una prioridad estratégica para este año',
    },
    {
        key: 'critica',
        label: 'Prioridad Crítica',
        color: 'border-urgency text-urgency hover:border-urgency',
        description: 'Es urgente y determinante para la competitividad',
    },
];

export default function PriorityQuestion({
    text,
    help,
    currentValue,
    onAnswer,
}: PriorityQuestionProps) {
    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            {/* Question text */}
            <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-urgency/10 rounded-lg flex items-center justify-center text-urgency flex-shrink-0">
                    🎯
                </div>
                <div className="flex-1">
                    <p className="text-xs font-medium text-urgency mb-2">Pregunta de prioridad estratégica</p>
                    <div className="flex items-start gap-3">
                        <h2 className="font-syne font-bold text-xl sm:text-2xl text-foreground leading-snug flex-1">
                            {text}
                        </h2>
                        {help && <HelpTooltip text={help} />}
                    </div>
                </div>
            </div>

            {/* Priority buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                {priorities.map((p) => {
                    const isSelected = currentValue === p.key;
                    return (
                        <button
                            key={p.key}
                            onClick={() => onAnswer(p.key)}
                            className={`
                p-4 rounded-xl border-2 text-left transition-all duration-300
                ${isSelected
                                    ? `${p.color} bg-surface-white shadow-lg scale-[1.02]`
                                    : 'border-border-light text-text-muted hover:shadow-md bg-surface-white'
                                }
              `}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-[15px]">{p.label}</span>
                                {isSelected && <span className="animate-scale-in">✓</span>}
                            </div>
                            <p className="text-xs text-text-muted">{p.description}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
