'use client';

import { useEffect, useState } from 'react';
import { getMaturityLevel, getMaturityColor } from '@/lib/scoring';
import { getMatrixDescription, DimensionKey } from '@/data/maturity-matrices';
import { ServiceType } from '@/types/assessment';

interface DimensionBreakdownProps {
    dimensions: {
        procesos: number;
        personas: number;
        herramientas: number;
        tecnologia: number;
    };
    service?: ServiceType;
    compact?: boolean;
}

const dimensionLabels: Record<string, { label: string; icon: string }> = {
    procesos: { label: 'Procesos', icon: '📋' },
    personas: { label: 'Personas', icon: '👥' },
    herramientas: { label: 'Herramientas', icon: '🛠️' },
    tecnologia: { label: 'Tecnología', icon: '💻' },
};

export default function DimensionBreakdown({ dimensions, service, compact = false }: DimensionBreakdownProps) {
    const [animated, setAnimated] = useState(false);
    const [expandedDim, setExpandedDim] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const entries = Object.entries(dimensions) as [DimensionKey, number][];

    if (compact) {
        return (
            <div className="space-y-3">
                {entries.map(([key, value], idx) => {
                    const info = dimensionLabels[key];
                    const level = getMaturityLevel(value);
                    const color = getMaturityColor(level);
                    const percentage = (value / 5) * 100;
                    const matrixEntry = service ? getMatrixDescription(service, key, value) : null;

                    return (
                        <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted flex items-center gap-1">
                                    <span>{info.icon}</span>
                                    {info.label}
                                </span>
                                <span className="text-xs font-bold" style={{ color }}>
                                    {value > 0 ? value.toFixed(1) : '—'}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-alt rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: animated ? `${percentage}%` : '0%',
                                        backgroundColor: color,
                                        transitionDelay: `${idx * 100}ms`,
                                    }}
                                />
                            </div>
                            {matrixEntry && (
                                <p className="text-[11px] text-light mt-1 leading-snug">
                                    {matrixEntry.description}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Full mode with expandable matrix descriptions
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {entries.map(([key, value], idx) => {
                const info = dimensionLabels[key];
                const level = getMaturityLevel(value);
                const color = getMaturityColor(level);
                const matrixEntry = service ? getMatrixDescription(service, key, value) : null;
                const isExpanded = expandedDim === key;

                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setExpandedDim(isExpanded ? null : key)}
                        className={`text-left rounded-xl p-4 transition-all duration-300 animate-scale-in border
              ${isExpanded
                                ? 'bg-surface border-accent/20 shadow-lg col-span-1 sm:col-span-2'
                                : 'bg-surface-alt/50 border-transparent hover:border-border hover:shadow-sm'
                            }`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-xl flex-shrink-0">{info.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="text-xs text-muted uppercase tracking-wide">{info.label}</p>
                                    <span
                                        className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                                        style={{
                                            backgroundColor: `${color}15`,
                                            color: color,
                                        }}
                                    >
                                        {value > 0 ? level : 'N/A'}
                                    </span>
                                </div>
                                <p className="font-syne font-extrabold text-2xl" style={{ color }}>
                                    {value > 0 ? value.toFixed(1) : '—'}
                                </p>

                                {/* Matrix description */}
                                {matrixEntry && (
                                    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'
                                        }`}>
                                        <div className="pt-3 border-t border-border">
                                            <p className="text-xs font-medium text-foreground mb-1">
                                                Nivel {matrixEntry.levelNumber}: {matrixEntry.level}
                                            </p>
                                            <p className="text-xs text-muted leading-relaxed">
                                                {matrixEntry.description}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Hint to expand */}
                                {matrixEntry && !isExpanded && (
                                    <p className="text-[10px] text-light mt-2 flex items-center gap-1">
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <path d="M3 4l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Ver detalle de matriz
                                    </p>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
