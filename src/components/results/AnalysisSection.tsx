'use client';

import { useState, useEffect } from 'react';

interface AnalysisSectionProps {
    analysis: string;
    isLoading: boolean;
}

export default function AnalysisSection({ analysis, isLoading }: AnalysisSectionProps) {
    const [displayed, setDisplayed] = useState('');

    // Typewriter effect when analysis arrives
    useEffect(() => {
        if (!analysis) return;
        let i = 0;
        setDisplayed('');
        const interval = setInterval(() => {
            if (i < analysis.length) {
                setDisplayed((prev) => prev + analysis[i]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 5);
        return () => clearInterval(interval);
    }, [analysis]);

    return (
        <div className="bg-surface-white rounded-2xl border border-border-light p-6 sm:p-8 animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-lg">🧠</span>
                <h3 className="font-syne font-bold text-lg text-foreground">Análisis Estratégico</h3>
                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full ml-auto">
                    Generado por IA
                </span>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-5/6" />
                    <div className="skeleton h-4 w-4/6" />
                    <div className="skeleton h-8 w-full mt-6" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-8 w-full mt-6" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-5/6" />
                    <div className="skeleton h-4 w-2/3" />
                </div>
            ) : analysis ? (
                <div className="prose prose-sm max-w-none">
                    <div className="text-text-muted leading-relaxed whitespace-pre-wrap text-[15px]">
                        {displayed}
                        {displayed.length < analysis.length && (
                            <span className="inline-block w-0.5 h-4 bg-accent animate-pulse ml-0.5" />
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-text-muted mb-2">No se pudo generar el análisis</p>
                    <p className="text-xs text-text-light">
                        Verifica que la API key de Claude esté configurada en las variables de entorno.
                    </p>
                </div>
            )}
        </div>
    );
}
