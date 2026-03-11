'use client';

import { useAssessmentStore } from '@/store/assessment-store';
import { serviceSections } from '@/data/sections';
import IACLogo from '@/components/brand/IACLogo';

interface DiagnosticLayoutProps {
    children: React.ReactNode;
}

export default function DiagnosticLayout({ children }: DiagnosticLayoutProps) {
    const {
        flowPhase,
        currentServiceIndex,
        currentQuestion,
        answers,
        getCurrentProgress,
        getCurrentService,
        previousQuestion,
        getQuestionCount,
    } = useAssessmentStore();

    const progress = getCurrentProgress();
    const selectedServices = answers.generalInfo.selectedServices;
    const currentService = getCurrentService();
    const currentSection = currentService
        ? serviceSections.find((s) => s.key === currentService)
        : null;
    const actualQCount = currentService ? getQuestionCount(currentService) : 0;

    const phaseLabel = () => {
        if (flowPhase === 'section-break') return 'Transición';
        if (flowPhase === 'objective') return 'Objetivo';
        if (flowPhase === 'contact') return 'Contacto';
        if (currentSection) return currentSection.title;
        return '';
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-surface p-6">
                <div className="mb-10">
                    <IACLogo size="sm" />
                </div>

                {answers.generalInfo.company && (
                    <div className="mb-6 pb-4 border-b border-border">
                        <p className="text-[10px] text-light uppercase tracking-wider mb-1">Empresa</p>
                        <p className="text-sm font-medium text-foreground truncate">{answers.generalInfo.company}</p>
                    </div>
                )}

                <nav className="flex-1 space-y-1">
                    {selectedServices.map((svc, idx) => {
                        const section = serviceSections.find((s) => s.key === svc);
                        if (!section) return null;

                        const isActive = flowPhase === 'questions' && currentServiceIndex === idx;
                        const isPast = flowPhase === 'questions'
                            ? currentServiceIndex > idx
                            : flowPhase === 'objective' || flowPhase === 'contact';
                        const isFuture = flowPhase === 'questions'
                            ? currentServiceIndex < idx
                            : flowPhase === 'section-break' && currentServiceIndex <= idx;

                        return (
                            <div
                                key={svc}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                                    isActive ? 'bg-accent/10 border border-accent/30' :
                                    isPast ? 'opacity-60' : isFuture ? 'opacity-35' : ''
                                }`}
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs transition-all ${
                                    isPast ? 'bg-success text-white' :
                                    isActive ? 'bg-accent text-navy-800' : 'bg-surface-alt text-light'
                                }`}>
                                    {isPast ? '✓' : section.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isActive ? 'text-foreground' : 'text-foreground'}`}>
                                        {section.title}
                                    </p>
                                    {isActive && (
                                        <p className="text-xs text-muted">
                                            Pregunta {currentQuestion + 1} de {actualQCount}
                                        </p>
                                    )}
                                    {isPast && <p className="text-xs text-success">Completado</p>}
                                </div>
                            </div>
                        );
                    })}

                    <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                        flowPhase === 'objective' ? 'bg-accent/10 border border-accent/30' : flowPhase === 'contact' ? 'opacity-60' : 'opacity-35'
                    }`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                            flowPhase === 'contact' ? 'bg-success text-white' : flowPhase === 'objective' ? 'bg-accent text-navy-800' : 'bg-surface-alt text-light'
                        }`}>
                            {flowPhase === 'contact' ? '✓' : '🎯'}
                        </div>
                        <p className={`text-sm font-medium ${flowPhase === 'objective' ? 'text-foreground' : 'text-foreground'}`}>Objetivo</p>
                    </div>

                    <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                        flowPhase === 'contact' ? 'bg-accent/10 border border-accent/30' : 'opacity-35'
                    }`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                            flowPhase === 'contact' ? 'bg-accent text-navy-800' : 'bg-surface-alt text-light'
                        }`}>📧</div>
                        <p className={`text-sm font-medium ${flowPhase === 'contact' ? 'text-foreground' : 'text-foreground'}`}>Contacto</p>
                    </div>
                </nav>

                <div className="pt-6 border-t border-border">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted">Progreso</span>
                        <span className="font-semibold text-foreground">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[9px] text-light mt-4 text-center italic leading-tight">
                        Ingeniería Asistida por Computador — 30 años elevando la eficiencia de los negocios
                    </p>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Mobile header */}
                <header className="lg:hidden sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <IACLogo size="sm" />
                            {phaseLabel() && <span className="text-xs text-muted ml-2">{phaseLabel()}</span>}
                        </div>
                        <span className="text-sm font-medium text-muted">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-alt rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex gap-1.5 mt-2">
                        {selectedServices.map((svc, idx) => {
                            const isDone = flowPhase === 'questions' ? currentServiceIndex > idx : flowPhase !== 'section-break' || currentServiceIndex > idx;
                            const isCurrent = flowPhase === 'questions' && currentServiceIndex === idx;
                            return (
                                <div key={svc} className={`h-1 flex-1 rounded-full transition-all ${isDone ? 'bg-success' : isCurrent ? 'bg-accent' : 'bg-surface-alt'}`} />
                            );
                        })}
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
                    {children}
                </main>

                <footer className="border-t border-border bg-surface px-4 sm:px-6 py-3">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <button onClick={previousQuestion} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Anterior
                        </button>
                        <span className="text-xs text-light">{phaseLabel()}</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
