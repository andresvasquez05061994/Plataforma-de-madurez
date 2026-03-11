'use client';

import { ServiceSection } from '@/types/assessment';

interface SectionBreakProps {
    section: ServiceSection;
    moduleNumber: number;
    totalModules: number;
    actualQuestionCount?: number;
    onStart: () => void;
    onBack: () => void;
}

export default function SectionBreak({
    section,
    moduleNumber,
    totalModules,
    actualQuestionCount,
    onStart,
    onBack,
}: SectionBreakProps) {
    const qCount = actualQuestionCount ?? section.questionCount;

    return (
        <div className="w-full max-w-2xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-8">
                <span className="text-xs font-semibold text-accent tracking-wider uppercase">
                    Módulo {moduleNumber} de {totalModules}
                </span>
            </div>

            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-accent/10 border-2 border-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <span className="text-4xl sm:text-5xl">{section.icon}</span>
            </div>

            <h1 className="font-syne font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                {section.title}
            </h1>

            <p className="text-muted text-base sm:text-lg max-w-md mx-auto mb-6 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {section.description}
            </p>

            <div className="inline-flex items-center gap-2 mb-10 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2 shadow-card">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted">
                        <rect x="2" y="2" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M5 6h6M5 8h4M5 10h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <span className="text-sm text-foreground font-medium">{qCount} preguntas</span>
                    <span className="text-light text-xs">· ~{Math.ceil(qCount * 0.5)} min</span>
                </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <button
                    onClick={onStart}
                    className="group px-10 py-4 rounded-2xl font-syne font-bold text-base sm:text-lg bg-accent text-navy-800 shadow-gold hover:shadow-gold-lg hover:scale-[1.03] active:scale-100 transition-all duration-300"
                >
                    <span>Comenzar {section.title}</span>
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                </button>
            </div>

            <div className="mt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <button onClick={onBack} className="text-sm text-muted hover:text-foreground transition-colors">← Volver</button>
            </div>

            <div className="flex justify-center gap-2 mt-10 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                {Array.from({ length: totalModules }, (_, i) => (
                    <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-500 ${
                            i + 1 === moduleNumber ? 'w-8 bg-accent' :
                            i + 1 < moduleNumber ? 'w-4 bg-accent/50' : 'w-4 bg-border'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
