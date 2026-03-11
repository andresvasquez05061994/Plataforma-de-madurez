'use client';

import { useEffect, useState } from 'react';
import { getMaturityColor } from '@/lib/scoring';
import { MaturityLevel } from '@/types/assessment';

interface ScoreBarProps {
    label: string;
    score: number;
    level: MaturityLevel;
    delay?: number;
}

export default function ScoreBar({ label, score, level, delay = 0 }: ScoreBarProps) {
    const [animated, setAnimated] = useState(false);
    const percentage = (score / 5) * 100;
    const color = getMaturityColor(level);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div className="animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
            <div className="flex items-center justify-between mb-2">
                <span className="font-syne font-semibold text-foreground">{label}</span>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-syne font-bold" style={{ color }}>
                        {score.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted">/5.0</span>
                </div>
            </div>

            <div className="w-full h-3 bg-surface-alt rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: animated ? `${percentage}%` : '0%',
                        backgroundColor: color,
                    }}
                />
            </div>

            <div className="flex items-center gap-2 mt-1.5">
                <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                        backgroundColor: `${color}15`,
                        color: color,
                    }}
                >
                    {level}
                </span>
            </div>
        </div>
    );
}
