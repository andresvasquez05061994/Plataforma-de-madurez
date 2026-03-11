'use client';

import { PriorityLevel } from '@/types/assessment';
import HelpTooltip from './HelpTooltip';

interface PriorityQuestionProps {
    text: string;
    help?: string;
    currentValue: PriorityLevel;
    onAnswer: (value: PriorityLevel) => void;
}

const priorities: { key: PriorityLevel; label: string; description: string; color: string; selectedBg: string }[] = [
    { key: 'baja', label: 'Baja', description: 'No es una prioridad en este momento', color: 'border-border text-muted', selectedBg: 'bg-surface-alt' },
    { key: 'media', label: 'Media', description: 'Es importante pero no urgente', color: 'border-amber-300 text-amber-700', selectedBg: 'bg-amber-50' },
    { key: 'alta', label: 'Alta', description: 'Es una prioridad estratégica para este año', color: 'border-orange-400 text-orange-600', selectedBg: 'bg-orange-50' },
    { key: 'critica', label: 'Prioridad Crítica', description: 'Es urgente y determinante para la competitividad', color: 'border-urgency text-urgency', selectedBg: 'bg-red-50' },
];

export default function PriorityQuestion({ text, help, currentValue, onAnswer }: PriorityQuestionProps) {
    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-accent/15 rounded-lg flex items-center justify-center text-accent flex-shrink-0">🎯</div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-accent mb-2 tracking-wider uppercase">Pregunta de prioridad estratégica</p>
                    <div className="flex items-start gap-3">
                        <h2 className="font-syne font-extrabold text-xl sm:text-2xl text-foreground leading-snug flex-1">{text}</h2>
                        {help && <HelpTooltip text={help} />}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                {priorities.map((p) => {
                    const isSelected = currentValue === p.key;
                    return (
                        <button
                            key={p.key}
                            onClick={() => onAnswer(p.key)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                                isSelected ? `${p.color} ${p.selectedBg} shadow-card` : 'border-border bg-surface hover:border-border-focus hover:shadow-card'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-[15px]">{p.label}</span>
                                {isSelected && <span className="animate-scale-in">✓</span>}
                            </div>
                            <p className="text-xs text-muted">{p.description}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
