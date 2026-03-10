'use client';

import { getMaturityColor } from '@/lib/scoring';
import { MaturityLevel } from '@/types/assessment';

interface MaturityBadgeProps {
    level: MaturityLevel;
    score: number;
    size?: 'sm' | 'lg';
}

export default function MaturityBadge({ level, score, size = 'lg' }: MaturityBadgeProps) {
    const color = getMaturityColor(level);

    if (size === 'sm') {
        return (
            <span
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${color}15`, color }}
            >
                {level}
            </span>
        );
    }

    return (
        <div className="flex flex-col items-center animate-badge-pop">
            {/* Score circle */}
            <div
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center badge-glow"
                style={{
                    background: `conic-gradient(${color} ${(score / 5) * 360}deg, #E0DDD7 0deg)`,
                }}
            >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-background flex flex-col items-center justify-center">
                    <span className="font-syne font-extrabold text-3xl sm:text-4xl" style={{ color }}>
                        {score.toFixed(1)}
                    </span>
                    <span className="text-xs text-text-muted">/5.0</span>
                </div>
            </div>

            {/* Level label */}
            <div
                className="mt-3 px-4 py-1.5 rounded-full font-syne font-bold text-sm"
                style={{ backgroundColor: `${color}15`, color }}
            >
                {level}
            </div>
        </div>
    );
}
