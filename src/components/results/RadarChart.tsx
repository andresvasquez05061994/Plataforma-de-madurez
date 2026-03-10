'use client';

import { useEffect, useState } from 'react';
import { ServiceScore } from '@/types/assessment';

interface RadarChartProps {
    scores: ServiceScore[];
}

export default function RadarChart({ scores }: RadarChartProps) {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const size = 300;
    const center = size / 2;
    const radius = 120;
    const levels = 5;
    const labels = scores.map((s) => s.label);
    const values = scores.map((s) => s.score);
    const angleStep = (2 * Math.PI) / labels.length;

    // Calculate point position
    const getPoint = (value: number, index: number) => {
        const angle = angleStep * index - Math.PI / 2;
        const r = (value / levels) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
        };
    };

    // Grid lines
    const gridLevels = [1, 2, 3, 4, 5];

    // Data polygon
    const dataPoints = values.map((v, i) => {
        const p = getPoint(animated ? v : 0, i);
        return `${p.x},${p.y}`;
    });

    return (
        <div className="flex justify-center animate-fade-in">
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className="w-full max-w-[300px] sm:max-w-[350px]"
            >
                {/* Grid */}
                {gridLevels.map((level) => {
                    const points = labels
                        .map((_, i) => {
                            const p = getPoint(level, i);
                            return `${p.x},${p.y}`;
                        })
                        .join(' ');
                    return (
                        <polygon
                            key={level}
                            points={points}
                            className="radar-grid"
                            strokeWidth={level === 5 ? 1.5 : 0.5}
                            opacity={0.4}
                        />
                    );
                })}

                {/* Axis lines */}
                {labels.map((_, i) => {
                    const p = getPoint(5, i);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={p.x}
                            y2={p.y}
                            stroke="#E0DDD7"
                            strokeWidth="0.5"
                        />
                    );
                })}

                {/* Data polygon */}
                <polygon
                    points={dataPoints.join(' ')}
                    className="transition-all duration-1000 ease-out"
                    fill="rgba(26, 26, 255, 0.1)"
                    stroke="#1A1AFF"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                />

                {/* Data points */}
                {values.map((v, i) => {
                    const p = getPoint(animated ? v : 0, i);
                    return (
                        <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill="#1A1AFF"
                            stroke="white"
                            strokeWidth="2"
                            className="transition-all duration-1000 ease-out"
                        />
                    );
                })}

                {/* Labels */}
                {labels.map((label, i) => {
                    const p = getPoint(5.8, i);
                    return (
                        <text
                            key={i}
                            x={p.x}
                            y={p.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-foreground text-xs font-semibold"
                            style={{ fontFamily: 'var(--font-syne)' }}
                        >
                            {label}
                        </text>
                    );
                })}

                {/* Score labels */}
                {values.map((v, i) => {
                    const p = getPoint(animated ? v : 0, i);
                    const labelOffset = v > 3 ? -12 : 12;
                    return (
                        <text
                            key={`score-${i}`}
                            x={p.x}
                            y={p.y + labelOffset}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-accent text-[10px] font-bold transition-all duration-1000"
                            style={{ fontFamily: 'var(--font-syne)' }}
                        >
                            {animated ? v.toFixed(1) : ''}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
